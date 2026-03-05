/**
 * Kortana Wallet — Chrome Extension Build Script (v4)
 * 
 * Aggressive fixes for blank popups:
 *  1. Rename _next/ → next/
 *  2. STRIP async="" from all scripts (fixes execution order issues)
 *  3. Patch paths to be relative
 *  4. Extract inline scripts (CSP)
 *  5. Patch Turbopack runtime
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.resolve(__dirname, '../out');

// ── helpers ───────────────────────────────────────────────────────────────────
function walkFiles(dir, cb) {
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        fs.statSync(full).isDirectory() ? walkFiles(full, cb) : cb(full);
    }
}

// ── STEP 1: build ─────────────────────────────────────────────────────────────
console.log('\n[1/5] Building Next.js ...');
execSync('npm run build', { stdio: 'inherit' });
console.log('✓ Build done.\n');

// ── STEP 2: rename _next → next ───────────────────────────────────────────────
console.log('[2/5] Renaming underscore dirs ...');
function renameDirs(dir) {
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) renameDirs(full);
    }
    for (const item of fs.readdirSync(dir)) {
        if (item.startsWith('_') && item !== '_locales') {
            const src = path.join(dir, item);
            const dst = path.join(dir, item.replace(/^_+/, ''));
            if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true });
            fs.renameSync(src, dst);
            console.log(`  ${item} → ${path.basename(dst)}`);
        }
    }
}
renameDirs(outDir);
console.log('✓ Rename done.\n');

// ── STEP 3: path patching & async removal ─────────────────────────────────────
console.log('[3/5] Patching paths & removing async ...');
walkFiles(outDir, (file) => {
    if (!/\.(html|js|css|txt|json)$/.test(file)) return;
    let raw = fs.readFileSync(file, 'utf8');

    const rel = path.relative(outDir, path.dirname(file));
    const depth = rel === '' ? 0 : rel.split(path.sep).length;
    const p = depth === 0 ? './' : '../'.repeat(depth);

    let fixed = raw
        .replace(/(href|src)="\/next\//g, `$1="${p}next/`)
        .replace(/(href|src)="\/_next\//g, `$1="${p}next/`)
        .replace(/url\(\/next\//g, `url(${p}next/`)
        .replace(/url\(\/_next\//g, `url(${p}next/`)
        .replace(/(href|src)="\/images\//g, `$1="${p}images/`)
        .replace(/\/_not-found/g, `${p}not-found`)
        .replace(/"\/next\//g, `"${p}next/`);

    // STRIP async from script tags in HTML
    if (file.endsWith('.html')) {
        fixed = fixed.replace(/<script([^>]*)\sasync=""([^>]*)>/gi, '<script$1$2>');
        fixed = fixed.replace(/<script([^>]*)\sasync([^>]*)>/gi, '<script$1$2>');
    }

    if (fixed !== raw) {
        fs.writeFileSync(file, fixed, 'utf8');
        console.log(`  ✓ ${path.relative(outDir, file)}`);
    }
});
console.log('✓ Path patching & async removal done.\n');

// ── STEP 4: extract inline scripts ────────────────────────────────────────────
console.log('[4/5] Extracting inline scripts ...');
walkFiles(outDir, (file) => {
    if (!file.endsWith('.html')) return;
    const raw = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    const base = path.basename(file, '.html');
    let n = 0;

    const out = raw.replace(
        /<script(?![^>]*\bsrc\b)([^>]*)>([\s\S]*?)<\/script>/gi,
        (_, attrs, body) => {
            if (!body.trim()) return _;
            const name = `${base}-inline-${++n}.js`;
            fs.writeFileSync(path.join(dir, name), body, 'utf8');
            return `<script src="./${name}"${attrs}></script>`;
        }
    );

    if (out !== raw) {
        fs.writeFileSync(file, out, 'utf8');
        console.log(`  ✓ ${path.relative(outDir, file)} (${n} scripts extracted)`);
    }
});
console.log('✓ CSP extraction done.\n');

// ── STEP 5: patch runtime & inject sizing ─────────────────────────────────────
console.log('[5/5] Patching runtime & injecting popup sizing ...');
const PATCHED_FN =
    'function l(){' +
    'if(typeof chrome!=="undefined"&&chrome.runtime&&chrome.runtime.getURL){' +
    'return chrome.runtime.getURL("/")}' +
    'var sc=document.currentScript;' +
    'if(!sc||!sc.src){return window.__EXT_BASE__||"./"}' +
    'var u=new URL(sc.src);var i=u.pathname.indexOf("/next/");if(i===-1)i=u.pathname.indexOf("/_next/");' +
    'if(i===-1){i=u.pathname.lastIndexOf("/")+1}' +
    'return u.origin+u.pathname.slice(0,i)}';

walkFiles(outDir, (file) => {
    if (!file.endsWith('.js')) return;
    let src = fs.readFileSync(file, 'utf8');
    const orig = src;

    const NEEDLE = 'function l(){let e=document.currentScript';
    const start = src.indexOf(NEEDLE);
    if (start !== -1) {
        let depth = 0, i = start, end = -1;
        while (i < src.length) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') { if (--depth === 0) { end = i + 1; break; } }
            i++;
        }
        if (end !== -1) {
            src = src.slice(0, start) + PATCHED_FN + src.slice(end);
            console.log(`  ✓ Patched getAssetPrefix: ${path.relative(outDir, file)}`);
        }
    }

    src = src.replace(/\blet t="\.\.\/\.\.\/\.\.\/next\/"/g,
        `let t=(typeof chrome!=="undefined"&&chrome.runtime&&chrome.runtime.getURL)?chrome.runtime.getURL("next/"):"./next/"`);

    if (src !== orig) fs.writeFileSync(file, src, 'utf8');
});

const indexHtml = path.join(outDir, 'index.html');
if (fs.existsSync(indexHtml)) {
    let html = fs.readFileSync(indexHtml, 'utf8');
    const extBaseJs = path.join(outDir, 'ext-base.js');
    fs.writeFileSync(extBaseJs, 'if(typeof chrome!=="undefined"&&chrome.runtime&&chrome.runtime.getURL){window.__EXT_BASE__=chrome.runtime.getURL("/");}');

    const inject = '<style id="ext-sizing">html,body{width:420px;height:600px;overflow:hidden;margin:0;padding:0;background:#0a0e27!important}</style>' +
        '<script src="./ext-base.js"></script>';

    if (!html.includes('id="ext-sizing"')) {
        html = html.replace('<head>', '<head>' + inject);
        fs.writeFileSync(indexHtml, html, 'utf8');
        console.log('  ✓ Injected sizing & ext-base.js');
    }
}

console.log('═══════════════════════════════════════════════════');
console.log('  Extension build complete!');
console.log('  Reload the extension and try again.');
console.log('═══════════════════════════════════════════════════\n');
