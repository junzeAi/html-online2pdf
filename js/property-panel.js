const PropertyPanel = {
    panel: null,
    selectedElement: null,
    iframeDoc: null,
    iframe: null,
    isCollapsed: false,
    
    fonts: [
        { name: '默认', value: '' },
        { name: '宋体', value: 'SimSun, serif' },
        { name: '黑体', value: 'SimHei, sans-serif' },
        { name: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
        { name: '楷体', value: 'KaiTi, serif' },
        { name: '仿宋', value: 'FangSong, serif' },
        { name: 'Arial', value: 'Arial, sans-serif' },
        { name: 'Times New Roman', value: '"Times New Roman", serif' },
        { name: 'Courier New', value: '"Courier New", monospace' }
    ],
    
    init: function() {
        this.iframe = document.getElementById('preview');
        this.createPanel();
        this.bindEvents();
    },
    
    createPanel: function() {
        this.panel = document.createElement('div');
        this.panel.className = 'property-panel collapsed';
        this.panel.id = 'propertyPanel';
        
        this.panel.innerHTML = `
            <div class="property-panel-header">
                <span class="property-panel-title">属性面板</span>
                <button class="property-panel-toggle" id="propertyPanelToggle" title="展开/折叠">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            </div>
            <div class="property-panel-content" id="propertyPanelContent">
                <div class="property-panel-empty" id="propertyPanelEmpty">
                    <div class="property-panel-empty-icon">?</div>
                    <p>在可视化模式下<br>点击元素以编辑属性</p>
                </div>
                <div class="property-panel-form" id="propertyPanelForm" style="display:none;">
                    <div class="property-element-info" id="propertyElementInfo"></div>
                    
                    <div class="property-group" id="propertyTextGroup" style="display:none;">
                        <div class="property-group-title">文字样式</div>
                        
                        <div class="property-item">
                            <label class="property-item-label">字体</label>
                            <select class="property-item-select" id="propFontFamily">
                                ${this.fonts.map(f => `<option value="${f.value}">${f.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">字号</label>
                            <div class="property-item-unit">
                                <input type="number" class="property-item-input" id="propFontSize" min="1" max="100" value="16">
                                <select class="property-item-unit-select" id="propFontSizeUnit">
                                    <option value="px">px</option>
                                    <option value="pt">pt</option>
                                    <option value="em">em</option>
                                    <option value="rem">rem</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">粗体</label>
                            <select class="property-item-select" id="propFontWeight">
                                <option value="normal">正常</option>
                                <option value="bold">粗体</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                                <option value="400">400</option>
                                <option value="500">500</option>
                                <option value="600">600</option>
                                <option value="700">700</option>
                                <option value="800">800</option>
                                <option value="900">900</option>
                            </select>
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">颜色</label>
                            <input type="color" class="property-item-input" id="propTextColor" value="#000000">
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">行高</label>
                            <div class="property-item-unit">
                                <input type="number" class="property-item-input" id="propLineHeight" min="0" max="10" step="0.1" value="1.6">
                                <select class="property-item-unit-select" id="propLineHeightUnit">
                                    <option value="">无单位</option>
                                    <option value="px">px</option>
                                    <option value="em">em</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="property-group" id="propertyBgGroup" style="display:none;">
                        <div class="property-group-title">背景样式</div>
                        
                        <div class="property-item">
                            <label class="property-item-label">背景色</label>
                            <input type="color" class="property-item-input" id="propBgColor" value="#ffffff">
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">背景图</label>
                            <input type="text" class="property-item-input" id="propBgImage" placeholder="图片URL">
                        </div>
                    </div>
                    
                    <div class="property-group" id="propertySpacingGroup" style="display:none;">
                        <div class="property-group-title">边距</div>
                        
                        <div class="property-spacing-grid">
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">上</span>
                                <input type="number" class="property-spacing-input" id="propMarginTop" value="0">
                            </div>
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">下</span>
                                <input type="number" class="property-spacing-input" id="propMarginBottom" value="0">
                            </div>
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">左</span>
                                <input type="number" class="property-spacing-input" id="propMarginLeft" value="0">
                            </div>
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">右</span>
                                <input type="number" class="property-spacing-input" id="propMarginRight" value="0">
                            </div>
                        </div>
                        
                        <div class="property-group-title" style="margin-top:12px;">内边距</div>
                        
                        <div class="property-spacing-grid">
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">上</span>
                                <input type="number" class="property-spacing-input" id="propPaddingTop" value="0">
                            </div>
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">下</span>
                                <input type="number" class="property-spacing-input" id="propPaddingBottom" value="0">
                            </div>
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">左</span>
                                <input type="number" class="property-spacing-input" id="propPaddingLeft" value="0">
                            </div>
                            <div class="property-spacing-item">
                                <span class="property-spacing-label">右</span>
                                <input type="number" class="property-spacing-input" id="propPaddingRight" value="0">
                            </div>
                        </div>
                    </div>
                    
                    <div class="property-group" id="propertyBorderGroup" style="display:none;">
                        <div class="property-group-title">边框</div>
                        
                        <div class="property-item">
                            <label class="property-item-label">边框色</label>
                            <input type="color" class="property-item-input" id="propBorderColor" value="#cccccc">
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">宽度</label>
                            <div class="property-item-unit">
                                <input type="number" class="property-item-input" id="propBorderWidth" min="0" value="0">
                                <span style="color:#888;font-size:12px;">px</span>
                            </div>
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">样式</label>
                            <select class="property-item-select" id="propBorderStyle">
                                <option value="none">无</option>
                                <option value="solid">实线</option>
                                <option value="dashed">虚线</option>
                                <option value="dotted">点线</option>
                                <option value="double">双线</option>
                            </select>
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">圆角</label>
                            <div class="property-item-unit">
                                <input type="number" class="property-item-input" id="propBorderRadius" min="0" value="0">
                                <span style="color:#888;font-size:12px;">px</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="property-group" id="propertyAlignGroup" style="display:none;">
                        <div class="property-group-title">对齐</div>
                        
                        <div class="property-item">
                            <label class="property-item-label">水平</label>
                            <select class="property-item-select" id="propTextAlign">
                                <option value="left">左对齐</option>
                                <option value="center">居中</option>
                                <option value="right">右对齐</option>
                                <option value="justify">两端对齐</option>
                            </select>
                        </div>
                        
                        <div class="property-item">
                            <label class="property-item-label">宽度</label>
                            <div class="property-item-unit">
                                <input type="text" class="property-item-input" id="propWidth" placeholder="auto">
                                <select class="property-item-unit-select" id="propWidthUnit">
                                    <option value="">无</option>
                                    <option value="px">px</option>
                                    <option value="%">%</option>
                                    <option value="em">em</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <button class="property-clear-btn" id="propClearStyle">清除所有样式</button>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(this.panel);
        }
    },
    
    bindEvents: function() {
        const toggleBtn = document.getElementById('propertyPanelToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.togglePanel();
            });
        }
        
        this.bindPropertyInputs();
        
        document.getElementById('propClearStyle').addEventListener('click', () => {
            if (this.selectedElement) {
                this.selectedElement.removeAttribute('style');
                this.syncToEditor();
                this.loadElementStyles(this.selectedElement);
            }
        });
    },
    
    bindPropertyInputs: function() {
        const inputs = [
            'propFontFamily', 'propFontSize', 'propFontSizeUnit', 'propFontWeight',
            'propTextColor', 'propLineHeight', 'propLineHeightUnit',
            'propBgColor', 'propBgImage',
            'propMarginTop', 'propMarginBottom', 'propMarginLeft', 'propMarginRight',
            'propPaddingTop', 'propPaddingBottom', 'propPaddingLeft', 'propPaddingRight',
            'propBorderColor', 'propBorderWidth', 'propBorderStyle', 'propBorderRadius',
            'propTextAlign', 'propWidth', 'propWidthUnit'
        ];
        
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => this.applyStyle());
                el.addEventListener('input', () => this.applyStyle());
            }
        });
    },
    
    togglePanel: function() {
        this.isCollapsed = !this.isCollapsed;
        this.panel.classList.toggle('collapsed', this.isCollapsed);
        
        const toggleIcon = document.querySelector('#propertyPanelToggle svg polyline');
        if (toggleIcon) {
            if (this.isCollapsed) {
                toggleIcon.setAttribute('points', '15 18 9 12 15 6');
            } else {
                toggleIcon.setAttribute('points', '9 18 15 12 9 6');
            }
        }
        
        this.updateLayout();
    },
    
    updateLayout: function() {
        const previewPanel = document.getElementById('previewPanel');
        if (previewPanel) {
            if (!this.isCollapsed) {
                previewPanel.classList.add('expanded-with-panel');
            } else {
                previewPanel.classList.remove('expanded-with-panel');
            }
        }
    },
    
    setIframeDoc: function(doc) {
        this.iframeDoc = doc;
    },
    
    setElement: function(element) {
        this.selectedElement = element;
        this.updatePanelVisibility();
        this.showElementInfo(element);
        this.showRelevantGroups(element);
        this.loadElementStyles(element);
        
        if (this.isCollapsed) {
            this.togglePanel();
        }
    },
    
    clearElement: function() {
        this.selectedElement = null;
        this.updatePanelVisibility();
    },
    
    updatePanelVisibility: function() {
        const emptyDiv = document.getElementById('propertyPanelEmpty');
        const formDiv = document.getElementById('propertyPanelForm');
        
        if (this.selectedElement) {
            emptyDiv.style.display = 'none';
            formDiv.style.display = 'block';
        } else {
            emptyDiv.style.display = 'block';
            formDiv.style.display = 'none';
        }
    },
    
    showElementInfo: function(element) {
        const infoDiv = document.getElementById('propertyElementInfo');
        const tagName = element.tagName.toLowerCase();
        const className = element.className ? element.className.replace('edit-selected-element', '').trim() : '';
        
        infoDiv.innerHTML = `
            <div class="property-element-tag">&lt;${tagName}&gt;</div>
            ${className ? `<div class="property-element-class">.${className.split(' ')[0]}</div>` : ''}
        `;
    },
    
    showRelevantGroups: function(element) {
        const tagName = element.tagName.toLowerCase();
        const textElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'li', 'td', 'th', 'div', 'label', 'button'];
        const isTextElement = textElements.includes(tagName);
        
        document.getElementById('propertyTextGroup').style.display = isTextElement ? 'block' : 'none';
        document.getElementById('propertyBgGroup').style.display = 'block';
        document.getElementById('propertySpacingGroup').style.display = 'block';
        document.getElementById('propertyBorderGroup').style.display = 'block';
        document.getElementById('propertyAlignGroup').style.display = 'block';
    },
    
    loadElementStyles: function(element) {
        if (!element) return;
        
        const style = element.style;
        const computedStyle = this.iframeDoc ? this.iframeDoc.defaultView.getComputedStyle(element) : null;
        
        this.setInputValue('propFontFamily', this.parseFontFamily(style.fontFamily || computedStyle?.fontFamily));
        this.setInputValue('propFontWeight', style.fontWeight || computedStyle?.fontWeight || 'normal');
        
        const fontSize = this.parseSize(style.fontSize || computedStyle?.fontSize);
        document.getElementById('propFontSize').value = fontSize.value || 16;
        document.getElementById('propFontSizeUnit').value = fontSize.unit || 'px';
        
        this.setInputValue('propTextColor', this.parseColor(style.color || computedStyle?.color));
        
        const lineHeight = this.parseSize(style.lineHeight || computedStyle?.lineHeight);
        document.getElementById('propLineHeight').value = lineHeight.value || 1.6;
        document.getElementById('propLineHeightUnit').value = lineHeight.unit || '';
        
        this.setInputValue('propBgColor', this.parseColor(style.backgroundColor || computedStyle?.backgroundColor));
        this.setInputValue('propBgImage', this.parseUrl(style.backgroundImage));
        
        this.setInputValue('propMarginTop', this.parseSize(style.marginTop).value || 0);
        this.setInputValue('propMarginBottom', this.parseSize(style.marginBottom).value || 0);
        this.setInputValue('propMarginLeft', this.parseSize(style.marginLeft).value || 0);
        this.setInputValue('propMarginRight', this.parseSize(style.marginRight).value || 0);
        
        this.setInputValue('propPaddingTop', this.parseSize(style.paddingTop).value || 0);
        this.setInputValue('propPaddingBottom', this.parseSize(style.paddingBottom).value || 0);
        this.setInputValue('propPaddingLeft', this.parseSize(style.paddingLeft).value || 0);
        this.setInputValue('propPaddingRight', this.parseSize(style.paddingRight).value || 0);
        
        this.setInputValue('propBorderColor', this.parseColor(style.borderColor || computedStyle?.borderColor));
        this.setInputValue('propBorderWidth', this.parseSize(style.borderWidth).value || 0);
        this.setInputValue('propBorderStyle', style.borderStyle || 'none');
        this.setInputValue('propBorderRadius', this.parseSize(style.borderRadius).value || 0);
        
        this.setInputValue('propTextAlign', style.textAlign || computedStyle?.textAlign || 'left');
        
        const width = this.parseSize(style.width);
        document.getElementById('propWidth').value = width.value || '';
        document.getElementById('propWidthUnit').value = width.unit || '';
    },
    
    setInputValue: function(id, value) {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'color') {
                el.value = value || '#ffffff';
            } else {
                el.value = value || '';
            }
        }
    },
    
    applyStyle: function() {
        if (!this.selectedElement) return;
        
        const styles = {};
        
        const fontFamily = document.getElementById('propFontFamily').value;
        if (fontFamily) styles.fontFamily = fontFamily;
        
        const fontSize = document.getElementById('propFontSize').value;
        const fontSizeUnit = document.getElementById('propFontSizeUnit').value;
        if (fontSize) styles.fontSize = fontSize + fontSizeUnit;
        
        const fontWeight = document.getElementById('propFontWeight').value;
        if (fontWeight) styles.fontWeight = fontWeight;
        
        const textColor = document.getElementById('propTextColor').value;
        if (textColor) styles.color = textColor;
        
        const lineHeight = document.getElementById('propLineHeight').value;
        const lineHeightUnit = document.getElementById('propLineHeightUnit').value;
        if (lineHeight) styles.lineHeight = lineHeight + lineHeightUnit;
        
        const bgColor = document.getElementById('propBgColor').value;
        if (bgColor) styles.backgroundColor = bgColor;
        
        const bgImage = document.getElementById('propBgImage').value;
        if (bgImage) styles.backgroundImage = `url('${bgImage}')`;
        
        const marginTop = document.getElementById('propMarginTop').value;
        const marginBottom = document.getElementById('propMarginBottom').value;
        const marginLeft = document.getElementById('propMarginLeft').value;
        const marginRight = document.getElementById('propMarginRight').value;
        if (marginTop) styles.marginTop = marginTop + 'px';
        if (marginBottom) styles.marginBottom = marginBottom + 'px';
        if (marginLeft) styles.marginLeft = marginLeft + 'px';
        if (marginRight) styles.marginRight = marginRight + 'px';
        
        const paddingTop = document.getElementById('propPaddingTop').value;
        const paddingBottom = document.getElementById('propPaddingBottom').value;
        const paddingLeft = document.getElementById('propPaddingLeft').value;
        const paddingRight = document.getElementById('propPaddingRight').value;
        if (paddingTop) styles.paddingTop = paddingTop + 'px';
        if (paddingBottom) styles.paddingBottom = paddingBottom + 'px';
        if (paddingLeft) styles.paddingLeft = paddingLeft + 'px';
        if (paddingRight) styles.paddingRight = paddingRight + 'px';
        
        const borderColor = document.getElementById('propBorderColor').value;
        const borderWidth = document.getElementById('propBorderWidth').value;
        const borderStyle = document.getElementById('propBorderStyle').value;
        const borderRadius = document.getElementById('propBorderRadius').value;
        if (borderColor && borderWidth && borderStyle !== 'none') {
            styles.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
        }
        if (borderRadius) styles.borderRadius = borderRadius + 'px';
        
        const textAlign = document.getElementById('propTextAlign').value;
        if (textAlign) styles.textAlign = textAlign;
        
        const width = document.getElementById('propWidth').value;
        const widthUnit = document.getElementById('propWidthUnit').value;
        if (width) styles.width = width + widthUnit;
        
        Object.keys(styles).forEach(key => {
            this.selectedElement.style[key] = styles[key];
        });
        
        this.syncToEditor();
    },
    
    syncToEditor: function() {
        if (!this.iframeDoc) return;
        
        const content = this.iframeDoc.documentElement.outerHTML;
        const html = '<!DOCTYPE html>\n' + content;
        
        if (window.setEditorContent) {
            window.setEditorContent(html);
        }
    },
    
    parseSize: function(value) {
        if (!value || value === 'auto' || value === 'normal') {
            return { value: '', unit: '' };
        }
        
        const match = value.match(/^([\d.]+)(px|pt|em|rem|%|)?$/);
        if (match) {
            return { value: parseFloat(match[1]), unit: match[2] || '' };
        }
        return { value: '', unit: '' };
    },
    
    parseColor: function(value) {
        if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') {
            return '';
        }
        
        if (value.startsWith('#')) {
            if (value.length === 4) {
                return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
            }
            return value;
        }
        
        if (value.startsWith('rgb')) {
            const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                const r = parseInt(match[1]).toString(16).padStart(2, '0');
                const g = parseInt(match[2]).toString(16).padStart(2, '0');
                const b = parseInt(match[3]).toString(16).padStart(2, '0');
                return '#' + r + g + b;
            }
        }
        
        return '';
    },
    
    parseFontFamily: function(value) {
        if (!value) return '';
        
        const firstFont = value.split(',')[0].trim().replace(/["']/g, '');
        
        for (const font of this.fonts) {
            if (font.value.includes(firstFont) || firstFont.includes(font.name)) {
                return font.value;
            }
        }
        
        return firstFont;
    },
    
    parseUrl: function(value) {
        if (!value || value === 'none') return '';
        const match = value.match(/url\(['"]?([^'"]+)['"]?\)/);
        return match ? match[1] : '';
    }
};

window.PropertyPanel = PropertyPanel;