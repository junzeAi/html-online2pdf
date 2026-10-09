# 部署与性能优化指南

本文档说明如何在 NAS（QNAP QTS 自带 Web Station）上部署本项目，
以及首次打开慢的问题是怎么解决的、还应不应该做服务器压缩。

---

## 一、首屏问题已经解决（2026-10 改造）

### 改造前：Monaco 挡在首屏关键路径上

原来 `index.html` 静态引入 `lib/monaco/vs/loader.js`，`js/editor.js` 立即调用
`initEditor()`，加载遮罩必须等 Monaco 就绪才消失。结果：

```
index.html → js/editor.js → loader.js → editor.main.js (3388 KB)
```

**要点开页面就必须先下载 4.5 MB**，其中 Monaco 占 89%。

| | 改造前首屏 | 改造后首屏 |
|---|---|---|
| 未压缩 | **4505 KB** | **189.5 KB** |
| gzip 后 | 1063 KB | 40 KB |
| 请求数 | 8（Monaco）+ 11（页面） | **11** |
| 差距 | — | **raw 23.8× / gzip 26.4×** |

### 改造做了什么

**Monaco 改为按需加载**，打开页面不再加载它：

1. 文档内容的真源从 Monaco model 抽成 `currentHTML`（`js/editor.js`），
   `getEditorContent()` / `setEditorContent()` 在没有 Monaco 时也能正常工作
2. 打开页面**默认进入可视化模式**，立即可用
3. 只有点击「代码模式」时才通过 `ensureMonacoEditor()` 加载 Monaco
   （`loader.js` 也改为动态注入）
4. 加载期间编辑面板显示进度；失败显示明确错误 + 「重试」按钮，
   **可视化模式不受影响**（改造前 Monaco 缺失是整页白屏）

### Monaco 现在什么时候下载

只有首次点「代码模式」时下载一次，约 4.3 MB（未压缩）。之后由浏览器缓存。

**所以服务器压缩仍然值得开** —— 它能把这次 4.3 MB 降到约 1.1 MB。
但即使完全不开压缩，页面打开速度也已经不再是问题。

---

## 二、检查 QNAP 自带的 HTTP 压缩（可选优化）

QNAP 官方文档写明，Web Server 有一个 **「启用 HTTP 压缩」** 选项，且**默认是开启的**。
位置：`控制台 → 应用程序 → 网站服务器`（旧版 QTS 5 之前是 `控制台 → 应用程序 → Web Server`）。

> ⚠️ 这个开关作用于 **Web Server（80/8080 端口）**。如果你用
> **Web Station 虚拟主机**（自定义域名/端口）访问，它可能不生效。

### 怎么验证压缩生效没有（30 秒）

浏览器按 `F12` → `Network` → 勾选 `Disable cache` → 刷新页面 →
**点一次「代码模式」**，然后点开 `editor.main.js`：

- 看 `Transferred` 列。若只有 850 KB 左右 → **压缩已生效**
- 点 `Headers` → `Response Headers`，应出现 `Content-Encoding: gzip`（或 `br`）

如果看不到 `Content-Encoding`，说明压缩**没生效**，按下面的方案处理。


---

## 三、解决方案（两步）

### 第1 步：生成预压缩文件（已完成，只需部署）

仓库已包含 `build/precompress.js`。若修改过 Monaco 或源码，重新生成：

```bash
node build/precompress.js
```

它会为 `lib/monaco`、`js`、`css` 下所有 `.js`/`.css` 生成同名的 `.gz` 与 `.br` 文件。
**注意**：`.gz`/`.br` 是构建产物，不需要纳入版本管理，上传 NAS 时可选择不上传
（但传了也没坏处，服务器若开启 `gzip_static` 会直接使用它们）。

### 第 2 步：让服务器使用这些文件

三选一，从简单到彻底。

---

### 方案 A：开启 nginx gzip（推荐，QNAP 可行）

QTS 的 nginx 主配置在 `/etc/config/nginx/` 下。通过 SSH 登录后：

```bash
# 1. 备份
sudo cp /etc/config/nginx/nginx.conf /etc/config/nginx/nginx.conf.bak

# 2. 编辑（vi 或 nano）
sudo vi /etc/config/nginx/nginx.conf
```

在 `http {` 块内加入：

```nginx
gzip              on;
gzip_min_length   1024;
gzip_comp_level   5;
gzip_vary         on;
gzip_proxied      any;
gzip_types        text/plain text/css text/xml text/javascript
                  application/javascript application/json application/xml
                  image/svg+xml;
```

如果**不能修改主配置**，新建 `/etc/config/nginx/conf.d/gzip.conf`：

```nginx
gzip              on;
gzip_min_length   1024;
gzip_comp_level   5;
gzip_vary         on;
gzip_proxied      any;
gzip_types        text/plain text/css text/xml text/javascript
                  application/javascript application/json application/xml
                  image/svg+xml;
```

> QNAP 升级系统固件会覆盖这些改动，需重新设置。

生效：

```bash
sudo /etc/init.d/nginx restart     # 或 killall nginx 后由 Web Station 重新拉起
```

**验证**：浏览器 F12 → Network → 选 `editor.main.js` → Response Headers 里应出现
`Content-Encoding: gzip`。

---

### 方案 B：使用预压缩文件（`gzip_static`）

若你的 nginx 支持（在上面的 `gzip_types` 之后追加）：

```nginx
gzip_static  on;      # 优先返回现成的 .gz 文件，省去实时压缩
```

支持 brotli 的话（需 nginx 带 ngx_brotli 模块）：

```nginx
brotli            on;
brotli_static     on;
brotli_comp_level 5;
```

这一项收益最大：3.3 MB → **664 KB**（brotli）或 **857 KB**（gzip）。

---

### 方案 C：Cloudflare 代理压缩（最省事）

如果外网访问经过 Cloudflare，可在 CF 控制台开启：

`网络` → `压缩`（Compression）→ 选中 `Brotli`（或 `Gzip`）

CDN 边缘节点会自动压缩，NAS 侧零改动。缺点是仅对经过 CF 的流量生效，
且部分套餐有流量上限。

---

## 四、验证是否生效

浏览器打开页面，F12 → Network 面板：

1. 勾选 `Disable cache` 后刷新
2. 找到 `editor.main.js`，看 `Transferred` 列 vs `Size` 列
   - `Transferred` 明显小于 `Size` → 压缩已生效
3. Response Headers 中确认 `Content-Encoding: gzip`（或 `br`）

预期效果：3.3 MB 的文件应降到 900 KB 以内。

---

## 五、可选的进一步优化

### 1. ~~升级 Monaco~~（已实测否决，勿再尝试）

> **实测结论：升级 Monaco 会让首屏更大，不要做。**
>
> 2026-10 实测（同一环境、同一加载方式 `require(['vs/editor/editor.main'])`，
> 统计 `performance.getEntriesByType('resource')` 的全部网络字节）：
>
> | | 旧版 0.45.0 | 新版 0.57.0 | 差值 |
> |---|---|---|---|
> | 未压缩 | 3996 KB | 4609 KB | **+613 KB** |
> | gzip 后 | 1018 KB | 1198 KB | **+180 KB** |
>
> 新版虽然单个 `editor-BdtEMBbM.js` 从 3388 KB 降到 2414 KB，但把
> `toggleHighContrast`（1264 KB）、`editorWorkerHost`（353 KB）、
> `editor.main.css`（113→382 KB）拉进了首屏，**总账是亏的**。
>
> 技术上新版能跑通（编辑器创建成功、HTML worker 正常），但性能上是负收益。
> **结论：本项目保持 0.45.0 min 构建不动。**


### 2. 删除用不到的 Monaco 文件（可选）

`lib/monaco` 总计 13 MB，其中以下文件本项目用不到：

| 文件/目录 | 体积 | 说明 |
|---|---|---|
| `language/typescript/tsWorker.js` | 4.5 MB | `language: 'html'` 不需要 TS 智能提示 |
| `editor.main.nls.ru.js` | 500 KB | 俄语语言包 |
| `editor.main.nls.ja.js` | 243 KB | 日语 |
| `editor.main.nls.ko.js` | 200 KB | 韩语 |
| `editor.main.nls.zh-tw.js` | 155 KB | 繁体中文 |
| `editor.main.nls.fr/es/de/it.js` | 约 500 KB | 西/法/德/意 |
| `basic-languages/` 中 74 个非 html/css/js 语言 | 约 1.3 MB | abap、solidity、powerquery 等 |

保留中文需 `editor.main.nls.zh-cn.js`。

> ⚠️ **谨慎删除**。这些文件是按需加载的（不在首屏链路上），删掉主要减少上传体积和磁盘占用，
> 对打开速度的改善有限。删除后务必实测编辑器能否正常启动（HTML 模式会拉起
> `htmlWorker.js`，若缺失会导致编辑器起不来）。建议先备份 `lib/monaco`。

### 3. 加 HTTP 缓存（推荐）

为 `lib/` 下的静态资源配置长缓存，浏览器二次打开几乎瞬间完成。
nginx 中：

```nginx
location ~* ^/lib/.*\.(js|css|ttf|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

配合 `.gz`/`.br` 后，第二次访问只需 304，几乎无感知延迟。

---

## 六、常见问题

**Q：NAS 上 `git pull` 报「Your local changes would be overwritten by merge」？**

A：几乎都是**换行符不一致**造成的 —— 仓库里存的是 LF，而工作区里那几个文件是 CRLF，
git 因此认为它们有"本地改动"。按下面顺序处理（**顺序不能反**）：

```bash
cd <你的网站目录>

# ① 先确认差异到底是什么：这条命令忽略行尾差异
#    如果输出为空 → 纯粹是换行符问题，可以放心丢弃
git diff --ignore-cr-at-eol --stat

# ② 关掉自动换行符转换（Linux 上本就不该开）
git config core.autocrlf false

# ③ 丢弃这几个文件的本地改动
git checkout -- README.md js/print.js js/toolbar.js

# ④ 重新拉取
git pull
```

> ⚠️ 一定要**先做 ② 再做 ③**。若 NAS 上 `core.autocrlf=true` 而先执行了 checkout，
> 会又写出 CRLF 版本，下次拉取继续冲突。

> 仓库已包含 `.gitattributes`（`* text=auto eol=lf`），理论上不会再出现这个问题。
> 如果你的目录是在该文件加入之前 clone 的，按上面步骤清一次即可。

**Q：本地 Windows 上编辑的文件拷到 NAS 后，git 说有改动？**

A：同样是换行符问题。Windows 工作区是 CRLF、仓库是 LF。
改用 `git pull` 更新，或者把 `core.autocrlf` 设为 `false` 后重新检出。

**Q：为什么本地 `start-server.bat` 不慢？**
A：本机读盘不占带宽。慢的是**网络传输**，NAS 到浏览器的距离与带宽决定体感。
（不过现在首屏只有 190 KB，这个差异已经不明显了。）

**Q：打开页面后看不到代码编辑器？**
A：这是**有意设计**。Monaco 有 3.4 MB，为了不拖慢打开速度，改为点「代码模式」时
才加载。首次点击会看到「正在加载代码编辑器…」，约几秒后出现，之后浏览器缓存，
再点就秒开。

**Q：代码编辑器加载失败怎么办？**
A：编辑面板会显示具体原因和「重试」按钮（常见原因是 `lib/monaco` 目录没上传完整）。
此时**可视化模式完全可用**，可以先继续编辑内容，之后再排查。

**Q：改了 js/css 目录下的文件后页面没变化？**
A：预压缩文件（`.gz`/`.br`）过期了。上传前先跑 `node build/precompress.js`
（或双击 `pre-upload.bat`）。

**Q：改了 nginx.conf 后 Web Station 页面打不开？**
A：先 `nginx -t` 校验语法再 reload；改前务必备份 `.bak`。QNAP 升级固件会还原，手法要记下。

**Q：`.gz`/`.br` 需要上传到 NAS 吗？**
A：**建议一起传**。它们只在服务器开启 `gzip_static` / `brotli_static` 时被使用，
但多这几 MB 没有任何副作用；漏传反而可能在开启 `gzip_static` 后导致返回旧内容。

**Q：上传整个项目需要多少空间？**
A：含预压缩文件约 19 MB，其中 `lib/monaco` 占 18 MB（Monaco 本身就是这个体量）。