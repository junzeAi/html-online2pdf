const FormatToolbar = {
    iframe: null,
    iframeDoc: null,
    floatingMenu: null,
    currentSelection: null,
    isVisualModeActive: false,
    visualListenersAttached: false,
    visualInputHandler: null,
    visualMouseDownHandler: null,
    visualMouseUpHandler: null,
    visualKeyDownHandler: null,
    visualUndoRedoHandler: null,
    undoRedoListenerAdded: false,
    saveStateTimeout: null,
    
    fonts: [
        { name: '宋体', value: 'SimSun, serif' },
        { name: '黑体', value: 'SimHei, sans-serif' },
        { name: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
        { name: '楷体', value: 'KaiTi, serif' },
        { name: '仿宋', value: 'FangSong, serif' },
        { name: 'Arial', value: 'Arial, sans-serif' },
        { name: 'Times New Roman', value: '"Times New Roman", serif' },
        { name: 'Courier New', value: '"Courier New", monospace' }
    ],
    
    fontSizes: [
        { name: '12px', value: '1' },
        { name: '14px', value: '2' },
        { name: '16px', value: '3' },
        { name: '18px', value: '4' },
        { name: '20px', value: '5' },
        { name: '24px', value: '6' },
        { name: '32px', value: '7' }
    ],
    
    colors: [
        '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff', '#ff0000', '#ff6600',
        '#ffcc00', '#ffff00', '#99cc00', '#339966', '#00cccc', '#3366ff', '#6633ff', '#cc33cc',
        '#990000', '#993300', '#996600', '#999900', '#006600', '#006666', '#003399', '#330066',
        '#660066', '#cc0066', '#ff3366', '#ff99cc', '#ffcc99', '#ffffcc', '#ccffcc', '#ccffff'
    ],
    
    highlighterColors: [
        { name: '黄色', color: '#ffeb3b' },
        { name: '绿色', color: '#a5d6a7' },
        { name: '蓝色', color: '#81d4fa' },
        { name: '粉色', color: '#f8bbd9' },
        { name: '橙色', color: '#ffcc80' },
        { name: '紫色', color: '#ce93d8' },
        { name: '红色', color: '#ef9a9a' },
        { name: '青色', color: '#80cbc4' }
    ],
    
    currentHighlighterColor: '#ffeb3b',

    init: function() {
        this.iframe = document.getElementById('preview');
        if (!this.iframe) {
            console.error('找不到预览 iframe #preview');
            return;
        }
        if (this.initialized) return;
        this.initialized = true;
        this.createToolbar();
        this.createFloatingMenu();
        this.bindEvents();
        console.log('FormatToolbar 初始化成功');
    },

    createToolbar: function() {
        const header = document.createElement('div');
        header.className = 'app-header';
        header.innerHTML = '<div class="app-title">钧泽Ai教育-html编辑器</div>';
        
        const toolbar = document.createElement('div');
        toolbar.className = 'format-toolbar';
        toolbar.id = 'formatToolbar';
        
        toolbar.innerHTML = `
            <div class="format-toolbar-center">
            <div class="toolbar-group">
                <button class="toolbar-btn" id="undoBtn" title="撤销 (Ctrl+Z)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 7v6h6"></path>
                        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
                    </svg>
                </button>
                <button class="toolbar-btn" id="redoBtn" title="恢复 (Ctrl+Y)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 7v6h-6"></path>
                        <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
                    </svg>
                </button>
            </div>
            
            <div class="toolbar-group">
                <button class="toolbar-btn" data-command="bold" title="加粗 (Ctrl+B)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    </svg>
                </button>
                <button class="toolbar-btn" data-command="italic" title="斜体 (Ctrl+I)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="4" x2="10" y2="4"></line>
                        <line x1="14" y1="20" x2="5" y2="20"></line>
                        <line x1="15" y1="4" x2="9" y2="20"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" data-command="underline" title="下划线 (Ctrl+U)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                        <line x1="4" y1="21" x2="20" y2="21"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" data-command="strikeThrough" title="删除线">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.1 2.7 3.1 3.4"></path>
                        <path d="M4 12h16"></path>
                        <path d="M7 16c0 3 2.5 4 5 4 2.7 0 5-1 5.4-4"></path>
                    </svg>
                </button>
            </div>
            
            <div class="toolbar-group">
                <div class="toolbar-dropdown" id="fontDropdown">
                    <button class="dropdown-btn">
                        <span class="dropdown-label">字体</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="dropdown-menu" id="fontMenu"></div>
                </div>
                <div class="toolbar-dropdown" id="fontSizeDropdown">
                    <button class="dropdown-btn">
                        <span class="dropdown-label">字号</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="dropdown-menu" id="fontSizeMenu"></div>
                </div>
            </div>
            
            <div class="toolbar-group">
                <div class="toolbar-dropdown" id="textColorDropdown">
                    <button class="dropdown-btn color-picker-btn" title="文字颜色">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M4 20h16"></path>
                            <path d="M9.5 4h5l5 12h-2l-1.5-4h-8l-1.5 4h-2l5-12z"></path>
                        </svg>
                        <span class="color-indicator" style="background: #ff0000;"></span>
                    </button>
                    <div class="dropdown-menu color-picker-dropdown" id="textColorMenu"></div>
                </div>
                <div class="toolbar-dropdown" id="bgColorDropdown">
                    <button class="dropdown-btn color-picker-btn" title="背景颜色">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                            <path d="M3 9h18"></path>
                        </svg>
                        <span class="color-indicator" style="background: #ffff00;"></span>
                    </button>
                    <div class="dropdown-menu color-picker-dropdown" id="bgColorMenu"></div>
                </div>
                <div class="toolbar-dropdown" id="highlighterDropdown">
                    <button class="dropdown-btn color-picker-btn highlighter-btn" title="荧光笔">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M12 3v18"></path>
                            <path d="M8 7l4-4 4 4"></path>
                            <rect x="6" y="12" width="12" height="6" fill="currentColor" opacity="0.3"></rect>
                        </svg>
                        <span class="color-indicator highlighter-indicator" data-hl-color="#ffeb3b"></span>
                    </button>
                    <div class="dropdown-menu color-picker-dropdown" id="highlighterMenu"></div>
                </div>
            </div>
            
            <div class="toolbar-group">
                <button class="toolbar-btn" data-command="justifyLeft" title="左对齐">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="15" y2="12"></line>
                        <line x1="3" y1="18" x2="18" y2="18"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" data-command="justifyCenter" title="居中">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="6" y1="12" x2="18" y2="12"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" data-command="justifyRight" title="右对齐">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="9" y1="12" x2="21" y2="12"></line>
                        <line x1="6" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="toolbar-group">
                <button class="toolbar-btn" data-command="insertOrderedList" title="有序列表">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="10" y1="6" x2="21" y2="6"></line>
                        <line x1="10" y1="12" x2="21" y2="12"></line>
                        <line x1="10" y1="18" x2="21" y2="18"></line>
                        <text x="4" y="8" font-size="8" fill="currentColor">1</text>
                        <text x="4" y="14" font-size="8" fill="currentColor">2</text>
                        <text x="4" y="20" font-size="8" fill="currentColor">3</text>
                    </svg>
                </button>
                <button class="toolbar-btn" data-command="insertUnorderedList" title="无序列表">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="10" y1="6" x2="21" y2="6"></line>
                        <line x1="10" y1="12" x2="21" y2="12"></line>
                        <line x1="10" y1="18" x2="21" y2="18"></line>
                        <circle cx="5" cy="6" r="1.5" fill="currentColor"></circle>
                        <circle cx="5" cy="12" r="1.5" fill="currentColor"></circle>
                        <circle cx="5" cy="18" r="1.5" fill="currentColor"></circle>
                    </svg>
                </button>
            </div>
            
            <div class="toolbar-group">
                <button class="toolbar-btn" id="insertImageBtn" title="插入图片">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                        <path d="M21 15l-5-5L5 21"></path>
                    </svg>
                </button>
                <button class="toolbar-btn" id="insertLinkBtn" title="插入链接">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                </button>
                <button class="toolbar-btn" id="insertTableBtn" title="插入表格">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="3" y1="15" x2="21" y2="15"></line>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                        <line x1="15" y1="3" x2="15" y2="21"></line>
                    </svg>
                </button>
            </div>
            
            <div class="toolbar-group" id="fileOperationsGroup">
                <button class="toolbar-btn" id="templateBtn" title="选择模板">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="9" x2="9" y2="21"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" id="importHtmlBtn" title="导入HTML">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" id="exportPdfBtn" title="导出PDF">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                </button>
                <button class="toolbar-btn" id="refreshPreviewBtn" title="刷新预览">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                </button>
            </div>
            </div>
            
            <div class="mode-switch">
                <button class="mode-switch-btn active" id="codeModeBtn" title="代码模式">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    代码
                </button>
                <button class="mode-switch-btn visual-btn" id="visualModeBtn" title="可视化模式">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                    </svg>
                    可视化
                </button>
            </div>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.parentNode.insertBefore(toolbar, container);
            container.parentNode.insertBefore(header, toolbar);
        } else {
            document.body.insertBefore(toolbar, document.body.firstChild);
            document.body.insertBefore(header, toolbar);
        }
        
        this.populateDropdowns();
    },

    populateDropdowns: function() {
        const fontMenu = document.getElementById('fontMenu');
        if (!fontMenu) {
            console.error('找不到 fontMenu');
            return;
        }
        this.fonts.forEach(font => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.style.fontFamily = font.value;
            item.textContent = font.name;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.execFontCommand(font.value, font.name);
                fontMenu.classList.remove('show');
            });
            fontMenu.appendChild(item);
        });
        
        const fontSizeMenu = document.getElementById('fontSizeMenu');
        if (!fontSizeMenu) {
            console.error('找不到 fontSizeMenu');
            return;
        }
        this.fontSizes.forEach(size => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = size.name;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.execCommand('fontSize', size.value);
                fontSizeMenu.classList.remove('show');
            });
            fontSizeMenu.appendChild(item);
        });
        
        this.createColorPicker('textColorMenu', (color) => this.execCommand('foreColor', color));
        this.createColorPicker('bgColorMenu', (color) => this.execCommand('hiliteColor', color));
        this.createHighlighterPicker('highlighterMenu');
        console.log('下拉菜单内容已填充');
    },

    createHighlighterPicker: function(menuId) {
        const menu = document.getElementById(menuId);
        if (!menu) {
            console.error(`找不到 ${menuId}`);
            return;
        }
        
        const grid = document.createElement('div');
        grid.className = 'color-grid highlighter-grid';
        
        this.highlighterColors.forEach(hl => {
            const cell = document.createElement('div');
            cell.className = 'color-cell highlighter-cell';
            cell.setAttribute('data-hl-preview', hl.color);
            cell.title = hl.name;
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentHighlighterColor = hl.color;
                this.applyHighlighter(hl.color);
                this.updateHighlighterIndicator(hl.color);
                menu.classList.remove('show');
            });
            grid.appendChild(cell);
        });
        
        menu.appendChild(grid);
        
        const clearBtn = document.createElement('div');
        clearBtn.className = 'dropdown-item highlighter-clear';
        clearBtn.textContent = '清除荧光笔';
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearHighlighter();
            menu.classList.remove('show');
        });
        menu.appendChild(clearBtn);
        
        this.updateHighlighterIndicator(this.currentHighlighterColor);
    },
    
    updateHighlighterIndicator: function(color) {
        const indicator = document.querySelector('#highlighterDropdown .color-indicator');
        if (indicator) {
            indicator.setAttribute('data-hl-color', color);
        }
    },
    
    applyHighlighter: function(color) {
        const iframe = document.getElementById('preview');
        if (!iframe || !iframe.contentDocument) {
            alert('预览区域未加载');
            return;
        }
        
        const doc = iframe.contentDocument;
        const selection = iframe.contentWindow.getSelection();
        
        if (!selection || selection.rangeCount === 0) {
            alert('请先选择要标记的文本');
            return;
        }
        
        const selectedText = selection.toString().trim();
        if (selectedText.length === 0) {
            alert('请先选择要标记的文本');
            return;
        }
        
        const range = selection.getRangeAt(0);
        
        this.injectPrintStyle(doc);
        
        try {
            const span = doc.createElement('span');
            span.className = 'highlighter-mark';
            span.setAttribute('data-hl-color', color);
            span.style.cssText = `background: linear-gradient(to bottom, transparent 50%, ${color} 50%); -webkit-print-color-adjust: exact; print-color-adjust: exact;`;
            
            try {
                range.surroundContents(span);
            } catch (e) {
                console.warn('surroundContents 失败，使用复杂选区处理:', e);
                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);
            }
            
            selection.removeAllRanges();
            
            if (!this.isDoingUndoRedo) {
                this.saveVisualState();
            }
            
            const content = doc.documentElement.outerHTML;
            const html = '<!DOCTYPE html>\n' + content;
            if (window.setEditorContent) {
                window.setEditorContent(html);
            }
        } catch (e) {
            console.error('荧光笔应用失败:', e);
            alert('荧光笔应用失败，请重新选择文本后重试');
        }
    },
    
    injectPrintStyle: function(doc) {
        const existingStyle = doc.getElementById('printStyle');
        if (existingStyle) return;
        
        const style = doc.createElement('style');
        style.id = 'printStyle';
        style.textContent = `
            @media print {
                .highlighter-mark {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;
        doc.head.appendChild(style);
    },
    
    injectHighlighterStyle: function(doc, color) {
    },
    
    getColorClass: function(color) {
        const colorMap = {
            '#ffeb3b': 'yellow',
            '#a5d6a7': 'green',
            '#81d4fa': 'blue',
            '#f8bbd9': 'pink',
            '#ffcc80': 'orange',
            '#ce93d8': 'purple',
            '#ef9a9a': 'red',
            '#80cbc4': 'cyan'
        };
        return colorMap[color] || color.replace('#', '');
    },
    
    clearHighlighter: function() {
        const iframe = document.getElementById('preview');
        if (!iframe || !iframe.contentDocument) return;
        
        const doc = iframe.contentDocument;
        const selection = iframe.contentWindow.getSelection();
        
        if (!selection || selection.rangeCount === 0) {
            alert('请先选择要清除荧光笔的文本');
            return;
        }
        
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        const highlighterSpans = doc.querySelectorAll('.highlighter-mark');
        highlighterSpans.forEach(span => {
            if (range.intersectsNode(span)) {
                const parent = span.parentNode;
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                }
                parent.removeChild(span);
            }
        });
        
        if (!this.isDoingUndoRedo) {
            this.saveVisualState();
        }
        
        const content = doc.documentElement.outerHTML;
        const html = '<!DOCTYPE html>\n' + content;
        if (window.setEditorContent) {
            window.setEditorContent(html);
        }
    },

    createColorPicker: function(menuId, callback) {
        const menu = document.getElementById(menuId);
        if (!menu) {
            console.error(`找不到 ${menuId}`);
            return;
        }
        
        const recentSection = document.createElement('div');
        recentSection.className = 'color-section';
        recentSection.innerHTML = '<div class="color-section-title">常用颜色</div>';
        const recentGrid = document.createElement('div');
        recentGrid.className = 'color-grid';
        this.colors.slice(0, 16).forEach(color => {
            const cell = document.createElement('div');
            cell.className = 'color-cell';
            cell.style.background = color;
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                callback(color);
                menu.classList.remove('show');
            });
            recentGrid.appendChild(cell);
        });
        recentSection.appendChild(recentGrid);
        menu.appendChild(recentSection);
        
        const allSection = document.createElement('div');
        allSection.className = 'color-section';
        allSection.innerHTML = '<div class="color-section-title">更多颜色</div>';
        const allGrid = document.createElement('div');
        allGrid.className = 'color-grid';
        this.colors.forEach(color => {
            const cell = document.createElement('div');
            cell.className = 'color-cell';
            cell.style.background = color;
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                callback(color);
                menu.classList.remove('show');
            });
            allGrid.appendChild(cell);
        });
        allSection.appendChild(allGrid);
        menu.appendChild(allSection);
    },

    createFloatingMenu: function() {
        this.floatingMenu = document.createElement('div');
        this.floatingMenu.className = 'floating-menu';
        this.floatingMenu.id = 'floatingMenu';
        
        this.floatingMenu.innerHTML = `
            <button class="floating-btn" data-command="bold" title="加粗">B</button>
            <button class="floating-btn" data-command="italic" title="斜体"><i>I</i></button>
            <button class="floating-btn" data-command="underline" title="下划线"><u>U</u></button>
            <div class="divider"></div>
            <button class="floating-btn" id="floatingLinkBtn" title="插入链接">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            </button>
        `;
        
        document.body.appendChild(this.floatingMenu);
    },

    bindEvents: function() {
        console.log('开始绑定工具栏事件...');
        
        const toolbarButtons = document.querySelectorAll('.format-toolbar .toolbar-btn[data-command]');
        if (toolbarButtons.length === 0) {
            console.warn('未找到任何带 data-command 的工具栏按钮');
        }
        toolbarButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`点击按钮: ${btn.dataset.command}`);
                this.execCommand(btn.dataset.command);
            });
        });
        console.log(`已绑定 ${toolbarButtons.length} 个 data-command 工具栏按钮事件`);
        
        document.querySelectorAll('.toolbar-dropdown .dropdown-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = btn.parentElement;
                const menu = dropdown.querySelector('.dropdown-menu');
                if (!menu) return;
                
                const isOpen = menu.classList.contains('show');
                document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
                
                if (!isOpen) {
                    menu.classList.add('show');
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.toolbar-dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
            }
        });
        
        const floatingButtons = document.querySelectorAll('.floating-menu .floating-btn[data-command]');
        floatingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.execCommand(btn.dataset.command);
                this.hideFloatingMenu();
            });
        });
        
        const floatingLinkBtn = document.getElementById('floatingLinkBtn');
        if (floatingLinkBtn) {
            floatingLinkBtn.addEventListener('click', () => {
                this.hideFloatingMenu();
                this.showLinkModal();
            });
        }
        
        const insertImageBtn = document.getElementById('insertImageBtn');
        if (insertImageBtn) {
            insertImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showImageModal();
            });
            console.log('插入图片按钮事件已绑定');
        } else {
            console.error('找不到插入图片按钮 #insertImageBtn');
        }
        
        const insertLinkBtn = document.getElementById('insertLinkBtn');
        if (insertLinkBtn) {
            insertLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLinkModal();
            });
            console.log('插入链接按钮事件已绑定');
        } else {
            console.error('找不到插入链接按钮 #insertLinkBtn');
        }
        
        const insertTableBtn = document.getElementById('insertTableBtn');
        if (insertTableBtn) {
            insertTableBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTableModal();
            });
            console.log('插入表格按钮事件已绑定');
        } else {
            console.error('找不到插入表格按钮 #insertTableBtn');
        }
        
        const templateBtn = document.getElementById('templateBtn');
        if (templateBtn) {
            templateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('模板按钮被点击');
                if (window.TemplateManager) {
                    console.log('TemplateManager 存在，调用 showTemplateSelector');
                    window.TemplateManager.showTemplateSelector();
                } else {
                    console.error('TemplateManager 不存在');
                }
            });
            console.log('模板按钮事件已绑定');
        } else {
            console.error('找不到模板按钮 #templateBtn');
        }
        
        const importHtmlBtn = document.getElementById('importHtmlBtn');
        if (importHtmlBtn) {
            importHtmlBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const fileInput = document.getElementById('htmlFileInput');
                if (fileInput) {
                    fileInput.click();
                }
            });
            console.log('导入HTML按钮事件已绑定');
        }
        
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showExportDialog();
            });
            console.log('导出按钮事件已绑定');
        } else {
            console.error('找不到导出按钮 #exportPdfBtn');
        }
        
        const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
        if (refreshPreviewBtn) {
            refreshPreviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.refreshPreview) {
                    window.refreshPreview();
                }
            });
            console.log('刷新预览按钮事件已绑定');
        }
        
        const self = this;
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                self.undo();
            });
            console.log('撤销按钮事件已绑定');
        } else {
            console.error('找不到撤销按钮 #undoBtn');
        }
        
        const redoBtn = document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                self.redo();
            });
            console.log('恢复按钮事件已绑定');
        } else {
            console.error('找不到恢复按钮 #redoBtn');
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    self.undo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    self.redo();
                }
            }
        });
        
        const codeModeBtn = document.getElementById('codeModeBtn');
        if (codeModeBtn) {
            codeModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('code');
            });
            console.log('代码模式按钮事件已绑定');
        } else {
            console.error('找不到代码模式按钮 #codeModeBtn');
        }
        
        const visualModeBtn = document.getElementById('visualModeBtn');
        if (visualModeBtn) {
            visualModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('visual');
            });
            console.log('可视化模式按钮事件已绑定');
        } else {
            console.error('找不到可视化模式按钮 #visualModeBtn');
        }
        
        console.log('FormatToolbar 所有事件绑定完成');
    },

    execCommand: function(command, value = null) {
        const iframe = document.getElementById('preview');
        
        if (!iframe) {
            console.error('找不到 iframe');
            alert('预览区域未加载，请刷新页面');
            return;
        }
        
        let doc = null;
        try {
            doc = iframe.contentDocument || iframe.contentWindow.document;
        } catch(e) {
            console.error('无法访问 iframe 内容:', e);
            alert('无法访问预览内容，请刷新页面重试');
            return;
        }
        
        if (!doc || !doc.body) {
            console.error('iframe document 未准备好');
            alert('预览区域未加载完成，请稍候再试');
            return;
        }
        
        if (this.isVisualModeActive) {
            try {
                doc.execCommand(command, false, value);
                
                const content = doc.documentElement.outerHTML;
                const html = '<!DOCTYPE html>\n' + content;
                if (window.setEditorContent) {
                    window.setEditorContent(html);
                }
                
                if (!this.isDoingUndoRedo) {
                    this.saveVisualState();
                }
                console.log(`可视化模式命令 "${command}" 执行成功`);
            } catch(e) {
                console.error('execCommand 错误:', e);
            }
        } else {
            this.execCommandInCodeMode(command, value, doc);
        }
    },
    
    execCommandInCodeMode: function(command, value, doc) {
        try {
            doc.body.contentEditable = true;
            doc.execCommand(command, false, value);
            doc.body.contentEditable = false;
            
            const content = doc.documentElement.outerHTML;
            const html = '<!DOCTYPE html>\n' + content;
            if (window.setEditorContent) {
                window.setEditorContent(html);
            }
            console.log(`代码模式命令 "${command}" 执行成功`);
            return;
        } catch(e) {
            console.error('iframe execCommand 失败:', e);
            alert('格式化功能暂时不可用，请尝试可视化模式');
        }
    },
    
    visualHistory: [],
    visualHistoryIndex: -1,
    isDoingUndoRedo: false,
    
    saveVisualState: function() {
        const iframe = document.getElementById('preview');
        if (!iframe || !iframe.contentDocument) {
            console.warn('saveVisualState: iframe 或 contentDocument 未找到');
            return;
        }
        
        const doc = iframe.contentDocument;
        const content = doc.body.innerHTML;
        
        if (this.visualHistoryIndex < this.visualHistory.length - 1) {
            this.visualHistory = this.visualHistory.slice(0, this.visualHistoryIndex + 1);
        }
        
        if (this.visualHistory.length > 0 && this.visualHistory[this.visualHistory.length - 1] === content) {
            console.log('saveVisualState: 内容相同，跳过保存');
            return;
        }
        
        this.visualHistory.push(content);
        this.visualHistoryIndex = this.visualHistory.length - 1;
        console.log('saveVisualState: 保存成功，历史长度:', this.visualHistory.length, '当前位置:', this.visualHistoryIndex);
        
        if (this.visualHistory.length > 30) {
            this.visualHistory.shift();
            this.visualHistoryIndex--;
        }
    },
    
    undo: function() {
        console.log('撤销操作 - isVisualModeActive:', this.isVisualModeActive, 'visualHistory.length:', this.visualHistory.length, 'visualHistoryIndex:', this.visualHistoryIndex);
        if (this.isVisualModeActive && this.visualHistory.length > 0) {
            if (this.visualHistoryIndex > 0) {
                const iframe = document.getElementById('preview');
                if (iframe && iframe.contentDocument) {
                    this.visualHistoryIndex--;
                    this.isDoingUndoRedo = true;
                    const newContent = this.visualHistory[this.visualHistoryIndex];
                    console.log('恢复到历史状态:', this.visualHistoryIndex, '内容长度:', newContent.length);
                    iframe.contentDocument.body.innerHTML = newContent;
                    this.isDoingUndoRedo = false;
                    
                    const content = iframe.contentDocument.documentElement.outerHTML;
                    const html = '<!DOCTYPE html>\n' + content;
                    if (window.setEditorContent) {
                        window.setEditorContent(html);
                    }
                    console.log('可视化模式撤销成功');
                } else {
                    console.error('iframe 或 contentDocument 未找到');
                }
            } else {
                console.log('已到达历史起点，无法继续撤销');
            }
        } else {
            const editor = window.getEditor ? window.getEditor() : null;
            if (editor) {
                editor.trigger('keyboard', 'undo');
                console.log('代码模式撤销成功');
            } else {
                console.warn('编辑器未初始化');
            }
        }
    },
    
    redo: function() {
        console.log('恢复操作 - isVisualModeActive:', this.isVisualModeActive, 'visualHistory.length:', this.visualHistory.length, 'visualHistoryIndex:', this.visualHistoryIndex);
        if (this.isVisualModeActive && this.visualHistory.length > 0) {
            if (this.visualHistoryIndex < this.visualHistory.length - 1) {
                const iframe = document.getElementById('preview');
                if (iframe && iframe.contentDocument) {
                    this.visualHistoryIndex++;
                    this.isDoingUndoRedo = true;
                    const newContent = this.visualHistory[this.visualHistoryIndex];
                    console.log('恢复到历史状态:', this.visualHistoryIndex, '内容长度:', newContent.length);
                    iframe.contentDocument.body.innerHTML = newContent;
                    this.isDoingUndoRedo = false;
                    
                    const content = iframe.contentDocument.documentElement.outerHTML;
                    const html = '<!DOCTYPE html>\n' + content;
                    if (window.setEditorContent) {
                        window.setEditorContent(html);
                    }
                    console.log('可视化模式恢复成功');
                } else {
                    console.error('iframe 或 contentDocument 未找到');
                }
            } else {
                console.log('已到达历史终点，无法继续恢复');
            }
        } else {
            const editor = window.getEditor ? window.getEditor() : null;
            if (editor) {
                editor.trigger('keyboard', 'redo');
                console.log('代码模式恢复成功');
            } else {
                console.warn('编辑器未初始化');
            }
        }
    },

    execFontCommand: function(fontFamily, fontName) {
        this.execCommand('fontName', fontFamily);
        const label = document.querySelector('#fontDropdown .dropdown-label');
        if (label) label.textContent = fontName;
    },

syncToEditor: function() {
        if (!this.iframeDoc) {
            console.warn('syncToEditor: iframeDoc 未找到');
            return;
        }
        
        if (this.isVisualModeActive && !this.isDoingUndoRedo) {
            console.log('syncToEditor: 保存可视化状态');
            this.saveVisualState();
        }
        
        const content = this.iframeDoc.documentElement.outerHTML;
        const html = '<!DOCTYPE html>\n' + content;
        
        if (window.setEditorContent) {
            window.setEditorContent(html);
        }
    },

    showFloatingMenu: function(x, y) {
        this.floatingMenu.style.left = x + 'px';
        this.floatingMenu.style.top = y + 'px';
        this.floatingMenu.classList.add('show');
    },

    hideFloatingMenu: function() {
        this.floatingMenu.classList.remove('show');
    },

    showImageModal: function() {
        console.log('点击插入图片按钮');
        this.showModal('插入图片', `
            <div class="form-group">
                <label>图片地址</label>
                <input type="text" id="imageUrl" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
                <label>或上传本地图片</label>
                <input type="file" id="imageFile" accept="image/*">
            </div>
            <div class="form-group">
                <label>替代文本</label>
                <input type="text" id="imageAlt" placeholder="图片描述">
            </div>
            <div class="form-group">
                <label>宽度</label>
                <input type="text" id="imageWidth" placeholder="如: 100%, 300px">
            </div>
        `, () => {
            const url = document.getElementById('imageUrl').value;
            const file = document.getElementById('imageFile').files[0];
            const alt = document.getElementById('imageAlt').value || '图片';
            const width = document.getElementById('imageWidth').value;
            
            console.log('插入图片:', { url, file, alt, width });
            
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.insertImage(e.target.result, alt, width);
                };
                reader.readAsDataURL(file);
            } else if (url) {
                this.insertImage(url, alt, width);
            } else {
                alert('请输入图片地址或选择本地图片');
            }
        });
    },

    insertImage: function(src, alt, width) {
        console.log('执行插入图片:', src);
        let imgTag = `<img src="${src}" alt="${alt}"`;
        if (width) imgTag += ` style="width: ${width}"`;
        imgTag += '>';
        this.execCommand('insertHTML', imgTag);
    },

    showLinkModal: function() {
        console.log('点击插入链接按钮');
        this.showModal('插入链接', `
            <div class="form-group">
                <label>链接地址</label>
                <input type="text" id="linkUrl" placeholder="https://example.com">
            </div>
            <div class="form-group">
                <label>链接文字</label>
                <input type="text" id="linkText" placeholder="点击这里">
            </div>
            <div class="form-group">
                <label>打开方式</label>
                <select id="linkTarget">
                    <option value="_self">当前窗口</option>
                    <option value="_blank">新窗口</option>
                </select>
            </div>
        `, () => {
            const url = document.getElementById('linkUrl').value;
            const text = document.getElementById('linkText').value || url;
            const target = document.getElementById('linkTarget').value;
            
            console.log('插入链接:', { url, text, target });
            
            if (url) {
                const linkTag = `<a href="${url}" target="${target}">${text}</a>`;
                this.execCommand('insertHTML', linkTag);
            } else {
                alert('请输入链接地址');
            }
        });
    },

    showTableModal: function() {
        console.log('点击插入表格按钮');
        this.showModal('插入表格', `
            <div class="form-group">
                <label>行数</label>
                <input type="number" id="tableRows" value="3" min="1" max="20">
            </div>
            <div class="form-group">
                <label>列数</label>
                <input type="number" id="tableCols" value="3" min="1" max="10">
            </div>
            <div class="form-group">
                <label>边框宽度</label>
                <input type="number" id="tableBorder" value="1" min="0" max="5">
            </div>
            <div class="form-group">
                <label>表格宽度</label>
                <input type="text" id="tableWidth" placeholder="如: 100%, 500px" value="100%">
            </div>
        `, () => {
            const rows = parseInt(document.getElementById('tableRows').value) || 3;
            const cols = parseInt(document.getElementById('tableCols').value) || 3;
            const border = parseInt(document.getElementById('tableBorder').value) || 1;
            const width = document.getElementById('tableWidth').value || '100%';
            
            console.log('插入表格:', { rows, cols, border, width });
            this.insertTable(rows, cols, border, width);
        });
    },

    insertTable: function(rows, cols, border, width) {
        let table = `<table style="width: ${width}; border-collapse: collapse; border: ${border}px solid #ddd;">`;
        
        for (let i = 0; i < rows; i++) {
            table += '<tr>';
            for (let j = 0; j < cols; j++) {
                if (i === 0) {
                    table += `<th style="border: ${border}px solid #ddd; padding: 8px; background: #f5f5f5;">标题</th>`;
                } else {
                    table += `<td style="border: ${border}px solid #ddd; padding: 8px;">内容</td>`;
                }
            }
            table += '</tr>';
        }
        
        table += '</table>';
        this.execCommand('insertHTML', table);
    },

    showModal: function(title, content, onConfirm) {
        console.log(`显示弹窗: ${title}`);
        let overlay = document.getElementById('modalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.id = 'modalOverlay';
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn" id="modalCancel">取消</button>
                    <button class="btn btn-primary" id="modalConfirm">确定</button>
                </div>
            </div>
        `;
        
        overlay.classList.add('show');
        
        overlay.querySelector('.modal-close').addEventListener('click', () => {
            overlay.classList.remove('show');
        });
        
        overlay.querySelector('#modalCancel').addEventListener('click', () => {
            overlay.classList.remove('show');
        });
        
        overlay.querySelector('#modalConfirm').addEventListener('click', () => {
            console.log('弹窗确认按钮点击');
            if (onConfirm) onConfirm();
            overlay.classList.remove('show');
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('show');
        });
    },

    showExportDialog: function() {
        this.showModal('选择导出格式', `
            <div class="export-options">
                <button class="export-option" id="exportPdfOption">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <div>
                        <div class="export-option-title">导出 PDF</div>
                        <div class="export-option-desc">使用浏览器打印功能导出为PDF文件</div>
                    </div>
                </button>
                <button class="export-option" id="exportHtmlOption">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    <div>
                        <div class="export-option-title">导出 HTML</div>
                        <div class="export-option-desc">下载当前的HTML源代码文件</div>
                    </div>
                </button>
            </div>
        `, null);
        
        const exportPdfOption = document.getElementById('exportPdfOption');
        if (exportPdfOption) {
            exportPdfOption.addEventListener('click', () => {
                document.getElementById('modalOverlay').classList.remove('show');
                if (window.exportPdf) {
                    window.exportPdf();
                }
            });
        }
        
        const exportHtmlOption = document.getElementById('exportHtmlOption');
        if (exportHtmlOption) {
            exportHtmlOption.addEventListener('click', () => {
                document.getElementById('modalOverlay').classList.remove('show');
                if (window.exportHtml) {
                    window.exportHtml();
                }
            });
        }
    },

    switchMode: function(mode) {
        const editorPanel = document.getElementById('editorPanel');
        const previewPanel = document.getElementById('previewPanel');
        const codeBtn = document.getElementById('codeModeBtn');
        const visualBtn = document.getElementById('visualModeBtn');
        
        if (!editorPanel || !previewPanel) {
            console.error('找不到 editorPanel 或 previewPanel');
            return;
        }
        
        if (mode === 'visual') {
            editorPanel.classList.add('hidden');
            previewPanel.classList.add('expanded');
            if (codeBtn) codeBtn.classList.remove('active');
            if (visualBtn) visualBtn.classList.add('active');
            this.isVisualModeActive = true;
            
            this.iframeDoc = null;
            try {
                this.iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            } catch(e) {
                console.error('无法获取 iframe document');
                return;
            }
            
            this.visualHistory = [];
            this.visualHistoryIndex = -1;
            if (this.iframeDoc && this.iframeDoc.body) {
                this.visualHistory.push(this.iframeDoc.body.innerHTML);
                this.visualHistoryIndex = 0;
                console.log('切换到可视化模式，初始化历史:', this.visualHistory.length, '当前位置:', this.visualHistoryIndex);
            }
            
            this.visualListenersAttached = false;
            this.undoRedoListenerAdded = false;
            this.enableVisualEditing();
            console.log('已切换到可视化模式');
        } else {
            editorPanel.classList.remove('hidden');
            previewPanel.classList.remove('expanded');
            if (codeBtn) codeBtn.classList.add('active');
            if (visualBtn) visualBtn.classList.remove('active');
            this.isVisualModeActive = false;
            this.disableVisualEditing();
            console.log('已切换到代码模式');
        }
        
        if (window.onModeChange) window.onModeChange(mode);
    },

    enableVisualEditing: function() {
        console.log('enableVisualEditing 开始, visualListenersAttached:', this.visualListenersAttached, 'undoRedoListenerAdded:', this.undoRedoListenerAdded);
        if (!this.iframe) {
            console.error('iframe 未初始化');
            return;
        }
        
        if (!this.iframeDoc) {
            try {
                this.iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            } catch(e) {
                console.error('无法获取 iframe document:', e);
                return;
            }
        }
        
        if (!this.iframeDoc || !this.iframeDoc.body) {
            console.error('iframeDoc 或 body 未准备好');
            return;
        }
        
        const body = this.iframeDoc.body;
        body.contentEditable = true;
        body.style.outline = 'none';
        
        this.injectEditStyles();
        
        if (!this.visualUndoRedoHandler) {
            this.visualUndoRedoHandler = (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                }
                if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.redo();
                }
            };
        }
        
        if (!this.undoRedoListenerAdded) {
            this.iframeDoc.addEventListener('keydown', this.visualUndoRedoHandler, true);
            this.undoRedoListenerAdded = true;
        }
        
        if (!this.visualListenersAttached) {
            this.saveStateTimeout = null;
            this.visualInputHandler = () => {
                console.log('input 事件触发, isDoingUndoRedo:', this.isDoingUndoRedo);
                if (this.isDoingUndoRedo) return;
                if (this.saveStateTimeout) clearTimeout(this.saveStateTimeout);
                this.saveStateTimeout = setTimeout(() => {
                    console.log('执行 syncToEditor');
                    this.syncToEditor();
                }, 300);
            };
            
            this.visualMouseDownHandler = (e) => {
                this.mouseDownTime = Date.now();
                this.mouseDownTarget = e.target;
            };
            
            this.visualMouseUpHandler = (e) => {
                const timeDiff = Date.now() - this.mouseDownTime;
                const selection = this.iframe.contentWindow.getSelection();
                const hasSelection = selection.toString().trim().length > 0;
                
                if (timeDiff < 200 && !hasSelection) {
                    this.handleElementClick(e);
                }
            };
            
            this.visualKeyDownHandler = (e) => {
                if (e.key === 'Escape') {
                    this.clearElementHighlight();
                }
            };
            
            body.addEventListener('input', this.visualInputHandler);
            this.iframeDoc.addEventListener('mousedown', this.visualMouseDownHandler);
            this.iframeDoc.addEventListener('mouseup', this.visualMouseUpHandler);
            body.addEventListener('keydown', this.visualKeyDownHandler);
            
            this.visualListenersAttached = true;
        }
        
        console.log('可视化编辑已启用');
    },

    injectEditStyles: function() {
        if (!this.iframeDoc) return;
        
        const existingStyle = this.iframeDoc.getElementById('editHighlightStyle');
        if (existingStyle) return;
        
        const style = this.iframeDoc.createElement('style');
        style.id = 'editHighlightStyle';
        style.textContent = `
            .edit-selected-element {
                outline: 2px solid #007acc !important;
                outline-offset: 2px;
            }
            .edit-hover-element {
                outline: 1px dashed #666 !important;
                outline-offset: 1px;
            }
            [contenteditable="true"]:focus {
                outline: none;
            }
        `;
        this.iframeDoc.head.appendChild(style);
    },

    handleElementClick: function(e) {
        e.stopPropagation();
        
        this.clearElementHighlight();
        
        const target = e.target;
        if (target === this.iframeDoc.body) return;
        
        target.classList.add('edit-selected-element');
        this.selectedElement = target;
        
        this.showElementToolbar(target);
    },

    clearElementHighlight: function() {
        if (!this.iframeDoc) return;
        
        const selected = this.iframeDoc.querySelectorAll('.edit-selected-element');
        selected.forEach(el => el.classList.remove('edit-selected-element'));
        
        this.selectedElement = null;
        this.hideElementToolbar();
    },

    showElementToolbar: function(element) {
        let toolbar = document.getElementById('elementToolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.className = 'element-toolbar';
            toolbar.id = 'elementToolbar';
            toolbar.innerHTML = `
                <button class="element-toolbar-btn" id="elementDeleteBtn" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
                <button class="element-toolbar-btn" id="elementDuplicateBtn" title="复制">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="element-toolbar-btn" id="elementMoveUpBtn" title="上移">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 19V5"></path>
                        <path d="M5 12l7-7 7 7"></path>
                    </svg>
                </button>
                <button class="element-toolbar-btn" id="elementMoveDownBtn" title="下移">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14"></path>
                        <path d="M19 12l-7 7-7-7"></path>
                    </svg>
                </button>
            `;
            document.body.appendChild(toolbar);
            
            this.bindElementToolbarEvents();
        }
        
        const iframeRect = this.iframe.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        toolbar.style.left = (iframeRect.left + elementRect.right + 10) + 'px';
        toolbar.style.top = (iframeRect.top + elementRect.top) + 'px';
        toolbar.classList.add('show');
    },

    hideElementToolbar: function() {
        const toolbar = document.getElementById('elementToolbar');
        if (toolbar) {
            toolbar.classList.remove('show');
        }
    },

    bindElementToolbarEvents: function() {
        document.getElementById('elementDeleteBtn').addEventListener('click', () => {
            if (this.selectedElement) {
                this.selectedElement.remove();
                this.syncToEditor();
                this.clearElementHighlight();
            }
        });
        
        document.getElementById('elementDuplicateBtn').addEventListener('click', () => {
            if (this.selectedElement) {
                const clone = this.selectedElement.cloneNode(true);
                this.selectedElement.parentNode.insertBefore(clone, this.selectedElement.nextSibling);
                this.syncToEditor();
            }
        });
        
        document.getElementById('elementMoveUpBtn').addEventListener('click', () => {
            if (this.selectedElement && this.selectedElement.previousElementSibling) {
                this.selectedElement.parentNode.insertBefore(this.selectedElement, this.selectedElement.previousElementSibling);
                this.syncToEditor();
            }
        });
        
        document.getElementById('elementMoveDownBtn').addEventListener('click', () => {
            if (this.selectedElement && this.selectedElement.nextElementSibling) {
                this.selectedElement.parentNode.insertBefore(this.selectedElement.nextElementSibling, this.selectedElement);
                this.syncToEditor();
            }
        });
    },

    disableVisualEditing: function() {
        if (!this.iframeDoc) return;
        
        const body = this.iframeDoc.body;
        body.contentEditable = false;
        
        if (this.undoRedoListenerAdded && this.visualUndoRedoHandler) {
            this.iframeDoc.removeEventListener('keydown', this.visualUndoRedoHandler, true);
            this.undoRedoListenerAdded = false;
        }
        
        if (this.visualListenersAttached && body) {
            if (this.visualInputHandler) body.removeEventListener('input', this.visualInputHandler);
            if (this.visualMouseDownHandler) this.iframeDoc.removeEventListener('mousedown', this.visualMouseDownHandler);
            if (this.visualMouseUpHandler) this.iframeDoc.removeEventListener('mouseup', this.visualMouseUpHandler);
            if (this.visualKeyDownHandler) body.removeEventListener('keydown', this.visualKeyDownHandler);
            this.visualListenersAttached = false;
        }
        
        this.clearElementHighlight();
        
        const style = this.iframeDoc.getElementById('editHighlightStyle');
        if (style) style.remove();
    },

    setIframeDoc: function(doc) {
        this.iframeDoc = doc;
    },

    reEnableVisualEditing: function() {
        if (!this.isVisualModeActive) return;
        
        var oldDoc = this.iframeDoc;
        this.iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        
        if (oldDoc && oldDoc !== this.iframeDoc && this.visualUndoRedoHandler) {
            try {
                oldDoc.removeEventListener('keydown', this.visualUndoRedoHandler, true);
            } catch (e) {}
            this.undoRedoListenerAdded = false;
        }
        
        const body = this.iframeDoc.body;
        body.contentEditable = true;
        body.style.outline = 'none';
        
        this.injectEditStyles();
        
        if (!this.visualUndoRedoHandler) {
            this.visualUndoRedoHandler = (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                }
                if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.redo();
                }
            };
        }
        
        if (!this.undoRedoListenerAdded) {
            this.iframeDoc.addEventListener('keydown', this.visualUndoRedoHandler, true);
            this.undoRedoListenerAdded = true;
        }
        
        if (this.visualListenersAttached) {
            try {
                if (this.visualInputHandler) body.removeEventListener('input', this.visualInputHandler);
                if (this.visualMouseDownHandler) this.iframeDoc.removeEventListener('mousedown', this.visualMouseDownHandler);
                if (this.visualMouseUpHandler) this.iframeDoc.removeEventListener('mouseup', this.visualMouseUpHandler);
                if (this.visualKeyDownHandler) body.removeEventListener('keydown', this.visualKeyDownHandler);
            } catch (e) {}
        }
        
        this.saveStateTimeout = null;
        this.visualInputHandler = () => {
            if (this.isDoingUndoRedo) return;
            if (this.saveStateTimeout) clearTimeout(this.saveStateTimeout);
            this.saveStateTimeout = setTimeout(() => {
                this.syncToEditor();
            }, 300);
        };
        
        this.visualMouseDownHandler = (e) => {
            this.mouseDownTime = Date.now();
            this.mouseDownTarget = e.target;
        };
        
        this.visualMouseUpHandler = (e) => {
            const timeDiff = Date.now() - this.mouseDownTime;
            const selection = this.iframe.contentWindow.getSelection();
            const hasSelection = selection.toString().trim().length > 0;
            
            if (timeDiff < 200 && !hasSelection) {
                this.handleElementClick(e);
            }
        };
        
        this.visualKeyDownHandler = (e) => {
            if (e.key === 'Escape') {
                this.clearElementHighlight();
            }
        };
        
        body.addEventListener('input', this.visualInputHandler);
        this.iframeDoc.addEventListener('mousedown', this.visualMouseDownHandler);
        this.iframeDoc.addEventListener('mouseup', this.visualMouseUpHandler);
        body.addEventListener('keydown', this.visualKeyDownHandler);
        
        this.visualListenersAttached = true;
    }
};

window.FormatToolbar = FormatToolbar;