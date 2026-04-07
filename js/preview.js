let debounceTimer = null;
const DEBOUNCE_DELAY = 300;
let lastIframe = null;
let isVisualMode = false;
let lastMouseUpHandler = null;
let lastIframeMouseDownHandler = null;
let lastDocMouseDownHandler = null;

function updatePreview() {
    if (window.FormatToolbar && window.FormatToolbar.isVisualModeActive) {
        return;
    }
    
    const content = window.getEditorContent ? window.getEditorContent() : '';
    const iframe = document.getElementById('preview');
    
    if (iframe) {
        if (content) {
            iframe.srcdoc = content;
        } else {
            iframe.srcdoc = '<html><body style="background:#fff;"></body></html>';
        }
        iframe.onload = function() {
            setupSelectionListener(iframe);
            setupFloatingMenuListener(iframe);
            if (window.FormatToolbar) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                window.FormatToolbar.setIframeDoc(iframeDoc);
            }
        };
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
        updatePreview();
    };

    console.log('预览初始化完成');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreview);
} else {
    initPreview();
}