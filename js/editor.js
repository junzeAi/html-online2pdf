/* =========================================================================
 * 编辑器内核：内容真源 + Monaco 按需加载
 *
 * 设计要点（重要，勿回退）：
 *   1. 文档内容真源是 currentHTML 这个变量，**不是** Monaco 的 model。
 *      这样即使 Monaco 还没加载，应用也能正常读写内容。
 *   2. Monaco 只在用户真正需要「代码模式」时才去加载（懒加载）。
 *      首屏因此不必等待 3.4MB 的 editor.main.js，打开即见界面。
 *   3. 对外的 window.getEditorContent / setEditorContent 保持原签名与语义，
 *      其它模块（toolbar/preview/templates/property-panel/import）无需改动。
 * ========================================================================= */

let editor = null;

// 文档内容唯一真源：Monaco 只是它的一个「视图」
let currentHTML = '';

const MONACO_CDN = window.MONACO_CDN || './lib/monaco/vs';

/* ------------------------------------------------------------------ *
 * 内容读写
 * ------------------------------------------------------------------ */

function getEditorContent() {
    return editor ? editor.getValue() : currentHTML;
}

function setEditorContent(content) {
    const text = (content === null || content === undefined) ? '' : String(content);
    currentHTML = text;

    // Monaco 尚未加载：真源已更新，等它加载时再用 currentHTML 初始化
    if (!editor) return;

    const model = editor.getModel();
    if (model) {
        editor.pushUndoStop();
        model.pushEditOperations(
            [],
            [{ range: model.getFullModelRange(), text: text }],
            null
        );
        editor.pushUndoStop();
    } else {
        editor.setValue(text);
    }
}

/* ------------------------------------------------------------------ *
 * Monaco 按需加载
 * ------------------------------------------------------------------ */

let monacoStatus = 'idle';   // idle | loading | ready | failed
let monacoWaiters = [];      // [{ resolve, reject }]
let monacoError = '';

function ensureMonacoEditor() {
    return new Promise(function (resolve, reject) {
        if (monacoStatus === 'ready') { resolve(); return; }
        if (monacoStatus === 'failed') {
            reject(new Error(monacoError || 'Monaco 加载失败'));
            return;
        }
        monacoWaiters.push({ resolve: resolve, reject: reject });
        if (monacoStatus === 'loading') return;
        monacoStatus = 'loading';
        loadMonaco();
    });
}

/** 供「重试」按钮使用：清掉失败状态后重新加载 */
function retryMonacoLoad() {
    if (monacoStatus === 'loading') return ensureMonacoEditor();
    if (monacoStatus === 'failed') {
        monacoStatus = 'idle';
        monacoError = '';
    }
    return ensureMonacoEditor();
}

function finishMonaco(ok, message) {
    monacoStatus = ok ? 'ready' : 'failed';
    monacoError = ok ? '' : (message || '');
    const waiters = monacoWaiters;
    monacoWaiters = [];
    waiters.forEach(function (w) {
        if (ok) {
            try { w.resolve(); } catch (e) {}
        } else {
            try { w.reject(new Error(monacoError)); } catch (e) {}
        }
    });
}

function loadMonaco() {
    if (typeof require !== 'undefined' && typeof require.config === 'function') {
        startAmdLoad();
        return;
    }
    // loader.js 也走懒加载，避免它占据首屏关键路径
    const s = document.createElement('script');
    s.src = MONACO_CDN + '/loader.js';
    s.async = true;
    s.onload = function () {
        if (typeof require === 'undefined' || typeof require.config !== 'function') {
            finishMonaco(false,
                '未能加载 Monaco AMD loader（' + MONACO_CDN + '/loader.js）。<br>' +
                '请确认 lib/monaco 目录完整，并通过 HTTP 访问（不要双击打开 index.html）。');
            return;
        }
        startAmdLoad();
    };
    s.onerror = function () {
        finishMonaco(false,
            '找不到 Monaco 脚本：' + MONACO_CDN + '/loader.js<br>' +
            '请确认 lib/monaco 目录已随项目一起上传。');
    };
    document.head.appendChild(s);
}

function startAmdLoad() {
    try {
        require.config({ paths: { vs: MONACO_CDN } });
    } catch (e) {
        finishMonaco(false, 'Monaco 配置失败：' + (e && e.message ? e.message : e));
        return;
    }

    const timer = setTimeout(function () {
        if (monacoStatus === 'loading') {
            finishMonaco(false,
                'Monaco 加载超时（30 秒）。<br>请检查 lib/monaco 目录是否完整。');
        }
    }, 30000);

    require(['vs/editor/editor.main'], function () {
        clearTimeout(timer);
        try {
            createEditorInstance();
            finishMonaco(true);
        } catch (e) {
            finishMonaco(false, 'Monaco 初始化异常：' + (e && e.message ? e.message : e));
        }
    }, function (err) {
        clearTimeout(timer);
        finishMonaco(false,
            'Monaco 资源加载失败：' + ((err && (err.message || err)) || '未知错误') +
            '<br>请检查 lib/monaco 目录是否完整。');
    });
}

function createEditorInstance() {
    const host = document.getElementById('editor');
    if (!host) throw new Error('找不到 #editor 容器');

    // 清掉加载占位，交给 Monaco 接管
    host.innerHTML = '';

    editor = monaco.editor.create(host, {
        value: currentHTML,
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: false,
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: false },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        tabSize: 2
    });

    window.MonacoEditor = editor;

    window.addEventListener('resize', function () {
        if (editor) editor.layout();
    });

    editor.onDidChangeModelContent(function () {
        // 同步真源，之后即使 Monaco 被回收也不会丢内容
        currentHTML = editor.getValue();
        if (window.onEditorChange) window.onEditorChange();
        if (window.EditorStorage) window.EditorStorage.save();
    });

    console.log('Monaco 编辑器已创建');
}

/** 供外部（如 toolbar.switchMode）在编辑器容器可见后调用，保证尺寸正确 */
function layoutEditor() {
    if (editor) {
        try { editor.layout(); } catch (e) {}
    }
}

/* ------------------------------------------------------------------ *
 * 本地存档
 * ------------------------------------------------------------------ */

const EditorStorage = {
    KEY: 'editorContent',
    TIMER: null,

    load: function () {
        try {
            const saved = localStorage.getItem(this.KEY);
            if (saved && saved.trim()) {
                console.log('已恢复上次编辑内容');
                return saved;
            }
        } catch (e) {
            console.warn('读取本地存档失败:', e);
        }
        return getDefaultTemplate();
    },

    save: function () {
        clearTimeout(this.TIMER);
        this.TIMER = setTimeout(function () {
            try {
                const content = window.getEditorContent ? window.getEditorContent() : '';
                if (content) {
                    localStorage.setItem(EditorStorage.KEY, content);
                }
            } catch (e) {
                // 配额超限等情况下静默失败，不打断用户编辑
                console.warn('自动保存失败:', e);
            }
        }, 800);
    },

    clear: function () {
        try {
            localStorage.removeItem(this.KEY);
        } catch (e) {}
    }
};

function getInitialContent() {
    return EditorStorage.load();
}

/* ------------------------------------------------------------------ *
 * 启动：不等待 Monaco
 * ------------------------------------------------------------------ */

function bootstrap() {
    // 1) 内容真源就绪（这一步完全不依赖 Monaco）
    currentHTML = getInitialContent();

    // 2) 渲染预览 + 初始化工具栏 / 模板
    if (window.onEditorReady) {
        try {
            window.onEditorReady();
        } catch (e) {
            console.error('onEditorReady 执行失败:', e);
        }
    }

    // 3) 默认进入可视化模式：既不阻塞首屏，也贴合改内容的主流程
    enterVisualModeWhenPreviewReady();

    window.__appReady = true;
    console.log('[bootstrap] 应用已就绪（Monaco 按需加载，尚未载入）');
}

/**
 * 预览 iframe 是 srcdoc 异步渲染的，必须等真实内容就绪后再切可视化模式。
 *
 * ⚠️ 不能用「iframeDoc 是否存在」来判断就绪：iframe 初始的 about:blank
 *    文档同样有 body 且 readyState 已是 complete，会在空白文档上启用编辑，
 *    随后 srcdoc 加载又把整个 document 换掉，contentEditable 就丢了。
 *    正确做法是等 load 事件，或用 doc.URL === 'about:srcdoc' 精确识别。
 */
function enterVisualModeWhenPreviewReady() {
    const iframe = document.getElementById('preview');
    let done = false;

    const goVisual = function () {
        if (done) return;
        done = true;
        if (window.FormatToolbar && window.FormatToolbar.switchMode) {
            try {
                window.FormatToolbar.switchMode('visual');
            } catch (e) {
                console.error('进入可视化模式失败，回退到代码模式:', e);
            }
        }
        if (window.__hideLoading) window.__hideLoading();
    };

    if (!iframe) {
        goVisual();
        return;
    }

    // srcdoc 渲染完成才是真就绪：preview.js 的 iframe.onload（注册更早，
     // 会先执行并设好 FormatToolbar.iframeDoc）跑完后再切模式。
    iframe.addEventListener('load', goVisual);

    let waited = 0;
    (function poll() {
        if (done) return;

        let real = false;
        try {
            const doc = iframe.contentDocument;
            real = !!(doc && doc.body &&
                String(doc.URL).indexOf('about:srcdoc') > -1 &&
                doc.readyState !== 'loading');
        } catch (e) { /* 忽略 */ }

        if (real) { goVisual(); return; }

        waited += 50;
        if (waited >= 2000) { goVisual(); return; }   // 兜底，不让用户干等
        setTimeout(poll, 50);
    })();

    // 绝对兜底：即便一直不成功，也不能让遮罩挡住用户
    setTimeout(function () {
        if (!done && window.__hideLoading) window.__hideLoading();
    }, 3000);
}

window.EditorStorage = EditorStorage;
window.getInitialContent = getInitialContent;
window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;
window.ensureMonacoEditor = ensureMonacoEditor;
window.retryMonacoLoad = retryMonacoLoad;
window.layoutEditor = layoutEditor;
window.getEditor = function () { return editor; };
window.isMonacoReady = function () { return monacoStatus === 'ready'; };
window.MonacoEditor = null;

function getDefaultTemplate() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文档标题</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
        }
        .question {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>试题标题</h1>
    <div class="question">
        <p><strong>题目1:</strong> 请在此编写你的内容...</p>
    </div>
</body>
</html>`;
}

function locateTextInEditor(text) {
    // 代码编辑器未加载时无需定位（此时用户也看不到代码）
    if (!editor || !text) return;

    const content = editor.getValue();
    const index = content.indexOf(text);

    if (index === -1) return;

    const position = editor.getModel().getPositionAt(index);
    const endPosition = editor.getModel().getPositionAt(index + text.length);

    editor.setSelection({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: endPosition.lineNumber,
        endColumn: endPosition.column
    });

    editor.revealRangeInCenter({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: endPosition.lineNumber,
        endColumn: endPosition.column
    });

    editor.focus();
}
window.locateTextInEditor = locateTextInEditor;

/* ------------------------------------------------------------------ *
 * 启动时机
 *
 * 不能依赖 document.readyState 判断「所有 defer 脚本已执行完」：
 * 浏览器可能把多个 defer 脚本分段执行，setTimeout(0) 会插在中间跑，
 * 此时 preview.js 还没注册 onEditorReady，工具栏就永远不会初始化。
 * 因此改为轮询必需的全局对象，确定就绪后再启动。
 * ------------------------------------------------------------------ */

(function waitForModulesThenBootstrap() {
    const REQUIRED = ['onEditorReady', 'FormatToolbar', 'TemplateManager'];
    let waited = 0;

    (function check() {
        const allReady = document.readyState !== 'loading' &&
            REQUIRED.every(function (k) { return window[k]; });

        if (allReady) {
            bootstrap();
            return;
        }

        waited += 25;
        if (waited > 8000) {
            console.warn('[bootstrap] 等待依赖超时，仍然尝试启动');
            bootstrap();
            return;
        }
        setTimeout(check, 25);
    })();
})();
