// fix-urls.js
// Replaces hardcoded http://127.0.0.1:8000 URLs in resources/js with
// VITE_API_URL-based URLs pointing to the production server.
//
// Usage: node fix-urls.js
// Run this from your project root (where resources/ lives).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'resources', 'js');

const API_FALLBACK = "import.meta.env.VITE_API_URL || 'http://192.168.255.97/api'";
const STORAGE_FALLBACK = `(${API_FALLBACK}).replace('/api','')`;

let filesChanged = 0;
let totalReplacements = 0;

function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walk(full);
        } else if (entry.endsWith('.jsx') || entry.endsWith('.js')) {
            processFile(full);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let localCount = 0;

    // 1. Single-quoted full strings with /api -> template literal
    content = content.replace(
        /'http:\/\/127\.0\.0\.1:8000\/api((?:[^'\\]|\\.)*)'/g,
        (_, rest) => { localCount++; return `\`\${${API_FALLBACK}}${rest}\``; }
    );

    // 2. Single-quoted full strings with /storage -> template literal
    content = content.replace(
        /'http:\/\/127\.0\.0\.1:8000\/storage((?:[^'\\]|\\.)*)'/g,
        (_, rest) => { localCount++; return `\`\${${STORAGE_FALLBACK}}/storage${rest}\``; }
    );

    // 3. Any remaining literal occurrences (already inside template literals)
    content = content.replace(
        /http:\/\/127\.0\.0\.1:8000\/api/g,
        () => { localCount++; return `\${${API_FALLBACK}}`; }
    );

    content = content.replace(
        /http:\/\/127\.0\.0\.1:8000\/storage/g,
        () => { localCount++; return `\${${STORAGE_FALLBACK}}/storage`; }
    );

    if (localCount > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesChanged++;
        totalReplacements += localCount;
        console.log(`${path.relative(__dirname, filePath)}: ${localCount} replacement(s)`);
    }
}

if (!fs.existsSync(ROOT)) {
    console.error('Could not find resources/js — run this script from your project root.');
    process.exit(1);
}

walk(ROOT);
console.log(`\nDone. ${totalReplacements} replacements across ${filesChanged} files.`);