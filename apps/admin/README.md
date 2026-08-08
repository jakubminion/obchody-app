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
| `CRON_SECRET` | Bearer token the Vercel Cron request must present to `/api/watchdog/cron` — generate the same way as `SESSION_SECRET` |
| `ANTHROPIC_API_KEY` | Used by the Event Watchdog's extraction step |
| `RESEND_API_KEY`, `WATCHDOG_DIGEST_EMAIL`, `WATCHDOG_FROM_EMAIL` | Optional — the weekly digest email no-ops (logs a warning) if unset |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional — crash/error reporting no-ops if unset |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Optional — only needed for source map upload at build time |

## Deploying (Vercel)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → New Project → import the repo.
3. Add the environment variables above in the project's Settings → Environment Variables.
4. Deploy. Every push to the main branch redeploys automatically. **Note:** changing an env var's value in the Vercel dashboard does not itself redeploy anything already live — trigger a redeploy (or push a commit) for a changed value to actually take effect.

## Backups

A nightly GitHub Action (`.github/workflows/backup-database.yml`) runs `pg_dump` against the database and uploads the compressed result as a workflow artifact, kept 30 days. It's stored as a GitHub artifact rather than in a Supabase Storage bucket deliberately — a backup living inside the same project it's backing up doesn't help if that project itself is lost or compromised.

**One-time setup:**
1. Supabase → Project Settings → Database → Connection string → copy the **Direct connection** URI (not the pooler ones — `pg_dump` needs a direct connection). It includes the DB password.
2. This repo's GitHub Settings → Secrets and variables → Actions → New repository secret → name it `SUPABASE_DB_URL`, paste the URI.
3. The workflow runs nightly at 03:00 UTC automatically; trigger one manually anytime from the Actions tab (`Nightly database backup` → Run workflow) to test it.

**To restore** (e.g. into a scratch Supabase project to verify the backup is actually good, or for real disaster recovery):
1. Download the artifact: GitHub → Actions → the backup run → Artifacts → `db-backup-<run-id>.zip`, unzip to get `backup.sql.gz`.
2. `gunzip backup.sql.gz`
3. Against a **fresh, empty** Supabase project's direct connection string:
   ```bash
   psql "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres" < backup.sql
   ```
4. Verify: `select count(*) from shops;` should match the row count at backup time.

Do this at least once against a scratch project (free Supabase projects are free to create/delete) to confirm the backup is actually restorable — an untested backup is a hope, not a backup.

## Notes

- Logo/logotype/photo uploads go to the `logos` / `logotypes` / `photos` Supabase Storage buckets. Logotype uploads run the same auto background-removal / color-normalization pipeline as `moje-aplikace/scripts/process-logotypes.mjs` — kept in sync deliberately (`lib/processLogotype.ts`).
- Deleting a shop cascades to its locations (DB foreign key), but does **not** delete its Storage files — a known, accepted gap.
- Auth is a single shared password, not per-user accounts — this is a one-curator tool. Every Server Action re-checks the session itself (`requireAuth()` in `lib/auth.ts`), not just the page-level gate in `proxy.ts`, per Next.js's own guidance that Proxy coverage can silently miss a route.
