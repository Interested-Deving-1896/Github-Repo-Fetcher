// utils/csvGenerator.js
const { getTimestamp } = require('./dateHelper');
const logger = require('./logger');
const constants = require('../config/constants');

/**
 * Escapes CSV field (handles commas, quotes, newlines)
 * @param {string} field - Raw field value
 * @returns {string} - CSV-safe field (quoted if necessary)
 */
function escapeCSVField(field) {
  if (field === null || field === undefined) {
    return '';
  }

  field = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

/**
 * Generates CSV content from repository array
 * @param {array} repos - Array of repository objects
 * @returns {string} - CSV formatted string
 */
function generateCsv(repos) {
  try {
    // CSV header row
    const headers = constants.CSV_HEADERS;
    const headerRow = headers.map(escapeCSVField).join(',');

    // CSV data rows
    const dataRows = repos.map((repo) => {
      return [
        repo.name,
        repo.url,
        repo.description,
        repo.language,
        repo.updated,
        repo.stars,
        repo.forks,
      ]
        .map(escapeCSVField)
        .join(',');
    });

    // Combine header + data
    const csvContent = [headerRow, ...dataRows].join('\n');

    logger.debug(`Generated CSV with ${repos.length} rows`);
    return csvContent;

  } catch (error) {
    logger.error(`Error generating CSV: ${error.message}`);
    throw error;
  }
}

/**
 * Sends CSV as downloadable file attachment
 * @param {object} res - Express response object
 * @param {string} csvContent - CSV content string
 * @param {string} username - GitHub username (for filename)
 */
function sendCsvDownload(res, csvContent, username) {
  try {
    const timestamp = getTimestamp();
    const filename = `${username}_filtered_repos_${timestamp}.csv`;

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send CSV content
    res.send(csvContent);

    logger.info(`CSV file sent: ${filename}`);

  } catch (error) {
    logger.error(`Error sending CSV download: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateCsv,
  sendCsvDownload,
  escapeCSVField,
};
