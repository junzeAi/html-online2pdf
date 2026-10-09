let debounceTimer = null;
const DEBOUNCE_DELAY = 300;
let lastIframe = null;
let isVisualMode = false;
let lastMouseUpHandler = null;
let lastIframeMouseDownHandler = null;
let lastDocMouseDownHandler = null;
let lastIframeScrollTop = 0;
let lastIframeScrollLeft = 0;

function updatePreview() {
    if (window.FormatToolbar && window.FormatToolbar.isVisualModeActive) {
        return;
    }
    
    const content = window.getEditorContent ? window.getEditorContent() : '';
    const iframe = document.getElementById('preview');
    
    if (!iframe) return;

    // 记住滚动位置，否则每次改代码都会跳回顶部
    captureIframeScroll(iframe);
    const prevScrollTop = lastIframeScrollTop;
    const prevScrollLeft = lastIframeScrollLeft;

    // 内容未变则跳过重建（避免图片重新加载导致闪烁）。
    // 用 hasAttribute 判断，避免 '' 与 undefined 混淆导致预览永久卡死。
    if (iframe.hasAttribute('data-rendered') && iframe.dataset.rendered === content) {
        return;
    }

    iframe.dataset.rendered = content;
    iframe.srcdoc = content || '<html><body style="background:#fff;"></body></html>';
    
    iframe.onload = function() {
        setupSelectionListener(iframe);
        setupFloatingMenuListener(iframe);
        if (window.FormatToolbar) {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            window.FormatToolbar.setIframeDoc(iframeDoc);
            if (window.PropertyPanel) {
                window.PropertyPanel.setIframeDoc(iframeDoc);
            }
        }
        restoreIframeScroll(iframe, prevScrollTop, prevScrollLeft);
    };
}

function captureIframeScroll(iframe) {
    try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) return;
        lastIframeScrollTop = win.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop || 0;
        lastIframeScrollLeft = win.pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0;
    } catch (e) {
        // 跨域或文档尚未就绪时忽略
    }
}

function restoreIframeScroll(iframe, top, left) {
    if (!top && !left) return;
    try {
        const win = iframe.contentWindow;
        if (!win) return;

        const apply = function () {
            try {
                win.scrollTo(left || 0, top || 0);
            } catch (e) { /* 忽略 */ }
        };

        apply();
        // srcdoc 重建后布局高度可能尚未确定，首次 scrollTo 会被截断到 0。
        // 等一帧让布局稳定后校正一次。
        if (win.requestAnimationFrame) {
            win.requestAnimationFrame(apply);
        }
    } catch (e) {
        // 忽略滚动恢复失败
    }
}

function setupSelectionListener(iframe) {
    try {
        if (lastIframe && lastIframe !== iframe) {
            const oldDoc = lastIframe.contentDocument || lastIframe.contentWindow.document;
            oldDoc.onmouseup = null;
            oldDoc.onkeyup = null;
        }
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeWin = iframe.contentWindow;
        
        const handler = function(e) {
            handleTextSelection(e, iframeWin);
        };
        
        iframeDoc.onmouseup = handler;
        iframeDoc.onkeyup = handler;
        lastIframe = iframe;
    } catch (e) {
        console.warn('无法访问 iframe 内容:', e);
    }
}

function handleTextSelection(event, iframeWin) {
    const selection = iframeWin.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0 && window.locateTextInEditor && !isVisualMode) {
        window.locateTextInEditor(selectedText);
    }
}

function setupFloatingMenuListener(iframe) {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeWin = iframe.contentWindow;
        
        if (lastMouseUpHandler && lastIframe) {
            try {
                const oldDoc = lastIframe.contentDocument || lastIframe.contentWindow.document;
                if (oldDoc && lastMouseUpHandler) oldDoc.removeEventListener('mouseup', lastMouseUpHandler);
                if (oldDoc && lastIframeMouseDownHandler) oldDoc.removeEventListener('mousedown', lastIframeMouseDownHandler);
            } catch (e) {}
        }
        if (lastDocMouseDownHandler) {
            document.removeEventListener('mousedown', lastDocMouseDownHandler);
        }
        
        const mouseUpHandler = (e) => {
            setTimeout(() => {
                const selection = iframeWin.getSelection();
                const selectedText = selection.toString().trim();
                
                if (selectedText.length > 0 && window.FormatToolbar && !isVisualMode) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    
                    const iframeRect = iframe.getBoundingClientRect();
                    const x = iframeRect.left + rect.left + rect.width / 2 - 90;
                    const y = iframeRect.top + rect.top - 50;
                    
                    window.FormatToolbar.showFloatingMenu(x, y);
                }
            }, 10);
        };
        
        const iframeMouseDownHandler = (e) => {
            if (window.FormatToolbar && !e.target.closest('.floating-menu')) {
                window.FormatToolbar.hideFloatingMenu();
            }
        };
        
        const docMouseDownHandler = (e) => {
            if (window.FormatToolbar && !e.target.closest('.floating-menu')) {
                window.FormatToolbar.hideFloatingMenu();
            }
        };
        
        iframeDoc.addEventListener('mouseup', mouseUpHandler);
        iframeDoc.addEventListener('mousedown', iframeMouseDownHandler);
        document.addEventListener('mousedown', docMouseDownHandler);
        
        lastMouseUpHandler = mouseUpHandler;
        lastIframeMouseDownHandler = iframeMouseDownHandler;
        lastDocMouseDownHandler = docMouseDownHandler;
        lastIframe = iframe;
    } catch (e) {
        console.warn('无法设置浮动菜单监听:', e);
    }
}

function debouncedUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePreview, DEBOUNCE_DELAY);
}

function initPreview() {
    window.onEditorChange = debouncedUpdate;
    
    window.onEditorReady = function() {
        updatePreview();
        if (window.FormatToolbar) {
            window.FormatToolbar.init();
        }
        if (window.TemplateManager) {
            window.TemplateManager.init();
        }
        console.log('编辑器准备完成，预览已初始化');
    };
    
    window.onModeChange = function(mode) {
        isVisualMode = mode === 'visual';
    };
    
    window.refreshPreview = function() {
        clearTimeout(debounceTimer);

        // 可视化模式下不能走 srcdoc 重建（会丢掉正在编辑的 DOM 状态），
        // 直接把新源码写入当前文档
        if (window.FormatToolbar && window.FormatToolbar.isVisualModeActive) {
            const iframe = document.getElementById('preview');
            const doc = iframe && (iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document));
            const content = window.getEditorContent ? window.getEditorContent() : '';
            if (doc && content) {
                try {
                    doc.open();
                    doc.write(content);
                    doc.close();
                } catch (e) {
                    console.error('可视化模式下刷新预览失败:', e);
                }
                if (window.FormatToolbar.reEnableVisualEditing) {
                    window.FormatToolbar.reEnableVisualEditing();
                }
                return;
            }
        }

        // 手动刷新视为「重新从头查看」，回到顶部
        lastIframeScrollTop = 0;
        lastIframeScrollLeft = 0;
        const target = document.getElementById('preview');
        if (target) {
            // 删除属性而非置空：置空后若内容恰为 '' 会被误判为已渲染
            target.removeAttribute('data-rendered');
        }
        updatePreview();
    };

    console.log('预览初始化完成');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreview);
} else {
    initPreview();
}