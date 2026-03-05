/**
 * Kortana Wallet — Chrome Extension Build Script (v5)
 * Final Boss Fix
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.resolve(__dirname, '../out');

function walkFiles(dir, cb) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        fs.statSync(full).isDirectory() ? walkFiles(full, cb) : cb(full);
    }
}

console.log('\n[1/5] Building Next.js ...');
execSync('npm run build', { stdio: 'inherit' });

console.log('[2/5] Renaming _next → next ...');
function renameDirs(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) renameDirs(full);
    }
    for (const item of items) {
        if (item.startsWith('_') && item !== '_locales') {
            const src = path.join(dir, item);
            const dst = path.join(dir, item.replace(/^_+/, ''));
            if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true });
            fs.renameSync(src, dst);
        }
    }
}
renameDirs(outDir);

console.log('[3/5] Fixing Paths & Stripping Async ...');
walkFiles(outDir, (file) => {
    if (!/\.(html|js|css|json)$/.test(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Fix all variations of /_next and /next to be relative ./next
    let fixed = content
        .replace(/\/_next\//g, './next/')
        .replace(/\/next\//g, './next/')
        .replace(/href="\/next\//g, 'href="./next/')
        .replace(/src="\/next\//g, 'src="./next/')
        .replace(/href="\/_next\//g, 'href="./next/')
        .replace(/src="\/_next\//g, 'src="./next/')
        .replace(/url\(\/next\//g, 'url(./next/')
        .replace(/url\(\/_next\//g, 'url(./next/')
        .replace(/"\/images\//g, '"./images/');

    if (file.endsWith('.html')) {
        // Strip async to force sequential loading
        fixed = fixed.replace(/\sasync=""/gi, '');
        fixed = fixed.replace(/\sasync/gi, '');
    }

    fs.writeFileSync(file, fixed, 'utf8');
});

console.log('[4/5] CSP extraction ...');
walkFiles(outDir, (file) => {
    if (!file.endsWith('.html')) return;
    let content = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    const base = path.basename(file, '.html');
    let n = 0;

    const out = content.replace(/<script(?![^>]*\bsrc\b)([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs, body) => {
        if (!body.trim()) return _;
        const name = `${base}-inline-${++n}.js`;
        fs.writeFileSync(path.join(dir, name), body, 'utf8');
        return `<script src="./${name}"${attrs}></script>`;
    });
    fs.writeFileSync(file, out, 'utf8');
});

console.log('[5/5] Patching Runtime & Sizing ...');
// This is the "Nuclear" fix for the Turbopack runtime
const PATCH_RUNTIME = `function l(){
  if(typeof chrome!=="undefined"&&chrome.runtime&&chrome.runtime.getURL){
    return chrome.runtime.getURL("/");
  }
  return window.location.origin + "/";
}`;

walkFiles(outDir, (file) => {
    if (!file.endsWith('.js')) return;
    let content = fs.readFileSync(file, 'utf8');

    // Patch the l() function which detects the asset prefix
    const needle = 'function l(){let e=document.currentScript';
    if (content.indexOf(needle) !== -1) {
        // Find the end of the function and replace it
        let start = content.indexOf(needle);
        let depth = 0;
        let end = -1;
        for (let i = start; i < content.length; i++) {
            if (content[i] === '{') depth++;
            if (content[i] === '}') {
                depth--;
                if (depth === 0) {
                    end = i + 1;
                    break;
                }
            }
        }
        if (end !== -1) {
            content = content.slice(0, start) + PATCH_RUNTIME + content.slice(end);
            fs.writeFileSync(file, content, 'utf8');
            console.log('  ✓ Patched runtime in', path.relative(outDir, file));
        }
    }
});

const indexHtml = path.join(outDir, 'index.html');
if (fs.existsSync(indexHtml)) {
    let html = fs.readFileSync(indexHtml, 'utf8');
    const sizing = '<style>html,body{width:420px;height:600px;overflow:hidden;margin:0;padding:0;background:#0a0e27}</style>';
    const base = '<base href="./">';

    html = html.replace('<head>', '<head>' + base + sizing);
    fs.writeFileSync(indexHtml, html, 'utf8');
    console.log('  ✓ Injected base and sizing into index.html');
}

console.log('\nDone! Extension is ready.');
