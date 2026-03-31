const TemplateManager = {
    templates: [],
    customTemplates: [],
    buttonAdded: false,
    
    init: async function() {
        console.log('TemplateManager 开始初始化');
        await this.loadTemplates();
        this.loadCustomTemplates();
        this.createTemplateSelector();
        console.log('TemplateManager 初始化完成');
    },
    
    addToolbarButtonLater: function() {
        setTimeout(() => {
            this.addToolbarButton();
        }, 100);
    },
    
    loadTemplates: async function() {
        const templateFiles = ['exam.json', 'lecture.json', 'summary.json'];
        console.log(`尝试加载 ${templateFiles.length} 个模板文件`);
        
        for (const file of templateFiles) {
            try {
                const response = await fetch(`templates/${file}`);
                if (response.ok) {
                    const template = await response.json();
                    this.templates.push(template);
                    console.log(`模板 ${file} 加载成功`);
                } else {
                    console.warn(`模板 ${file} 加载失败，状态码: ${response.status}`);
                }
            } catch (e) {
                console.warn(`无法加载模板 ${file}:`, e);
            }
        }
        console.log(`共加载 ${this.templates.length} 个预设模板`);
    },
    
    loadCustomTemplates: function() {
        const saved = localStorage.getItem('customTemplates');
        if (saved) {
            try {
                this.customTemplates = JSON.parse(saved);
            } catch (e) {
                console.warn('无法解析自定义模板:', e);
            }
        }
    },
    
    saveCustomTemplates: function() {
        localStorage.setItem('customTemplates', JSON.stringify(this.customTemplates));
    },
    
    createTemplateSelector: function() {
        let selector = document.getElementById('templateSelector');
        if (!selector) {
            selector = document.createElement('div');
            selector.className = 'modal-overlay';
            selector.id = 'templateSelector';
            document.body.appendChild(selector);
        }
        
        let templateList = '<div class="template-categories">';
        
        templateList += `
            <div class="template-category">
                <div class="template-category-title">预设模板</div>
                <div class="template-grid">
        `;
        
        this.templates.forEach(template => {
            templateList += `
                <div class="template-card" data-id="${template.id}" data-type="preset">
                    <div class="template-card-icon">${this.getTemplateIcon(template.id)}</div>
                    <div class="template-card-name">${template.name}</div>
                    <div class="template-card-desc">${template.description}</div>
                </div>
            `;
        });
        
        templateList += `</div></div>`;
        
        if (this.customTemplates.length > 0) {
            templateList += `
                <div class="template-category">
                    <div class="template-category-title">自定义模板</div>
                    <div class="template-grid">
            `;
            
            this.customTemplates.forEach((template, index) => {
                templateList += `
                    <div class="template-card" data-index="${index}" data-type="custom">
                        <div class="template-card-icon">📄</div>
                        <div class="template-card-name">${template.name}</div>
                        <div class="template-card-desc">${template.description || '自定义模板'}</div>
                        <button class="template-delete-btn" data-index="${index}">删除</button>
                    </div>
                `;
            });
            
            templateList += `</div></div>`;
        }
        
        templateList += `</div>`;
        
        selector.innerHTML = `
            <div class="modal template-modal">
                <div class="modal-header">
                    <h3>选择模板</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body template-body">
                    ${templateList}
                    <div class="template-actions">
                        <button class="btn btn-primary" id="saveAsTemplateBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            保存当前为模板
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.bindSelectorEvents();
    },
    
    getTemplateIcon: function(id) {
        const icons = {
            'exam': '📝',
            'lecture': '📚',
            'summary': '📋'
        };
        return icons[id] || '📄';
    },
    
    bindSelectorEvents: function() {
        const selector = document.getElementById('templateSelector');
        
        selector.querySelector('.modal-close').addEventListener('click', () => {
            selector.classList.remove('show');
        });
        
        selector.addEventListener('click', (e) => {
            if (e.target === selector) {
                selector.classList.remove('show');
            }
            
            if (e.target.classList.contains('template-card')) {
                const type = e.target.dataset.type;
                const id = e.target.dataset.id;
                const index = e.target.dataset.index;
                
                if (type === 'preset') {
                    this.applyTemplate(id);
                } else if (type === 'custom') {
                    this.applyCustomTemplate(parseInt(index));
                }
                
                selector.classList.remove('show');
            }
            
            if (e.target.classList.contains('template-delete-btn')) {
                e.stopPropagation();
                const index = parseInt(e.target.dataset.index);
                this.deleteCustomTemplate(index);
            }
        });
        
        document.getElementById('saveAsTemplateBtn').addEventListener('click', () => {
            selector.classList.remove('show');
            this.showSaveTemplateModal();
        });
    },
    
    addToolbarButton: function() {
        const toolbar = document.getElementById('formatToolbar');
        if (!toolbar) {
            console.error('工具栏 #formatToolbar 不存在');
            return false;
        }
        
        if (this.buttonAdded) {
            console.log('模板按钮已添加，跳过');
            return true;
        }
        
        if (document.getElementById('templateBtn')) {
            console.log('模板按钮已存在，跳过');
            this.buttonAdded = true;
            return true;
        }
        
        const modeSwitch = toolbar.querySelector('.mode-switch');
        const templateButton = this.createTemplateButton();
        
        if (!modeSwitch) {
            console.warn('找不到 mode-switch 元素，将模板按钮添加到工具栏末尾');
            toolbar.appendChild(templateButton);
        } else {
            toolbar.insertBefore(templateButton, modeSwitch);
        }
        
        this.buttonAdded = true;
        console.log('模板按钮已添加到工具栏');
        return true;
    },
    
    createTemplateButton: function() {
        const templateGroup = document.createElement('div');
        templateGroup.className = 'toolbar-group';
        
        const btn = document.createElement('button');
        btn.className = 'toolbar-btn';
        btn.id = 'templateBtn';
        btn.title = '选择模板';
        
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.style.fill = 'none';
        svg.style.stroke = '#ccc';
        svg.setAttribute('stroke-width', '2');
        
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', '3');
        rect.setAttribute('y', '3');
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '18');
        rect.setAttribute('rx', '2');
        
        const line1 = document.createElementNS(svgNS, 'line');
        line1.setAttribute('x1', '3');
        line1.setAttribute('y1', '9');
        line1.setAttribute('x2', '21');
        line1.setAttribute('y2', '9');
        
        const line2 = document.createElementNS(svgNS, 'line');
        line2.setAttribute('x1', '9');
        line2.setAttribute('y1', '9');
        line2.setAttribute('x2', '9');
        line2.setAttribute('y2', '21');
        
        svg.appendChild(rect);
        svg.appendChild(line1);
        svg.appendChild(line2);
        btn.appendChild(svg);
        templateGroup.appendChild(btn);
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('点击模板按钮');
            this.showTemplateSelector();
        });
        
        console.log('模板按钮元素已创建');
        return templateGroup;
    },
    
    showTemplateSelector: function() {
        this.createTemplateSelector();
        const selector = document.getElementById('templateSelector');
        if (selector) {
            selector.classList.add('show');
        }
    },
    
    applyTemplate: function(id) {
        const template = this.templates.find(t => t.id === id);
        if (template && window.setEditorContent) {
            window.setEditorContent(template.html);
            if (window.onEditorChange) {
                window.onEditorChange();
            }
        }
    },
    
    applyCustomTemplate: function(index) {
        const template = this.customTemplates[index];
        if (template && window.setEditorContent) {
            window.setEditorContent(template.html);
            if (window.onEditorChange) {
                window.onEditorChange();
            }
        }
    },
    
    showSaveTemplateModal: function() {
        const overlay = document.getElementById('modalOverlay') || document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modalOverlay';
        
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>保存为模板</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>模板名称</label>
                        <input type="text" id="templateName" placeholder="如：我的试卷模板">
                    </div>
                    <div class="form-group">
                        <label>模板描述</label>
                        <input type="text" id="templateDesc" placeholder="简要描述模板用途">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="modalCancel">取消</button>
                    <button class="btn btn-primary" id="modalConfirm">保存</button>
                </div>
            </div>
        `;
        
        if (!document.getElementById('modalOverlay')) {
            document.body.appendChild(overlay);
        }
        
        overlay.classList.add('show');
        
        overlay.querySelector('.modal-close').addEventListener('click', () => {
            overlay.classList.remove('show');
        });
        
        overlay.querySelector('#modalCancel').addEventListener('click', () => {
            overlay.classList.remove('show');
        });
        
        overlay.querySelector('#modalConfirm').addEventListener('click', () => {
            const name = document.getElementById('templateName').value.trim();
            const desc = document.getElementById('templateDesc').value.trim();
            
            if (!name) {
                alert('请输入模板名称');
                return;
            }
            
            this.saveCurrentAsTemplate(name, desc);
            overlay.classList.remove('show');
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('show');
        });
    },
    
    saveCurrentAsTemplate: function(name, description) {
        const content = window.getEditorContent ? window.getEditorContent() : '';
        
        if (!content) {
            alert('编辑器内容为空，无法保存');
            return;
        }
        
        const template = {
            id: 'custom_' + Date.now(),
            name: name,
            description: description || '自定义模板',
            html: content,
            createdAt: new Date().toISOString()
        };
        
        this.customTemplates.push(template);
        this.saveCustomTemplates();
        
        this.createTemplateSelector();
        
        alert('模板已保存');
    },
    
    deleteCustomTemplate: function(index) {
        if (confirm('确定要删除这个模板吗？')) {
            this.customTemplates.splice(index, 1);
            this.saveCustomTemplates();
            this.createTemplateSelector();
            document.getElementById('templateSelector').classList.add('show');
        }
    }
};

window.TemplateManager = TemplateManager;