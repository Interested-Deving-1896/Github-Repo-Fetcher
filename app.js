// app.js
const express = require('express');
const path = require('path');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const repoRoutes = require('./routes/repoRoutes');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// --- Middleware Setup ---

// 1. Serve static files (CSS, JS, images) from public folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. Configure EJS and layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Parse incoming JSON and form-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request logging middleware: log every incoming request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// --- Routes ---

// Mount repo routes at /repos prefix
app.use('/repos', repoRoutes);

// Home route: render the search form
app.get('/', (req, res) => {
  res.render('index', { title: 'GitHub Repository Fetcher' });
});

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404,
  });
});

// --- Error Handler (must be last middleware) ---
app.use(errorHandler);

module.exports = app;
