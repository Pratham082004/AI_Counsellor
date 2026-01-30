/**
 * Logger utility for consistent logging across the application
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message), data);
    }
  }

  info(message: string, data?: any): void {
    console.info(this.formatMessage(LogLevel.INFO, message), data);
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message), data);
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message), error);
  }
}

export const logger = new Logger();
