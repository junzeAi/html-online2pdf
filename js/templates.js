const TemplateManager = {
    templates: [],
    customTemplates: [],
    selectorInitialized: false,
    
    init: function() {
        console.log('TemplateManager 开始初始化');
        this.loadBuiltInTemplates();
        this.loadCustomTemplates();
        this.selectorInitialized = false;
        console.log('TemplateManager 初始化完成');
    },
    
    loadBuiltInTemplates: function() {
        this.templates = [
            {
                id: 'exam',
                name: '试卷',
                category: '教学',
                description: '标准考试试卷模板，包含标题、考生信息、题目区域',
                html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>试卷</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', SimSun, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.8;
        }
        .exam-header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .exam-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .exam-info {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 15px;
        }
        .exam-info-item {
            display: flex;
            gap: 5px;
        }
        .exam-info-label {
            font-weight: bold;
        }
        .exam-info-value {
            border-bottom: 1px solid #333;
            min-width: 100px;
        }
        .section {
            margin: 20px 0;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            background: #f0f0f0;
            padding: 5px 10px;
            margin-bottom: 15px;
        }
        .question {
            margin: 15px 0;
            padding-left: 20px;
        }
        .question-number {
            font-weight: bold;
        }
        .question-content {
            margin: 5px 0;
        }
        .question-options {
            margin-left: 20px;
        }
        .option {
            margin: 5px 0;
        }
        .answer-area {
            margin: 10px 0;
            min-height: 50px;
            border: 1px dashed #ccc;
            padding: 10px;
        }
        .score-box {
            display: inline-block;
            border: 1px solid #333;
            padding: 2px 8px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="exam-header">
        <div class="exam-title">___________试卷</div>
        <div class="exam-info">
            <div class="exam-info-item">
                <span class="exam-info-label">姓名:</span>
                <span class="exam-info-value"></span>
            </div>
            <div class="exam-info-item">
                <span class="exam-info-label">班级:</span>
                <span class="exam-info-value"></span>
            </div>
            <div class="exam-info-item">
                <span class="exam-info-label">学号:</span>
                <span class="exam-info-value"></span>
            </div>
            <div class="exam-info-item">
                <span class="exam-info-label">得分:</span>
                <span class="exam-info-value"></span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">一、选择题 <span class="score-box">共20分</span></div>
        <div class="question">
            <span class="question-number">1.</span>
            <span class="question-content">请在此填写题目内容...</span>
            <div class="question-options">
                <div class="option">A. 选项A</div>
                <div class="option">B. 选项B</div>
                <div class="option">C. 选项C</div>
                <div class="option">D. 选项D</div>
            </div>
        </div>
        <div class="question">
            <span class="question-number">2.</span>
            <span class="question-content">请在此填写题目内容...</span>
            <div class="question-options">
                <div class="option">A. 选项A</div>
                <div class="option">B. 选项B</div>
                <div class="option">C. 选项C</div>
                <div class="option">D. 选项D</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">二、填空题 <span class="score-box">共20分</span></div>
        <div class="question">
            <span class="question-number">1.</span>
            <span class="question-content">请在此填写题目内容，空格处用____表示。</span>
        </div>
        <div class="question">
            <span class="question-number">2.</span>
            <span class="question-content">请在此填写题目内容，空格处用____表示。</span>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">三、简答题 <span class="score-box">共30分</span></div>
        <div class="question">
            <span class="question-number">1.</span>
            <span class="question-content">请在此填写题目内容...</span>
            <div class="answer-area">答题区域</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">四、综合题 <span class="score-box">共30分</span></div>
        <div class="question">
            <span class="question-number">1.</span>
            <span class="question-content">请在此填写题目内容...</span>
            <div class="answer-area" style="min-height: 100px;">答题区域</div>
        </div>
    </div>
</body>
</html>`
            },
            {
                id: 'lecture',
                name: '讲义',
                category: '教学',
                description: '课程讲义模板，包含标题、章节结构、要点提示',
                html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>讲义</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', SimSun, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.8;
        }
        .lecture-header {
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .lecture-title {
            font-size: 22px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 8px;
        }
        .lecture-meta {
            font-size: 14px;
            color: #666;
            display: flex;
            gap: 20px;
        }
        .chapter {
            margin: 25px 0;
        }
        .chapter-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
            border-left: 4px solid #2c5aa0;
            padding-left: 10px;
            margin-bottom: 15px;
        }
        .section {
            margin: 15px 0;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .content-block {
            margin: 10px 0;
            padding: 10px 15px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .key-point {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .key-point-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
        }
        .example-box {
            background: #e7f3ff;
            border: 1px solid #2c5aa0;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .example-title {
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
        }
        .note-box {
            background: #d4edda;
            border: 1px solid #28a745;
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .note-title {
            font-weight: bold;
            color: #155724;
        }
        ul, ol {
            margin-left: 20px;
        }
        li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="lecture-header">
        <div class="lecture-title">课程名称 - 第N讲</div>
        <div class="lecture-meta">
            <span>授课教师：________</span>
            <span>日期：________</span>
            <span>课时：________</span>
        </div>
    </div>
    
    <div class="chapter">
        <div class="chapter-title">一、本章概述</div>
        <div class="section">
            <div class="section-title">学习目标</div>
            <div class="content-block">
                <ol>
                    <li>了解________的基本概念</li>
                    <li>掌握________的核心原理</li>
                    <li>能够应用________解决实际问题</li>
                </ol>
            </div>
        </div>
    </div>
    
    <div class="chapter">
        <div class="chapter-title">二、核心内容</div>
        <div class="section">
            <div class="section-title">2.1 概念定义</div>
            <div class="content-block">
                <p>请在此填写概念定义和详细说明...</p>
            </div>
            <div class="key-point">
                <div class="key-point-title">重点</div>
                <p>请在此标注重点内容...</p>
            </div>
        </div>
        <div class="section">
            <div class="section-title">2.2 原理讲解</div>
            <div class="content-block">
                <p>请在此填写原理讲解内容...</p>
            </div>
            <div class="example-box">
                <div class="example-title">示例</div>
                <p>请在此填写示例内容...</p>
            </div>
        </div>
    </div>
    
    <div class="chapter">
        <div class="chapter-title">三、扩展知识</div>
        <div class="section">
            <div class="content-block">
                <p>请在此填写扩展内容...</p>
            </div>
            <div class="note-box">
                <div class="note-title">注意</div>
                <p>请在此填写注意事项...</p>
            </div>
        </div>
    </div>
    
    <div class="chapter">
        <div class="chapter-title">四、小结</div>
        <div class="content-block">
            <p>请在此填写本讲小结...</p>
        </div>
    </div>
</body>
</html>`
            },
            {
                id: 'summary',
                name: '知识点总结',
                category: '教学',
                description: '知识点总结模板，包含分类整理、要点归纳、思维导图结构',
                html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>知识点总结</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', SimSun, sans-serif;
            padding: 20px;
            max-width: 900px;
            margin: 0 auto;
            line-height: 1.8;
        }
        .summary-header {
            text-align: center;
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .summary-title {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 10px;
        }
        .summary-subtitle {
            font-size: 14px;
            color: #666;
        }
        .knowledge-section {
            margin: 25px 0;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            background: #fff;
        }
        .knowledge-title {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 8px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .knowledge-title-number {
            background: #e74c3c;
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
        .knowledge-item {
            margin: 12px 0;
            padding: 10px 15px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        .knowledge-item-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .knowledge-item-content {
            color: #555;
        }
        .formula-box {
            background: #fff8e1;
            border: 1px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            text-align: center;
            font-size: 16px;
        }
        .formula-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 8px;
            text-align: left;
        }
        .compare-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .compare-table th,
        .compare-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        .compare-table th {
            background: #e74c3c;
            color: #fff;
        }
        .compare-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        .tips-box {
            background: #e8f5e9;
            border: 1px solid #4caf50;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .tips-title {
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 8px;
        }
        .mindmap-item {
            display: flex;
            align-items: flex-start;
            margin: 10px 0;
        }
        .mindmap-bullet {
            width: 20px;
            height: 20px;
            background: #e74c3c;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-right: 10px;
            flex-shrink: 0;
        }
        .mindmap-content {
            flex: 1;
        }
        .mindmap-subitem {
            margin-left: 30px;
            padding-left: 15px;
            border-left: 2px solid #ddd;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="summary-header">
        <div class="summary-title">________知识点总结</div>
        <div class="summary-subtitle">________章节 | ________学科</div>
    </div>
    
    <div class="knowledge-section">
        <div class="knowledge-title">
            <span class="knowledge-title-number">01</span>
            基本概念
        </div>
        <div class="knowledge-item">
            <div class="knowledge-item-title">概念一</div>
            <div class="knowledge-item-content">请在此填写概念定义和解释...</div>
        </div>
        <div class="knowledge-item">
            <div class="knowledge-item-title">概念二</div>
            <div class="knowledge-item-content">请在此填写概念定义和解释...</div>
        </div>
    </div>
    
    <div class="knowledge-section">
        <div class="knowledge-title">
            <span class="knowledge-title-number">02</span>
            核心公式
        </div>
        <div class="formula-box">
            <div class="formula-title">公式一：</div>
            <p><strong>公式内容（如：a² + b² = c²）</strong></p>
        </div>
        <div class="formula-box">
            <div class="formula-title">公式二：</div>
            <p><strong>公式内容</strong></p>
        </div>
        <div class="tips-box">
            <div class="tips-title">记忆技巧</div>
            <p>请在此填写公式记忆技巧...</p>
        </div>
    </div>
    
    <div class="knowledge-section">
        <div class="knowledge-title">
            <span class="knowledge-title-number">03</span>
            对比辨析
        </div>
        <table class="compare-table">
            <tr>
                <th>对比项</th>
                <th>概念A</th>
                <th>概念B</th>
            </tr>
            <tr>
                <td>定义</td>
                <td>请填写...</td>
                <td>请填写...</td>
            </tr>
            <tr>
                <td>特点</td>
                <td>请填写...</td>
                <td>请填写...</td>
            </tr>
            <tr>
                <td>应用</td>
                <td>请填写...</td>
                <td>请填写...</td>
            </tr>
        </table>
    </div>
    
    <div class="knowledge-section">
        <div class="knowledge-title">
            <span class="knowledge-title-number">04</span>
            知识脉络
        </div>
        <div class="mindmap-item">
            <div class="mindmap-bullet">1</div>
            <div class="mindmap-content">
                <strong>核心知识点一</strong>
                <div class="mindmap-subitem">
                    <div>• 子知识点a</div>
                    <div>• 子知识点b</div>
                </div>
            </div>
        </div>
        <div class="mindmap-item">
            <div class="mindmap-bullet">2</div>
            <div class="mindmap-content">
                <strong>核心知识点二</strong>
                <div class="mindmap-subitem">
                    <div>• 子知识点a</div>
                    <div>• 子知识点b</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
            }
        ];
        console.log(`共加载 ${this.templates.length} 个内置模板`);
    },
    
    loadTemplates: async function() {
        console.log('内置模板已直接加载，无需 fetch');
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
        console.log('createTemplateSelector 被调用');
        
        if (this.selectorInitialized) {
            console.log('模板选择器已初始化，跳过重复创建');
            return;
        }
        
        console.log('templates 数量:', this.templates.length);
        
        let selector = document.getElementById('templateSelector');
        if (!selector) {
            selector = document.createElement('div');
            selector.className = 'modal-overlay';
            selector.id = 'templateSelector';
            document.body.appendChild(selector);
            console.log('创建新的 templateSelector 元素');
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
        this.selectorInitialized = true;
        console.log('模板选择器创建完成并已初始化');
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
                return;
            }
            
            const card = e.target.closest('.template-card');
            if (card) {
                const type = card.dataset.type;
                const id = card.dataset.id;
                const index = card.dataset.index;
                
                console.log('点击了模板卡片，type:', type, 'id:', id, 'index:', index);
                
                if (type === 'preset') {
                    this.applyTemplate(id);
                } else if (type === 'custom') {
                    this.applyCustomTemplate(parseInt(index));
                }
                
                selector.classList.remove('show');
                return;
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
    
showTemplateSelector: function() {
        console.log('showTemplateSelector 被调用');
        console.log('templates 数量:', this.templates.length);
        this.createTemplateSelector();
        const selector = document.getElementById('templateSelector');
        console.log('selector 元素:', selector);
        if (selector) {
            selector.classList.add('show');
            console.log('模板选择器已显示');
        } else {
            console.error('未找到 templateSelector 元素');
        }
    },
    
    applyTemplate: function(id) {
        console.log('applyTemplate 被调用，id:', id);
        const template = this.templates.find(t => t.id === id);
        if (!template) {
            console.error('未找到模板:', id);
            return;
        }
        
        if (!window.setEditorContent) {
            console.error('setEditorContent 不存在');
            return;
        }
        
        const selector = document.getElementById('templateSelector');
        if (selector) {
            selector.classList.remove('show');
        }
        
        console.log('开始应用模板');
        
        requestAnimationFrame(() => {
            try {
                window.setEditorContent(template.html);
                console.log('模板内容已设置到编辑器');
                if (window.EditorStorage) {
                    window.EditorStorage.save();
                }

                requestAnimationFrame(() => {
                    if (window.refreshPreview) {
                        window.refreshPreview();
                        console.log('预览已刷新');
                    }
                });
            } catch (e) {
                console.error('应用模板失败:', e);
            }
        });
    },
    
    applyCustomTemplate: function(index) {
        console.log('applyCustomTemplate 被调用，index:', index);
        const template = this.customTemplates[index];
        if (!template) {
            console.error('未找到自定义模板:', index);
            return;
        }
        
        if (!window.setEditorContent) {
            console.error('setEditorContent 不存在');
            return;
        }
        
        const selector = document.getElementById('templateSelector');
        if (selector) {
            selector.classList.remove('show');
        }
        
        console.log('开始应用自定义模板');
        
        requestAnimationFrame(() => {
            try {
                window.setEditorContent(template.html);
                console.log('自定义模板内容已设置到编辑器');
                
                requestAnimationFrame(() => {
                    if (window.refreshPreview) {
                        window.refreshPreview();
                        console.log('预览已刷新');
                    }
                });
            } catch (e) {
                console.error('应用自定义模板失败:', e);
            }
        });
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
        
        this.selectorInitialized = false;
        
        alert('模板已保存');
    },
    
    deleteCustomTemplate: function(index) {
        if (confirm('确定要删除这个模板吗？')) {
            this.customTemplates.splice(index, 1);
            this.saveCustomTemplates();
            this.selectorInitialized = false;
            
            const selector = document.getElementById('templateSelector');
            if (selector) {
                selector.classList.remove('show');
            }
            
            setTimeout(() => {
                this.showTemplateSelector();
            }, 100);
        }
    }
};

window.TemplateManager = TemplateManager;