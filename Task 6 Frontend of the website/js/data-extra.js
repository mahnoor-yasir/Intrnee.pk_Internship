/**
 * NEXORA — extended demonstration data
 * Augments window.NEXORA_DATA with the richer content required by the
 * checkout, dashboard, case-study, article and technology experiences.
 * Loaded after data.js so it can merge onto the existing records.
 */
(function () {
  "use strict";

  const D = window.NEXORA_DATA;
  if (!D) return;

  /* ------------------------------------------------------------------ */
  /* Plans — three tiers with monthly / yearly pricing                   */
  /* ------------------------------------------------------------------ */

  D.plans = [
    {
      id: "starter",
      name: "Starter",
      desc: "For individuals and small projects that need a credible presence quickly.",
      monthly: 490,
      yearly: 4704, // 20% saving versus 12 monthly payments
      cta: "Choose Starter",
      featured: false,
      highlight: "Best for launch pages",
      limits: { pages: 5, seats: 2, requests: 6 },
      features: [
        "Up to 5 responsive pages",
        "Design system foundation",
        "Contact and lead forms",
        "Basic SEO setup",
        "2 revision rounds",
        "30 days of post-launch support",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      desc: "For growing businesses that need depth, integrations and ongoing iteration.",
      monthly: 1290,
      yearly: 12384,
      cta: "Choose Professional",
      featured: true,
      highlight: "Most chosen engagement",
      limits: { pages: 15, seats: 8, requests: 20 },
      features: [
        "Up to 15 pages or app screens",
        "Full component library",
        "Advanced animations and interactions",
        "Performance optimisation pass",
        "Accessibility audit (WCAG 2.2 AA)",
        "Unlimited revision rounds",
        "90 days of post-launch support",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      desc: "For larger products and organisations with multiple teams and stakeholders.",
      monthly: 3450,
      yearly: 33120,
      cta: "Choose Enterprise",
      featured: false,
      highlight: "Multi-team governance",
      limits: { pages: 60, seats: 25, requests: 60 },
      features: [
        "Unlimited pages and product surfaces",
        "Multi-team design system governance",
        "Dedicated frontend architect",
        "Automated testing and CI guardrails",
        "Security and compliance review support",
        "Priority SLA response",
        "12 months of partnership support",
      ],
    },
  ];

  D.yearlySavingPercent = 20;

  /* ------------------------------------------------------------------ */
  /* Service details                                                     */
  /* ------------------------------------------------------------------ */

  const serviceExtra = {
    frontend: {
      timeline: "6–12 weeks",
      process: ["Architecture review", "Token and primitive layer", "Component build", "Performance hardening"],
      benefits: ["Predictable delivery velocity", "One shared interface language", "Measurable Core Web Vitals"],
      tech: ["React", "TypeScript", "CSS Architecture", "Vite"],
    },
    uiux: {
      timeline: "4–8 weeks",
      process: ["Discovery interviews", "Flow mapping", "Interface system", "Prototype validation"],
      benefits: ["Fewer build-time ambiguities", "Higher task completion", "Reusable visual language"],
      tech: ["Figma", "Design Tokens", "Prototyping", "Usability Testing"],
    },
    web: {
      timeline: "5–10 weeks",
      process: ["Content modelling", "Template system", "Build and integrate", "Editor handover"],
      benefits: ["Marketing can ship without engineering", "Search-ready structure", "Documented architecture"],
      tech: ["Semantic HTML", "JavaScript", "Headless CMS", "REST APIs"],
    },
    ai: {
      timeline: "6–14 weeks",
      process: ["Pattern research", "Streaming prototype", "Failure-path design", "Evaluation harness"],
      benefits: ["Trustworthy assistive UX", "Lower perceived latency", "Graceful degradation"],
      tech: ["Streaming UI", "React", "TypeScript", "Evaluation Tooling"],
    },
    perf: {
      timeline: "2–5 weeks",
      process: ["Field data review", "Profiling", "Highest-impact fixes", "CI budgets"],
      benefits: ["Faster real-user loading", "Lower bounce on mobile", "Regressions caught in CI"],
      tech: ["Lighthouse", "Web Vitals", "Bundle Analysis", "Image Pipeline"],
    },
    seo: {
      timeline: "2–6 weeks",
      process: ["Automated audit", "Manual keyboard pass", "Remediation", "Verification report"],
      benefits: ["WCAG 2.2 AA alignment", "Better crawl clarity", "Procurement-ready compliance"],
      tech: ["Semantic HTML", "ARIA", "Structured Data", "Screen Readers"],
    },
  };

  D.services.forEach(function (s) {
    const extra = serviceExtra[s.id] || {};
    s.timeline = extra.timeline || "4–10 weeks";
    s.process = extra.process || [];
    s.benefits = extra.benefits || [];
    s.stack = extra.tech || s.features;
  });

  /* ------------------------------------------------------------------ */
  /* Case study details                                                  */
  /* ------------------------------------------------------------------ */

  const projectExtra = {
    finora: {
      industry: "Financial operations",
      team: "5 people — 1 architect, 2 engineers, 1 designer, 1 QA",
      features: [
        "Multi-currency balance consolidation",
        "Saved views with URL-synced state",
        "Approval queue with audit trail",
        "Forecast charts with keyboard navigation",
      ],
      performance: [
        { label: "Lighthouse performance", value: "96 / 100" },
        { label: "Largest contentful paint", value: "1.4s" },
        { label: "Interaction to next paint", value: "112ms" },
      ],
    },
    auralis: {
      industry: "AI productivity software",
      team: "4 people — 1 architect, 2 engineers, 1 interaction designer",
      features: [
        "Token-level streaming responses",
        "Inline diff preview before apply",
        "Undo-safe suggestion application",
        "Confidence and source cues",
      ],
      performance: [
        { label: "First visible token", value: "380ms" },
        { label: "Lighthouse performance", value: "94 / 100" },
        { label: "Blocking spinners", value: "0" },
      ],
    },
    vantaflow: {
      industry: "B2B SaaS workflow",
      team: "6 people — 2 engineers, 1 architect, 1 designer, 2 QA",
      features: [
        "Documented 120-component library",
        "Permissions-aware navigation",
        "Bulk actions with optimistic UI",
        "Visual regression pipeline",
      ],
      performance: [
        { label: "UI defect rate", value: "-41%" },
        { label: "Bundle size", value: "-28%" },
        { label: "Components shared", value: "120+" },
      ],
    },
    lumio: {
      industry: "Direct-to-consumer retail",
      team: "4 people — 2 engineers, 1 designer, 1 performance specialist",
      features: [
        "Instant client-side faceted filtering",
        "Responsive art-directed media",
        "Progressive validated checkout",
        "Offline-tolerant cart state",
      ],
      performance: [
        { label: "Mobile load time", value: "2.0s" },
        { label: "Image payload", value: "-64%" },
        { label: "Checkout drop-off", value: "-38%" },
      ],
    },
    northgate: {
      industry: "Corporate / public sector",
      team: "5 people — 2 engineers, 1 designer, 1 accessibility lead, 1 editor",
      features: [
        "Landmark-correct semantic rebuild",
        "Multi-region content model",
        "Visible focus system",
        "Structured data across templates",
      ],
      performance: [
        { label: "WCAG conformance", value: "2.2 AA" },
        { label: "Organic sessions", value: "+58%" },
        { label: "Critical a11y issues", value: "0" },
      ],
    },
    orbitdesk: {
      industry: "Customer operations",
      team: "5 people — 3 engineers, 1 designer, 1 researcher",
      features: [
        "Command palette navigation",
        "Virtualised 10k-row ticket grid",
        "Locally persisted drafts",
        "Dense but readable data layout",
      ],
      performance: [
        { label: "Task completion time", value: "-47%" },
        { label: "Rows rendered", value: "10,000" },
        { label: "Draft recovery", value: "100%" },
      ],
    },
  };

  D.projects.forEach(function (p) {
    const extra = projectExtra[p.id] || {};
    p.industry = extra.industry || "Technology";
    p.team = extra.team || "4 people";
    p.keyFeatures = extra.features || [];
    p.performance = extra.performance || [];
  });

  /* ------------------------------------------------------------------ */
  /* Article details                                                     */
  /* ------------------------------------------------------------------ */

  const authors = {
    a1: "Imran Qureshi — Frontend Architect",
    a2: "Lena Fischer — Interaction Designer",
    a3: "Marcus Bell — Performance Engineer",
    a4: "Priya Raman — AI Interface Lead",
    a5: "Elena Kovács — Accessibility Lead",
    a6: "Tomas Halvorsen — Semantics & SEO",
  };

  D.articles.forEach(function (a) {
    a.author = authors[a.id] || "NEXORA Studio";
  });

  /* ------------------------------------------------------------------ */
  /* Technology details                                                  */
  /* ------------------------------------------------------------------ */

  const techExtra = {
    HTML5: {
      purpose: "Document structure and meaning.",
      why: "Semantics are the cheapest accessibility and SEO win available, so every build starts here.",
      example: "Rebuilding Northgate with correct landmarks cleared a WCAG 2.2 AA review without remediation rounds.",
    },
    CSS3: {
      purpose: "Layout, theming and motion.",
      why: "Custom properties let one token change ripple through an entire product safely.",
      example: "Lumio's storefront theme switches light and dark surfaces from a single token layer.",
    },
    JavaScript: {
      purpose: "Interaction and state on the client.",
      why: "Modular vanilla JavaScript keeps small products fast without shipping a framework runtime.",
      example: "This site's checkout, dashboard and search all run on framework-free modules.",
    },
    React: {
      purpose: "Component architecture for complex applications.",
      why: "Composition scales better than templates once state and permissions get complicated.",
      example: "VantaFlow's 120-component library is consumed by four independent product teams.",
    },
    TypeScript: {
      purpose: "Type-safe contracts across a codebase.",
      why: "Types document intent and catch integration mistakes before review, not after release.",
      example: "Finora's data-table primitive exposes one typed API used by nine screens.",
    },
    Git: {
      purpose: "Version control and change history.",
      why: "Small reviewable commits make regressions traceable to a single decision.",
      example: "Every NEXORA engagement hands over a readable history, not one squashed import commit.",
    },
    GitHub: {
      purpose: "Collaboration and automated checks.",
      why: "Pull-request automation is where performance and accessibility budgets are actually enforced.",
      example: "OrbitDesk's CI blocks merges that regress the interaction budget.",
    },
    "REST APIs": {
      purpose: "Data exchange with backend services.",
      why: "Resilient fetching, caching and error states decide how a product feels on a bad network.",
      example: "Auralis streams partial responses and degrades to a retry path instead of a dead spinner.",
    },
    "Responsive Design": {
      purpose: "Layouts that adapt to any viewport.",
      why: "Most traffic is mid-range mobile, so 320px is the design starting point rather than an afterthought.",
      example: "Every NEXORA build is verified at 320, 390, 768, 1024, 1440 and 1920 pixels.",
    },
    Accessibility: {
      purpose: "Usable interfaces for everyone.",
      why: "Keyboard operability and visible focus are build requirements, not optional polish.",
      example: "This site's modals trap focus and return it to the element that opened them.",
    },
  };

  D.technologies.forEach(function (t) {
    const extra = techExtra[t.name] || {};
    t.purpose = extra.purpose || t.desc;
    t.why = extra.why || "Chosen for longevity and maintainability rather than novelty.";
    t.example = extra.example || "Applied across NEXORA demonstration projects.";
  });

  /* ------------------------------------------------------------------ */
  /* Inquiry wizard options                                              */
  /* ------------------------------------------------------------------ */

  D.inquiry = {
    needs: ["Website", "Web Application", "SaaS Product", "Dashboard", "E-commerce", "AI Product", "Other"],
    budgets: ["Under $5k", "$5k – $15k", "$15k – $40k", "$40k – $100k", "$100k+"],
    timelines: ["ASAP (under 4 weeks)", "1–2 months", "3–6 months", "Flexible / planning ahead"],
    contactMethods: ["Email", "Video call", "Phone"],
  };

  D.countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "Sweden",
    "United Arab Emirates",
    "Pakistan",
    "India",
    "Singapore",
    "Japan",
    "Brazil",
    "Other",
  ];
})();
