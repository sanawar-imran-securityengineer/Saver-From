# FastFB Video Downloader

FastFB lets people inspect public Facebook videos and download the exact MP4 quality they choose.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/fastfb run dev` — run the FastFB web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The API server uses the system `yt-dlp` and `ffmpeg` binaries for extraction and MP4 delivery.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/fastfb/src/App.tsx` — single-page downloader experience, translations, theme, FAQ, and download flow
- `artifacts/fastfb/src/index.css` — FastFB visual system and responsive layout
- `artifacts/api-server/src/routes/facebook.ts` — validated metadata and download proxy routes
- `lib/api-spec/openapi.yaml` — source of truth for the Facebook API contract

## Architecture decisions

- The existing shared Express API service proxies `yt-dlp` rather than adding a second server runtime; the frontend and API stay on the workspace's path-routed services.
- The API returns format metadata without exposing CDN URLs to the browser; selected formats are proxied server-side for more predictable downloads.
- No database or accounts are used; FastFB is intentionally stateless and only handles public links submitted by the user.

## Product

- Responsive public Facebook video inspector and downloader
- Exact quality selection with inline download states
- English, Urdu, Hindi, Arabic, and Spanish UI translations
- Persisted light/dark theme and language selection
- SEO-ready single-page marketing and FAQ content

## User preferences

- Prefer practical, real download behavior over placeholder UI.

## Gotchas

- Facebook may reject private, login-gated, region-restricted, or expired links; the UI surfaces a friendly extraction error instead of retrying blindly.
- Format metadata can vary per URL. The API validates the selected `formatId` and asks the user to inspect again when an option is stale.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
