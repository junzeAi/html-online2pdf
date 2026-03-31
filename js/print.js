const MARGIN_MAP = {
    none: 0,
    narrow: 10,
    medium: 20,
    wide: 30
};

const SIZE_MAP = {
    portrait: { width: 210, height: 297 },
    landscape: { width: 297, height: 210 }
};

async function exportPdf() {
    const exportBtn = document.getElementById('exportPdf');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '生成中...';
    exportBtn.disabled = true;
    
    try {
        const iframe = document.getElementById('preview');
        if (!iframe || !iframe.contentDocument) {
            throw new Error('预览区域未加载');
        }
        
        const marginSelect = document.getElementById('margin');
        const orientationSelect = document.getElementById('orientation');
        const margin = MARGIN_MAP[marginSelect.value] || 20;
        const size = SIZE_MAP[orientationSelect.value] || SIZE_MAP.portrait;
        
        const doc = iframe.contentDocument;
        const body = doc.body;
        
        const selectedElements = doc.querySelectorAll('.edit-selected-element, .edit-hover-element');
        selectedElements.forEach(el => {
            el.classList.remove('edit-selected-element', 'edit-hover-element');
        });
        
        if (window.FormatToolbar) {
            window.FormatToolbar.injectHighlighterStyle(doc, window.FormatToolbar.currentHighlighterColor);
        }
        
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '794px';
        container.style.background = '#fff';
        container.style.zIndex = '-9999';
        container.style.padding = '20px';
        container.style.fontFamily = "'Microsoft YaHei', sans-serif";
        
        container.innerHTML = body.innerHTML;
        
        const styles = doc.querySelectorAll('style');
        const styleText = Array.from(styles).map(s => s.textContent).join('\n');
        const styleEl = document.createElement('style');
        styleEl.textContent = styleText;
        container.insertBefore(styleEl, container.firstChild);
        
        document.body.appendChild(container);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        
        document.body.removeChild(container);
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: orientationSelect.value === 'landscape' ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = size.width - margin * 2;
        const pageHeight = size.height - margin * 2;
        
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        if (imgHeight <= pageHeight) {
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        } else {
            let position = 0;
            let remainingHeight = imgHeight;
            let pageNumber = 1;
            
            while (remainingHeight > 0) {
                if (pageNumber > 1) {
                    pdf.addPage();
                }
                
                const sourceY = (position * canvas.width) / pageWidth;
                const sourceHeight = Math.min(pageHeight, remainingHeight);
                const sourceHeightPx = (sourceHeight * canvas.width) / pageWidth;
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = sourceHeightPx;
                const ctx = tempCanvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeightPx, 0, 0, canvas.width, sourceHeightPx);
                
                const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
                pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, sourceHeight);
                
                position += sourceHeight;
                remainingHeight -= sourceHeight;
                pageNumber++;
            }
        }
        
        const timestamp = new Date().toISOString().slice(0, 10);
        pdf.save(`document-${timestamp}.pdf`);
        
    } catch (error) {
        console.error('PDF导出失败:', error);
        alert('PDF导出失败: ' + error.message);
    } finally {
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
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