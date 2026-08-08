import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

export interface ExtractedEvent {
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  venue_name: string | null;
  address_raw: string | null;
  description: string | null;
  is_shoppable: boolean;
  confidence: number;
  image_url: string | null;
}

export interface SourceMeta {
  name: string;
  url: string;
}

const EXTRACT_TOOL_NAME = 'extract_events';

const EVENT_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    starts_at: {
      type: ['string', 'null'],
      description: 'ISO 8601 date or datetime. null if you cannot confidently determine it — never guess.',
    },
    ends_at: { type: ['string', 'null'], description: 'ISO 8601 date or datetime, or null.' },
    venue_name: { type: ['string', 'null'] },
    address_raw: { type: ['string', 'null'], description: 'Street address as written on the page, or null.' },
    description: { type: ['string', 'null'] },
    is_shoppable: {
      type: 'boolean',
      description: 'true only if visitors can buy something on-site: markets, pop-up sales, sample sales, open studios with sale, fairs with stalls, festival shops. false for pure exhibitions, talks, workshops, concerts.',
    },
    confidence: { type: 'number', description: 'Extraction confidence, 0 to 1.' },
    image_url: { type: ['string', 'null'] },
  },
  required: ['title', 'starts_at', 'ends_at', 'venue_name', 'address_raw', 'description', 'is_shoppable', 'confidence', 'image_url'],
} as const;

const SYSTEM_PROMPT = `You extract candidate shoppable events in Prague from web page text for a curated shop guide's event watchdog.

Rules:
- Prague only. Skip events elsewhere.
- Future-dated only relative to the given current date. Skip anything already past.
- Only include events where visitors can buy something on-site: markets, pop-up sales, sample sales, open studios with a sale, fairs with stalls, festival shops (e.g. a museum shop pop-up). Exclude pure exhibitions, talks, workshops, concerts — even if listed on the same page as shoppable ones. Set is_shoppable accordingly; still include non-shoppable events you find with is_shoppable: false only if you're unsure of the classification, otherwise omit clearly non-shoppable listings entirely.
- Never guess a date. If a start date isn't clearly stated or confidently inferable, set starts_at to null rather than guessing.
- Resolve relative/partial dates (e.g. "příští sobotu", "14. 9." with no year) using the given current date.
- If the page lists no qualifying events, return an empty array.`;

export async function extractCandidates(
  text: string,
  source: SourceMeta,
  currentDate: Date = new Date(),
): Promise<ExtractedEvent[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set.');

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: EXTRACT_TOOL_NAME,
        description: 'Report the extracted candidate events.',
        input_schema: {
          type: 'object',
          properties: {
            events: { type: 'array', items: EVENT_ITEM_SCHEMA },
          },
          required: ['events'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: EXTRACT_TOOL_NAME },
    messages: [
      {
        role: 'user',
        content: `Current date: ${currentDate.toISOString().slice(0, 10)}
Source: ${source.name} (${source.url})

Page text:
${text.slice(0, 60_000)}`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === EXTRACT_TOOL_NAME,
  );
  if (!toolUse) return [];

  const input = toolUse.input as { events?: ExtractedEvent[] };
  return input.events ?? [];
}
