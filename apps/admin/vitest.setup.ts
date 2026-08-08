// Loads .env.local (ANTHROPIC_API_KEY etc.) so the live-extraction
// integration test can find it — mirrors `node --env-file=.env.local`
// used everywhere else in this project, so `npx vitest run` just works
// without a separate invocation convention.
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}
