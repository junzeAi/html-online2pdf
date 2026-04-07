function initImport() {
    const fileInput = document.getElementById('htmlFileInput');
    
    if (!fileInput) {
        console.error('找不到文件输入元素 #htmlFileInput');
        return;
    }
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const content = event.target.result;
            
            if (window.setEditorContent) {
                window.setEditorContent(content);
                
                if (window.onEditorChange) {
                    window.onEditorChange();
                }
                
                console.log('HTML文件导入成功:', file.name);
            } else {
                console.error('编辑器未初始化，无法导入');
                alert('编辑器未准备好，请稍后再试');
            }
        };
        
        reader.onerror = function() {
            console.error('文件读取失败');
            alert('文件读取失败，请重试');
        };
        
        reader.readAsText(file, 'UTF-8');
        
        fileInput.value = '';
    });
    
    console.log('导入HTML功能初始化成功');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImport);
} else {
    initImport();
}