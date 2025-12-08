// services/githubService.js
const axios = require('axios');
const logger = require('../utils/logger');
const { isWithinLastNDays, formatDateForDisplay } = require('../utils/dateHelper');
const constants = require('../config/constants');

// Create axios instance with GitHub API configuration
const githubClient = axios.create({
  baseURL: constants.GITHUB_API_BASE,
  headers: {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Repo-Fetcher-Node',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Parses the GitHub Link header for pagination
 * GitHub returns Link header like: <url?page=2>; rel="next", <url?page=34>; rel="last"
 * @param {string} linkHeader - The Link header value from GitHub response
 * @returns {object} - Object with next, last, first, prev page URLs (or empty if no more pages)
 */
function parseLinkHeader(linkHeader) {
  const links = {};
  if (!linkHeader) return links;

  linkHeader.split(',').forEach((link) => {
    const match = link.match(/<(.+?)>;\s*rel="(.+?)"/);
    if (match) {
      links[match[2]] = match[1];
    }
  });

  return links;
}

/**
 * Fetches repositories for a GitHub user/org with pagination
 * Continues fetching until no more pages or max pages reached
 * @param {string} username - GitHub username or organization name
 * @param {number} perPage - Repos per API call (default 30, max 100)
 * @returns {array} - Array of all fetched repositories (filtered to last 6 months)
 */
async function fetchRepositories(username, perPage = constants.REPOS_PER_PAGE) {
  let allRepos = [];
  let currentPage = 1;
  let hasNextPage = true;

  try {
    logger.info(`Fetching repos for ${username}...`);

    while (hasNextPage && currentPage <= constants.MAX_PAGES) {
      try {
        // Fetch repos page with pagination
        const response = await githubClient.get(`/users/${username}/repos`, {
          params: {
            per_page: perPage,
            page: currentPage,
            sort: 'updated', // GitHub sorts by most recently updated by default
            direction: 'desc',
          },
        });

        const repos = response.data;
        
        if (repos.length === 0) {
          // Empty response means we've reached the end
          hasNextPage = false;
          break;
        }

        logger.debug(`Page ${currentPage}: Fetched ${repos.length} repos`);

        // Transform and filter repos
        const filteredRepos = repos
          .filter((repo) => isWithinLastNDays(repo.updated_at))
          .map((repo) => ({
            name: repo.name,
            url: repo.html_url,
            description: repo.description || 'N/A',
            language: repo.language || 'N/A',
            updated: formatDateForDisplay(repo.updated_at),
            updatedRaw: repo.updated_at, // Keep raw date for sorting
            stars: repo.stargazers_count,
            forks: repo.forks_count,
          }));

        allRepos.push(...filteredRepos);

        // Check Link header for next page
        const linkHeader = response.headers.link;
        const links = parseLinkHeader(linkHeader);

        hasNextPage = !!links.next;
        currentPage++;

        logger.debug(`Link header: ${linkHeader || 'None'}`);

      } catch (pageError) {
        if (pageError.response?.status === 422) {
          // 422 Unprocessable Entity (e.g., org name doesn't exist)
          logger.error(`Invalid username/org: ${username}`);
          throw new Error(`GitHub user/org "${username}" not found or is private.`);
        }
        throw pageError;
      }
    }

    logger.info(`✓ Fetched ${allRepos.length} repos updated in last 6 months`);
    return allRepos;

  } catch (error) {
    logger.error(`GitHub API error: ${error.message}`);
    
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid GitHub token. Please check your .env file.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('GitHub API request timed out. Try again.');
    }
    
    throw error;
  }
}

/**
 * Sorts repositories by the specified criteria
 * @param {array} repos - Array of repository objects
 * @param {string} sortBy - Sort key: 'stars', 'forks', or 'updated'
 * @returns {array} - Sorted array
 */
function sortRepositories(repos, sortBy = constants.DEFAULT_SORT) {
  const validSortOptions = ['stars', 'forks', 'updated'];
  
  if (!validSortOptions.includes(sortBy)) {
    logger.warn(`Invalid sort option: ${sortBy}. Using default.`);
    sortBy = constants.DEFAULT_SORT;
  }

  switch (sortBy) {
    case 'stars':
      // Descending: highest stars first
      return repos.sort((a, b) => b.stars - a.stars);
    
    case 'forks':
      // Descending: most forks first
      return repos.sort((a, b) => b.forks - a.forks);
    
    case 'updated':
      // Descending: most recently updated first
      return repos.sort((a, b) => new Date(b.updatedRaw) - new Date(a.updatedRaw));
    
    default:
      return repos;
  }
}

module.exports = {
  fetchRepositories,
  sortRepositories,
  parseLinkHeader, // Export for testing
};
