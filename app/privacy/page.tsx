export const metadata = {
  title: 'Zásady ochrany soukromí — Obchody',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Zásady ochrany soukromí</h1>
      <p className="mb-8 text-sm text-neutral-500">Platí pro aplikaci Obchody (iOS). Poslední úprava: srpen 2026.</p>

      <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Žádný účet, žádná registrace</h2>
          <p>
            Obchody nevyžaduje vytvoření účtu ani přihlášení. Aplikaci lze plně používat bez zadání jakýchkoliv
            osobních údajů.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Poloha</h2>
          <p>
            Pokud polohu povolíte, používá se výhradně na vašem zařízení — k seřazení obchodů a akcí podle
            vzdálenosti a k vycentrování mapy. Vaše souřadnice se nikdy neodesílají na žádný server ani se nikde
            neukládají; aplikace je nepřenáší ani do vlastní databáze, ani do nástroje na sledování pádů (viz níže).
            Bez povolení polohy aplikace funguje normálně, jen se nezobrazují vzdálenosti a mapa se vycentruje na
            Prahu.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Oblíbené</h2>
          <p>
            Seznam oblíbených obchodů se ukládá pouze lokálně ve vašem zařízení. Nikam se neodesílá a nelze jej
            přiřadit k vaší osobě.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Hlášení pádů aplikace</h2>
          <p>
            Pro odhalování chyb používáme službu Sentry, která v případě pádu nebo chyby aplikace zaznamená
            technické informace (např. verzi aplikace, typ zařízení, chybovou zprávu). Tato hlášení jsou anonymní —
            neobsahují vaše jméno, e-mail ani polohu — a slouží výhradně k opravě chyb.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Obsah aplikace</h2>
          <p>
            Seznam obchodů a akcí zobrazovaný v aplikaci je veřejně publikovaný redakční obsah spravovaný
            kurátorem — nejde o osobní údaje uživatelů.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Kontakt</h2>
          <p>
            Dotazy k těmto zásadám nebo k aplikaci samotné směřujte na{' '}
            <a href="mailto:jakub.vranek@seznam.cz" className="underline">
              jakub.vranek@seznam.cz
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
