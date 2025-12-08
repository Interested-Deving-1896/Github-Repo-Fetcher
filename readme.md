# GitHub Repo Fetcher

A sleek, responsive Node.js + Express app that fetches public GitHub repositories for a given username or organization, filters repositories updated within the last 6 months, allows sorting (stars, forks, recently updated), and exports results to CSV.

**Demo:** (run locally — quick steps below)

**Tech stack:** Node.js, Express, EJS, Bootstrap 5, Axios, Winston

**Highlights:**
- Fast search UI with validation and loading states
- Beautiful responsive layout using Bootstrap and custom CSS
- CSV export of filtered repositories
- Clean code separation: routes, controllers, services, utils


## Quick Start

Requirements:
- Node.js 18+ and npm

Clone and install:

```bash
git clone <your-repo-url>
cd github-repo-fetcher
npm install
```

Run:

```bash
# Development (auto-restart)
npm run dev

# Production / plain start
npm start
```

Then open `http://localhost:3000` (or the port defined in your `PORT` env var).

## Environment

Create a `.env` file in the project root to set optional environment variables:

```
# .env example
PORT=3000
# Optional: GitHub personal access token to increase rate limits
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXX
NODE_ENV=development
```

If you provide `GITHUB_TOKEN` the GitHub API calls will use it (check `services/githubService.js`).

## Project Structure

- `app.js` — Express app configuration, middleware, routes
- `server.js` — starts the HTTP server (use this to run the app)
- `routes/` — route definitions
- `controllers/` — request handlers and rendering
- `services/` — GitHub API calls and business logic
- `utils/` — CSV generation, logging, helpers
- `views/` — EJS templates and layout
- `public/` — static assets (CSS/JS)

## Why your CSS/Bootstrap might not have been applied (common causes)

1. App started with the wrong entry script — ensure you run `server.js` (this repo uses `server.js` to `listen()`).
	- Use `npm start` (runs `node server.js`) or `npm run dev`.
2. Static middleware must be registered before your routes — this app uses `app.use(express.static(path.join(__dirname, 'public')))` in `app.js`.
3. Links in the layout: `views/layouts/main.ejs` already includes Bootstrap CDN and local CSS via `/css/style.css` and local JS via `/js/client.js` — when the server runs, those URLs are served from `public/css` and `public/js` respectively.

If you still see no CSS:
- Open browser DevTools → Network tab → reload the page and confirm the requests to `/css/style.css` and the Bootstrap CDN succeed (200). If you see 404 for `/css/style.css`, confirm `public/css/style.css` exists and that the server is started using `server.js`.
- If CDN calls fail (rare), try visiting the CDN URL directly; or temporarily replace with another CDN.

## Troubleshooting & Tips

- Start the server with `npm run dev` for auto-reload.
- Check `server.js` logs — the app logs the URL when listening.
- If running behind a proxy or subpath, adjust Express static mount or prefix asset links accordingly.

## Contribution

PRs, issues and suggestions welcome. If you improve the README or add tests, please send a PR.

---

Enjoy building with GitHub Repo Fetcher! 🚀
