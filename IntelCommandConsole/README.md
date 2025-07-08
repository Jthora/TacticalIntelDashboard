# Intel Command Console

A sophisticated tactical intelligence dashboard built with React, TypeScript, and Vite. This application provides real-time intelligence feeds, system monitoring, health diagnostics, and comprehensive data export capabilities in a military-grade command console interface.

## 🚀 Features

### Core Intelligence Dashboard
- **Real-time Intelligence Feeds**: Dynamic feed visualization with filtering and metadata enrichment
- **System Control Panel**: Comprehensive system monitoring with theme switching and settings management
- **Health Diagnostics**: Advanced system health monitoring with automated diagnostics and repair functions
- **Export Capabilities**: Multi-format data export with encryption, compression, and metadata support

### Advanced Filter System
- **Centralized Filter State**: Unified filter management across all dashboard components
- **Metadata Enrichment**: Automatic enhancement of feed data with source metadata
- **Persistent Settings**: Filter preferences saved across sessions
- **Real-time Updates**: Live filtering with instant visual feedback

### System Health & Diagnostics
- **Health Monitoring**: Real-time system health tracking with visual indicators
- **Auto-Recovery**: Intelligent error handling and recovery mechanisms
- **Diagnostic Tools**: Built-in troubleshooting and system analysis tools
- **Performance Metrics**: Comprehensive performance tracking and optimization

## 🏗️ Project Structure

The project has been organized into a clean, maintainable structure:

```
IntelCommandConsole/
├── 📁 src/                   # Source code
├── 📁 docs/                  # Documentation (organized)
│   ├── 📁 cors-solution/     # CORS documentation
│   ├── 📁 deployment/        # Deployment documentation
│   └── 📁 testing/           # Testing documentation
├── 📁 deployment/            # Deployment files & configs
├── 📁 tools/                 # Development & testing tools
│   ├── 📁 testing/           # Testing utilities
│   └── 📁 deployment/        # Deployment tools
├── 📁 scripts/               # Build & utility scripts
├── 📁 public/                # Static assets
└── 📄 PROJECT_STRUCTURE.md   # Detailed structure documentation
```

For a comprehensive overview of the project structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## 🛡️ CORS Solution

This project implements a robust, multi-layered solution for fetching RSS feeds without CORS issues:

1. **Primary Approach**: RSS2JSON APIs (83% success rate)
2. **Fallback System**: CORS Proxies (when APIs fail)
3. **Offline Support**: Local cache system
4. **Development**: Mock data fallback

For detailed information on our CORS solution, see [docs/cors-solution/CORS_SOLUTION_COMPLETE.md](./docs/cors-solution/CORS_SOLUTION_COMPLETE.md).

## 🚀 Deployment

The dashboard is ready for deployment with multiple options:

- **Static Hosting**: Vercel, Netlify, GitHub Pages
- **Container**: Docker deployment ready
- **Edge Functions**: Cloudflare Workers, Netlify Edge, AWS Lambda@Edge

See [docs/deployment/DEPLOYMENT_READY.md](./docs/deployment/DEPLOYMENT_READY.md) for deployment instructions.
## 📊 Performance Metrics

- **RSS Feed Success Rate**: 83% (6/7 feeds operational)
- **Primary API Success**: 83% (rss2json.vercel.app)
- **Total Intelligence Items**: 148 live news items
- **Bundle Size**: 98.83 kB gzipped
- **Load Time**: <3 seconds with live data

## 🧪 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run tests
npm test

# Test feed parsing
tools/testing/test-feed-parsing.sh

# Test proxy fallback
node tools/testing/test-proxy-fallback.js
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **CORS Solution**: `docs/cors-solution/`
- **Deployment**: `docs/deployment/`
- **Testing Reports**: `docs/testing/`
- **Project Structure**: `PROJECT_STRUCTURE.md`
- **Cleanup Summary**: `CLEANUP_SUMMARY.md`

## 🔮 Future Enhancements

1. **API Key Integration**: Paid RSS2JSON tier for higher limits
2. **Custom Proxy Deployment**: Cloudflare Worker for 100% control
3. **Feed Validation**: RSS feed health checking
4. **Advanced Caching**: Improved offline capability

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### Core Technologies
- **React 18.3**: Modern React with concurrent features
- **TypeScript**: Full type safety and enhanced development experience
- **Vite**: Fast build tool with hot module replacement
- **ESLint**: Code quality and consistency enforcement

### State Management
- **Context API**: Centralized state management for filters, themes, and health
- **Custom Hooks**: Reusable logic for common operations
- **Performance Optimization**: Memoization and lazy loading strategies

### Services Layer
- **FilterService**: Centralized filter state management
- **DiagnosticService**: System health monitoring and diagnostics
- **ExportService**: Multi-format data export with encryption
- **SettingsService**: User preferences and configuration management
- **FeedService**: Intelligence feed data processing

### Security Features
- **Data Encryption**: AES-256 encryption for sensitive exports
- **Safe DOM Manipulation**: Secure data attribute handling
- **Input Validation**: Comprehensive input sanitization
- **Memory Management**: Optimized memory usage and garbage collection

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd IntelCommandConsole

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── TacticalFilters.tsx
│   ├── FeedVisualizer.tsx
│   ├── SystemControl.tsx
│   ├── Health.tsx
│   └── ExportPanel.tsx
├── contexts/           # React contexts
│   ├── FilterContext.tsx
│   ├── ThemeContext.tsx
│   └── HealthContext.tsx
├── services/           # Business logic services
│   ├── FilterService.ts
│   ├── DiagnosticService.ts
│   ├── ExportService.ts
│   └── SettingsService.ts
├── utils/             # Utility functions
│   └── performanceUtils.ts
├── assets/            # Static assets
│   └── styles/        # CSS modules
└── docs/              # Documentation
    └── implementation/ # Implementation guides
```

## 🔧 Configuration

### Environment Variables
```env
# Add to .env file
VITE_APP_TITLE=Intel Command Console
VITE_API_ENDPOINT=https://api.example.com
VITE_ENCRYPTION_KEY=your-encryption-key
```

### Theme Configuration
Themes can be configured in `src/contexts/ThemeContext.tsx`:
- **tactical**: Military-grade dark interface
- **console**: Classic command console styling
- **light**: Light mode for day operations

## 🎯 Usage

### Filter System
```typescript
// Access filter context
const { filters, updateFilter, clearFilters } = useFilterContext();

// Apply filters
updateFilter('source', 'satellite');
updateFilter('priority', 'high');
```

### Health Monitoring
```typescript
// Access health context
const { health, runDiagnostic } = useHealthContext();

// Run diagnostics
await runDiagnostic('system-scan');
```

### Data Export
```typescript
// Export data with options
const exportOptions = {
  format: 'pdf',
  encryption: true,
  compression: true,
  metadata: true
};

await exportService.exportData(data, exportOptions);
```

## 📈 Performance Optimizations

### React Optimizations
- **Memoization**: React.memo for expensive components
- **Callback Optimization**: useCallback for event handlers
- **Lazy Loading**: Dynamic imports for code splitting

### Bundle Optimizations
- **Tree Shaking**: Dead code elimination
- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Compressed images and fonts

### Memory Management
- **Cleanup**: Proper cleanup of event listeners and timers
- **Weak References**: Efficient memory usage patterns
- **Garbage Collection**: Optimized object lifecycle management

## 🔒 Security Considerations

### Data Protection
- **Encryption**: AES-256 encryption for sensitive data
- **Sanitization**: Input validation and sanitization
- **Access Control**: Role-based access patterns

### Best Practices
- **CSP Headers**: Content Security Policy implementation
- **HTTPS Only**: Secure communication protocols
- **Data Minimization**: Only collect necessary data

## 📊 Monitoring & Analytics

### Health Metrics
- **System Performance**: CPU, memory, and network usage
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage patterns and performance metrics

### Diagnostics
- **Automated Scans**: Regular system health checks
- **Performance Monitoring**: Real-time performance tracking
- **Alert System**: Proactive issue detection

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Testing**: Unit tests for all new features
- **Documentation**: Clear documentation for all changes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./docs/)
- Review [implementation guides](./docs/implementation/)
- Submit issues on GitHub

## 🚀 Roadmap

### Phase 2 Features
- **Real-time Collaboration**: Multi-user dashboard sharing
- **Advanced Analytics**: Machine learning-powered insights
- **Mobile Application**: Native mobile companion app
- **Cloud Integration**: Cloud-based data synchronization

### Performance Enhancements
- **WebWorkers**: Background processing for heavy operations
- **Caching**: Advanced caching strategies
- **Offline Support**: Progressive Web App capabilities

---

Built with ⚡ by the Intel Command Console team
