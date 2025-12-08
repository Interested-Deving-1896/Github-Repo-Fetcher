// middleware/errorHandler.js
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Must be registered LAST in app.js to catch all errors
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {Function} next - Express next() (not used, but required by Express)
 */
function errorHandler(err, req, res, next) {
  // Log error details (don't expose sensitive info to user)
  logger.error(`Unhandled error: ${err.message}`);
  logger.debug(`Stack: ${err.stack}`);

  // Determine status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred.';

  // Don't expose internal details to users
  if (statusCode === 500) {
    message = 'Something went wrong. Please try again later.';
  }

  // Render error page
  res.status(statusCode).render('error', {
    title: `Error ${statusCode}`,
    message,
    statusCode,
  });
}

module.exports = errorHandler;
