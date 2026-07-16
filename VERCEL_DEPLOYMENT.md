# Vercel deployment

Micro Empire V6.1 supports Vercel and GitHub Pages from the same repository.

## Vercel settings

- Framework preset: Vite (auto-detected)
- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js runtime: 22.x

The `/api/health` and `/api/edition` functions are available only on the Vercel deployment. Commercial access remains denied until authenticated entitlements are implemented.
