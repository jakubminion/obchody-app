# Obchody Admin

Internal admin panel for the [Obchody](../moje-aplikace) shop guide app — edit shop info, upload logos/photos, manage locations and opening hours, add/remove shops. Talks directly to the same Supabase project the mobile app reads from; changes here are live in the app on the next pull-to-refresh.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000, log in with the password from `.env.local`.

## Environment variables

Set in `.env.local` for local dev, and in your hosting provider's dashboard for production:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Same Supabase project URL as the mobile app |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — full write access, server-only, never sent to the browser |
| `ADMIN_PASSWORD` | Single shared password gating the whole panel |
| `SESSION_SECRET` | Random string used to sign the login session cookie — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

## Deploying (Vercel)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → New Project → import the repo.
3. Add the four environment variables above in the project's Settings → Environment Variables.
4. Deploy. Every push to the main branch redeploys automatically.

## Notes

- Logo/logotype/photo uploads go to the `logos` / `logotypes` / `photos` Supabase Storage buckets. Logotype uploads run the same auto background-removal / color-normalization pipeline as `moje-aplikace/scripts/process-logotypes.mjs` — kept in sync deliberately (`lib/processLogotype.ts`).
- Deleting a shop cascades to its locations (DB foreign key), but does **not** delete its Storage files — a known, accepted gap.
- Auth is a single shared password, not per-user accounts — this is a one-curator tool. Every Server Action re-checks the session itself (`requireAuth()` in `lib/auth.ts`), not just the page-level gate in `proxy.ts`, per Next.js's own guidance that Proxy coverage can silently miss a route.
