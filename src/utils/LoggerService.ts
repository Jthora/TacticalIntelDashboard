/**
 * Centralized logging utility for the Intel Command Console
 * Provides structured logging with different levels and optional console output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private logLevel: LogLevel = LogLevel.INFO;
  private enableConsoleOutput = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

  static getInstance(): LoggerService {
    if (!this.instance) {
      this.instance = new LoggerService();
    }
    return this.instance;
  }

  private constructor() {
    // Initialize logger - safe access to environment variables
    const logLevel = typeof process !== 'undefined' && process.env 
      ? process.env.VITE_LOG_LEVEL || 'INFO'
      : 'INFO';
    this.logLevel = this.parseLogLevel(logLevel);
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toUpperCase()) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      case 'CRITICAL': return LogLevel.CRITICAL;
      default: return LogLevel.INFO;
    }
  }

  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
    if (level < this.logLevel) return;

    const entryBase = {
      timestamp: new Date(),
      level,
      category,
      message,
      data
    } as const;

    const entry: LogEntry = error?.stack
      ? { ...entryBase, stack: error.stack }
      : { ...entryBase };

    // Add to internal log store
    this.logs.push(entry);
    
    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (this.enableConsoleOutput) {
      const levelName = LogLevel[level];
      const timestamp = entry.timestamp.toISOString();
      const prefix = `[${timestamp}] ${levelName} [${category}]`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(prefix, message, data, error);
          break;
      }
    }
  }

  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any, error?: Error): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  critical(category: string, message: string, data?: any, error?: Error): void {
    this.log(LogLevel.CRITICAL, category, message, data, error);
  }

  // Get logs for debugging or export
  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) return [...this.logs];
    return this.logs.filter(log => log.level >= level);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Enable/disable console output
  setConsoleOutput(enabled: boolean): void {
    this.enableConsoleOutput = enabled;
  }
}

// Export singleton instance
export const logger = LoggerService.getInstance();

// Export convenience methods
export const log = {
  debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
  info: (category: string, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: string, message: string, data?: any, error?: Error) => logger.error(category, message, data, error),
  critical: (category: string, message: string, data?: any, error?: Error) => logger.critical(category, message, data, error)
};

export default LoggerService;
