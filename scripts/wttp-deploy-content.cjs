#!/usr/bin/env node

const { wttp } = require('wttp-handler');
const { Wallet } = require('ethers');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Deploy content to WTTP site
 * This script uploads the built site files to the deployed WTTP contract
 */
async function deployContentToWTTP() {
    console.log('🚀 Starting WTTP Content Deployment...');
    
    // Check required environment variables
    const siteAddress = process.env.WTTP_SITE_ADDRESS;
    const privateKey = process.env.WTTP_PRIVATE_KEY || process.env.PRIVATE_KEY;
    
    if (!siteAddress) {
        console.error('❌ WTTP_SITE_ADDRESS not set in environment variables');
        console.log('💡 Deploy the contract first: npm run wttp:deploy-contract');
        process.exit(1);
    }
    
    if (!privateKey) {
        console.error('❌ WTTP_PRIVATE_KEY not set in environment variables');
        console.log('💡 Add your private key to .env file');
        process.exit(1);
    }
    
    // Create signer
    const signer = new Wallet(privateKey);
    
    console.log('📝 Deployment Configuration:');
    console.log('├── Site Address:', siteAddress);
    console.log('├── Signer Address:', signer.address);
    console.log('├── Build Directory:', path.resolve('./dist'));
    
    // Define files to upload - use prepared content if available
    let filesToUpload;
    
    if (global.WTTP_CONTENT_FILES) {
        // Use prepared content files
        filesToUpload = global.WTTP_CONTENT_FILES;
        console.log('📦 Using prepared WTTP content files');
    } else {
        // Use default file list
        filesToUpload = [
            { path: '/index.html', file: './dist/index.html', contentType: 'text/html; charset=utf-8' },
            { path: '/assets/index.css', file: './dist/assets/index.css', contentType: 'text/css; charset=utf-8' },
            { path: '/assets/index.js', file: './dist/assets/index.js', contentType: 'text/javascript; charset=utf-8' },
            { path: '/favicon.ico', file: './public/favicon.ico', contentType: 'image/x-icon' },
            { path: '/robots.txt', file: './public/robots.txt', contentType: 'text/plain; charset=utf-8' }
        ];
        
        // Try to find actual asset files in dist directory
        const fs = require('fs');
        const path = require('path');
        
        if (fs.existsSync('./dist/assets')) {
            const assetFiles = fs.readdirSync('./dist/assets');
            filesToUpload = [
                { path: '/index.html', file: './dist/index.html', contentType: 'text/html; charset=utf-8' }
            ];
            
            // Add actual asset files
            assetFiles.forEach(file => {
                const ext = path.extname(file);
                let contentType = 'application/octet-stream';
                
                if (ext === '.css') contentType = 'text/css; charset=utf-8';
                else if (ext === '.js') contentType = 'text/javascript; charset=utf-8';
                else if (ext === '.map') contentType = 'application/json; charset=utf-8';
                
                filesToUpload.push({
                    path: `/assets/${file}`,
                    file: `./dist/assets/${file}`,
                    contentType: contentType
                });
            });
            
            // Add public files
            const publicFiles = ['favicon.ico', 'robots.txt', 'manifest.json'];
            publicFiles.forEach(file => {
                if (fs.existsSync(`./public/${file}`)) {
                    let contentType = 'text/plain; charset=utf-8';
                    if (file.endsWith('.ico')) contentType = 'image/x-icon';
                    else if (file.endsWith('.json')) contentType = 'application/json; charset=utf-8';
                    
                    filesToUpload.push({
                        path: `/${file}`,
                        file: `./public/${file}`,
                        contentType: contentType
                    });
                }
            });
        }
    }
    
    // Check if build exists
    if (!fs.existsSync('./dist/index.html')) {
        console.error('❌ Build files not found. Run build first:');
        console.log('   npm run build');
        process.exit(1);
    }
    
    console.log('\n📂 Files to upload:');
    filesToUpload.forEach(({ path: urlPath, file }) => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            console.log(`├── ${urlPath} (${(stats.size / 1024).toFixed(2)} KB)`);
        } else {
            console.log(`├── ${urlPath} ⚠️  (file not found: ${file})`);
        }
    });
    
    let uploadedCount = 0;
    let totalSize = 0;
    
    try {
        console.log('\n🔄 Starting file uploads...');
        
        for (const { path: urlPath, file, contentType } of filesToUpload) {
            if (!fs.existsSync(file)) {
                console.log(`⏭️  Skipping ${urlPath} (file not found)`);
                continue;
            }
            
            const content = fs.readFileSync(file);
            const sizeKB = (content.length / 1024).toFixed(2);
            
            console.log(`\n📤 Uploading ${urlPath} (${sizeKB} KB)...`);
            
            try {
                const response = await wttp.fetch(`wttp://${siteAddress}${urlPath}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": contentType,
                        "Content-Location": "datapoint/chunk",
                        "Publisher": signer.address
                    },
                    body: content,
                    signer: signer
                });
                
                if (response.status === 201 || response.status === 200) {
                    console.log(`✅ Successfully uploaded ${urlPath}`);
                    uploadedCount++;
                    totalSize += content.length;
                } else {
                    console.log(`❌ Failed to upload ${urlPath}: HTTP ${response.status}`);
                }
                
                // Add delay between uploads to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (uploadError) {
                console.error(`❌ Error uploading ${urlPath}:`, uploadError.message);
            }
        }
        
        console.log('\n📊 Upload Summary:');
        console.log(`├── Files uploaded: ${uploadedCount}/${filesToUpload.length}`);
        console.log(`├── Total size: ${(totalSize / 1024).toFixed(2)} KB`);
        console.log(`├── Site URL: wttp://${siteAddress}/`);
        
        if (uploadedCount > 0) {
            console.log('\n🎉 Content deployment completed successfully!');
            console.log('\n🌐 Access your site:');
            console.log(`   WTTP URL: wttp://${siteAddress}/`);
            console.log('\n🔧 Test deployment:');
            console.log('   npm run wttp:test');
        } else {
            console.log('\n❌ No files were uploaded successfully');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    }
}

// Run deployment if called directly
if (require.main === module) {
    deployContentToWTTP().catch(console.error);
}

module.exports = { deployContentToWTTP };
