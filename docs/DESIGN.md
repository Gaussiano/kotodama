# Design plan — Kotodama (spec §19.1)

## Palette
Day «Bosque al amanecer»: background `mist-50` #E9F0E6 (pale green mist, never cream), text `forest-900`,
primary `forest-700` #1D5C48, success `moss-500`, active glow `leaf-300`, XP/streak `rune-gold`,
magic `mana-500` + `spell-glow`, error `ember-500`. Parchment #F3EAD3 appears **only** on Grimoire cards,
framed with `bark-600`.
Night «Bosque bajo las estrellas»: bg #0E2419, surface #163628, elevated #1F4433, text #E9F0E6,
secondary #A9BFB2, primary → `leaf-300`, magic glows with drop-shadow.
Region banners: R0 #6B5A2A · R1 #1D5C48 · R2 #7A3B2E · R3 #4F3F86 · R4 #2B4F72.

Contrast (AA ≥ 4.5 body, ≥ 3 large): forest-900 on mist-50 = 13.9 · ink-2 #425C50 on mist-50 = 6.1 ·
white on forest-700 = 7.9 · forest-900 on leaf-300 = 9.1 · #E9F0E6 on #163628 = 11.2 · #A9BFB2 on #0E2419 = 8.0.
Ember/moss/mana are used as fills with white or forest-900 text, never as body text on mist.

## Typography
- Display (region names, screen titles): Shippori Mincho B1 700.
- UI: Nunito 400/600/700/800; Japanese UI glyphs fall back to M PLUS Rounded 1c.
- Learnable Japanese: Klee One 400/600, `lang="ja"`, 2.5 rem in exercise cards, 4.5 rem for isolated kana.
- Scale (rem): 0.8125 · 0.9375 · 1.0625 · 1.25 · 1.5 · 2 · 3. Sentence case everywhere.

## Wireframe · Map (home)
```
┌──────────────────────────────────────┐
│ 🔥 7   ◆ 420   ♥♥♥♥♡          ⚙     │  top bar (fixed)
├──────────────────────────────────────┤
│ ╔════════════════════════════════╗   │
│ ║ R2 · La taberna   12–18 oct  3/7║   │  region banner (region color)
│ ╚════════════════════════════════╝   │
│          ▲  ▲      ▲                 │  tree silhouettes, parallax layers
│      ╭───╮                           │
│      │ ✓ │ R2-1 En la puerta         │  completed: moss + gold star
│      ╰───╯                           │
│            ╲                         │
│             ╭───╮  ⚑ Hoy toca        │  lantern flag over today's node
│             │ ◉ │ R2-2 Pedir         │  available: pulsing leaf-300 glow
│             ╰───╯                    │
│            ╱                         │
│      ╭───╮                           │
│      │ 🔒│ R2-3 Preguntar            │  locked: stone grey + root lock
│      ╰───╯                           │
│                 ╱                    │
│          ╔═══════╗                   │
│          ║ ◈ ◈ ◈ ║  Guardián         │  96 px rune portal
│          ╚═══════╝                   │
├──────────────────────────────────────┤
│  Mapa   Repaso   Kana  Grimorio Perfil│  tab bar
└──────────────────────────────────────┘
```
Tapping a node opens a bottom sheet: title · «Aprenderás: …» · «4 frases nuevas» · [Empezar].

## Wireframe · Exercise (E3 «Elige el hechizo»)
```
┌──────────────────────────────────────┐
│ ✕   ████████████░░░░░░░░   ♥♥♥♥♡     │  close (confirm) · progress · hearts
│                                      │
│  Elige el hechizo                    │  small label, sentence case
│  Quieres salsa de soja.              │  prompt in Spanish, 1.25 rem
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 🔊  しょうゆは ありますか      │    │  Klee One 1.5 rem, speaker 48 px
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │ 🔊  おみずを ください         │    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │ 🔊  これを ください           │    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │ 🔊  メニューを ください        │    │
│  └──────────────────────────────┘    │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │           Comprobar              │ │  primary button, thumb zone
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
   on success → feedback sheet slides up (moss), spell circle blooms behind «Continuar»
   on error   → sheet (ember/amber) «Era: しょうゆは ありますか» + translation + 🔊
```

## Self-review against §3 (what I changed)
- Dropped the generic "white card with grey shadow" default: surfaces use a faint green-tinted white and a
  shadow tinted with forest-900, and nodes are rune stones, not cards.
- No decorative gradients anywhere in the UI; the only glow is the spell circle and the available-node pulse.
- No all-caps labels; tab labels and section headers are sentence case.
- Options in choice exercises are plain bordered rows (no drop shadows) so the spell circle is the only loud element.
- Grimoire is the only parchment surface; everything else stays on mist/forest.
