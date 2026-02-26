# Poppy Supplier Dashboard

Internal supplier catalog tool for managing farm partners, wholesalers, and the flower catalog.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and markup |
| `styles.css` | All styles |
| `app.js` | All JavaScript / app logic |
| `data.json` | Supplier and catalog data |

## Local Development

Because the app loads `data.json` via `fetch`, it needs to be served from a local web server (not opened directly as a file).

**Start the dev server:**
```bash
./start.sh
```
This starts a server on http://localhost:8000 and opens it in your browser automatically.

**Stop the dev server:**
```bash
./stop.sh
```

> The scripts require Python 3, which comes pre-installed on macOS.

## Deploying

The site is hosted on GitHub Pages and redeploys automatically on every push to `main`.

```bash
git add -A
git commit -m "your message"
git push
```

Live URL: https://poppyflowersmeg.github.io/supplier-dashboard/
