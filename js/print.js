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
                
                .no-break {
                    page-break-inside: avoid;
                }
                
                body::before,
                body::after,
                *::before,
                *::after {
                    display: block !important;
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
    
    alert('提示：在打印对话框中，请勾选"背景图形"选项以保留渐变色和荧光笔效果');
    
    setTimeout(() => {
        try {
            const win = iframe.contentWindow;
            if (win && win.print) {
                win.focus();
                win.print();
            } else {
                fallbackPrint(contentWithPrintStyles);
            }
        } catch (e) {
            console.error('打印失败:', e);
            fallbackPrint(contentWithPrintStyles);
        }
    }, 200);
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
        }, 200);
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