# 🔧 Setup Guide - Development Environment

## 📋 **Overview**

This guide provides step-by-step instructions for setting up a development environment for the Tactical Intel Dashboard. The setup process is designed to be straightforward and supports multiple operating systems and development preferences.

## 🎯 **Prerequisites**

### **System Requirements**
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space for development environment
- **Network**: Broadband internet connection

### **Required Software**

#### **Node.js & Package Manager**
```bash
# Install Node.js 20.x or higher
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should be v20.0.0 or higher
npm --version   # Should be 10.0.0 or higher

# Optional: Use yarn instead of npm
npm install -g yarn
```

#### **Git Version Control**
```bash
# Install Git
# Download from: https://git-scm.com/

# Verify installation
git --version

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### **Code Editor** (Recommended)
- **Visual Studio Code**: Enhanced with extensions
- **WebStorm**: JetBrains IDE with built-in tools
- **Vim/Neovim**: For terminal-based development

---

## 🚀 **Quick Start Setup**

### **1. Clone the Repository**
```bash
# Clone the repository
git clone https://github.com/Jthora/TacticalIntelDashboard.git

# Navigate to the project directory
cd TacticalIntelDashboard/IntelCommandConsole

# Verify project structure
ls -la
```

### **2. Install Dependencies**
```bash
# Install project dependencies
npm install

# Or using yarn
yarn install

# Verify installation
npm list --depth=0
```

### **3. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# Use your preferred editor to modify .env
```

**Environment Variables**:
```bash
# .env file
VITE_PROXY_URL=/api/proxy-feed?url=
VITE_APP_TITLE=Tactical Intel Dashboard
VITE_APP_VERSION=2.0.0
VITE_DEBUG_MODE=true

# Optional: Custom configurations
VITE_AUTO_REFRESH_INTERVAL=300000  # 5 minutes
VITE_MAX_FEED_ITEMS=100
VITE_THEME=tactical-dark
```

### **4. Start Development Server**
```bash
# Start the development server
npm run dev

# Or using yarn
yarn dev

# Server will start at http://localhost:5173
```

### **5. Verify Installation**
Open your browser and navigate to `http://localhost:5173`. You should see the Tactical Intel Dashboard with the Wing Commander theme.

---

## 🛠️ **Development Tools Setup**

### **Visual Studio Code Extensions**

**Essential Extensions**:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-react-typescript"
  ]
}
```

**Install Extensions**:
```bash
# Install recommended extensions
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-vscode.vscode-react-typescript
```

**VS Code Settings**:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

### **Browser Development Tools**

**Recommended Browser Extensions**:
- **React Developer Tools**: Debug React components
- **Redux DevTools**: State management debugging
- **Lighthouse**: Performance auditing
- **Web Vitals**: Core Web Vitals monitoring

**Chrome Extensions**:
```bash
# React Developer Tools
# https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi

# Redux DevTools
# https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
```

---

## 📦 **Project Structure Deep Dive**

### **File Organization**
```
IntelCommandConsole/
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   └── favicon.ico           # Application icon
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── Header.tsx
│   │   ├── FeedVisualizer.tsx
│   │   └── ...
│   ├── pages/               # Route components
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript definitions
│   ├── constants/           # Static data
│   └── assets/              # Images, styles
├── api/                     # Vercel Edge Functions
│   └── proxy-feed.ts        # CORS proxy
├── docs/                    # Documentation
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── vercel.json              # Deployment configuration
```

### **Key Configuration Files**

#### **package.json**
```json
{
  "name": "intelcommandconsole",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

#### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### **vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

---

## 🧪 **Testing Setup**

### **Testing Framework Installation**
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @types/jest jest-environment-jsdom

# Install additional testing utilities
npm install --save-dev @testing-library/user-event msw
```

### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};
```

### **Test Setup File**
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 🔧 **Build & Deployment Setup**

### **Local Build Process**
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Build verification
ls -la dist/
```

### **Vercel CLI Setup**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### **Environment Variables for Deployment**
```bash
# Set production environment variables
vercel env add VITE_PROXY_URL production
vercel env add VITE_APP_TITLE production
vercel env add VITE_APP_VERSION production
```

---

## 🐛 **Debugging Setup**

### **Browser Debugging**
```typescript
// Add debugging utilities
const DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true';

export const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

### **React Developer Tools**
```typescript
// Enable React debugging
if (DEBUG) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
}
```

### **Network Debugging**
```typescript
// CORS proxy debugging
const PROXY_DEBUG = DEBUG;

export const debugProxyRequest = (url: string, method: string) => {
  if (PROXY_DEBUG) {
    console.log(`[PROXY] ${method} ${url}`);
  }
};
```

---

## 📋 **Development Workflow**

### **Daily Development Process**
1. **Pull Latest Changes**: `git pull origin main`
2. **Install Dependencies**: `npm install` (if package.json changed)
3. **Start Dev Server**: `npm run dev`
4. **Make Changes**: Edit code with live reload
5. **Test Changes**: Run tests with `npm test`
6. **Commit Changes**: `git commit -m "feat: description"`
7. **Push Changes**: `git push origin feature-branch`

### **Code Quality Checks**
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run all quality checks
npm run quality-check
```

### **Git Hooks Setup**
```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Node Version Mismatch**
```bash
# Check Node version
node --version

# Install correct version using nvm
nvm install 20
nvm use 20
```

#### **Port Already in Use**
```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 5174
```

#### **Module Resolution Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**
```bash
# Restart TypeScript service
# In VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Check TypeScript version
npx tsc --version
```

### **Performance Issues**
```bash
# Analyze bundle size
npm run build
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

---

## 🎯 **Next Steps**

After completing the setup:

1. **Explore the Code**: Familiarize yourself with the component structure
2. **Run Tests**: Execute the test suite to verify everything works
3. **Make a Small Change**: Edit a component and see live reload in action
4. **Read Documentation**: Review the [Architecture Guide](../architecture/)
5. **Join Development**: Check the [Roadmap](../roadmap/) for contribution opportunities

---

## 📞 **Getting Help**

If you encounter issues during setup:

1. **Check Documentation**: Review this guide and related docs
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Ask for Help**: Create a new issue with detailed error information
4. **Join Community**: Participate in development discussions

---

*This setup guide ensures you have a robust development environment for contributing to the Tactical Intel Dashboard. The configuration prioritizes developer experience while maintaining code quality and consistency.*
