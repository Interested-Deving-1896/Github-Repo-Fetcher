// controllers/repoController.js
const { fetchRepositories, sortRepositories } = require('../services/githubService');
const { generateCsv, sendCsvDownload } = require('../utils/csvGenerator');
const logger = require('../utils/logger');
const constants = require('../config/constants');

/**
 * GET /repos/search
 * Renders the search form page
 */
async function getSearchForm(req, res) {
  try {
    res.render('index', {
      title: 'GitHub Repository Fetcher',
      sortOptions: constants.SORT_OPTIONS,
    });
  } catch (error) {
    logger.error(`Error rendering search form: ${error.message}`);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load search form.',
      statusCode: 500,
    });
  }
}

/**
 * POST /repos/fetch
 * Fetches repos from GitHub and displays filtered results
 * Request body: { username, sortBy }
 */
async function fetchRepos(req, res, next) {
  try {
    const { username, sortBy } = req.body;

    // Validation: username required
    if (!username || username.trim().length === 0) {
      return res.status(400).render('error', {
        title: 'Validation Error',
        message: 'Please enter a GitHub username or organization name.',
        statusCode: 400,
      });
    }

    // Validation: sortBy must be in allowed options
    if (sortBy && !constants.SORT_OPTIONS.includes(sortBy)) {
      return res.status(400).render('error', {
        title: 'Validation Error',
        message: `Invalid sort option. Choose from: ${constants.SORT_OPTIONS.join(', ')}`,
        statusCode: 400,
      });
    }

    logger.info(`Fetching repos for: ${username}, Sort: ${sortBy || 'default'}`);

    // Call GitHub service
    let repos = await fetchRepositories(username.trim());

    // Apply sorting
    const sortOption = sortBy || constants.DEFAULT_SORT;
    repos = sortRepositories(repos, sortOption);

    // Convert repos to Base64 for safe form transmission
    const reposBase64 = Buffer.from(JSON.stringify(repos)).toString('base64');

    // Render results page
    res.render('results', {
      title: 'Search Results',
      username: username.trim(),
      repos,
      reposBase64, // Pass Base64 encoded repos to view
      sortBy: sortOption,
      sortOptions: constants.SORT_OPTIONS,
      repoCount: repos.length,
    });

  } catch (error) {
    logger.error(`Error fetching repos: ${error.message}`);

    // Pass error to global error handler
    next(error);
  }
}

/**
 * POST /repos/download-csv
 * Generates and downloads filtered repos as CSV
 * Request body: { username, sortBy, repos (Base64 encoded) }
 */
async function downloadCsv(req, res, next) {
  try {
    const { username, sortBy, repos: reposBase64 } = req.body;

    // Validation
    if (!username || !reposBase64) {
      return res.status(400).json({
        error: 'Missing required fields: username, repos',
      });
    }

    let repos;
    try {
      // Decode Base64 back to JSON string, then parse
      const reposJson = Buffer.from(reposBase64, 'base64').toString('utf-8');
      repos = JSON.parse(reposJson);
    } catch (decodeError) {
      logger.error(`Base64 decode/parse error: ${decodeError.message}`);
      return res.status(400).json({ error: 'Invalid repos data.' });
    }

    if (!Array.isArray(repos) || repos.length === 0) {
      return res.status(400).json({
        error: 'No repositories to download.',
      });
    }

    logger.info(`Generating CSV for ${username} (${repos.length} repos)...`);

    // Generate CSV content
    const csvContent = generateCsv(repos);

    // Send CSV as attachment for download
    sendCsvDownload(res, csvContent, username);

    logger.info(`✓ CSV downloaded for ${username}`);

  } catch (error) {
    logger.error(`Error downloading CSV: ${error.message}`);
    next(error);
  }
}

module.exports = {
  getSearchForm,
  fetchRepos,
  downloadCsv,
};
