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
    
    try {
        iframe.contentWindow.print();
    } catch (e) {
        console.error('打印失败:', e);
        alert('请使用浏览器打印功能（Ctrl+P），或尝试在新窗口中打开预览后打印');
    }
}

function initPrint() {
    window.exportPdf = exportPdf;
    console.log('PDF导出功能初始化完成');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrint);
} else {
    initPrint();
}