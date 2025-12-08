// routes/repoRoutes.js
const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

/**
 * GET /repos/search
 * Display the search form page
 */
router.get('/search', repoController.getSearchForm);

/**
 * POST /repos/fetch
 * Fetch repos from GitHub, filter, sort, and display results
 * Expects: username (required), sortBy (optional)
 */
router.post('/fetch', repoController.fetchRepos);

/**
 * POST /repos/download-csv
 * Generate and download filtered repos as timestamped CSV file
 * Expects: username, sortBy, repos (stringified JSON array)
 */
router.post('/download-csv', repoController.downloadCsv);

module.exports = router;
