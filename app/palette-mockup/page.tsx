export const metadata = {
  title: 'Návrh nové palety — Obchody',
};

// Raw palette the user gave us.
const RAW = {
  oxblood: '#6F1D1B',
  tan: '#BB9457',
  darkBrown: '#432818',
  sienna: '#99582A',
  cream: '#FFE6A7',
};

// Two extra shades derived the same way the current palette derives its one
// "tan" category color — a blend between two palette anchors, not a new
// hue. Everything below is a PROPOSAL for review, nothing is wired into
// the real app yet.
const DERIVED = {
  rust: '#843A22', // oxblood x sienna
  olive: '#73532F', // tan x darkBrown
};

const CATEGORIES = [
  { label: 'Umění a knihy', color: RAW.tan, icon: '📚' },
  { label: 'Design a móda', color: RAW.oxblood, icon: '🧵' },
  { label: 'Vintage a starožitnosti', color: RAW.sienna, icon: '🕰️' },
  { label: 'Parfémy a kosmetika', color: DERIVED.rust, icon: '🧴' },
  { label: 'Speciality', color: DERIVED.olive, icon: '⭐' },
];

const TAGS = [
  'Knihy', 'Oblečení', 'Hudba', 'Tisky', 'Šperky', 'Parfémy',
  'Květiny', 'Starožitnictví', 'Kosmetika', 'Řemeslo', 'Design',
];

function Swatch({ hex, label, sub }: { hex: string; label: string; sub?: string }) {
  const light = hex === RAW.cream || hex === '#FFFFFF';
  return (
    <div style={{ width: 108 }}>
      <div
        style={{
          height: 64,
          borderRadius: 10,
          background: hex,
          border: light ? '1px solid rgba(0,0,0,0.12)' : 'none',
        }}
      />
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: '#292019' }}>{label}</div>
      <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#8a7c6c' }}>{sub ?? hex}</div>
    </div>
  );
}

// Schematic, not a real map render — the Google Maps API key is restricted
// to the iOS/Android SDKs, not the web, so it won't load here. This
// reproduces the same *roles* the real custom map style (mapStyle.ts) uses:
// cream/dark land, a distinct water color, park blobs, a plain road grid,
// one highway accent, plus a couple of real pins dropped on top for scale.
function MapPreview({
  land,
  water,
  park,
  roadFill,
  roadStroke,
  highway,
  highwayStroke,
  labelStroke,
}: {
  land: string;
  water: string;
  park: string;
  roadFill: string;
  roadStroke: string;
  highway: string;
  highwayStroke: string;
  labelStroke: string;
}) {
  return (
    <svg width={280} height={190} viewBox="0 0 280 190" style={{ borderRadius: 12, display: 'block' }}>
      <rect width={280} height={190} fill={land} />

      {/* river */}
      <path
        d="M -10 40 C 60 30, 70 90, 140 85 S 230 130, 290 110"
        fill="none"
        stroke={water}
        strokeWidth={22}
      />

      {/* park blobs */}
      <ellipse cx={70} cy={140} rx={38} ry={26} fill={park} />
      <ellipse cx={225} cy={45} rx={26} ry={20} fill={park} />

      {/* plain road grid */}
      {[30, 65, 100, 135, 170].map((y) => (
        <rect key={`h${y}`} x={0} y={y} width={280} height={4} fill={roadFill} stroke={roadStroke} strokeWidth={0.5} />
      ))}
      {[40, 90, 150, 210, 250].map((x) => (
        <rect key={`v${x}`} x={x} y={0} width={4} height={190} fill={roadFill} stroke={roadStroke} strokeWidth={0.5} />
      ))}

      {/* highway */}
      <line x1={-10} y1={175} x2={290} y2={15} stroke={highwayStroke} strokeWidth={10} />
      <line x1={-10} y1={175} x2={290} y2={15} stroke={highway} strokeWidth={6} />

      {/* a locality label, matching labels.text.stroke role */}
      <text x={140} y={100} textAnchor="middle" fontSize={13} fontWeight={700} fill={labelStroke} stroke={land} strokeWidth={3} paintOrder="stroke">
        Praha
      </text>

      {/* a couple of pins for scale */}
      <g transform="translate(96,58) scale(0.8)">
        <path d="M5 26 L29 26 L17 45 Z" fill={RAW.oxblood} />
        <circle cx={17} cy={17} r={15} fill={RAW.oxblood} stroke="#FFF" strokeWidth={2} />
      </g>
      <g transform="translate(178,118) scale(0.8)">
        <path d="M5 26 L29 26 L17 45 Z" fill={RAW.sienna} />
        <circle cx={17} cy={17} r={15} fill={RAW.sienna} stroke="#FFF" strokeWidth={2} />
      </g>
    </svg>
  );
}

function Pin({ color, icon, size = 40 }: { color: string; icon: string; size?: number }) {
  const w = size;
  const h = size * 1.32;
  return (
    <svg width={w} height={h} viewBox="0 0 34 46">
      <path d="M5 26 L29 26 L17 45 Z" fill={color} />
      <circle cx={17} cy={17} r={15} fill={color} stroke="#FFF" strokeWidth={2} />
      <text x={17} y={22} fontSize={14} textAnchor="middle">{icon}</text>
    </svg>
  );
}

interface MapColors {
  land: string;
  water: string;
  park: string;
  roadFill: string;
  roadStroke: string;
  highway: string;
  highwayStroke: string;
  labelStroke: string;
}

function ThemeBlock({
  mode,
  bg,
  surface,
  ink,
  inkSecondary,
  inkTertiary,
  border,
  favorite,
  accent,
  map,
}: {
  mode: string;
  bg: string;
  surface: string;
  ink: string;
  inkSecondary: string;
  inkTertiary: string;
  border: string;
  favorite: string;
  accent: string;
  map: MapColors;
}) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: 28, color: ink }}>
      <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.04, color: inkSecondary }}>
        {mode}
      </h3>

      {/* category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        {CATEGORIES.map((c) => (
          <span
            key={c.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              borderRadius: 999,
              background: c.color,
              color: '#FFF',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <span>{c.icon}</span>
            {c.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* shop list tile */}
        <div style={{ width: 220 }}>
          <div
            style={{
              position: 'relative',
              height: 150,
              borderRadius: 14,
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${border}, ${surface})`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: '28px 12px 10px',
                background: `linear-gradient(to top, ${RAW.darkBrown}E6, transparent)`,
              }}
            >
              <div style={{ color: '#FFF', fontWeight: 700, fontSize: 13.5 }}>Papelote</div>
              <div style={{ color: '#F1E4D0', fontSize: 11 }}>papírnictví · zápisníky</div>
            </div>
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 26,
                height: 26,
                borderRadius: 13,
                background: 'rgba(255,255,255,0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
              }}
            >
              <span style={{ color: favorite }}>♥</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: inkTertiary, marginTop: 6 }}>Seznam — dlaždice obchodu</div>
        </div>

        {/* shop detail snippet */}
        <div style={{ width: 240, background: surface, borderRadius: 14, padding: 16, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>Papelote</div>
            <span style={{ color: favorite, fontSize: 16 }}>♥</span>
          </div>
          <div style={{ color: DERIVED.rust, fontWeight: 700, fontSize: 12.5, marginTop: 6 }}>
            papírnictví · zápisníky · dárkové zboží
          </div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: inkSecondary }}>
            Otevřeno · <span style={{ color: accent }}>zavírá v 19:00</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: inkTertiary, borderTop: `1px solid ${border}`, paddingTop: 8 }}>
            <span style={{ fontWeight: 700, textDecoration: 'underline', color: ink }}>Čt 10:00–19:00</span>
            <br />Pá 10:00–19:00
          </div>
        </div>

        {/* map style */}
        <div style={{ background: surface, borderRadius: 14, padding: 16, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, color: inkTertiary, marginBottom: 10 }}>Styl mapy</div>
          <MapPreview {...map} />
        </div>

        {/* map pins */}
        <div style={{ background: surface, borderRadius: 14, padding: 16, border: `1px solid ${border}` }}>
          <div style={{ fontSize: 11, color: inkTertiary, marginBottom: 10 }}>Špendlíky na mapě</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            {CATEGORIES.map((c) => (
              <Pin key={c.label} color={c.color} icon={c.icon} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: accent, boxShadow: `0 0 0 5px ${accent}44` }} />
              <span style={{ fontSize: 11, color: inkSecondary }}>Akce — dnes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, border: `2px dashed ${accent}`, opacity: 0.55 }} />
              <span style={{ fontSize: 11, color: inkSecondary }}>Akce — nadcházející</span>
            </div>
          </div>
        </div>

        {/* filter chips row */}
        <div style={{ background: surface, borderRadius: 14, padding: 16, border: `1px solid ${border}`, width: 200 }}>
          <div style={{ fontSize: 11, color: inkTertiary, marginBottom: 10 }}>Přepínač / filtr</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5 }}>Otevřeno teď</span>
            <div style={{ width: 40, height: 24, borderRadius: 12, background: accent, position: 'relative' }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: '#FFF', position: 'absolute', top: 3, right: 3 }} />
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAGS.slice(0, 4).map((t) => (
              <span key={t} style={{ fontSize: 10.5, padding: '4px 9px', borderRadius: 6, background: bg, border: `1px solid ${border}`, color: inkSecondary }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaletteMockupPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px', fontFamily: '-apple-system, sans-serif' }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase', color: RAW.sienna, margin: '0 0 10px' }}>
        Návrh — zatím nikde nezapojeno
      </p>
      <h1 style={{ fontSize: 28, margin: '0 0 8px', color: '#221913' }}>Nová paleta v kontextu aplikace</h1>
      <p style={{ color: '#6b5c4c', maxWidth: '62ch', marginBottom: 28 }}>
        Ukázka, jak by dodaná paleta fungovala na skutečných prvcích aplikace — dlaždice obchodu, špendlíky na mapě,
        detail obchodu, kategorie. Nic z tohoto zatím není zapojeno do reálného kódu; jde jen o vizuální náhled ke
        schválení. Dvě barvy navíc (níže označené &quot;odvozeno&quot;) jsou dopočítané směsi dvou zadaných barev —
        stejný princip, jaký současná paleta používá pro jeden odvozený hnědý odstín kategorie Vintage.
      </p>

      <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>Zadaná paleta</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <Swatch hex={RAW.oxblood} label="oxblood" />
        <Swatch hex={RAW.tan} label="tan" />
        <Swatch hex={RAW.darkBrown} label="dark brown" />
        <Swatch hex={RAW.sienna} label="sienna" />
        <Swatch hex={RAW.cream} label="cream" />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <Swatch hex={DERIVED.rust} label="rust (odvozeno)" />
        <Swatch hex={DERIVED.olive} label="olive (odvozeno)" />
      </div>

      <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>Navržené role</h2>
      <ul style={{ fontSize: 13.5, color: '#4a3d30', lineHeight: 1.9, marginBottom: 32 }}>
        <li><b>Pozadí (light):</b> cream #FFE6A7 &nbsp;·&nbsp; <b>Text/ink (light):</b> dark brown #432818</li>
        <li><b>Oblíbené (srdíčko):</b> oxblood #6F1D1B &nbsp;·&nbsp; <b>Akcent (přepínače, živé akce):</b> sienna #99582A</li>
        <li><b>5 hlavních kategorií:</b> tan, oxblood, sienna, rust (odvozeno), olive (odvozeno)</li>
      </ul>

      <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>Světlý režim</h2>
      <div style={{ marginBottom: 32 }}>
        <ThemeBlock
          mode="Light"
          bg={RAW.cream}
          surface="#FFFFFF"
          ink={RAW.darkBrown}
          inkSecondary="#7A5C3E"
          inkTertiary="#A88B62"
          border="#E9CE8F"
          favorite={RAW.oxblood}
          accent={RAW.sienna}
          map={{
            land: RAW.cream,
            water: RAW.darkBrown,
            park: DERIVED.olive,
            roadFill: '#FFFFFF',
            roadStroke: '#E9CE8F',
            highway: RAW.tan,
            highwayStroke: RAW.oxblood,
            labelStroke: RAW.darkBrown,
          }}
        />
      </div>

      <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>Tmavý režim</h2>
      <ThemeBlock
        mode="Dark"
        bg="#241608"
        surface="#33220F"
        ink={RAW.cream}
        inkSecondary="#D8C08A"
        inkTertiary="#9C8459"
        border="#4A3520"
        favorite="#D6564F"
        accent={RAW.tan}
        map={{
          land: '#241608',
          water: '#120B04',
          park: '#5C3A22',
          roadFill: '#33220F',
          roadStroke: '#4A3520',
          highway: RAW.tan,
          highwayStroke: '#5F4322',
          labelStroke: RAW.cream,
        }}
      />

      <p style={{ marginTop: 36, fontSize: 12.5, color: '#8a7c6c' }}>
        Pokud tohle vypadá dobře, řekni a proveden reálný přepis (theme.ts, kategorie, štítky, styl mapy) napříč
        mobilní aplikací.
      </p>
    </div>
  );
}
