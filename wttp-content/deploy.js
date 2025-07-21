#!/usr/bin/env node
// Auto-generated WTTP deployment script
const { deployContentToWTTP } = require('./scripts/wttp-deploy-content.js');

// Content files to deploy
const contentFiles = [
  {
    "path": "/app-icon-192.png",
    "file": "wttp-content/app-icon-192.png",
    "contentType": "image/png; charset=utf-8"
  },
  {
    "path": "/app-icon.png",
    "file": "wttp-content/app-icon.png",
    "contentType": "image/png; charset=utf-8"
  },
  {
    "path": "/assets/Aldrich-Regular-BJ2Af9cL.ttf",
    "file": "wttp-content/assets/Aldrich-Regular-BJ2Af9cL.ttf",
    "contentType": "font/ttf; charset=utf-8"
  },
  {
    "path": "/assets/WingCommanderLogo-288x162-Dr7UFZxN.gif",
    "file": "wttp-content/assets/WingCommanderLogo-288x162-Dr7UFZxN.gif",
    "contentType": "image/gif; charset=utf-8"
  },
  {
    "path": "/assets/crypto--8Ipcbip.js",
    "file": "wttp-content/assets/crypto--8Ipcbip.js",
    "contentType": "text/javascript; charset=utf-8"
  },
  {
    "path": "/assets/index-B0r42Cow.css",
    "file": "wttp-content/assets/index-B0r42Cow.css",
    "contentType": "text/css; charset=utf-8"
  },
  {
    "path": "/assets/index-DJGz9D2C.js",
    "file": "wttp-content/assets/index-DJGz9D2C.js",
    "contentType": "text/javascript; charset=utf-8"
  },
  {
    "path": "/assets/router-mubfmCo3.js",
    "file": "wttp-content/assets/router-mubfmCo3.js",
    "contentType": "text/javascript; charset=utf-8"
  },
  {
    "path": "/assets/ui-l0sNRNKZ.js",
    "file": "wttp-content/assets/ui-l0sNRNKZ.js",
    "contentType": "text/javascript; charset=utf-8"
  },
  {
    "path": "/assets/vendor-CWc6w16D.js",
    "file": "wttp-content/assets/vendor-CWc6w16D.js",
    "contentType": "text/javascript; charset=utf-8"
  },
  {
    "path": "/favicon.ico",
    "file": "wttp-content/favicon.ico",
    "contentType": "image/x-icon; charset=utf-8"
  },
  {
    "path": "/favicon.png",
    "file": "wttp-content/favicon.png",
    "contentType": "image/png; charset=utf-8"
  },
  {
    "path": "/index.html",
    "file": "wttp-content/index.html",
    "contentType": "text/html; charset=utf-8"
  },
  {
    "path": "/manifest.json",
    "file": "wttp-content/manifest.json",
    "contentType": "application/json; charset=utf-8"
  },
  {
    "path": "/vite.svg",
    "file": "wttp-content/vite.svg",
    "contentType": "image/svg+xml; charset=utf-8"
  },
  {
    "path": "/favicon.ico",
    "file": "wttp-content/favicon.ico",
    "contentType": "image/x-icon; charset=utf-8"
  },
  {
    "path": "/manifest.json",
    "file": "wttp-content/manifest.json",
    "contentType": "application/json; charset=utf-8"
  }
];

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
