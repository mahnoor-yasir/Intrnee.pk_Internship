# TalkBox — Vertex Labs

## Built-in 100-question assistant
This edition includes a local predefined knowledge pack with exactly 100 questions across programming, web development, AI/data, science, mathematics, history/geography, careers/business, writing/study, computing/security, and general knowledge. No API key or paid AI provider is required for these predefined answers. Small wording, case, and punctuation variations are matched locally. Questions outside the pack receive a clear limitation message rather than a fabricated answer.

# TalkBox — Conversations, beautifully connected.

A premium chat application for the fictional **Vertex Labs** workspace.
Plain HTML, CSS and JavaScript — no build step and no dependencies. The only server-side
piece is the small AI proxy that keeps the model API key off the frontend.

## Run it

**Extract the ZIP and open `index.html`.** Any modern browser works.

- Served from the deployed TalkBox project (or any host that also serves
  `/api/public/talkbox-chat`), the Assistant works immediately with no API key.
- Opened straight from disk (`file://`), point the Assistant at your own provider in
  **Settings → AI assistant** (or set the service endpoint to the deployed absolute URL).

## Files

```
index.html          entry point
css/styles.css      design tokens, components, markdown/code styles, responsive rules
js/data.js          Vertex Labs directory (14 people) + seeded conversation histories
js/markdown.js      safe markdown renderer (bold, italic, lists, quotes, code blocks)
js/ai.js            AI layer: real LLM calls via the TalkBox service or your own provider
js/contacts.js      contextual colleague reply engine (intent + domain knowledge)
js/app.js           state, rendering, persistence, all interactions
assets/favicon.svg  app icon
README.md
```

## AI assistant — a real, general-purpose AI

Every Assistant answer is generated dynamically by a live language model. There is no
keyword matching, no scripted reply and no fixed knowledge base: ask about science, history,
maths, code, writing, careers or anything else and the model answers from its own reasoning.
The whole conversation is sent as context, so follow-ups like "explain that in simpler terms"
work naturally. Answers are rendered as markdown, including fenced code blocks with
one-click copy.

Configure it in **Settings → AI assistant**:

1. **TalkBox AI service** (default) — the browser posts the conversation to
   `/api/public/talkbox-chat`, a serverless endpoint that calls the model with a key that
   exists **only on the server**. No secret is ever present in the frontend.
2. **Custom OpenAI-compatible provider** — any `/chat/completions` endpoint (OpenAI,
   OpenRouter, Groq, Together, a local server). Base URL, model and API key are stored only
   in your own browser's `localStorage`.

**Connection status** is shown in Settings and as a header badge, and **Test connection**
runs a real round-trip to the model. If the model cannot be reached, the Assistant says so
with the specific reason (bad key, no credits, rate limit, network/CORS) instead of faking
an answer.


## Conversations

- 14 Vertex Labs colleagues across Engineering, Design, Product, Data, Marketing, Success and QA.
- Each has a role, expertise, personality and an ongoing project thread seeded with real history.
- Replies are **contextual, not random**: the engine detects intent (bug report, review request,
  design feedback, scheduling, status update, question) and resolves references like
  "that file" or "the second option".
- **People search is directory-only** — you can start a chat with any of the 14 members;
  unknown names return "No team member found." There is no arbitrary contact creation.

## Other features

- Independent message history per conversation; switching never loses messages
- Image & file attachments, client-side downscaling, lightbox, per-chat Shared Media
- Reactions, reply, copy, pin, delete, in-chat search, per-conversation drafts
- Typing / "thinking" indicators, sent/delivered/read ticks, unread badges, ambient activity
- Code blocks with language labels and one-click copy
- Light / dark / system themes, toasts, sounds, export to JSON, full reset
- Full localStorage persistence (`talkbox.state.v3`), corruption-safe and quota-safe
- Responsive at 1440 / 1200 / 992 / 768 / 480 / 375 px with no horizontal overflow

## Keyboard shortcuts

`Ctrl/⌘+K` search · `Ctrl/⌘+F` in-chat search · `Ctrl/⌘+N` new conversation · `Ctrl/⌘+J` theme ·
`Ctrl/⌘+,` settings · `Enter` send · `Shift+Enter` newline · `Esc` close overlays

