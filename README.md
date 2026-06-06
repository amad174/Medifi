# Medifi — NHS Letter Lens

> *"From confusing NHS letters to clear next steps."*

Medifi is a patient-facing AI tool that turns confusing NHS letters, referral
messages, and appointment instructions into a **clear, plain-English action
plan**. A user photographs a letter or pastes a message; Medifi extracts the key
details, explains them simply, builds a checklist of what to do next, and — most
importantly — **flags admin risks** (a date that has already passed, a missing
phone number, vague fasting instructions, conflicting times).

> We are not trying to replace doctors. We fix the confusing admin layer that
> stops patients reaching care in the first place.

## Quick start

### 1. Add your LLM API key

```bash
cp .env.example .env
```

Edit `.env` and set your key (OpenAI or Anthropic):

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### 2. Run the server (app + AI proxy)

```bash
cd server && npm install && npm start
```

Open **http://localhost:3001/ui_kits/app/index.html**

The Node server serves the app and proxies LLM calls so your API key stays on the server (not in the browser).

### Without AI

If no API key is set, the app falls back to **Tesseract OCR** + rule-based parsing. You can still use `python3 -m http.server 8765` for static-only mode.

### Try it

**Scan a letter** → upload a photo or paste text → **Make my plan**. Check **Account** for AI connection status.

The app is a **responsive web layout** — full-width on desktop with a top nav bar; bottom tab bar on smaller screens.

## What's in this repo

- **`ui_kits/app/`** — web app entry (`index.html`) and screen components
- **`ui_kits/app/app.css`** — web layout shell (header, nav, responsive grids)
- **`Medifi App.html`** — legacy phone-mock standalone (design export; use `ui_kits/app/` for web)
- **`components/`** — design-system React primitives (`Button`, `RiskFlag`, `ChecklistItem`, …)
- **`tokens/`** + **`styles.css`** — brand tokens (Medifi Blue, Lens Teal, risk traffic-light system)
- **`assets/`** — Medifi logo and mark SVGs

---

## Sources & provenance

This system was authored for a hackathon concept (Track 02 — *Making NHS Admin
Easier*). The attached materials were intentionally minimal:

- **Local codebase** — `Medifi/` (mounted read-only). Contained only a stub
  `README.md` ("MEDIFI APP") — no existing UI, components, or brand.
- **GitHub** — [`amad174/Medifi`](https://github.com/amad174/Medifi) — likewise a
  stub repo (`README.md` only at commit `cd5058b`). Explore it further if code
  has since been added; the design system should be reconciled against any real
  implementation that lands there.

Because no prior brand or UI existed, **Medifi's visual identity here is original
and purpose-built.** It deliberately does *not* reuse the NHS's proprietary
identity (the NHS Blue lockup, the Frutiger typeface, the NHS logo). Medifi is an
independent third-party patient tool that *works with* NHS information — it must
never imply it is an official NHS product. Where we evoke the trustworthy,
clinical-but-human feeling people associate with public health services, we do so
through original colour, type, and layout choices.

---

## Brand in one breath

**Calm clinical clarity.** Trustworthy, accessible, and human — never sterile,
never alarming for the sake of it. Every decision serves an audience that may be
stressed, time-poor, caring for someone else, reading English as a second
language, or has low health literacy. Big readable type, generous whitespace,
unmissable contrast, and a signature **green / amber / red risk system** that is
the emotional centre of the product.

- **Primary — Medifi Blue** `#1257d6` · trust, calm authority
- **Accent — Lens Teal** `#0e8c84` · clarity, focus, the "lens"
- **Risk system** · green (safe), amber (check this), red (high risk)
- **Type** · [Lexend](https://fonts.google.com/specimen/Lexend) (reading-proficiency
  tuned) for everything; [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)
  for verbatim letter text & extracted fields

---

## CONTENT FUNDAMENTALS — how Medifi writes

Medifi's voice is the opposite of an NHS letter. Where the letter is formal,
passive, and acronym-heavy, Medifi is **plain, direct, and reassuring**. Copy is
the product — getting the words right *is* the design.

**Voice principles**

- **Second person, active, present.** Talk *to* the patient: "You have a
  dermatology appointment on Tuesday at 10:30." Never "The patient is required to
  attend." Medifi refers to itself sparingly and never as "we the NHS."
- **Plain English, ~Year-6 reading age.** Short sentences. One idea per line. No
  jargon without translation — "referral" becomes "a doctor has asked another
  team to see you." Expand every acronym on first use.
- **Lead with the action, not the admin.** Headlines are verbs the patient can
  do: *"Add this to your calendar," "Call to confirm," "Bring your medication
  list."* The bureaucratic detail is supporting text, not the headline.
- **Calm, never alarmist — but honest about risk.** Amber and red flags are
  stated plainly and kindly: *"This date looks like it has already passed. Check
  your letter and call the number below."* We name the problem and immediately
  give the next step. We never use scare language or exclamation marks for risk.
- **Always defer to the source.** Medifi is a helper, not an authority. Standing
  reassurance line: *"Always check against your original letter."* When the AI is
  unsure, it says so rather than guessing — uncertainty is surfaced, not hidden.
- **Inclusive & accessible.** Translated summaries are "supportive — your original
  NHS letter is still the source of truth." Carer mode is framed warmly: "Send
  this summary to someone helping you."

**Casing & mechanics**

- **Sentence case everywhere** — headings, buttons, labels, nav. No Title Case, no
  ALL CAPS except tiny tracked eyebrow labels (e.g. `WHAT TO BRING`).
- Buttons are short verb phrases: *"Scan a letter," "Add to calendar," "Show
  original."*
- Numbers, dates, and times are written the way a person says them: *"Tuesday 12
  June, 10:30am,"* not `2026-06-12T10:30`.
- **No emoji.** Status is carried by the colour system and clear icons, not emoji.
  (Emoji read as informal and can confuse screen readers and ESL users.)
- Tone is warm and competent, like a capable friend who works in a clinic — not
  chatty, not corporate, not clinical.

**Example — the same content, NHS letter vs Medifi**

> *Letter:* "You are invited to attend the Dermatology Outpatient Department.
> Failure to attend may result in discharge back to your GP."
>
> *Medifi:* "You have a skin (dermatology) appointment. **Tuesday 12 June,
> 10:30am** at St Thomas' Hospital, Clinic B. If you can't go, call the number
> below so you don't lose your place."

---

## VISUAL FOUNDATIONS

**Colour & vibe.** A cool, calm canvas (`--canvas` `#f3f7fa`) with white cards.
Medifi Blue carries trust and primary actions; Lens Teal is the secondary/clarity
accent (the lens check, links inside summaries, progress). Colour is used
*sparingly and meaningfully* — most of the screen is calm neutral so that the
risk colours, when they appear, genuinely stand out. No decorative gradients, no
purple-blue tech clichés. The only gradients allowed are subtle, near-flat washes
behind the marketing hero. Imagery, when used, is warm, real, and human (people,
hands, letters on a kitchen table) — never cold stock or clinical hardware.

**Type.** Lexend at large sizes — body text defaults to 17px and summaries run at
`--leading-relaxed` (1.65) for comfortable reading. Headings are bold and tight
(`--tracking-tight`). Eyebrow labels are the only tracked/uppercase text. IBM
Plex Mono is reserved for two jobs: showing the *verbatim* letter text ("show
original") and rendering *extracted structured fields* (dates, NHS numbers, phone
numbers) so they read as machine-extracted data.

**Spacing & layout.** 4px grid, but used generously — calm, uncluttered, one
clear thing to do per screen. The patient app is mobile-first at `--app-max`
(480px); long-form summaries cap at `--content-max` (720px) for a readable
measure. Tap targets are never below 48px (`--tap-min`).

**Corners, borders, cards.** Cards are white, `--radius-md` (14px) corners, a
hairline `--border-default` border **plus** a soft low shadow (`--shadow-sm`) —
never a heavy drop shadow. Pills/badges use `--radius-pill`. Risk cards keep the
same shape but swap to the tinted risk surface + matching coloured left edge and
icon. Nothing is sharp-cornered; nothing is bubbly-round either.

**Shadows & elevation.** Soft, diffuse, low-opacity, blue-tinted
(`rgba(13,27,42,…)`). Elevation is quiet — `--shadow-sm` for resting cards,
`--shadow-md` for menus/sheets, `--shadow-lg` for modals. No neon glows.

**Borders & dividers.** Hairline (1px) `--border-default`; `--border-subtle` for
internal dividers; `--border-strong` only where structure must read clearly.

**Motion.** Gentle and reassuring, never bouncy or playful. Fades and short
slides on `--ease-out` over 200ms. Content animates *in from* hidden and the
end-state is the base style (so reduced-motion and print show content). No
infinite looping decoration. Respect `prefers-reduced-motion`.

**Hover / press states.** Buttons darken on hover (`--brand` → `--brand-hover`),
darken further on press (`--brand-active`); subtle/ghost buttons gain a tinted
surface. No scale-up on hover; a barely-perceptible press settle is fine. Focus
is **always** a visible 3px ring (`--focus-ring`) — accessibility is
non-negotiable.

**Transparency & blur.** Used sparingly — a translucent blurred bar behind the
sticky app header and bottom action bar, and a dim scrim behind modals/sheets.
Body content is always fully opaque for legibility.

---

## ICONOGRAPHY

Medifi uses **[Lucide](https://lucide.dev)** (loaded from CDN) as its icon set —
clean, consistent 2px-stroke outline icons that match the calm, legible,
non-childish tone. Outline (not filled) is the default; icons sit at 20–24px in
UI and 16px inline. Stroke weight stays consistent so icons feel like one family.

- **Status / risk** is the one place colour-coded icons appear: `check-circle`
  (safe/green), `alert-triangle` (caution/amber), `alert-octagon` or `clock`
  (risk/red). These mirror the risk system exactly.
- **Actions** use neutral-ink Lucide glyphs: `calendar-plus` (add to calendar),
  `phone`, `map-pin`, `pill` / `clipboard-list` (what to bring), `scan-line` /
  `camera` (scan a letter), `languages` (translation mode), `share-2` (carer
  mode).
- **No emoji, ever** — they read informally and behave unpredictably for screen
  readers and ESL readers.
- **No hand-rolled SVG icons** — use Lucide so the family stays consistent. The
  *brand logomark* (`assets/medifi-mark.svg`) is the one bespoke vector: a lens
  ring whose lens contains a teal clarity check, with a magnifier handle.

> **Substitution note:** Lucide is a substitution chosen for this original brand
> (there was no existing icon set in the codebase). It's CDN-linked, not vendored.
> If Medifi later standardises on a different set, swap the CDN link and update
> this section.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (import this one file). `@import`s only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill wrapper for use in Claude Code.

**`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`,
`elevation.css`. Base values + semantic aliases.

**`assets/`** — `medifi-mark.svg`, `medifi-logo.svg`, `medifi-logo-white.svg`,
sample NHS-style letter images, brand specimen cards.

**`guidelines/`** — foundation specimen cards (Type, Colors, Spacing, Brand) shown
in the Design System tab.

**`components/`** — reusable React primitives (see each `*.prompt.md`):
- `core/` — Button, Badge, Card, Input, Eyebrow
- `feedback/` — RiskFlag (the signature risk-alert component)
- `app/` — ChecklistItem, FieldRow (extracted-field display)

**`ui_kits/app/`** — high-fidelity click-through recreation of the Medifi patient
app: scan/paste → plain-English summary → action checklist → risk alerts.

---

*Want to build for Medifi? Start with `styles.css`, skim this README, then compose
the components in `components/` and reference `ui_kits/app/` for real screens.*
