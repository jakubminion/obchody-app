import { describe, expect, it } from 'vitest';
import { extractCandidates } from '../extract';

// Live Anthropic call — skipped automatically when ANTHROPIC_API_KEY isn't
// present in the environment (vitest.setup.ts loads .env.local, so this
// runs whenever the key is configured, same as everywhere else in the
// project). A synthetic fixture stands in for a "recorded" real page —
// deliberately mixes shoppable, non-shoppable, dated, and undated listings
// so a single run exercises all of the extractor's classification rules.
const FIXTURE_TEXT = `
Kalendář akcí — CZECHDESIGN

14. 9. 2026 — Dyzajn Market vol. 4
Prodejní trh českého designu, keramiky a šperků. Desítky vystavovatelů,
vstup zdarma. Vnitroblock, Praha 7.

20. 9. 2026 — Výstava: Formy a struktury
Skupinová výstava soch a instalací. Kurátorský výběr, bez prodeje.
Kunsthalle Praha.

Sample sale — Lula Vintage
Jednorázový výprodej vzorků a nadstavu z minulé sezóny, sleva až 70 %.
Otevřeno so 26. 9. 2026, 10—18 h. Praha 1, Vodičkova.

Workshop: Základy knihvazby
Celodenní dílna pro začátečníky, kapacita 12 osob, přihlášky nutné.
25. 9. 2026, Knihex.

Pop-up prodejna UMPRUM
Prodej prací studentů ateliéru Produktový design — keramika, textil,
sklo. Termín bude upřesněn.
`.trim();

describe('extractCandidates (live)', () => {
  it.skipIf(!process.env.ANTHROPIC_API_KEY)(
    'classifies shoppable vs. non-shoppable events and extracts dates correctly',
    async () => {
      const result = await extractCandidates(
        FIXTURE_TEXT,
        { name: 'CZECHDESIGN kalendář akcí (fixture)', url: 'https://example.com/fixture' },
        new Date('2026-08-01T00:00:00.000Z'),
      );

      expect(result.length).toBeGreaterThan(0);

      const market = result.find((e) => /dyzajn/i.test(e.title));
      expect(market?.is_shoppable).toBe(true);
      expect(market?.starts_at?.slice(0, 10)).toBe('2026-09-14');

      const exhibition = result.find((e) => /formy a struktury/i.test(e.title));
      if (exhibition) expect(exhibition.is_shoppable).toBe(false);

      const sampleSale = result.find((e) => /sample sale|lula/i.test(e.title));
      expect(sampleSale?.is_shoppable).toBe(true);

      const workshop = result.find((e) => /knihvazb/i.test(e.title));
      if (workshop) expect(workshop.is_shoppable).toBe(false);

      const popup = result.find((e) => /umprum/i.test(e.title));
      if (popup) {
        expect(popup.is_shoppable).toBe(true);
        expect(popup.starts_at).toBeNull(); // "bude upřesněno" — no date given, must not be guessed
      }
    },
    30_000,
  );
});
