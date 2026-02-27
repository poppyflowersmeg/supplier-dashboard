# Poppy Supplier Dashboard

Internal supplier catalog tool for managing farm partners, wholesalers, and the flower catalog.

## Stack

React 18 + TypeScript, Vite, TanStack Query v5, Supabase (auth + database + storage).

## Local Development

**Start the dev server:**
```bash
npm run dev
```
Opens http://localhost:8000/supplier-dashboard/ with hot module replacement.

**Build for production:**
```bash
npm run build
```

**Preview the production build locally:**
```bash
npm run preview
```

## Environment

Create a `.env.local` file in the project root with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deploying

Push to `main` — GitHub Actions builds and deploys to GitHub Pages automatically.

Before the first deploy, add these secrets in repo Settings → Secrets → Actions:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Also enable GitHub Pages with source "GitHub Actions" in repo Settings → Pages.

Live URL: https://poppyflowersmeg.github.io/supplier-dashboard/
