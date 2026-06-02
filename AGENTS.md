# AGENTS.md — Agent Guidance for this Repository

Purpose
- Give AI coding agents a concise, actionable entrypoint so they can be immediately productive.

Quick commands

```bash
# Development
npm run dev

# Build & preview
npm run build
npm run preview

# Lint
npm run lint

# Deploy to Cloudflare (requires Wrangler + credentials)
npm run deploy

# Generate Cloudflare types (optional)
npm run cf-typegen
```

Key files to inspect
- package.json ([package.json](package.json#L1-L200)) — scripts and deps
- Vite config ([vite.config.ts](vite.config.ts#L1-L200)) — dev server and plugin setup
- Wrangler config ([wrangler.jsonc](wrangler.jsonc#L1-L200)) — Cloudflare Worker entry/deploy settings
- Router and routes ([src/router.tsx](src/router.tsx#L1-L200), [src/routeTree.gen.ts](src/routeTree.gen.ts#L1-L200), [src/routes/__root.tsx](src/routes/__root.tsx#L1-L200))
- Supabase client and functions ([src/lib/supabase.ts](src/lib/supabase.ts#L1-L200), supabase/functions/)
- Migrations ([supabase/migrations](supabase/migrations/)) — DB schema and RLS
- Worker entry ([worker/index.ts](worker/index.ts#L1-L200))
- UI primitives ([src/ui](src/ui/)) and shared components ([src/components](src/components/))

Conventions and notes for agents
- This is a Vite + React (TS) app using TanStack Router and `@tanstack/react-start` for SSR on Cloudflare.
- `src/routes` is the canonical source for routes; `src/routeTree.gen.ts` is generated — do not edit.
- TypeScript uses `tsc -b` before `vite build`; respect the build ordering.
- Environment variables follow `VITE_*` naming (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Warn users if missing.
- Deploys use Wrangler/Cloudflare; ensure credentials and account info are available before running `npm run deploy`.

Common pitfalls
- Missing `VITE_` env vars will break runtime behavior.
- Editing `routeTree.gen.ts` will be overwritten by generator tooling.
- Wrangler config may require specific Wrangler versions and `nodejs_compat` setup.
- `bun.lockb` exists but package scripts assume npm; don't assume a single package manager.

Suggested next agent customizations
- Create a small `deploy` agent that runs build + `wrangler deploy` with checks for required env vars.
- Create a `migrations` skill to validate and list unapplied SQL migrations.
- Add a `supabase` hook to locally run or emulate supabase functions when testing.

If you want, I can add any of the suggested agent files (deploy hook, migration checker, or a short test harness). Say which one to create next.
