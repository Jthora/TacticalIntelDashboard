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
- **Diagnostic Actions**: Automated scan, clean, and repair operations
- **Performance Metrics**: System performance monitoring and optimization
- **Alert System**: Proactive alerts for system anomalies

### Export & Data Management
- **Multiple Formats**: Support for JSON, XML, PDF, and CSV exports
- **Encryption**: AES-256 encryption for sensitive data exports
- **Compression**: ZIP compression for large datasets
- **Metadata**: Rich metadata embedding in all export formats
- **Async Operations**: Non-blocking export operations with progress tracking

### Theme & Settings
- **Theme Management**: Dynamic theme switching with tactical/console themes
- **Settings Persistence**: User preferences saved locally
- **Responsive Design**: Optimized for various screen sizes
- **Accessibility**: WCAG-compliant design patterns

## 🛠️ Technical Architecture

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
