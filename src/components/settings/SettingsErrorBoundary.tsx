import { Component, ErrorInfo, ReactNode } from 'react';
import SettingsError from './SettingsError';

interface SettingsErrorBoundaryProps {
  children: ReactNode;
}

interface SettingsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * SettingsErrorBoundary - Catches runtime errors in settings components
 * and displays a meaningful error screen instead of crashing the entire app
 */
class SettingsErrorBoundary extends Component<SettingsErrorBoundaryProps, SettingsErrorBoundaryState> {
  constructor(props: SettingsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): SettingsErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error information for debugging
    console.error('Settings component error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      const componentStack = this.state.errorInfo?.componentStack || '';
      
      return (
        <SettingsError 
          message="Settings Component Error"
          details={errorMessage}
          code={componentStack}
        />
      );
    }

    return this.props.children;
  }
}

export default SettingsErrorBoundary;
