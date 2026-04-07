let editor = null;

function initEditor() {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: getDefaultTemplate(),
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

        window.addEventListener('resize', function() {
            if (editor) {
                editor.layout();
            }
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
        const model = editor.getModel();
        if (model) {
            editor.pushUndoStop();
            model.pushEditOperations(
                [],
                [{ range: model.getFullModelRange(), text: content }],
                null
            );
            editor.pushUndoStop();
        } else {
            editor.setValue(content);
        }
    }
}

window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;
window.locateTextInEditor = locateTextInEditor;
window.getEditor = function() { return editor; };
window.MonacoEditor = null;

initEditor();

function locateTextInEditor(text) {
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