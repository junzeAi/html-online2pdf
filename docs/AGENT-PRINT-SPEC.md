# 打印级 HTML 生成规范（面向 AI Agent）

> **这份文档的作用**：把它作为系统提示词 / 附件交给生成 HTML 的 Agent，
> 让它产出的 HTML 可以**直接导入编辑器检查、直接打印成 A4 PDF**，
> 不需要事后返工。

---

## 使用方式

把本文件整体附给你的 Agent，并加上一句任务指令，例如：

> 请**严格遵循**附件《打印级 HTML 生成规范》，生成一份
> 「小升初数学总复习——小数的认识」的 A4 打印稿 HTML。单文件、CSS 内联、不引用任何外部资源。

---

## 一、任务目标

你生成的 HTML 最终会被：

1. 导入到 HTML 编辑器里**人工检查、修改**
2. 用 Chrome / Edge **打印成 A4 PDF**，发给学生

因此必须同时满足四个条件：

| # | 要求 | 不满足的后果 |
|---|---|---|
| 1 | 打印出来的样式与屏幕预览一致 | 版面跑偏 |
| 2 | PDF 里的文字**能选中、能搜索** | 学生选不了、复制不了 |
| 3 | **不触发浏览器缩放** | 选区错位、光标异常变大 |
| 4 | 结构干净，**能被可视化编辑器正常编辑** | 编辑器里点不动、改不了 |

**优先级**：宁可排版朴素，也不要违反下面任何一条硬性规则。

---

## 二、硬性规则（逐条必须遵守）

### R1. 必须是完整的单文件 HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>这里写文档的真实标题</title>
<style>/* 全部 CSS 内联在这里 */</style>
</head>
<body>
<!-- 正文 -->
</body>
</html>
```

- `<meta charset="UTF-8">` **必须有**，否则中文乱码
- CSS **全部内联**在 `<style>` 里，**不引用任何外部文件**
- 不引用 CDN、不引用网络字体、不引用外链图片

### R2. ⚠️ `<title>` 必须是文档的真实中文标题

导出 PDF 时，**浏览器会用 `<title>` 作为 PDF 的文件名**。

```html
<title>小升初数学总复习——小数的认识</title>   <!-- ✅ -->
<title>document</title>                        <!-- ❌ 导出就是 document.pdf -->
<title>Untitled</title>                        <!-- ❌ -->
```

- 用文档真实标题，**不要用英文占位符**
- 不要包含 `/ \ : * ? " < > |` 这些字符
- 长度控制在 60 个字符以内

### R3. 必须声明纸张尺寸

```css
@page {
    size: A4;
    margin: 0;
}
```

**这是最关键的一条。** 不声明时 Chrome 会按「屏幕尺寸」猜纸张大小，
一旦内容比纸宽就**整页缩放**，会导致：

- 打印预览里选中的文字与实际位置对不上
- 文字插入光标异常变大

### R4. `body` 必须有 padding

因为 `@page` 用了 `margin: 0`，**页面留白完全靠 padding 提供**：

```css
body {
    margin: 0;
    padding: 15mm 18mm;   /* 上下 15mm、左右 18mm */
}
```

没有 padding 的话，内容会贴到纸边，被打印机的硬件不可打印区裁掉。

### R5. 内容宽度不得超过纸张

A4 宽 **210mm**。左右各留 18mm 后，**可用宽度是 174mm**。

```css
/* ✅ 用 mm / % / max-width */
.container { width: 174mm; }
.card      { max-width: 100%; }

/* ❌ 禁止固定 px 宽度 */
.container { width: 1200px; }
```

- 所有尺寸**优先用 `mm`**，其次 `%`
- **禁止** `100vw`、`100vh`
- 不要写 `width: 1000px` 这类会超过 174mm 的值

### R6. 必须声明打印颜色

```css
* {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
```

不加的话，浏览器默认**不打印背景色和背景图**，底色/色块会全部消失。

### R7. ⚠️ 禁止使用含 `transparent` 的渐变

含 `transparent` 的渐变会让 Chrome 在 PDF 里生成「透明度组 + 亮度软掩码」，
**部分 PDF 阅读器渲染不了，整块直接消失**。

```css
/* ❌ 禁止 */
background: linear-gradient(to bottom, transparent 50%, #ffeb3b 50%);
background: linear-gradient(to bottom, rgba(255,255,255,0) 50%, #ffeb3b 50%);

/* ✅ 需要「半抹荧光笔」效果时，用不透明纯色 + background-size */
background-image: linear-gradient(#ffeb3b, #ffeb3b);
background-size: 100% 50%;
background-position: 0 100%;
background-repeat: no-repeat;
```

**任何 `rgba(...)` 里 alpha 为 0 的色标都算违规。**

### R8. 字体只用系统字体

```css
body {
    font-family: "Microsoft YaHei", "PingFang SC",
                 "Hiragino Sans GB", "Source Han Sans SC",
                 "Heiti SC", sans-serif;
}
```

- **禁止**用 `@font-face` 加载网络字体
- 字体回退会改变字宽 → 换行错位 → 版面跑偏

### R9. 字号用 `pt`，行高用无单位数字

```css
body { font-size: 10.5pt; }    /* ✅ 10.5pt ≈ 五号字，适合打印 */
body { font-size: 14px; }      /* ⚠️ 屏幕单位，打印时会变 */
body { line-height: 1.7; }     /* ✅ 跟随字号缩放 */
body { line-height: 26px; }    /* ❌ 改字号后就错位 */
```

### R10. 文字必须是真实文本

| 做法 | PDF 里能选中 |
|---|---|
| 正常 HTML 文本节点 | ✅ |
| `<img>` 图片里的文字 | ❌ |
| `<canvas>` 绘制的文字 | ❌ |
| 用 `background-image` 贴文字图 | ❌ |
| 用 `::before` / `::after` 的 `content` 放正文 | ⚠️ 编辑器里改不了，禁止 |

**所有正文内容必须是真实文本节点。**

### R11. 分页控制

```css
/* 标题不要孤零零留在页尾 */
h1, h2, h3, h4 { break-after: avoid; }

/* 这些元素不要被跨页切断 */
tr, img, svg, figure, pre, blockquote {
    break-inside: avoid;
}

/* 段落不要出现单行孤行 */
p, li { orphans: 2; widows: 2; }

/* 长表格每页重复表头 */
thead { display: table-header-group; }
```

⚠️ **不要给 `table` 本身加 `break-inside: avoid`** —— 长表格会被整体推到下一页，
前面留一大片空白。

### R12. 结构必须适合可视化编辑器二次编辑

因为用户会用编辑器的**可视化模式**点选元素、改文字、调样式：

- 用**语义化标签**：`h1`~`h4`、`p`、`ul`/`ol`/`li`、`table`/`thead`/`tbody`/`tr`/`th`/`td`、`figure`
- **不要过度嵌套 `div`** —— 嵌套越深，编辑时越难点中想要的那一层
- 每个独立的内容单元用**独立的块级元素**，不要把大段内容塞进一个 `p` 里
- **不要**用伪元素承载内容文字
- 需要强调就用 `<strong>` / `<em>`，不要用 `<span style="font-weight:700">` 堆砌

---

## 三、禁止清单

以下属性会让打印错乱或选区错位，**一律禁用**：

| 禁用 | 原因 | 替代方案 |
|---|---|---|
| `transform: scale()` / `skew()` | PDF 文字层坐标错位，选不中 | 改 `font-size`、用 `font-style: italic` |
| `zoom` | 同上 | 改 `font-size` |
| `position: fixed` | 打印时行为不一致（有的只在首页） | `position: static` / `relative` |
| `vh` / `vw` / `100vh` | 打印时"视口"高度不确定 | 用 `mm` 或 `auto` |
| 含 `transparent` 的渐变 | 生成 PDF 软掩码，部分阅读器不显示 | 见 R7 |
| `@font-face` 网络字体 | 加载时序不稳定 | 系统字体栈 |
| 外部 CSS / JS / 图片链接 | 单文件打开时不可靠 | 全部内联 |
| JS 动态生成正文 | 打印时可能未执行完 | 静态 HTML |
| CSS Grid 复杂布局 | 分页时容易断裂 | `flex` 或普通块级 |

---

## 四、完整模板骨架（直接复制使用）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>请替换为文档真实标题</title>
<style>
    /* ---------- 纸张 ---------- */
    @page { size: A4; margin: 0; }

    * { box-sizing: border-box; }

    /* ---------- 页面基础 ---------- */
    html { margin: 0; padding: 0; }

    body {
        margin: 0;
        padding: 15mm 18mm;          /* 留白靠 padding（R4） */
        font-family: "Microsoft YaHei", "PingFang SC",
                     "Hiragino Sans GB", "Source Han Sans SC", sans-serif;
        font-size: 10.5pt;           /* 打印用 pt（R9） */
        line-height: 1.7;
        color: #222;
        -webkit-print-color-adjust: exact;   /* R6 */
        print-color-adjust: exact;
    }

    /* ---------- 标题 ---------- */
    h1 { font-size: 18pt; text-align: center; margin: 0 0 6mm; }
    h2 { font-size: 14pt; margin: 7mm 0 3mm; break-after: avoid; }
    h3 { font-size: 12pt; margin: 5mm 0 2mm; break-after: avoid; }

    /* ---------- 正文 ---------- */
    p { margin: 0 0 3mm; }
    ul, ol { margin: 0 0 3mm; padding-left: 7mm; }
    li { margin-bottom: 1.5mm; orphans: 2; widows: 2; }

    /* ---------- 表格 ---------- */
    table {
        width: 100%;
        max-width: 174mm;            /* 不超过可用宽度（R5） */
        border-collapse: collapse;
        margin: 0 0 4mm;
    }
    th, td {
        border: 1px solid #999;
        padding: 1.5mm 2.5mm;
        text-align: left;
        vertical-align: top;
    }
    th { background-color: #eef2f7; }   /* 纯色，不用渐变（R7） */
    tr { break-inside: avoid; }          /* R11 */
    thead { display: table-header-group; }

    /* ---------- 图片 ---------- */
    img { max-width: 100%; height: auto; break-inside: avoid; }

    /* ---------- 分页 ---------- */
    .page-break { break-before: page; page-break-before: always; }
    .no-print   { display: none; }
</style>
</head>
<body>

<h1>文档标题</h1>

<h2>一、小节标题</h2>
<p>正文内容……</p>

<table>
    <thead>
        <tr><th>序号</th><th>内容</th></tr>
    </thead>
    <tbody>
        <tr><td>1</td><td>示例</td></tr>
    </tbody>
</table>

</body>
</html>
```

---

## 五、荧光笔标记格式（可选）

荧光笔通常由用户在编辑器里**手动添加**，你**不需要主动生成**。
但如果任务明确要求你预置荧光笔，必须用下面这个格式，否则编辑器识别不了：

```html
<span class="highlighter-mark" data-hl-color="#ffeb3b"
      style="background-image: linear-gradient(#ffeb3b, #ffeb3b);
             background-size: 100% 50%;
             background-position: 0 100%;
             background-repeat: no-repeat;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;">被标记的文字</span>
```

可用的 8 种颜色（`data-hl-color` 与渐变颜色必须一致）：

| 颜色 | 色值 |
|---|---|
| 黄色 | `#ffeb3b` |
| 绿色 | `#a5d6a7` |
| 蓝色 | `#81d4fa` |
| 粉色 | `#f8bbd9` |
| 橙色 | `#ffcc80` |
| 紫色 | `#ce93d8` |
| 红色 | `#ef9a9a` |
| 青色 | `#80cbc4` |

> ⚠️ 只在**行内文字的片段**上用，不要包住整段或块级元素。
> 也**不要**在 `<style>` 里给 `.highlighter-mark` 写背景色 —— 颜色是每处内联指定的。

---

## 六、生成后自检清单

输出之前，逐条核对：

- [ ] `<!DOCTYPE html>` + `<html lang="zh-CN">` 齐全
- [ ] 有 `<meta charset="UTF-8">`
- [ ] `<title>` 是**文档真实中文标题**，没有英文占位符
- [ ] CSS 全部在 `<style>` 里，**没有任何外部引用**
- [ ] 有 `@page { size: A4; margin: 0; }`
- [ ] `body` 有 `padding`（如 `15mm 18mm`）
- [ ] 所有尺寸用 `mm` / `%`，**没有超过 174mm 的固定 px 宽度**
- [ ] 有 `print-color-adjust: exact`（`*` 和 `body` 都写上更稳）
- [ ] **全文搜索 `transparent`，确认没有含它的渐变**
- [ ] 字体是系统字体栈，没有 `@font-face`
- [ ] 字号用 `pt`，行高是无单位数字
- [ ] 表格有 `tr { break-inside: avoid }` 和 `thead { display: table-header-group }`
- [ ] **没有**给 `table` 本身加 `break-inside`
- [ ] 标题有 `break-after: avoid`
- [ ] 没有 `transform` / `zoom` / `position: fixed` / `vh` / `vw`
- [ ] 所有正文都是真实文本节点，不在图片或伪元素里
- [ ] 结构用语义标签，`div` 嵌套不超过 3 层

---

## 七、输出要求

- 只输出**一个完整的 HTML 文件**，不要拆分成多个文件
- 不要输出解释性文字，直接给完整代码
- 代码块语言标记为 `html`
