/* TalkBox — Vertex Labs workspace data
 * Single source of truth for the company directory, employee personalities
 * and their realistic starting conversation history.
 *
 * There are no randomly invented people: every member of the workspace is
 * defined here, and People search only ever searches this directory.
 */
window.TB_SEED = (function () {
  "use strict";

  const now = Date.now();
  const m = (mins) => now - mins * 60000;
  let seq = 0;
  const id = () => "m" + (now + ++seq).toString(36) + Math.random().toString(36).slice(2, 6);
  const them = (t, at) => ({ id: id(), from: "them", text: t, at, reactions: {} });
  const me = (t, at) => ({ id: id(), from: "me", text: t, at, reactions: {}, status: "read" });
  const initialsOf = (n) =>
    String(n || "?").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  /* ------------------------------------------------------------------ *
   * Employees — Vertex Labs
   * expertise  : topic keywords the contextual engine matches against
   * style       : how they write (used by the response engine)
   * ------------------------------------------------------------------ */
  const employees = [
    {
      id: "alex", name: "Alex Morgan", username: "@alex.morgan",
      role: "Engineering Lead", department: "Engineering", domain: "engineering",
      a1: "#5b7cfa", a2: "#3f52c9", online: true, pinned: true, open: true,
      personality: "Direct, calm under pressure, decides quickly and explains the trade-off.",
      style: "short paragraphs, concrete next step, mentions ownership",
      expertise: ["architecture", "deployment", "code review", "release planning", "tech debt", "APIs"],
      interests: ["distributed systems", "developer experience", "incident reviews"],
      context: "Owns the platform rewrite and the weekly release train.",
      messages: [
        them("Release train for 2.4 is cut. I froze the branch at 18:00 yesterday.", m(212)),
        me("Nice. Anything risky in it?", m(208)),
        them("Two things: the new caching layer and Ahmed's pipeline change. I'd ship the cache behind a flag and turn it on for 10% first.", m(205)),
        me("Agreed, let's flag it.", m(200)),
        them("Done. Code review queue is down to three PRs if you want to take a look.", m(196)),
      ],
    },
    {
      id: "ethan", name: "Ethan Brooks", username: "@ethan.brooks",
      role: "Senior Frontend Engineer", department: "Engineering", domain: "frontend",
      a1: "#6366f1", a2: "#4338ca", online: true, open: true,
      personality: "Detail-obsessed about the browser, pragmatic about scope.",
      style: "technical, references components and specific files",
      expertise: ["React", "CSS", "accessibility", "performance", "state management", "design system"],
      interests: ["rendering performance", "bundle size", "component APIs"],
      context: "Rebuilding the dashboard filters and the shared component library.",
      messages: [
        them("Dashboard filter refactor is on staging. Bundle dropped 62KB after I dropped the date library.", m(140)),
        me("Any regressions in the filter state?", m(136)),
        them("One: the URL sync loses the range when you switch tabs quickly. I'm debouncing it now.", m(133)),
      ],
    },
    {
      id: "noah", name: "Noah Williams", username: "@noah.williams",
      role: "Backend Engineer", department: "Engineering", domain: "backend",
      a1: "#2fb98a", a2: "#128a68", online: false, lastSeen: "40 minutes ago",
      personality: "Methodical, thinks in schemas and failure modes.",
      style: "precise, mentions endpoints, queries and latency numbers",
      expertise: ["databases", "SQL", "API design", "queues", "caching", "migrations"],
      interests: ["Postgres internals", "idempotency", "observability"],
      context: "Owns the reporting API and the events pipeline.",
      messages: [
        them("Reporting endpoint p95 was 1.8s. Added a composite index on (workspace_id, created_at) and it's at 240ms now.", m(320)),
        me("That's a big win. Is the migration already applied on prod?", m(316)),
        them("Applied this morning, zero downtime — it was a concurrent index build.", m(310)),
      ],
    },
    {
      id: "priya", name: "Priya Raman", username: "@priya.raman",
      role: "Software Engineer", department: "Engineering", domain: "engineering",
      a1: "#0ea5a5", a2: "#0f766e", online: true,
      personality: "Curious, fast learner, asks clarifying questions before coding.",
      style: "friendly, asks one clarifying question, proposes a small first step",
      expertise: ["JavaScript", "testing", "refactoring", "integrations", "documentation"],
      interests: ["clean code", "developer tooling", "pair programming"],
      context: "Working on the notifications service and the onboarding checklist.",
      messages: [
        them("Notifications service is behind a queue now, so a slow email provider can't block signups.", m(600)),
        me("Great. Did you add retries?", m(596)),
        them("Yes, three attempts with exponential backoff, then it lands in a dead-letter table I can replay.", m(590)),
      ],
    },
    {
      id: "sarah", name: "Sarah Wilson", username: "@sarah.wilson",
      role: "Product Designer", department: "Product & Design", domain: "design",
      a1: "#ef7d5a", a2: "#d94f6a", online: true, pinned: true, open: true, unread: 1,
      personality: "Warm, opinionated about clarity, always thinks mobile-first.",
      style: "concrete design language: spacing, hierarchy, contrast, states",
      expertise: ["UI", "UX", "accessibility", "design system", "spacing", "typography", "prototypes"],
      interests: ["design tokens", "motion", "empty states"],
      context: "Redesigning the analytics dashboard and maintaining the Vertex design system.",
      messages: [
        them("I reviewed the latest dashboard design.", m(96)),
        me("Great. Did you notice any spacing issues on mobile?", m(93)),
        them("Yes — the filter controls need tighter spacing on small screens. I dropped the row gap from 16 to 8 and the cards from 24 to 16.", m(90)),
        me("Perfect, that matches what QA reported.", m(86)),
        them("I also raised the label contrast to 4.6:1 so it passes AA. New file is in the Dashboard v3 page.", m(82)),
      ],
    },
    {
      id: "mia", name: "Mia Thompson", username: "@mia.thompson",
      role: "Product Manager", department: "Product & Design", domain: "product",
      a1: "#e0559b", a2: "#a8266f", online: true, open: true,
      personality: "Structured, protective of scope, always asks about impact.",
      style: "prioritises, references the roadmap, sets dates",
      expertise: ["roadmap", "scope", "requirements", "priorities", "release planning", "metrics"],
      interests: ["user research", "cycle time", "launch readiness"],
      context: "Owns the Q3 roadmap and the dashboard v3 launch.",
      messages: [
        them("Dashboard v3 is the only P0 for this cycle — everything else slides unless it blocks the launch.", m(260)),
        me("What's the target date?", m(256)),
        them("Beta with ten workspaces on the 18th, general availability on the 29th. I need the flagged cache decision from Alex before Friday.", m(250)),
      ],
    },
    {
      id: "chloe", name: "Chloe Dubois", username: "@chloe.dubois",
      role: "UX Researcher", department: "Product & Design", domain: "research",
      a1: "#a06ef0", a2: "#6d3fd0", online: false, lastSeen: "2 hours ago",
      personality: "Evidence-first, gently challenges assumptions.",
      style: "quotes participants, cites sample sizes, separates signal from noise",
      expertise: ["usability testing", "interviews", "research", "user feedback", "surveys"],
      interests: ["diary studies", "onboarding drop-off", "accessibility research"],
      context: "Running the dashboard usability study with 12 participants.",
      messages: [
        them("Round two of the dashboard study is done — 12 participants, 9 completed the filter task unaided.", m(430)),
        me("What tripped up the other three?", m(425)),
        them("All three looked for the date range inside the chart instead of the toolbar. That's a placement problem, not a labelling one.", m(420)),
      ],
    },
    {
      id: "daniel", name: "Daniel Carter", username: "@daniel.carter",
      role: "Data Analyst", department: "Data", domain: "data",
      a1: "#3fb6f0", a2: "#1f7fc0", online: false, lastSeen: "1 hour ago", open: true,
      personality: "Sceptical of small samples, loves a clean definition.",
      style: "leads with the number, then the caveat",
      expertise: ["metrics", "KPIs", "reports", "dashboards", "SQL", "funnels", "retention"],
      interests: ["cohort analysis", "metric definitions", "experiment readouts"],
      context: "Owns the weekly KPI report and the activation funnel.",
      messages: [
        them("Weekly report is out. Week-4 retention is 41.2%, up 2.3 points.", m(330)),
        me("Is that the flag rollout or seasonality?", m(326)),
        them("Probably the rollout, but I only have nine days of data — I'd wait for a full two weeks before we put it in the board deck.", m(320)),
      ],
    },
    {
      id: "sofia", name: "Sofia Rossi", username: "@sofia.rossi",
      role: "Data Scientist", department: "Data", domain: "datascience",
      a1: "#14b8a6", a2: "#0d9488", online: true,
      personality: "Rigorous, explains models in plain language.",
      style: "explains method, then confidence, then limitation",
      expertise: ["modelling", "experiments", "statistics", "forecasting", "Python", "churn"],
      interests: ["A/B testing", "feature engineering", "model monitoring"],
      context: "Building the churn-risk model used by Customer Success.",
      messages: [
        them("Churn model v2 is at 0.81 AUC. Biggest signal is a drop in weekly active seats, not support tickets.", m(500)),
        me("Can James use it yet?", m(494)),
        them("Yes for prioritising outreach, no for forecasting revenue — it's not calibrated for that.", m(488)),
      ],
    },
    {
      id: "olivia", name: "Olivia Smith", username: "@olivia.smith",
      role: "Marketing Manager", department: "Marketing", domain: "marketing",
      a1: "#f0a93f", a2: "#d07a12", online: true, open: true,
      personality: "High energy, benefit-first, deadline driven.",
      style: "campaign language, offers two options, names the channel",
      expertise: ["campaigns", "launches", "positioning", "messaging", "email", "social"],
      interests: ["launch sequencing", "landing pages", "customer stories"],
      context: "Running the dashboard v3 launch campaign.",
      messages: [
        them("Launch campaign is drafted: teaser on the 15th, launch post on the 18th, customer story on the 22nd.", m(1400)),
        me("What do you need from us?", m(1394)),
        them("Two product screenshots at 2x and one sentence on the speed improvement — Daniel's 240ms number would land really well.", m(1388)),
      ],
    },
    {
      id: "emma-brown", name: "Emma Brown", username: "@emma.brown",
      role: "Content Strategist", department: "Marketing", domain: "content",
      a1: "#8b5cf6", a2: "#6d28d9", online: false, lastSeen: "yesterday",
      personality: "Precise editor, allergic to jargon.",
      style: "rewrites your sentence, explains the edit in one line",
      expertise: ["writing", "editing", "docs", "release notes", "tone of voice", "SEO"],
      interests: ["information architecture", "plain language", "style guides"],
      context: "Owns release notes, help docs and the Vertex tone of voice guide.",
      messages: [
        them("Release notes for 2.4 are in review. I cut them from 600 words to 220.", m(1500)),
        me("Did you keep the migration warning?", m(1495)),
        them("Kept it and moved it to the top with a bold heading — nobody reads warnings at the bottom.", m(1490)),
      ],
    },
    {
      id: "emma", name: "Emma Davis", username: "@emma.davis",
      role: "QA Engineer", department: "QA", domain: "qa",
      a1: "#22c55e", a2: "#15803d", online: true, open: true, unread: 1,
      personality: "Systematic, never reports a bug without steps.",
      style: "steps to reproduce, environment, severity",
      expertise: ["testing", "bugs", "regression", "reproduction", "automation", "release sign-off"],
      interests: ["edge cases", "test data", "flaky tests"],
      context: "Owns the regression suite and release sign-off for 2.4.",
      messages: [
        them("Regression run on 2.4-rc2: 214 passed, 3 failed. Two are flaky network mocks, one is real.", m(150)),
        me("Which one is real?", m(146)),
        them("The filter chip keeps focus after you remove it, so the screen reader announces a control that no longer exists. Steps: open dashboard, add a filter, remove it with the keyboard. Severity: minor, accessibility.", m(142)),
      ],
    },
    {
      id: "james", name: "James Anderson", username: "@james.anderson",
      role: "Customer Success Manager", department: "Operations", domain: "success",
      a1: "#f59e0b", a2: "#b45309", online: false, lastSeen: "yesterday",
      personality: "Empathetic, always translates customer pain into a request.",
      style: "names the account, quantifies the impact, asks for a date",
      expertise: ["customers", "onboarding", "feedback", "renewals", "escalations", "support"],
      interests: ["health scores", "QBRs", "adoption"],
      context: "Handles the top 20 accounts and the renewal pipeline.",
      messages: [
        them("Northwind renewed for another year, and Lumen asked about the export limit again.", m(2600)),
        me("How big is the export they need?", m(2590)),
        them("About 400k rows. Right now we cap at 50k, which is the single biggest complaint from my top accounts.", m(2584)),
      ],
    },
    {
      id: "ahmed", name: "Ahmed Khan", username: "@ahmed.khan",
      role: "DevOps Engineer", department: "Operations", domain: "devops",
      a1: "#ef4444", a2: "#b91c1c", online: true,
      personality: "Blunt, pragmatic, obsessed with reproducible builds.",
      style: "mentions pipelines, logs, metrics and rollback plans",
      expertise: ["CI/CD", "deployment", "infrastructure", "monitoring", "Docker", "rollback"],
      interests: ["build caching", "alert fatigue", "cost control"],
      context: "Owns the CI pipeline, staging environments and on-call rota.",
      messages: [
        them("Pipeline is 4 minutes faster after I cached the dependency layer.", m(700)),
        me("Any change to the deploy steps?", m(694)),
        them("Same steps, but rollback is now a single command and keeps the previous image warm for 30 minutes.", m(688)),
      ],
    },
  ];

  const directory = employees.map((e) => ({
    id: e.id, name: e.name, username: e.username, role: e.role,
    department: e.department, domain: e.domain, initials: initialsOf(e.name),
    a1: e.a1, a2: e.a2, online: !!e.online, lastSeen: e.lastSeen || null,
    personality: e.personality, style: e.style, expertise: e.expertise,
    interests: e.interests, context: e.context,
  }));

  const toConversation = (e) => ({
    id: e.id, name: e.name, username: e.username, role: e.role,
    department: e.department, domain: e.domain, initials: initialsOf(e.name),
    a1: e.a1, a2: e.a2, online: !!e.online, lastSeen: e.lastSeen || null,
    pinned: !!e.pinned, muted: !!e.muted, unread: e.unread || 0, bot: false,
    personality: e.personality, style: e.style, expertise: e.expertise,
    interests: e.interests, context: e.context,
    draft: "", pins: [], messages: (e.messages || []).slice(),
  });

  const assistant = {
    id: "assistant", name: "TalkBox Assistant", username: "@assistant",
    role: "AI assistant", department: "Vertex Labs", domain: "assistant",
    initials: "TB", a1: "#4f6bed", a2: "#7b5bfa", online: true, lastSeen: null,
    pinned: true, muted: false, unread: 1, bot: true,
    personality: "Helpful, direct, technically deep.",
    style: "markdown, examples, code blocks",
    expertise: ["programming", "web development", "science", "maths", "writing", "career"],
    interests: [], context: "General-purpose AI assistant inside TalkBox.",
    draft: "", pins: [],
    messages: [
      them(
        "Hi! I'm the **TalkBox Assistant**.\n\nAsk me anything — programming (JavaScript, React, Python, CSS, SQL), computer science, maths and science, writing and rewriting, study or career questions, or everyday problem solving. I keep the context of our conversation, so follow-up questions like *“now explain that line by line”* work fine.\n\nTwo modes are available:\n\n1. **Live AI** — connect a model in Settings → AI assistant for full large-language-model answers.\n2. **Offline reference mode** — works with no network at all, using a built-in knowledge base. It is genuinely useful but it is not a large language model, and it will always say so.\n\nWhat would you like to start with?",
        m(240)
      ),
    ],
  };

  return {
    company: {
      name: "Vertex Labs",
      tagline: "Internal communication for the Vertex Labs team",
      departments: ["Engineering", "Product & Design", "Data", "Marketing", "QA", "Operations"],
    },
    me: { name: "You", initials: "YO", status: "Active now", role: "Product Engineer · Vertex Labs" },
    directory,
    employees,
    conversations: [assistant].concat(employees.filter((e) => e.open).map(toConversation)),
    conversationFor: (dirEntry) => {
      const e = employees.find((x) => x.id === dirEntry.id);
      return toConversation(e || dirEntry);
    },
  };
})();
