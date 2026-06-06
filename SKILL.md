---
name: medifi-design
description: Use this skill to generate well-branded interfaces and assets for Medifi (NHS Letter Lens), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

Medifi is a patient-facing AI tool that turns confusing NHS letters into a clear,
plain-English action plan, with a signature green/amber/red admin-risk system.
The brand is "calm clinical clarity" — accessible-first, trustworthy, human.

Key files:
- `readme.md` — full design guide: product context, content voice, visual
  foundations, iconography, and a manifest of everything here.
- `styles.css` — the only stylesheet to link; it `@import`s all tokens + fonts.
- `tokens/` — colours, typography (Lexend + IBM Plex Mono), spacing, elevation.
- `components/` — React primitives (Button, Badge, Card, Input, Eyebrow,
  RiskFlag, ChecklistItem, FieldRow). Each has a `.prompt.md` with usage.
- `ui_kits/app/` — a full interactive recreation of the Medifi patient app.
- `assets/` — logo / mark assets.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy
assets out and create static HTML files for the user to view. If working on
production code, copy assets and read the rules here to become an expert in
designing with this brand.

If the user invokes this skill without any other guidance, ask them what they
want to build or design, ask some questions, and act as an expert designer who
outputs HTML artifacts _or_ production code, depending on the need.

Always honour the voice: plain English, second person, sentence case, no emoji,
calm-but-honest about risk, and always defer to the patient's original letter.
