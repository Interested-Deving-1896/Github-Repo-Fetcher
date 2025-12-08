// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    // Add timestamp to logs
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Add colors for console output (for readability)
    winston.format.colorize(),
    // Format as "2024-01-15 10:30:45 [INFO] Message here"
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [
    // Console output (stdout/stderr)
    new winston.transports.Console(),
    
    // File output for errors (logs/error.log)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB max file size
      maxFiles: 5,      // Keep last 5 error log files
    }),
    
    // File output for all logs (logs/combined.log)
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// If not in production, also log unhandled rejections
if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logger initialized in development mode');
}

module.exports = logger;
