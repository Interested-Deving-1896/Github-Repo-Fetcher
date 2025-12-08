// server.js
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`✓ Server running on http://localhost:${PORT}`);
  logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown: close server & log cleanup
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
