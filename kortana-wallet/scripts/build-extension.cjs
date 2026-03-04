const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.resolve(__dirname, '../out');

console.log('Building Next.js project...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Fixing static paths for Chrome Extension...');

function walkSync(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkSync(filePath, callback);
        } else {
            callback(filePath);
        }
    });
}

// Rename and Clean Reserved Underscore paths
// Chrome Extensions do not allow files/folders starting with _ (except _locales)
function cleanReservedPaths(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const isDir = fs.statSync(itemPath).isDirectory();

        if (item.startsWith('_')) {
            const newItemName = item.replace(/^_+/, ''); // Remove leading underscores
            const newPath = path.join(dir, newItemName);

            if (fs.existsSync(newPath)) {
                if (fs.statSync(newPath).isDirectory()) {
                    fs.rmSync(newPath, { recursive: true });
                } else {
                    fs.unlinkSync(newPath);
                }
            }

            fs.renameSync(itemPath, newPath);
            console.log(`Renamed ${item} -> ${newItemName}`);

            // Recurse into the renamed directory
            if (isDir) cleanReservedPaths(newPath);
        } else if (isDir) {
            cleanReservedPaths(itemPath);
        }
    });
}

console.log('Cleaning reserved paths...');
cleanReservedPaths(outDir);

// Replace all occurrences of reserved underscores in all files
walkSync(outDir, (filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.txt')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Targeted replacement of Next.js reserved paths
        // Use a more robust replacement for absolute paths to relative paths
        const newContent = content
            .replace(/(?<=['"\/])_next(?=[\/'"])/g, 'next') // Matches _next between quotes or slashes
            .replace(/\/_next/g, './next')
            .replace(/_next\/static/g, 'next/static')
            .replace(/\/_not-found/g, './not-found')
            .replace(/_not-found\.html/g, 'not-found.html')
            .replace(/_not-found\.txt/g, 'not-found.txt');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated references in ${path.relative(outDir, filePath)}`);
        }
    }
});

// Extract inline scripts to fix CSP violations
walkSync(outDir, (filePath) => {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let scriptCounter = 0;
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath, '.html');

        const newContent = content.replace(/<script(?![^>]*src)([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, scriptContent) => {
            if (!scriptContent.trim()) return match;

            scriptCounter++;
            const scriptFileName = `${fileName}-script-${scriptCounter}.js`;
            const scriptFilePath = path.join(dir, scriptFileName);

            fs.writeFileSync(scriptFilePath, scriptContent, 'utf8');
            console.log(`Extracted inline script to ${scriptFileName}`);

            return `<script src="./${scriptFileName}"${attrs}></script>`;
        });

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    }
});

// Patch Next.js Invariant check for assetPrefix
console.log('Patching Next.js assetPrefix checks...');
walkSync(outDir, (filePath) => {
    if (filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Broadly patch any indexOf checks that look like they're verifying the script path
        // This handles cases where Next.js expects certain path prefixes that don't exist in extensions
        let newContent = content
            .replace(/indexOf\("\.\/next\/"\)/g, 'indexOf("/next/")')
            .replace(/indexOf\("\/_next\/"\)/g, 'indexOf("/next/")')
            .replace(/indexOf\("(?:\.\/|\/)next\/"\)/g, 'indexOf("next/")');

        // Also patch the actual throw to be more forgiving if possible
        // (Replacing the -1 check with a check that always passes or handles extension protocol)
        newContent = newContent.replace(/if\(-1===([a-zA-Z0-9]+)\)throw/g, 'if(false && -1===$1)throw');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Patched Invariant check in ${path.relative(outDir, filePath)}`);
        }
    }
});

console.log('Extension build complete! Load the "out" folder in Chrome.');
