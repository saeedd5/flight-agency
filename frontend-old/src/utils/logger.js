/**
 * Logger utility with environment-aware logging
 * Only logs in development mode
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // Always log errors (even in production for debugging)
    console.error(...args);
    
    // In production, you might want to send errors to a monitoring service
    // Example: Sentry.captureException(args[0]);
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  table: (data) => {
    if (isDevelopment && console.table) {
      console.table(data);
    }
  }
};

export default logger;
