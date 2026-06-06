# Medifi App — UI kit

A high-fidelity, click-through recreation of the **Medifi patient app**
(*NHS Letter Lens*). It demonstrates the four MVP features end to end:

1. **Scan / paste** an NHS letter (`ScanScreen`) — photo or paste, or pick one of
   three realistic sample letters.
2. **Plain-English summary** + **extracted details** (`ResultScreen`).
3. **Action checklist** of what to do next (tickable).
4. **Admin risk alerts** — the signature traffic-light flags (past date, missing
   phone number, vague fasting time).

Plus the "should-have / nice-to-have" touches: real **calendar export**
(Google Calendar links + downloadable `.ics` with alarms, and recurring
**medicine reminders** from a prescription), **translation mode**, **ask a
question about this letter**, **send to a carer**, and interactive **Letters**,
**Help**, and **Account** screens.

## Run it
Open `index.html`. It mounts an interactive phone mock that scales to fit the
viewport. Try: tap **Scan a letter** → pick the **Confusing letter** sample →
**Make my plan** to see the red risk alerts. Or tap any letter on the home
screen to jump straight to its plan.

## Files
- `index.html` — phone frame, all app chrome CSS, script wiring, fit-to-viewport scaler.
- `AppShell.jsx` — frame, status bar, header, screen router, bottom nav, action bar, calendar sheet.
- `HomeScreen.jsx` — greeting, primary scan CTA, recent letters list.
- `ScanScreen.jsx` — photo (camera + OCR mockup) / paste tiles, sample chips, paste box.
- `ResultScreen.jsx` — hero, risk alerts, summary, extracted fields, checklist, medicine reminders, ask box, tools.
- `LettersScreen.jsx` — filterable list of all letters.
- `HelpScreen.jsx` — interactive FAQ + 111/999/GP contacts.
- `AccountScreen.jsx` — profile, reminder/sharing preferences (real toggles).
- `calendar.js` — Google Calendar URLs + valid `.ics` generation, incl. recurring medicine reminders.
- `Icons.jsx` — Lucide icon set as one `<Icon name/>` component.
- `data.js` — four fake (no real patient data) NHS-style letters/prescription and their parsed output.

> Calendar export creates real artefacts: "Add to my calendar" opens a Google
> Calendar template or downloads a `.ics` (with a 2-hour alarm); a prescription's
> "Set medicine reminders" downloads a `.ics` with daily recurring dose alerts.

## How it's built
Screens compose the design-system components from the bundle
(`window.MedifiDesignSystem_*`): `Button`, `Badge`, `Card`, `Input`, `Eyebrow`,
`RiskFlag`, `ChecklistItem`, `FieldRow`. App-specific chrome (frame, nav, hero,
tiles) is plain CSS in `index.html` using the design tokens. Nothing here
re-implements a primitive — it all leans on the system.
