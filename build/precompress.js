#!/usr/bin/env node
/**
 * 预压缩构建脚本
 *
 * 为 Monaco 与项目自身的 JS/CSS 生成 .gz / .br 预压缩文件。
 * 配合 nginx 的 gzip_static / brotli_static 指令使用，
 * 服务器无需实时压缩，直接返回现成文件 → 首屏体积从 3.3MB 降到 660KB。
 *
 * NAS（QNAP QTS 自带 Web Station）若不便改 nginx 配置，
 * 本脚本仍能让 QTS 默认的 gzip 生效（nginx 的 gzip_static 会自动优先使用 .gz）。
 *
 * 用法：
 *   node build/precompress.js          仅在文件有变化时重新生成
 *   node build/precompress.js --force  强制全部重新生成
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const FORCE = process.argv.includes('--force');

// 需要预压缩的目录（白名单，避免误伤无关文件）
const TARGET_DIRS = ['lib/monaco', 'js', 'css'];
const TARGET_EXT = new Set(['.js', '.css', '.svg', '.json', '.html']);

// 单文件压缩后小于该值就不值得生成（gzip 头本身有开销）
const MIN_SIZE = 1024;

function walk(dir, out = []) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return out;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, out);
        } else if (entry.isFile()) {
            out.push(full);
        }
    }
    return out;
}

function newer(source, target) {
    if (!fs.existsSync(target)) return true;
    return fs.statSync(source).mtimeMs > fs.statSync(target).mtimeMs;
}

function brotliAvailable() {
    return typeof zlib.brotliCompressSync === 'function';
}

let created = 0;
let skipped = 0;
let savedBytes = 0;

const candidates = TARGET_DIRS
    .map(d => path.join(ROOT, d))
    .filter(fs.existsSync)
    .flatMap(d => walk(d))
    .filter(f => TARGET_EXT.has(path.extname(f)))
    // 不处理已经压缩过的产物
    .filter(f => !f.endsWith('.gz') && !f.endsWith('.br'));

console.log(`扫描到 ${candidates.length} 个待处理文件\n`);

for (const file of candidates) {
    const stat = fs.statSync(file);
    if (stat.size < MIN_SIZE) {
        skipped++;
        continue;
    }

    const rel = path.relative(ROOT, file);
    const gzPath = file + '.gz';
    const brPath = file + '.br';

    if (!FORCE && !newer(file, gzPath)) {
        skipped++;
        continue;
    }

    const content = fs.readFileSync(file);

    const gz = zlib.gzipSync(content, { level: zlib.constants.Z_BEST_COMPRESSION });
    fs.writeFileSync(gzPath, gz);
    created++;
    savedBytes += stat.size - gz.length;

    if (brotliAvailable()) {
        const br = zlib.brotliCompressSync(content, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                [zlib.constants.BROTLI_PARAM_SIZE_HINT]: content.length
            }
        });
        fs.writeFileSync(brPath, br);
        created++;
    }
}

console.log(`新建压缩文件: ${created} 个`);
console.log(`跳过（已是最新）: ${skipped} 个`);
console.log(`节省传输量: ${(savedBytes / 1024).toFixed(0)} KB`);
console.log(`\n完成。nginx 需开启 gzip_static on;（brotli 另需 brotli_static on;）`);