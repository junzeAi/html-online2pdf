# HTML预览编辑器 + PDF导出 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个纯前端HTML编辑器，支持实时预览和A4格式PDF导出，确保所有CSS样式完整保留。

**Architecture:** 左右分栏布局，左侧Monaco编辑器，右侧iframe预览。编辑内容通过防抖机制自动更新预览。导出PDF使用浏览器原生打印功能，注入打印样式控制A4格式。

**Tech Stack:** 纯HTML/CSS/JavaScript，Monaco Editor（CDN），无构建工具。

---

## 文件结构

```
/
├── index.html          # 主页面，引入所有依赖
├── css/
│   └── style.css       # 布局样式（分栏、工具栏、编辑器容器）
├── js/
│   ├── editor.js       # Monaco编辑器初始化和事件监听
│   ├── preview.js       # iframe预览刷新和防抖逻辑
│   └── print.js        # 打印配置（边距、方向）和导出功能
└── README.md           # 使用说明
```

---

### Task 1: 创建项目基础结构

**Files:**
- Create: `index.html`
- Create: `css/style.css`

- [ ] **Step 1: 创建index.html基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML预览编辑器</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="toolbar" id="toolbar">
        <button id="exportPdf" class="btn btn-primary">导出PDF</button>
        <div class="toolbar-group">
            <label for="margin">边距:</label>
            <select id="margin">
                <option value="none">无</option>
                <option value="narrow">窄 (1cm)</option>
                <option value="medium" selected>中 (2cm)</option>
                <option value="wide">宽 (3cm)</option>
            </select>
        </div>
        <div class="toolbar-group">
            <label for="orientation">方向:</label>
            <select id="orientation">
                <option value="portrait" selected>纵向</option>
                <option value="landscape">横向</option>
            </select>
        </div>
        <button id="refreshPreview" class="btn">刷新预览</button>
    </div>
    
    <div class="container">
        <div class="editor-panel" id="editorPanel">
            <div class="panel-header">代码编辑</div>
            <div id="editor"></div>
        </div>
        <div class="preview-panel" id="previewPanel">
            <div class="panel-header">预览</div>
            <iframe id="preview" sandbox="allow-scripts"></iframe>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"></script>
    <script src="js/editor.js"></script>
    <script src="js/preview.js"></script>
    <script src="js/print.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建css/style.css布局样式**

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.toolbar {
    height: 48px;
    background: #1e1e1e;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 16px;
    flex-shrink: 0;
}

.toolbar-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toolbar-group label {
    color: #ccc;
    font-size: 13px;
}

.toolbar-group select {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background: #2d2d2d;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
}

.toolbar-group select:focus {
    outline: none;
    border-color: #007acc;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: 1px solid #444;
    background: #2d2d2d;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn:hover {
    background: #3d3d3d;
}

.btn-primary {
    background: #007acc;
    border-color: #007acc;
}

.btn-primary:hover {
    background: #0098ff;
}

.container {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.editor-panel,
.preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.editor-panel {
    border-right: 1px solid #333;
}

.panel-header {
    padding: 8px 16px;
    background: #252526;
    color: #ccc;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #333;
}

#editor {
    flex: 1;
    overflow: hidden;
}

#preview {
    flex: 1;
    width: 100%;
    border: none;
    background: #fff;
}
```

- [ ] **Step 3: 验证基础结构**

在浏览器中打开 `index.html`，确认：
- 工具栏显示正确
- 左右分栏布局正常
- 控制台无报错（Monaco Editor尚未加载，这是预期行为）

---

### Task 2: 实现Monaco编辑器初始化

**Files:**
- Create: `js/editor.js`

- [ ] **Step 1: 创建js/editor.js编辑器初始化代码**

```javascript
let editor = null;

function initEditor() {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: getDefaultTemplate(),
            language: 'html',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            tabSize: 2
        });

        editor.onDidChangeModelContent(() => {
            if (window.onEditorChange) {
                window.onEditorChange();
            }
        });

        if (window.onEditorReady) {
            window.onEditorReady();
        }
    });
}

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

function getEditorContent() {
    return editor ? editor.getValue() : '';
}

function setEditorContent(content) {
    if (editor) {
        editor.setValue(content);
    }
}

initEditor();
```

- [ ] **Step 2: 验证编辑器加载**

刷新 `index.html`，确认：
- Monaco编辑器正确加载并显示默认模板
- 语法高亮正常工作
- 可以编辑内容
- 控制台无报错

---

### Task 3: 实现预览功能

**Files:**
- Create: `js/preview.js`

- [ ] **Step 1: 创建js/preview.js预览刷新逻辑**

```javascript
let debounceTimer = null;
const DEBOUNCE_DELAY = 300;

function updatePreview() {
    const content = window.getEditorContent ? window.getEditorContent() : '';
    const iframe = document.getElementById('preview');
    
    if (iframe && content) {
        iframe.srcdoc = content;
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
    };

    document.getElementById('refreshPreview').addEventListener('click', function() {
        clearTimeout(debounceTimer);
        updatePreview();
    });
}

initPreview();
```

- [ ] **Step 2: 验证预览同步**

刷新 `index.html`，确认：
- 编辑器加载后预览区显示默认模板渲染结果
- 编辑代码后300ms预览自动更新
- 点击"刷新预览"按钮立即更新预览

---

### Task 4: 实现PDF导出功能

**Files:**
- Create: `js/print.js`

- [ ] **Step 1: 创建js/print.js打印配置和导出**

```javascript
const MARGIN_MAP = {
    none: '0mm',
    narrow: '10mm',
    medium: '20mm',
    wide: '30mm'
};

const SIZE_MAP = {
    portrait: { width: '210mm', height: '297mm' },
    landscape: { width: '297mm', height: '210mm' }
};

function getPrintStyles() {
    const marginSelect = document.getElementById('margin');
    const orientationSelect = document.getElementById('orientation');
    
    const margin = MARGIN_MAP[marginSelect.value];
    const size = SIZE_MAP[orientationSelect.value];
    
    return `
        <style>
            @media print {
                @page {
                    size: ${size.width} ${size.height};
                    margin: ${margin};
                }
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .no-break {
                    page-break-inside: avoid;
                }
            }
        </style>
    `;
}

function injectPrintStyles() {
    const content = window.getEditorContent ? window.getEditorContent() : '';
    const printStyles = getPrintStyles();
    
    if (content.includes('</head>')) {
        return content.replace('</head>', printStyles + '</head>');
    } else if (content.includes('<body>')) {
        return content.replace('<body>', printStyles + '<body>');
    } else {
        return printStyles + content;
    }
}

function exportPdf() {
    const iframe = document.getElementById('preview');
    const contentWithPrintStyles = injectPrintStyles();
    
    iframe.srcdoc = contentWithPrintStyles;
    
    setTimeout(() => {
        try {
            iframe.contentWindow.print();
        } catch (e) {
            console.error('打印失败:', e);
            alert('导出PDF失败，请使用浏览器的打印功能（Ctrl+P）');
        }
    }, 100);
}

function initPrint() {
    document.getElementById('exportPdf').addEventListener('click', exportPdf);
}

initPrint();
```

- [ ] **Step 2: 验证PDF导出**

刷新 `index.html`，测试：
- 点击"导出PDF"按钮触发浏览器打印对话框
- 打印预览中可以看到A4尺寸
- 不同边距选项生效（通过打印预览验证）
- 纵向/横向切换正常工作

---

### Task 5: 创建README文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建README.md使用说明**

```markdown
# HTML预览编辑器

一个简洁的HTML代码编辑器，支持实时预览和PDF导出，专为试题试卷、文章等内容设计。

## 功能特性

- 实时预览：编辑代码后自动刷新预览（300ms防抖）
- 语法高亮：Monaco Editor提供专业级代码编辑体验
- PDF导出：保留所有CSS样式，支持A4标准格式
- 打印配置：可选边距（无/窄/中/宽）和方向（纵向/横向）

## 使用方法

1. 在编辑器中编写HTML代码（支持内嵌CSS样式）
2. 预览区实时显示渲染效果
3. 调整边距和方向配置
4. 点击"导出PDF"按钮
5. 在浏览器打印对话框中选择"另存为PDF"

## 技术栈

- 纯HTML/CSS/JavaScript（无构建工具）
- Monaco Editor（CDN引入）
- 浏览器原生打印功能

## 浏览器兼容性

推荐使用最新版本的Chrome、Edge或Firefox。

## 注意事项

- PDF导出依赖浏览器打印功能，请在打印对话框中选择"另存为PDF"
- 所有CSS样式都会被完整保留
- 大型文档预览可能有轻微延迟

## 许可证

MIT License
```

- [ ] **Step 2: 最终验证**

完整测试流程：
1. 打开 `index.html`
2. 编辑器显示默认模板，预览区正常渲染
3. 修改代码，预览自动更新
4. 切换边距和方向选项
5. 点击导出PDF，打印对话框正常弹出
6. 验证PDF中CSS样式完整保留
7. README文档内容准确

---

## 自检清单

**Spec覆盖:**
- [x] Monaco编辑器集成（语法高亮、行号）→ Task 2
- [x] 左右分栏布局 → Task 1
- [x] 实时预览（防抖更新）→ Task 3
- [x] 手动刷新按钮 → Task 3
- [x] 打印边距配置（无/窄/中/宽）→ Task 4
- [x] 打印方向配置（纵向/横向）→ Task 4
- [x] A4纸张导出PDF → Task 4
- [x] 使用说明文档 → Task 5

**占位符扫描:**
- 无TBD/TODO等占位符
- 所有步骤包含完整代码

**类型一致性:**
- 所有函数命名一致
- 配置对象结构一致