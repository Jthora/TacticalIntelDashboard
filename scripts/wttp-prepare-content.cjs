#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Prepare content for WTTP deployment
 * This script optimizes the build output for efficient WTTP deployment
 */
async function prepareWTTPContent() {
    console.log('🔧 Preparing content for WTTP deployment...');
    
    const distDir = path.resolve('./dist');
    const wttpDir = path.resolve('./wttp-content');
    
    // Check if build exists
    if (!fs.existsSync(distDir)) {
        console.error('❌ Build directory not found. Run build first:');
        console.log('   npm run build');
        process.exit(1);
    }
    
    // Create WTTP content directory
    if (!fs.existsSync(wttpDir)) {
        fs.mkdirSync(wttpDir, { recursive: true });
    }
    
    console.log('📂 Build directory:', distDir);
    console.log('📂 WTTP content directory:', wttpDir);
    
    // Content mapping for WTTP
    const contentMap = [];
    
    // Helper function to get MIME type
    function getMimeType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.ico': 'image/x-icon',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.txt': 'text/plain',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
    
    // Helper function to calculate file hash
    function getFileHash(filePath) {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
    }
    
    // Recursively process files
    function processDirectory(dir, basePath = '') {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.join(basePath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                // Recursively process subdirectories
                processDirectory(fullPath, relativePath);
            } else {
                // Process file
                const urlPath = '/' + relativePath.replace(/\\/g, '/');
                const mimeType = getMimeType(item);
                const size = stats.size;
                const hash = getFileHash(fullPath);
                
                // Copy file to WTTP content directory
                const wttpFilePath = path.join(wttpDir, relativePath);
                const wttpFileDir = path.dirname(wttpFilePath);
                
                if (!fs.existsSync(wttpFileDir)) {
                    fs.mkdirSync(wttpFileDir, { recursive: true });
                }
                
                fs.copyFileSync(fullPath, wttpFilePath);
                
                contentMap.push({
                    path: urlPath,
                    file: path.relative(process.cwd(), wttpFilePath),
                    originalFile: path.relative(process.cwd(), fullPath),
                    contentType: mimeType + '; charset=utf-8',
                    size: size,
                    hash: hash
                });
                
                console.log(`├── ${urlPath} (${(size / 1024).toFixed(2)} KB, ${mimeType})`);
            }
        }
    }
    
    console.log('\n📄 Processing files...');
    processDirectory(distDir);
    
    // Copy public files that might not be in dist
    const publicDir = path.resolve('./public');
    if (fs.existsSync(publicDir)) {
        console.log('\n📄 Processing public files...');
        const publicItems = ['favicon.ico', 'robots.txt', 'manifest.json'];
        
        for (const item of publicItems) {
            const publicFile = path.join(publicDir, item);
            if (fs.existsSync(publicFile)) {
                const wttpFile = path.join(wttpDir, item);
                const stats = fs.statSync(publicFile);
                const mimeType = getMimeType(item);
                const hash = getFileHash(publicFile);
                
                fs.copyFileSync(publicFile, wttpFile);
                
                contentMap.push({
                    path: '/' + item,
                    file: path.relative(process.cwd(), wttpFile),
                    originalFile: path.relative(process.cwd(), publicFile),
                    contentType: mimeType + '; charset=utf-8',
                    size: stats.size,
                    hash: hash
                });
                
                console.log(`├── /${item} (${(stats.size / 1024).toFixed(2)} KB, ${mimeType})`);
            }
        }
    }
    
    // Generate content manifest
    const manifest = {
        generated: new Date().toISOString(),
        totalFiles: contentMap.length,
        totalSize: contentMap.reduce((sum, item) => sum + item.size, 0),
        files: contentMap
    };
    
    const manifestPath = path.join(wttpDir, 'wttp-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('\n📊 Content Summary:');
    console.log(`├── Total files: ${manifest.totalFiles}`);
    console.log(`├── Total size: ${(manifest.totalSize / 1024).toFixed(2)} KB`);
    console.log(`├── Content directory: ${wttpDir}`);
    console.log(`├── Manifest: ${manifestPath}`);
    
    // Generate deployment script
    const deployScript = `#!/usr/bin/env node
// Auto-generated WTTP deployment script
const { deployContentToWTTP } = require('./scripts/wttp-deploy-content.js');

// Content files to deploy
const contentFiles = ${JSON.stringify(contentMap.map(item => ({
    path: item.path,
    file: item.file,
    contentType: item.contentType
})), null, 2)};

async function deployContent() {
    console.log('🚀 Deploying prepared WTTP content...');
    
    // Override the file list in the deploy script
    global.WTTP_CONTENT_FILES = contentFiles;
    
    // Run deployment
    await deployContentToWTTP();
}

if (require.main === module) {
    deployContent().catch(console.error);
}

module.exports = { deployContent, contentFiles };
`;
    
    const deployScriptPath = path.join(wttpDir, 'deploy.js');
    fs.writeFileSync(deployScriptPath, deployScript);
    
    console.log(`├── Deploy script: ${deployScriptPath}`);
    
    console.log('\n✅ Content preparation completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy contract: npm run wttp:deploy-contract');
    console.log('2. Deploy content: npm run wttp:deploy-content');
    console.log('3. Test deployment: npm run wttp:test');
    
    return {
        contentMap,
        manifest,
        wttpDir
    };
}

// Run preparation if called directly
if (require.main === module) {
    prepareWTTPContent().catch(console.error);
}

module.exports = { prepareWTTPContent };
