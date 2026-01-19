/**
 * Logger utility for consistent logging across the application
 */

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatLog = (level, message, data = {}) => {
  const timestamp = getTimestamp();
  const time = new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  
  // Format for better readability
  const levelColor = {
    INFO: '\x1b[36m',    // Cyan
    ERROR: '\x1b[31m',   // Red
    WARN: '\x1b[33m',    // Yellow
    DEBUG: '\x1b[90m'    // Gray
  };
  const reset = '\x1b[0m';
  
  // Build log message
  let logMessage = `${levelColor[level] || ''}[${level}]${reset} ${time} | ${message}`;
  
  // Add data if present (excluding empty objects)
  const hasData = Object.keys(data).length > 0;
  if (hasData) {
    // Format data nicely
    const dataStr = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      })
      .join(' | ');
    
    if (dataStr) {
      logMessage += ` | ${dataStr}`;
    }
  }
  
  return logMessage;
};

export const logger = {
  info: (message, data = {}) => {
    console.log(formatLog('INFO', message, data));
  },

  error: (message, error = {}, data = {}) => {
    const errorData = {
      ...data,
      ...(error.message && { errorMessage: error.message }),
      ...(error.code && { errorCode: error.code }),
      ...(error.name && { errorName: error.name })
    };
    console.error(formatLog('ERROR', message, errorData));
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack);
    }
  },

  warn: (message, data = {}) => {
    console.warn(formatLog('WARN', message, data));
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('DEBUG', message, data));
    }
  },

  // Request logging helper - cleaner format
  request: (method, path, userId, data = {}) => {
    const cleanPath = path.replace('/api', '');
    const userDisplay = userId !== 'anonymous' ? userId : 'guest';
    logger.info(`→ ${method} ${cleanPath}`, {
      user: userDisplay,
      ...(Object.keys(data.query || {}).length > 0 && { query: JSON.stringify(data.query) }),
      ...(data.bodyKeys?.length > 0 && { bodyFields: data.bodyKeys.join(', ') })
    });
  },

  // Response logging helper - cleaner format
  response: (method, path, userId, statusCode, data = {}) => {
    const cleanPath = path.replace('/api', '');
    const userDisplay = userId !== 'anonymous' ? userId : 'guest';
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✓' : statusCode >= 400 ? '✗' : '→';
    logger.info(`${statusEmoji} ${method} ${cleanPath} ${statusCode}`, {
      user: userDisplay,
      ...(data.responseSize && { size: `${(data.responseSize / 1024).toFixed(2)}KB` }),
      ...(data.streak !== undefined && { streak: data.streak }),
      ...(data.skippedDays !== undefined && { skippedDays: data.skippedDays })
    });
  }
};

export default logger;
