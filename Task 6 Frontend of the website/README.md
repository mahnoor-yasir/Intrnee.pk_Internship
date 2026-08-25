# NEXORA — Digital Product Studio Website

A fully functional, dependency-free front-end product built with semantic HTML, modern CSS and vanilla JavaScript (ES5-safe modules on a single `NEXORA` namespace). No build step, no frameworks — open `index.html` and everything works.

## Highlights

- **Multi-step checkout** — plan review → payment → processing → success, with Luhn card validation, live card preview, monthly/yearly pricing and simulated payment persisted locally.
- **Customer dashboard** — overview, usage meters, billing (change plan, cancel/reactivate), activity timeline, account and settings tabs.
- **Rich detail modals** — case studies with metrics, services with process steps and deliverables, insight articles with full content and bookmarking.
- **Global search (Ctrl/⌘ + K)** — searches services, work, insights and FAQs with keyboard navigation.
- **FAQ live filtering** with result counter and empty state.
- **Saved library** — bookmark articles and manage them in a dedicated panel.
- **Project inquiry wizard** — 3-step qualification flow with validation and a generated reference number.
- **Hash router** — deep links such as `#/work/finora`, `#/services/frontend`, `#/insights/a1`, `#/pricing`, `#/checkout/professional`, `#/dashboard`, `#/saved`, `#/inquiry`, with working back button.
- **Preferences** — dark/light/system theme, reduced motion, compact density; all persisted.
- **Accessibility** — focus-trapped dialogs, ARIA roles, keyboard support, visible focus states, `prefers-reduced-motion` respected.

## Getting started

```sh
# any static server works
npx serve .
# or simply open index.html in a browser
```

## Project structure

```
index.html            Markup shell; sections are rendered from data
css/
  style.css           Design tokens, layout, base components
  animations.css      Scroll reveals, transitions, preloader
  responsive.css      Breakpoints
  app.css             Overlays, checkout, dashboard, saved, wizard
js/
  data.js             Services, projects, articles, FAQs, plans
  data-extra.js       Plan limits, service processes, case-study metrics
  icons.js            Inline SVG icon set
  store.js            localStorage state: subscription, bookmarks, activity
  overlay.js          Accessible dialog factory (focus trap, ESC, scrim)
  theme.js            Theme handling incl. system preference
  prefs.js            Preferences panel + saved library
  pricing.js          Billing cycle state and pricing grid
  components.js       Renders all data-driven sections
  checkout.js         Multi-step checkout + card validation
  dashboard.js        Customer dashboard views
  inquiry.js          Project inquiry wizard
  filters.js          Work/insight filtering
  search.js           Command palette search
  forms.js            Form validation + toasts
  navigation.js       Header, drawer, smooth scroll
  animations.js       Intersection-observer reveals
  router.js           Hash router for deep links
  main.js             Boot sequence
```

## Simulated backend

There is no server. `store.js` keeps state in `localStorage` under the `nexora:*` keys:

- `nexora:subscription` — active plan, billing cycle, status, renewal date
- `nexora:bookmarks` — saved article ids
- `nexora:activity` — activity/timeline entries
- `nexora:prefs` — theme, motion, density

Clear site data to reset the demo. No real payment is processed and no card data leaves the browser.

## Browser support

Latest Chrome, Edge, Firefox and Safari. Graceful degradation when JavaScript is unavailable: content sections still render from markup where possible.

