function sanitizeFileName(rawTitle, fallback) {
    let name = String(rawTitle || '')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')  // Windows 非法字符
        .replace(/\s+/g, ' ')                 // 压缩连续空白
        .trim()
        .replace(/[. ]+$/, '');               // 结尾的点和空格在 Windows 上非法

    // 设备保留名：CON / PRN / AUX / NUL / COM1-9 / LPT1-9
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(name)) {
        name = '_' + name;
    }
    if (!name) return fallback || 'document';
    // 中文按 UTF-16 码元计，留足余量避免超长
    if (name.length > 60) {
        name = name.slice(0, 60).replace(/[. ]+$/, '');
    }
    return name || (fallback || 'document');
}

function getDocumentFileBase(doc) {
    return sanitizeFileName(doc.title, 'document');
}

/* ------------------------------------------------------------------ *
 * 打印窗口的文件名
 *
 * Chrome / Edge 取「顶层页面标题」当 PDF 默认文件名，**不认** iframe 的标题；
 * Firefox 则取 iframe 自己的标题。两边都设上，打印窗口里的文件名才会是
 * 文档标题，用户不必再到「另存为」里手动改。
 * ------------------------------------------------------------------ */

let printTitleBackup = null;    // { top, frame }
let printRestoreTimer = null;

function applyPrintTitle(fileName) {
    restorePrintTitle();        // 先确保处于干净状态

    const iframe = document.getElementById('preview');
    printTitleBackup = { top: document.title, frame: null };

    document.title = fileName;

    try {
        const doc = iframe && iframe.contentDocument;
        if (doc) {
            printTitleBackup.frame = doc.title;
            doc.title = fileName;
        }
    } catch (e) { /* 跨域等情况下跳过 */ }

    // 打印结束就还原，避免改动的标题残留进「导出 HTML」
    try {
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.addEventListener('afterprint', restorePrintTitle, { once: true });
        }
    } catch (e) {}

    // afterprint 在部分浏览器或取消打印时不可靠，加时间兜底
    clearTimeout(printRestoreTimer);
    printRestoreTimer = setTimeout(restorePrintTitle, 60000);
}

function restorePrintTitle() {
    clearTimeout(printRestoreTimer);
    if (!printTitleBackup) return;

    const backup = printTitleBackup;
    printTitleBackup = null;

    try { document.title = backup.top; } catch (e) {}

    if (backup.frame !== null) {
        try {
            const doc = document.getElementById('preview').contentDocument;
            if (doc) doc.title = backup.frame;
        } catch (e) {}
    }
}

function exportPdf() {
    const iframe = document.getElementById('preview');
    if (!iframe || !iframe.contentDocument) {
        alert('预览区域未加载');
        return;
    }

    const doc = iframe.contentDocument;

    // 导出前清掉编辑器加的高亮框，否则蓝框会被打进 PDF
    doc.querySelectorAll('.edit-selected-element, .edit-hover-element').forEach(el => {
        el.classList.remove('edit-selected-element', 'edit-hover-element');
    });

    // 文件名取自文档的 <title>；文档没有标题时回退为 document.pdf
    const fileName = getDocumentFileBase(doc) + '.pdf';

    injectPrintStyle(doc);
    applyPrintTitle(fileName);

    try {
        iframe.contentWindow.focus();
        // 浏览器不允许网页静默生成 PDF（安全模型限制），
        // 这里打开的就是系统打印窗口，用户选「另存为 PDF」即可。
        iframe.contentWindow.print();
    } catch (e) {
        console.error('打印失败:', e);
        restorePrintTitle();
        alert('无法打开打印窗口，请改用浏览器自带的 Ctrl+P。');
    }
}

function injectPrintStyle(doc) {
    // 用 upsert 而不是「已存在就跳过」：加荧光笔时 toolbar.js 会先建一个较弱的
    // printStyle，若这里直接 return，@page 规则就永远注入不进去。
    let style = doc.getElementById('printStyle');
    if (!style) {
        style = doc.createElement('style');
        style.id = 'printStyle';
        doc.head.appendChild(style);
    }

    style.textContent = `
        /* 必须显式声明纸张尺寸。
           不声明时 Chrome 会按「屏幕尺寸」猜，从而整页缩放 —— 缩放会同时导致：
             · 选区位置按未缩放坐标计算 → 选中的文字对不上（选不准）
             · 插入光标按未缩放字号渲染 → 光标显得特别大
           声明 A4 + 零页边距后可用宽度是完整的 210mm，文档按自身的内边距留白，
           缩放保持 100%，上述两个现象随之消失。 */
        @page {
            size: A4;
            margin: 0;
        }

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
            }
            /* 切勿在此覆盖 .highlighter-mark 的 background。
               荧光笔颜色是内联写在 span 上的，而这里的规则带 !important 会盖掉内联样式。
               历史教训：曾写成 var(--hl-color, #ffeb3b)，但 --hl-color 从未被定义过，
               于是 8 种颜色打印出来全变成黄色。内联的 linear-gradient 本身已能正确打印。 */
        }
    `;
}

/* 说明：原先这里有一个「导出文件名」弹窗，让用户复制文件名再粘贴到打印窗口。
   现在打印窗口的文件名由 applyPrintTitle() 自动填好，这一步已无必要，故移除。 */

function exportHtml() {
    const iframe = document.getElementById('preview');
    if (!iframe || !iframe.contentDocument) {
        alert('预览区域未加载');
        return;
    }

    // 若刚打印过且标题尚未还原，先还原，避免把导出用的文件名写进 HTML 的 <title>
    restorePrintTitle();

    const doc = iframe.contentDocument;
    // 复用与源码同步同一套清洗逻辑，避免把编辑器注入的样式导出给用户
    const htmlContent = window.FormatToolbar
        ? window.FormatToolbar.getCleanHTML(doc)
        : '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    
    const fileName = getDocumentFileBase(doc);
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('HTML文件已导出:', fileName);
}

function initPrint() {
    window.exportPdf = exportPdf;
    window.exportHtml = exportHtml;

    // 打印窗口关闭后立刻还原页面标题（applyPrintTitle 里还设了时间兜底）
    window.addEventListener('afterprint', restorePrintTitle);

    console.log('导出功能初始化完成');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrint);
} else {
    initPrint();
}