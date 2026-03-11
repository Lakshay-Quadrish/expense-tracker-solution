const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(srcDir, 'render-deploy');

if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir);

const skipList = [
    'node_modules',
    'ios',
    'android',
    'render-deploy',
    '.git',
    '.idea',
    '.env',
    'expense-tracker-deploy.zip',
    'create-deploy-folder.js',
    'package-lock.json'
];

function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        if (skipList.includes(entry.name)) continue;

        // Also skip inner node_modules and big folders
        if (entry.name === 'node_modules') continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Building clean deployment directory...');
copyDir(srcDir, destDir);
console.log('✅ Clean deploy folder created at:', destDir);
