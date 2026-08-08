import 'server-only';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';

export interface FetchedSource {
  text: string;
  hash: string;
}

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = 'ObchodyEventWatchdog/1.0 (+https://obchody-app-ivee.vercel.app)';

// Fetches a source page and reduces it to plain readable text for the LLM
// extraction step. Strips script/style, keeps everything else — the LLM is
// robust to imperfect extraction, so this doesn't need to be a precise
// content-only scraper.
export async function fetchAndExtractText(url: string): Promise<FetchedSource> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status} for ${url}`);
    html = await res.text();
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);
  $('script, style, noscript, svg').remove();
  const text = $('body').text().replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
  const hash = createHash('sha256').update(text).digest('hex');

  return { text, hash };
}
