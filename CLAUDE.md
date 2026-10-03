# CLAUDE.md — Kotodama 言霊

Survival-Japanese learning PWA for a Spanish speaker. Training window: **3 Oct – 1 Nov 2026**.
Trip: **2–16 Nov 2026** (Osaka → Kioto → Kanazawa → Hakone → Tokio). Full spec lives in
`docs/SPEC.md` (sections 1–19). The spec is the source of truth; this file records decisions.

## What it is (10 lines)
1. Duolingo-style app: a vertical forest map with 5 regions (R0 campamento … R4 el gran viaje), lesson nodes and a guardian (boss) per region.
2. Content is fixed by the printed dossier (spec §10): phrases to say, phrases you will hear, grammar/culture cards, kana rows, practice words, scenes, numbers, clock, survival kanji. Never invent Japanese; anything new is `generated: true`.
3. 15 exercise types E1–E15 (learn card, choose translation, build sentence, type it, match, "what do you answer", situation, say it aloud, read kana, prices, clock, signs, scene).
4. Lesson engine: 12 exercises, new phrases first (E1 + easy check), then mixed production, ≤30 % SRS reviews, failed items re-queued. Seeded RNG (mulberry32) for deterministic tests.
5. Game loop: mana (XP), daily goal, streak with freeze amulets, 5 hearts regenerating 1/30 min, achievements as wax seals. "Modo sereno" disables hearts.
6. SRS: 5-box Leitner (same day, +1, +3, +7, +14), halved intervals for boxes 4–5 from 26 Oct to 1 Nov.
7. Calendar: each node has a recommended date; map shows "Hoy toca"; never blocks by date; nudge when >3 days behind.
8. Travel mode (default home screen 2–16 Nov): big phrase cards by category, "Enseñar al personal" fullscreen with Wake Lock, fillable blanks, price calculator (yen→eur, editable rate), emergency numbers with `tel:`.
9. Visual identity "bosque con magia": deep greens, parchment only for Grimoire cards, violet/cyan magic, spell circle on correct answers, flower field after a guardian, Fuku the owl mascot (5 SVG states). All art original SVG/CSS. No Nintendo/Zelda/Frieren assets (names only as katakana vocabulary).
10. 100 % offline PWA, no backend, Zustand persist in localStorage, GitHub Pages via Actions, HashRouter.

## Stack (fixed by spec §2)
Vite · React 18 · TypeScript strict · Tailwind 3 (tokens as CSS vars) · Zustand persist · vite-plugin-pwa ·
motion · wanakana · @fontsource (Shippori Mincho B1, Nunito, M PLUS Rounded 1c, Klee One) · react-router-dom HashRouter ·
Vitest + Testing Library · Web Speech API (ja-JP) · Web Audio sfx synthesized in code.

## Conventions
- Code, identifiers, comments and commits in **English**. UI copy in **Spanish (España, tuteo)**, sentence case, no all-caps labels.
- Pure domain logic in `src/domain/` with unit tests; React components never contain game rules.
- Content in `src/content/` as typed data (`r0.ts … r4.ts`, `kana.ts`, `numbers.ts`, `clock.ts`, `kanji.ts`, `scenes.ts`).
- Japanese text always rendered through `<JpText>` (`lang="ja"`, Klee One for learnable kana, M PLUS Rounded for UI).
- Dates are ISO `YYYY-MM-DD` in the device's local time zone. "Today" is injected (`now` param) so tests are deterministic.
- Animations only in response to user actions; respect `prefers-reduced-motion` everywhere.
- Contrast AA minimum in both themes.
- No new dependency without a one-line justification here.

## Minor decisions taken (spec §19.3)
- Tailwind **3.4** (not 4) so tokens map through `tailwind.config.ts` as the spec describes.
- React **18.3** as the spec states, even though React 19 exists.
- Default user name `Alex` until set in Ajustes.
- Hearts regen is computed lazily from `hearts.updatedAt` on every read; no timers.
- Day boundary = local midnight (`new Date().toISOString()` is NOT used for day keys; a `localDayKey(date)` helper is).
- Exchange rate default: 1 EUR = 170 JPY (editable in Ajustes, offline).
- Repo: `github.com/Gaussiano/kotodama`, Pages base `/kotodama/`.
- **Fonts:** @fontsource ships Japanese fonts as ~120 unicode-range subsets per weight (tens of MB), so the three
  Japanese fonts are subsetted ourselves with `python scripts/subset-fonts.py <ttf-dir>` (fonttools) to the exact
  glyphs used (kana blocks + every non-ASCII char in `src/` and `docs/SPEC.md`) and committed in `src/theme/fonts/`.
  `src/tests/fontCoverage.test.ts` fails if content uses a glyph outside the subset: re-run the script.
  Nunito stays on @fontsource (latin subsets only) via `scripts/fonts.mjs` (runs in `prebuild`).
- **Extra dev dependencies:** `sharp` only to render the PNG icons (`npm run icons`); `playwright` only for the visual
  review script `node scripts/shots.mjs` (390×844, both themes, output in `screenshots/`, gitignored).
- **Lesson length:** E1 cards do not count toward the 12-exercise target; nodes with kana rows add a kana block, so
  phrase lessons land at 12–18 evaluated exercises. Lessons are padded with recognition rounds when a node has few phrases.
- **SRS inside lessons:** an item moves at most one box per lesson (promoted if never failed, demoted on any failure);
  the Repaso screen promotes/demotes per answer.
- **Hidden phrases:** entries split out of a dossier line (はい / いいえ) or lifted from notes (まだです, はい、おねがいします,
  カードで, すみません、わかりません) are `hidden: true`: usable as answers/options, not listed in the Grimoire.
- **Generated Japanese (for review, spec §19.4):** only NPC lines in scenes, each marked `generated: true` in
  `src/content/scenes.ts`: なにか おさがしですか · まっすぐ いって、ひだりです · はい、いきますよ。つぎの でんしゃも いきます ·
  はい、かしこまりました.

## Phases (spec §17) — status
- [x] 0 · Base — Vite + TS + Tailwind + Zustand + PWA, tokens, fonts, themes, deploy workflow.
- [x] 1 · MVP de estudio — all content, lesson engine, E1/E2/E3/E4/E7/E11, TTS, map, persistence.
- [ ] 2 · Juego — mana, daily goal, streak + amulets, hearts, results, achievements, spell circle, sfx, forest map, Fuku.
- [ ] 3 · Todos los ejercicios — E5, E6, E8, E9, E10, E12, E13, E14, E15, guardians, final guardian, flower field.
- [ ] 4 · Repaso y viaje — SRS, Repaso, kana dojo, Grimorio, Modo viaje, Perfil.
- [ ] 5 · Pulido — a11y, performance, export/import, onboarding, visual review 390×844 and 360×780, Lighthouse ≥ 90.

## Commands
```
npm run dev      # local dev server
npm test         # vitest run
npm run build    # typecheck + vite build → dist/
npm run preview  # serve dist/ locally
```
