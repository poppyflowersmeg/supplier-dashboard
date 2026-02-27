# Supplier Dashboard — Claude Context

## Stack
React 18 + TypeScript, built with Vite, TanStack Query v5 for data fetching, Supabase for auth + database.

| Path | Purpose |
|------|---------|
| `src/main.tsx` | Entry point, QueryClientProvider + ToastProvider |
| `src/App.tsx` | Auth gate — shows LoginScreen or main app |
| `src/lib/supabase.ts` | Supabase client (from env vars) |
| `src/lib/types.ts` | Supplier/CatalogItem interfaces + db mapping functions |
| `src/hooks/useAuth.ts` | Google OAuth auth state |
| `src/hooks/useSuppliers.ts` | React Query hooks for partners table |
| `src/hooks/useCatalog.ts` | React Query hooks for catalog table |
| `src/components/` | UI components (NavBar, SupplierSection, CatalogSection, etc.) |
| `src/styles/styles.css` | All styles |
| `.env.local` | VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (gitignored) |

## Local Development

**Start the dev server:**
```bash
npm run dev
```
Opens http://localhost:8000/supplier-dashboard/ (Vite with HMR).

**Build:**
```bash
npm run build
```

**Preview built output:**
```bash
npm run preview
```

## Deploying

Push to `main` — GitHub Actions runs the build and deploys to GitHub Pages automatically.

Before the first deploy, add these GitHub Actions secrets in repo Settings → Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Also enable GitHub Pages with source "GitHub Actions" in repo Settings → Pages.

Live URL: https://poppyflowersmeg.github.io/supplier-dashboard/

# currentDate
Today's date is 2026-02-27.

      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
