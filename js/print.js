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
                
                *,
                *::before,
                *::after {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                html, body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                body,
                div,
                section,
                article,
                header,
                footer,
                nav,
                aside,
                main,
                figure,
                figcaption,
                h1, h2, h3, h4, h5, h6,
                p,
                span,
                a,
                strong,
                em,
                b,
                i,
                u,
                mark,
                code,
                pre,
                blockquote,
                ul, ol, li,
                table, th, td, tr,
                form, input, button,
                img,
                svg {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .highlighter-mark {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                .no-break {
                    page-break-inside: avoid;
                }
                
                body::before,
                body::after,
                *::before,
                *::after {
                    display: block !important;
                }
                
                .edit-selected-element,
                .edit-hover-element {
                    outline: none !important;
                }
            }
        </style>
    `;
}

function getPrintContent() {
    const iframe = document.getElementById('preview');
    
    if (window.FormatToolbar && window.FormatToolbar.isVisualModeActive) {
        if (iframe && iframe.contentDocument) {
            const doc = iframe.contentDocument;
            
            doc.querySelectorAll('.edit-selected-element').forEach(el => {
                el.classList.remove('edit-selected-element');
            });
            doc.querySelectorAll('.edit-hover-element').forEach(el => {
                el.classList.remove('edit-hover-element');
            });
            
            const editStyle = doc.getElementById('editHighlightStyle');
            if (editStyle) editStyle.remove();
            
            const html = doc.documentElement.outerHTML;
            return '<!DOCTYPE html>\n' + html;
        }
    }
    
    return window.getEditorContent ? window.getEditorContent() : '';
}

function injectPrintStyles(content) {
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
    const rawContent = getPrintContent();
    const contentWithPrintStyles = injectPrintStyles(rawContent);
    
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.top = '-10000px';
    printIframe.style.left = '-10000px';
    printIframe.style.width = '210mm';
    printIframe.style.height = '297mm';
    printIframe.id = 'printIframe';
    document.body.appendChild(printIframe);
    
    printIframe.srcdoc = contentWithPrintStyles;
    
    setTimeout(() => {
        try {
            const win = printIframe.contentWindow;
            if (win) {
                win.focus();
                win.print();
            }
        } catch (e) {
            console.error('打印失败:', e);
            fallbackPrint(contentWithPrintStyles);
        }
        
        setTimeout(() => {
            document.body.removeChild(printIframe);
        }, 1000);
    }, 500);
}

function fallbackPrint(content) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    } else {
        alert('无法打开打印窗口，请检查浏览器弹窗设置');
    }
}

function initPrint() {
    const exportPdfBtn = document.getElementById('exportPdf');
    if (!exportPdfBtn) {
        console.error('找不到导出PDF按钮 #exportPdf');
        return;
    }
    exportPdfBtn.addEventListener('click', exportPdf);
    console.log('导出PDF按钮事件绑定成功');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrint);
} else {
    initPrint();
}