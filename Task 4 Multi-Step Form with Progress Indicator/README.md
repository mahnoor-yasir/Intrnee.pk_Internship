# FormFlow Smart Multi-Step Application Platform

A production-quality, fully responsive multi-step application form built with **plain HTML, CSS and
vanilla JavaScript**. No build step, no framework, no backend, no internet connection required.

Open `index.html` in a browser and the complete application runs.

---

## Features

**Multi-step flow**

- Five clearly separated steps: Personal Information, Professional Information, Preferences,
  Additional Details, Review & Confirm.
- Dynamic progress indicator: current step, total steps, step names, percentage and animated bar.
- Completed / current / upcoming / locked step states in the sidebar and the mobile drawer.
- Click any completed or available step to jump back; forward jumps to incomplete steps are blocked.
- Data entered in later steps is preserved when you return to an earlier step.

**Validation**

- Required fields, email format, international phone formats, URL format, number ranges,
  character limits, date-of-birth restrictions (no future dates, realistic age), file type and
  file size, and a required confirmation checkbox.
- Errors appear on blur (never before a field has been used), on **Continue**, and on submit.
- Each invalid field gets a visible error state, `aria-invalid`, and an error message linked via
  `aria-describedby`.
- A step-level summary ("Please fix 3 errors before continuing.") lists every problem; clicking an
  entry focuses and scrolls to the relevant field.

**Autosave & draft recovery**

- Saves to `localStorage` on every field change (debounced), on every step change, every 30 seconds
  as a backup, and before the page unloads.
- Status pill shows `Saving…`, `Saved just now`, `Last saved X minutes ago`, or a storage error.
- On return, a recovery dialog offers **Continue where you left off** or **Start a new form**.
  Saved data is never overwritten without confirmation.
- Draft management: Save & Exit, resume, clear draft (with confirmation).

**Review, submission & history**

- Review screen groups every answer into Personal / Professional / Preferences / Additional cards,
  each with its own **Edit** button that returns to the matching step.
- Submit stays disabled until the accuracy checkbox is ticked and every step validates.
- Success screen with animated check, reference number (`FF-2026-XXXXXX`), timestamp, summary,
  **Start New Form** and **View Submitted Data**.
- Local submission history (up to 25 entries): reference, date, name, email, status, expandable
  detail view and delete with confirmation.

**Files**

- Drag-and-drop plus browse, type and size validation, file preview (image thumbnail or format
  badge), size display, ready status and remove. Files are handled entirely in the browser; nothing
  is uploaded anywhere.

**Design & experience**

- Deep slate foundation, soft neutral surfaces, indigo accent, subtle borders, soft shadows.
- Complete light **and** dark theme with a toggle; the choice is remembered in `localStorage`.
- Toast notifications for saves, restores, deletions, submissions, file events and theme changes.
- Micro-interactions on buttons, inputs, checkboxes, progress bar, step transitions and success.
- `prefers-reduced-motion` disables non-essential motion.

**Accessibility**

- Semantic HTML, real labels, `aria-describedby`, `aria-invalid`, `aria-current="step"`, a
  progressbar role with live values, live regions for status, focus-visible styles everywhere.
- Full keyboard support: Tab / Shift+Tab, Enter and Space on custom controls, Escape to close
  dialogs, focus trapping inside dialogs with focus restored on close, and a skip link.

**Responsive**

- Verified from 1920px down to 360px: sidebar shell on desktop, compact header with a collapsible
  step drawer and sticky navigation on mobile. No horizontal scrolling or clipped controls.

---

## Technologies

- HTML5 (semantic markup)
- CSS3 (custom properties, grid, flexbox, container-free responsive layout, keyframe animations)
- Vanilla JavaScript (ES2019, no dependencies, no bundler)
- Browser `localStorage` and the `FileReader` API

There are **no external libraries, fonts, CDNs or network requests**. The app works fully offline.

---

## Project Structure

```
FormFlow/
├── index.html              Application shell and markup
├── css/
│   ├── style.css           Design system, components, layout
│   ├── responsive.css      Breakpoints from 1920px down to 360px
│   └── animations.css      Keyframes, micro-interactions, reduced-motion
├── js/
│   ├── utils.js            DOM/format helpers, reference numbers, file reading
│   ├── storage.js          Guarded localStorage wrapper (draft, theme, history)
│   ├── validation.js       Pure validation rules for fields and files
│   ├── ui.js               Toasts, accessible dialogs, theme, focus helpers
│   ├── form.js             Schema, state, rendering, navigation, submission
│   └── app.js              Event wiring, draft recovery, history management
└── README.md
```

Every file referenced by the application is included; there are no missing dependencies.

---

## How to Run

1. Extract the ZIP file.
2. Open the extracted `FormFlow` folder.
3. Double-click `index.html`.
4. The application opens in your default browser and is immediately usable.

No `npm install`, no dev server, no database, no API keys, no configuration.

---

## Browser Compatibility

Tested against current versions of Chrome, Edge, Firefox and Safari (desktop and mobile).
Requires a browser that supports CSS custom properties and ES2019 — any browser released from
2020 onward.

---

## Data Storage

All data stays on your device:

- `formflow.draft.v1` — the in-progress form (autosaved draft)
- `formflow.history.v1` — locally stored submissions
- `formflow.theme.v1` — light/dark preference

Nothing is transmitted to a server. Clearing your browser storage removes drafts and history.
If `localStorage` is disabled, the app still works — it warns you that autosave is unavailable
instead of failing.
