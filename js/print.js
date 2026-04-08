function exportPdf() {
    const iframe = document.getElementById('preview');
    if (!iframe || !iframe.contentDocument) {
        alert('预览区域未加载');
        return;
    }
    
    const selectedElements = iframe.contentDocument.querySelectorAll('.edit-selected-element, .edit-hover-element');
    selectedElements.forEach(el => {
        el.classList.remove('edit-selected-element', 'edit-hover-element');
    });
    
    const doc = iframe.contentDocument;
    const title = doc.title || '文档';
    const safeTitle = title.replace(/[<>:"/\\|?*]/g, '').trim();
    const titleBase = safeTitle.substring(0, 10) || 'document';
    
    showFileNamePrompt(`${titleBase}.pdf`, () => {
        injectPrintStyle(doc);
        try {
            iframe.contentWindow.print();
        } catch (e) {
            console.error('打印失败:', e);
            alert('请使用浏览器打印功能（Ctrl+P），或尝试在新窗口中打开预览后打印');
        }
    });
}

function injectPrintStyle(doc) {
    const existingStyle = doc.getElementById('printStyle');
    if (existingStyle) return;
    
    const style = doc.createElement('style');
    style.id = 'printStyle';
    style.textContent = `
        @media print {
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .highlighter-mark {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: linear-gradient(to bottom, transparent 50%, var(--hl-color, #ffeb3b) 50%) !important;
            }
        }
    `;
    doc.head.appendChild(style);
}

function showFileNamePrompt(fileName, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'fileNamePromptOverlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h3>建议文件名</h3>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #1e1e1e; border-radius: 6px; border: 1px solid #444;">
                    <code id="suggestedFileName" style="flex: 1; color: #007acc; font-size: 14px; word-break: break-all;">${fileName}</code>
                    <button id="copyFileNameBtn" title="复制文件名" style="padding: 8px; background: #2d2d2d; border: 1px solid #555; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
                <p id="copySuccessMsg" style="margin-top: 10px; color: #28a745; font-size: 13px; display: none;">✓ 已复制到剪贴板</p>
                <div style="margin-top: 16px; padding: 12px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                        <strong>⚠️ 重要提示：</strong><br>
                        在打印对话框中，请确保勾选<br>
                        <strong>"打印背景图形"</strong> 选项，<br>
                        否则荧光笔效果将无法显示！
                    </p>
                </div>
                <p style="margin-top: 12px; color: #888; font-size: 13px; line-height: 1.6;">点击复制按钮后，在打印对话框中按 Ctrl+V 粘贴文件名</p>
            </div>
            <div class="modal-footer">
                <button class="btn" id="cancelFileNameBtn">取消</button>
                <button class="btn btn-primary" id="continuePrintBtn">继续打印</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    overlay.classList.add('show');
    
    const copyBtn = document.getElementById('copyFileNameBtn');
    const successMsg = document.getElementById('copySuccessMsg');
    const fileNameEl = document.getElementById('suggestedFileName');
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(fileName).then(() => {
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 2000);
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = fileName;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 2000);
        });
    });
    
    document.getElementById('cancelFileNameBtn').addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 200);
    });
    
    document.getElementById('continuePrintBtn').addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (callback) callback();
        }, 200);
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 200);
        }
    });
}

function exportHtml() {
    const iframe = document.getElementById('preview');
    if (!iframe || !iframe.contentDocument) {
        alert('预览区域未加载');
        return;
    }
    
    const selectedElements = iframe.contentDocument.querySelectorAll('.edit-selected-element, .edit-hover-element');
    selectedElements.forEach(el => {
        el.classList.remove('edit-selected-element', 'edit-hover-element');
    });
    
    const doc = iframe.contentDocument;
    const htmlContent = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    
    const title = doc.title || '文档';
    const safeTitle = title.replace(/[<>:"/\\|?*]/g, '').trim();
    const titleBase = safeTitle.substring(0, 10) || 'document';
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${titleBase}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('HTML文件已导出:', titleBase);
}

function initPrint() {
    window.exportPdf = exportPdf;
    window.exportHtml = exportHtml;
    console.log('导出功能初始化完成');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrint);
} else {
    initPrint();
}