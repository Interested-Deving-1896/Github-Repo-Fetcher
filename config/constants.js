// config/constants.js

module.exports = {
  // GitHub API endpoints
  GITHUB_API_BASE: process.env.GITHUB_API_URL || 'https://api.github.com',
  
  // Rate limiting (per minute)
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
  
  // 6-month filter (in days)
  FILTER_DAYS: 180,
  
  // Pagination
  REPOS_PER_PAGE: 30,
  MAX_PAGES: 33, // GitHub max per_page is 100, but to avoid excessive API calls, limit to ~1000 repos
  
  // Sorting options
  SORT_OPTIONS: ['stars', 'forks', 'updated'],
  DEFAULT_SORT: 'updated', // Default sort by updated date
  
  // CSV output
  CSV_HEADERS: ['Name', 'URL', 'Description', 'Language', 'Last Updated', 'Stars', 'Forks'],
  CSV_OUTPUT_DIR: process.env.CSV_OUTPUT_DIR || './downloads',
  
  // Logging levels
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
};
