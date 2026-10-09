# 打印级 HTML / CSS 编写规范

面向「用浏览器打印成 PDF」的文档（试卷、讲义、知识点归纳等）。
目标是两件事：**打印出来的样式与预览一致**，且 **PDF 里的文字能准确选中**。

> 📄 **这份文档是写给人看的**（讲原理、给选择、可翻阅）。
>
> 🤖 **如果你要的是「交给 AI Agent 让它按规范生成 HTML」**，用那份：
> [`AGENT-PRINT-SPEC.md`](AGENT-PRINT-SPEC.md) ——
> 指令式、单文件、含可直接复制的模板骨架与自检清单，可整体当系统提示词使用。

> 💡 本项目的编辑器已经自动注入了一部分关键规则（`@page`、`print-color-adjust`、
> 分页保护），所以下面标「编辑器已处理」的条目你不必操心，但了解原理有助于排查问题。

---

## 一、用什么浏览器导出

| 角色 | 推荐 | 说明 |
|---|---|---|
| **生成 PDF（打印）** | **Chrome / Edge** | 同为 Chromium 内核、同一打印引擎，结果一致 |
| 查看 PDF | Adobe Acrobat / Reader | 渲染规范，可放心使用 |
| 不推荐生成 | Firefox / Safari | 打印引擎不同，渐变与分页表现有差异 |

**注意**：`Adobe` 是 PDF **阅读器**，不负责生成 PDF。常见正确流程是
「用 Chrome/Edge 导出 → 用 Adobe 查看」。

---

## 二、纸张与页面尺寸（最关键，先看这节）

### 2.1 必须声明纸张尺寸

```css
@page {
    size: A4;
    margin: 0;        /* 或者留白写在这里，见 2.3 */
}
```

**不声明会发生什么**：Chrome 会按「屏幕尺寸」猜纸张大小。A4 在 96dpi 下可打印宽度
只有 **794px**，而网页常按 1000px+ 设计，宽度对不上 → Chrome **整页缩放** → 同时出现：

- **选中的文字对不上**（选区按未缩放坐标计算）
- **光标异常变大**（插入光标按未缩放字号渲染）

> 编辑器已处理：导出时自动注入 `@page { size: A4; margin: 0 }`。

### 2.2 内容宽度不要超过纸张

A4 纵向 = **210mm × 297mm**。留 10mm 边距的话，可用宽度是 **190mm**。

```css
/* ✅ 好：用 mm，跟着纸张走 */
body { width: 190mm; margin: 0 auto; }

/* ✅ 也好：用百分比 / max-width，自适应 */
.container { max-width: 100%; }

/* ❌ 危险：固定 px 宽度，可能超过纸张 → 触发缩放 */
.container { width: 1200px; }
```

**尺寸单位用 `mm` 而不是 `px`**，跨设备、跨缩放都稳定。

### 2.3 页面留白放在哪

两种都可，但**别两处都设**，否则留白会翻倍：

```css
/* 方案 A：让纸管留白（推荐，打印到纸上更安全） */
@page { size: A4; margin: 15mm; }
body { margin: 0; }

/* 方案 B：纸不留白，文档自己用 padding 留 */
@page { size: A4; margin: 0; }
body { padding: 15mm; }
```

> ⚠️ 本编辑器采用**方案 B**（`margin: 0` + 文档自身 padding）。
> 所以**你的文档一定要有 padding**，否则内容会贴到纸边，被打印机的硬件不可打印区裁掉。

---

## 三、分页控制

### 3.1 防止元素被跨页切断

```css
/* 表格行、图片、图注、代码块不要被拦腰截断 */
tr, img, svg, figure, pre, blockquote {
    break-inside: avoid;
    page-break-inside: avoid;   /* 老写法，兼容用 */
}
```

> ⚠️ **不要给 `table` 本身加**，长表格会被整体推到下一页，反而留出大片空白。

### 3.2 标题不要落在页尾

```css
h1, h2, h3, h4, h5, h6 {
    break-after: avoid;
    page-break-after: avoid;
}
```

### 3.3 控制孤行寡行

```css
p, li {
    orphans: 2;   /* 段落末尾至少留 2 行在本页 */
    widows: 2;    /* 段落开头至少 2 行带到下页 */
}
```

### 3.4 强制分页

```css
.page-break { break-before: page; page-break-before: always; }
```

### 3.5 长表格每页重复表头

```css
thead { display: table-header-group; }
tfoot { display: table-footer-group; }
```

> 编辑器已处理：3.1–3.3 的基础规则已自动注入。

---

## 四、颜色与背景

### 4.1 必须声明 exact，否则背景会被丢掉

```css
* {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
```

不声明的话，浏览器默认**不打印背景色/背景图**（除非用户在打印窗口手动勾选）。

> 编辑器已处理，并且导出时会自动带上。

### 4.2 ⚠️ 避免含 `transparent` 的渐变

```css
/* ❌ 会让 Chrome 在 PDF 里生成「透明度组 + 亮度软掩码」 */
background: linear-gradient(to bottom, transparent 50%, #ffeb3b 50%);

/* ✅ 等价写法：全程不透明，PDF 里退化成普通实心填充 */
background-image: linear-gradient(#ffeb3b, #ffeb3b);
background-size: 100% 50%;
background-position: 0 100%;
background-repeat: no-repeat;
```

原因：`transparent` 产生的**软掩码**（PDF 的 `/SMask`）是较高级的特性，
部分阅读器渲染不了 → 症状是**「打印预览正常、存成 PDF 打开整块消失」**。

同理，`rgba()` 里 alpha 为 0 的色标也会触发，尽量用不透明色。

### 4.3 半抹荧光笔的标准写法

就是上面 4.2 的 ✅ 那版：**不透明纯色 + `background-size: 100% 50%` + 底部对齐**。
视觉是"只见下半行"，且 PDF 兼容性最好。

---

## 五、字体与排版

### 5.1 用系统字体，或确保字体能嵌入

```css
body {
    font-family: "Microsoft YaHei", "PingFang SC",
                 "Source Han Sans SC", "Hiragino Sans GB", sans-serif;
}
```

- **优先系统已装字体**，中文不要依赖网络 `@font-face`（加载时序会影响打印）
- 字体回退会改变字宽 → 换行位置错乱 → 版面跑偏

### 5.2 字号：屏幕用 px，打印用 pt

```css
body { font-size: 14px; }          /* 屏幕 */

@media print {
    body { font-size: 10.5pt; }    /* 打印：10.5pt ≈ 五号字 */
}
```

### 5.3 行高用无单位数字

```css
body { line-height: 1.6; }    /* ✅ 跟着字号缩放 */
body { line-height: 26px; }   /* ❌ 改字号后会错位 */
```

---

## 六、保证「文字可以被选中」

PDF 里能否选中文字，取决于**它是真文字还是图片**：

| 做法 | 可选中 |
|---|---|
| 正常 HTML 文本 | ✅ |
| `<img>` 图片里的文字 | ❌ |
| `<canvas>` 绘制的文字 | ❌ |
| 用 `background-image` 贴的文字图 | ❌ |
| CSS 伪元素 `content: "文字"` | ⚠️ 通常可以，但部分阅读器不行 |

**结论：要能选中、能搜索，文字就必须是真正的文本节点。**

---

## 七、保证「选区位置准确」

除了第二节的**不要缩放**，还要避开：

```css
/* ❌ 都会让 PDF 文字层坐标错位 */
zoom: 1.2;
transform: scale(1.1);
transform: skewX(-5deg);        /* 斜体请用 font-style: italic */

/* ❌ 过度的字距微调，PDF 里字距会算错 */
letter-spacing: 0.13em;
```

需要倾斜/放大，**改 `font-style` 和 `font-size`**，不要用 `transform`。

---

## 八、能不用就不用的东西

| 属性 | 问题 |
|---|---|
| `position: fixed` | 打印时行为不一致（有的只出现在第一页，有的每页都有） |
| `vh` / `vw` | 打印时"视口"高度不确定，布局会崩 |
| `100vh` 做整页容器 | 同上，改用 `297mm` 或 `auto` |
| CSS Grid 的隐式行高 | 分页时容易断裂，复杂网格建议降级为 `flex` 或普通块 |
| 动画 / `transition` | 打印时取初始状态，无意义 |

需要隐藏的元素（导航、按钮）：

```css
@media print {
    .no-print { display: none !important; }
}
```

---

## 九、速查清单

写打印稿时过一遍：

- [ ] 声明了 `@page { size: A4; margin: ... }`
- [ ] 内容宽度用 `mm` / 百分比，**没有超过 190mm 的固定 px 宽度**
- [ ] 文档本身有 padding（如果 `@page` 是 `margin: 0`）
- [ ] 有 `print-color-adjust: exact`
- [ ] **没有含 `transparent` 的渐变**
- [ ] 字体是系统已装字体，中文不依赖网络字体
- [ ] 正文字号用 `pt`，行高用无单位数字
- [ ] 表格行 / 图片加了 `break-inside: avoid`，但 `table` 本身没加
- [ ] 标题加了 `break-after: avoid`
- [ ] 没有 `position: fixed`、`vh`、`zoom`、`transform: scale`
- [ ] 需要隐藏的元素包在 `@media print { display: none }` 里

---

## 十、怎么快速自查

1. 用 **Chrome / Edge** 打开文档
2. `Ctrl+P` → 目标选「另存为 PDF」
3. 看打印窗口的**「缩放」是不是 100%**
   - 不是 100% → 说明内容比纸张宽，回第二节检查宽度
4. 展开「更多设置」→ 勾选**「背景图形」**（Chrome 会记住）
5. 保存后**用 Adobe 打开**，试着拖选一段文字
   - 选不中 → 那段是图片，不是文字
   - 选得中但位置偏 → 违反了第七节（用了 transform / zoom）
