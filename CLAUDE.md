# Supplier Dashboard — Claude Context

## Stack
Plain HTML, CSS, and JavaScript. No build step, no framework, no dependencies.

| File | Purpose |
|------|---------|
| `index.html` | Page structure and markup |
| `styles.css` | All styles |
| `app.js` | All JavaScript / app logic |
| `data.json` | Supplier and catalog data |

## Local Development

The app uses `fetch('data.json')` so it must be served from a local server — opening `index.html` directly as a file won't work.

**Start the dev server:**
```bash
./start.sh
```
Opens http://localhost:8000 in your browser automatically. If the server is already running, it will restart it.

**Stop the dev server:**
```bash
./stop.sh
```

## Deploying

`gh` CLI is installed. Push changes to `main` and GitHub Pages rebuilds automatically — no manual deploy step needed.

```bash
git add -A
git commit -m "your message"
git push
```

Live URL: https://poppyflowersmeg.github.io/supplier-dashboard/
