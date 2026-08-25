/**
 * NEXORA — static demonstration data
 * All content is fictional and exists purely to demonstrate frontend behaviour.
 * Every module reads from window.NEXORA_DATA so content can be edited in one place.
 */
(function () {
  "use strict";

  const services = [
    {
      id: "frontend",
      icon: "code",
      title: "Frontend Engineering",
      short: "High-performance, responsive and scalable interfaces.",
      features: ["Component architecture", "Design-system driven", "Core Web Vitals budgets"],
      detail:
        "We build interface layers that stay fast and maintainable as products grow. Work starts from a token-based design system, moves through reusable component primitives, and ships with measurable performance budgets rather than guesswork.",
      deliverables: [
        "Reusable component library with documented props and states",
        "Responsive layouts verified from 320px to 1920px",
        "Performance budget report with before/after metrics",
      ],
    },
    {
      id: "uiux",
      icon: "pen",
      title: "UI/UX Design",
      short: "Clean, accessible and conversion-focused digital experiences.",
      features: ["Interface systems", "Prototyping", "Usability review"],
      detail:
        "Design decisions are grounded in the flows people actually complete. We map the journey, prototype the risky parts first, then hand over a system that engineering can implement without ambiguity.",
      deliverables: [
        "Journey maps and annotated wireframes",
        "High-fidelity interface system with tokens",
        "Interactive prototype for stakeholder review",
      ],
    },
    {
      id: "web",
      icon: "layers",
      title: "Web Development",
      short: "Modern websites and web applications built around real business needs.",
      features: ["Marketing sites", "Web applications", "Headless content"],
      detail:
        "From editorial marketing sites to complex application shells, we build the whole frontend surface: routing, state, content modelling, and the editing workflow the team will live in after launch.",
      deliverables: [
        "Production frontend with documented architecture",
        "Content model and editing workflow",
        "Deployment checklist and handover session",
      ],
    },
    {
      id: "ai",
      icon: "spark",
      title: "AI-Powered Experiences",
      short: "Intelligent interfaces and automation-driven workflows.",
      features: ["Assistive interfaces", "Workflow automation", "Streaming UI patterns"],
      detail:
        "AI features live or die on interface quality. We design the streaming states, confidence cues, correction paths and fallbacks that make an assistive product feel trustworthy instead of unpredictable.",
      deliverables: [
        "Interaction patterns for streaming and partial results",
        "Fallback and error-recovery flows",
        "Evaluation harness for prompt-driven UI states",
      ],
    },
    {
      id: "perf",
      icon: "gauge",
      title: "Performance Optimization",
      short: "Improve loading speed, Core Web Vitals and overall usability.",
      features: ["Bundle analysis", "Rendering strategy", "Asset pipeline"],
      detail:
        "We profile first and only then change code. Typical work covers render-blocking resources, image strategy, hydration cost, third-party weight and layout stability across real device classes.",
      deliverables: [
        "Audit with prioritised, effort-scored findings",
        "Implementation of the highest-impact fixes",
        "Regression guardrails in CI",
      ],
    },
    {
      id: "seo",
      icon: "search",
      title: "SEO & Accessibility",
      short: "Search-friendly, semantic and accessible frontend experiences.",
      features: ["Semantic structure", "WCAG alignment", "Structured data"],
      detail:
        "Semantic markup serves crawlers and assistive technology at the same time. We correct heading structure, landmarks, focus behaviour, contrast and metadata, then verify with both automated and manual passes.",
      deliverables: [
        "Accessibility audit against WCAG 2.2 AA",
        "Structured data and metadata implementation",
        "Keyboard and screen-reader test report",
      ],
    },
  ];

  const solutions = [
    {
      id: "startup",
      name: "Startup Launch",
      headline: "Get to a credible market presence fast",
      body: "A focused launch surface: positioning, a single strong narrative page, waitlist capture and analytics — built in weeks, not quarters.",
      points: ["Narrative-led landing experience", "Waitlist and lead capture", "Analytics instrumentation"],
      stat: { value: "3 weeks", label: "Typical launch window" },
    },
    {
      id: "business",
      name: "Business Websites",
      headline: "A site that sells while the team sleeps",
      body: "Multi-page marketing sites with clean information architecture, editable content and search-friendly semantics throughout.",
      points: ["Editable content model", "Service and location pages", "Lead routing and forms"],
      stat: { value: "2.1x", label: "Average enquiry uplift" },
    },
    {
      id: "saas",
      name: "SaaS Platforms",
      headline: "Application shells built to scale",
      body: "Routing, permissions-aware navigation, data tables, empty states and settings surfaces designed as one coherent system.",
      points: ["Design-system foundation", "Complex data views", "Onboarding flows"],
      stat: { value: "120+", label: "Components shipped" },
    },
    {
      id: "ecom",
      name: "E-commerce Experiences",
      headline: "Storefronts tuned for conversion",
      body: "Fast catalogue browsing, frictionless filtering and checkout interfaces that hold up on mid-range mobile hardware.",
      points: ["Faceted catalogue browsing", "Optimised media pipeline", "Checkout interface polish"],
      stat: { value: "-38%", label: "Checkout drop-off" },
    },
    {
      id: "dashboard",
      name: "Internal Dashboards",
      headline: "Tools your team actually enjoys using",
      body: "Operational interfaces with dense but readable data, keyboard-first interactions and states designed for real workloads.",
      points: ["Keyboard-first interactions", "Virtualised data grids", "Role-aware layouts"],
      stat: { value: "4.6/5", label: "Internal usability score" },
    },
    {
      id: "aiproduct",
      name: "AI Products",
      headline: "Interfaces for probabilistic systems",
      body: "Streaming responses, source attribution, editable outputs and graceful failure — the patterns that make AI features usable.",
      points: ["Streaming response UI", "Source and confidence cues", "Human-in-the-loop editing"],
      stat: { value: "< 400ms", label: "Time to first token UI" },
    },
    {
      id: "portfolio",
      name: "Portfolio & Personal Brands",
      headline: "Distinctive, fast and memorable",
      body: "Editorial layouts and considered motion that make individual work stand out without sacrificing load time or accessibility.",
      points: ["Editorial art direction", "Case-study templates", "Motion with reduced-motion support"],
      stat: { value: "98", label: "Median Lighthouse score" },
    },
  ];

  const projects = [
    {
      id: "finora",
      title: "Finora",
      subtitle: "FinTech Dashboard",
      category: "FinTech",
      image: "assets/images/work-finora.svg",
      description:
        "A treasury dashboard unifying multi-currency balances, forecasting and approvals into a single operational view.",
      tech: ["React", "TypeScript", "Design System", "Charts"],
      results: "Reporting time cut from hours to minutes",
      challenge:
        "Finance teams reconciled balances across six disconnected tools, exporting spreadsheets daily to answer basic liquidity questions.",
      solution:
        "We designed a consolidated dashboard with a shared data-table primitive, saved views and an approval queue, then rebuilt the frontend around a strict component and token system.",
      timeline: "14 weeks — discovery, design system, build, hardening",
      metrics: [
        { value: "-72%", label: "Reporting time" },
        { value: "1.4s", label: "Largest contentful paint" },
        { value: "96", label: "Lighthouse performance" },
      ],
    },
    {
      id: "auralis",
      title: "Auralis",
      subtitle: "AI Productivity Platform",
      category: "AI",
      image: "assets/images/work-auralis.svg",
      description:
        "An assistive workspace where drafts, summaries and actions stream into the document the user is already editing.",
      tech: ["React", "Streaming UI", "TypeScript", "Accessibility"],
      results: "Adoption of assistive features tripled",
      challenge:
        "The original assistant blocked the editor while generating, and users abandoned the feature before results appeared.",
      solution:
        "We introduced progressive streaming states, inline diff previews, undo-safe application of suggestions and clear confidence cues, all keyboard navigable.",
      timeline: "11 weeks — pattern research, prototype, build",
      metrics: [
        { value: "3.1x", label: "Feature adoption" },
        { value: "380ms", label: "First visible token" },
        { value: "0", label: "Blocking spinners" },
      ],
    },
    {
      id: "vantaflow",
      title: "VantaFlow",
      subtitle: "SaaS Management Platform",
      category: "SaaS",
      image: "assets/images/work-vantaflow.svg",
      description:
        "A workflow platform with permissions-aware navigation, bulk actions and a component library used by four product teams.",
      tech: ["React", "Component Library", "REST APIs", "Testing"],
      results: "Four teams shipping from one system",
      challenge:
        "Each squad had built its own buttons, tables and modals, producing an inconsistent product and duplicated maintenance work.",
      solution:
        "We extracted a documented component library with accessibility baked in, migrated the three heaviest surfaces, and set up visual regression checks.",
      timeline: "16 weeks — audit, library, migration",
      metrics: [
        { value: "-41%", label: "UI defect rate" },
        { value: "120+", label: "Shared components" },
        { value: "4", label: "Teams onboarded" },
      ],
    },
    {
      id: "lumio",
      title: "Lumio",
      subtitle: "E-commerce Experience",
      category: "E-commerce",
      image: "assets/images/work-lumio.svg",
      description:
        "A storefront rebuilt around instant filtering, responsive media and a checkout that stays usable on slow connections.",
      tech: ["JavaScript", "CSS Architecture", "Performance", "SEO"],
      results: "Materially lower checkout abandonment",
      challenge:
        "Catalogue pages shipped oversized imagery and blocking scripts, and mobile shoppers dropped out before reaching payment.",
      solution:
        "We rebuilt the media pipeline, moved filtering to the client with URL-synced state, and simplified the checkout into progressive, validated steps.",
      timeline: "9 weeks — audit, rebuild, launch",
      metrics: [
        { value: "-38%", label: "Checkout drop-off" },
        { value: "-64%", label: "Image payload" },
        { value: "2.0s", label: "Mobile load time" },
      ],
    },
    {
      id: "northgate",
      title: "Northgate",
      subtitle: "Corporate Web Platform",
      category: "Business",
      image: "assets/images/work-northgate.svg",
      description:
        "A multi-region corporate site with editable content, structured data and full keyboard accessibility.",
      tech: ["Semantic HTML", "CSS", "Accessibility", "SEO"],
      results: "WCAG 2.2 AA conformance achieved",
      challenge:
        "A legacy site failed accessibility review, blocked public-sector procurement and was impossible for marketing to update.",
      solution:
        "We rebuilt the frontend semantically, corrected landmark and heading structure, added visible focus throughout and shipped an editor-friendly content model.",
      timeline: "12 weeks — audit, rebuild, certification support",
      metrics: [
        { value: "AA", label: "WCAG 2.2 level" },
        { value: "+58%", label: "Organic sessions" },
        { value: "0", label: "Critical a11y issues" },
      ],
    },
    {
      id: "orbitdesk",
      title: "OrbitDesk",
      subtitle: "Operations Console",
      category: "SaaS",
      image: "assets/images/work-orbitdesk.svg",
      description:
        "A dense operations console with virtualised tables, command palette navigation and offline-tolerant drafts.",
      tech: ["React", "Virtualisation", "TypeScript", "LocalStorage"],
      results: "Task completion time nearly halved",
      challenge:
        "Support agents navigated eight clicks deep to resolve routine tickets and lost work whenever connectivity dropped.",
      solution:
        "We added a command palette, virtualised the ticket grid, and persisted in-progress drafts locally so nothing is lost on reload.",
      timeline: "10 weeks — research, build, rollout",
      metrics: [
        { value: "-47%", label: "Task completion time" },
        { value: "10k", label: "Rows rendered smoothly" },
        { value: "100%", label: "Draft recovery" },
      ],
    },
  ];

  const processSteps = [
    {
      num: "01",
      name: "Discover",
      short: "Understand goals, users and business requirements.",
      body: "We start with the commercial objective, not the interface. Stakeholder interviews, analytics review and a competitive scan establish what success actually looks like before any pixels exist.",
      points: ["Stakeholder interviews", "Analytics and funnel review", "Success metric definition"],
      duration: "1–2 weeks",
    },
    {
      num: "02",
      name: "Define",
      short: "Plan architecture, content and user flows.",
      body: "Information architecture, content model and technical approach are agreed and written down. Risky assumptions get flagged here, where changing direction is still cheap.",
      points: ["Information architecture", "Content modelling", "Technical approach document"],
      duration: "1 week",
    },
    {
      num: "03",
      name: "Design",
      short: "Create the visual system and interface.",
      body: "We build a token-based design system first, then compose screens from it. Every state — hover, focus, loading, empty, error — is designed rather than improvised during build.",
      points: ["Token and component system", "Key screen design", "All interaction states"],
      duration: "2–3 weeks",
    },
    {
      num: "04",
      name: "Develop",
      short: "Build responsive and interactive frontend components.",
      body: "Implementation happens component-first with accessibility and responsiveness as build-time requirements, not a later cleanup pass. Progress is reviewable continuously.",
      points: ["Component-first implementation", "Responsive from 320px up", "Continuous review builds"],
      duration: "3–6 weeks",
    },
    {
      num: "05",
      name: "Test",
      short: "Test functionality, responsiveness, accessibility and performance.",
      body: "Cross-browser checks, keyboard and screen-reader passes, real-device testing and performance budgets are verified before anything is called done.",
      points: ["Cross-browser matrix", "Keyboard and screen-reader passes", "Performance budget verification"],
      duration: "1–2 weeks",
    },
    {
      num: "06",
      name: "Launch",
      short: "Prepare the final product for production.",
      body: "Release checklist, monitoring, documentation and a handover session so the team owning the product afterwards is genuinely equipped to run it.",
      points: ["Release checklist", "Documentation and handover", "Post-launch monitoring window"],
      duration: "1 week",
    },
  ];

  const technologies = [
    { name: "HTML5", icon: "code", desc: "Semantic structure and landmark-driven markup." },
    { name: "CSS3", icon: "palette", desc: "Modern layout, custom properties and container-aware design." },
    { name: "JavaScript", icon: "js", desc: "Modular ES2020+ with progressive enhancement." },
    { name: "React", icon: "atom", desc: "Component architecture for complex application state." },
    { name: "TypeScript", icon: "ts", desc: "Type-safe interfaces across large codebases." },
    { name: "Git", icon: "branch", desc: "Disciplined branching and reviewable history." },
    { name: "GitHub", icon: "github", desc: "Pull-request workflow with automated checks." },
    { name: "REST APIs", icon: "plug", desc: "Resilient data fetching, caching and error states." },
    { name: "Responsive Design", icon: "devices", desc: "Fluid layouts verified from 320px to 1920px." },
    { name: "Accessibility", icon: "a11y", desc: "WCAG 2.2 AA practices applied from the first commit." },
  ];

  const values = [
    { title: "Performance-first development", desc: "Budgets agreed up front and enforced in CI." },
    { title: "Mobile-first architecture", desc: "Layouts designed at 320px before they scale up." },
    { title: "Accessibility-focused UI", desc: "Keyboard, contrast and screen-reader support by default." },
    { title: "Clean component architecture", desc: "Small, composable units with clear responsibilities." },
    { title: "SEO-friendly implementation", desc: "Semantic markup, metadata and structured data." },
    { title: "Maintainable code", desc: "Readable naming, documented decisions, no dead paths." },
    { title: "Cross-browser compatibility", desc: "Verified in Chrome, Edge, Firefox and Safari." },
    { title: "Security-conscious frontend", desc: "Safe rendering, validated input, no secret leakage." },
    { title: "Scalable architecture", desc: "Systems that survive new teams and new requirements." },
    { title: "User-centered design", desc: "Decisions validated against real task completion." },
  ];

  const testimonials = [
    {
      name: "Amara Whitfield",
      role: "Head of Product",
      company: "Finora (demo client)",
      initials: "AW",
      rating: 5,
      quote:
        "The team replaced a fragmented reporting flow with one console our finance leads genuinely enjoy. Everything shipped was documented, tested and handed over cleanly.",
    },
    {
      name: "Daniel Okoye",
      role: "CTO",
      company: "VantaFlow (demo client)",
      initials: "DO",
      rating: 5,
      quote:
        "We had four squads building four different button components. NEXORA extracted one library, migrated our heaviest surfaces and our UI defect rate dropped noticeably within a quarter.",
    },
    {
      name: "Sofia Marchetti",
      role: "Design Director",
      company: "Lumio (demo client)",
      initials: "SM",
      rating: 5,
      quote:
        "Rare to find engineers who treat design tokens as a contract. The build matched the system exactly, and the mobile experience finally feels first-class.",
    },
    {
      name: "Rehan Malik",
      role: "Founder",
      company: "Auralis (demo client)",
      initials: "RM",
      rating: 5,
      quote:
        "They understood that an AI feature is mostly an interface problem. Streaming states and undo-safe edits turned a demo people ignored into the thing they log in for.",
    },
    {
      name: "Elena Kovács",
      role: "Accessibility Lead",
      company: "Northgate (demo client)",
      initials: "EK",
      rating: 5,
      quote:
        "The accessibility work was thorough rather than cosmetic — landmarks, focus order and real screen-reader testing. We cleared our AA review without remediation rounds.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      desc: "For individuals and small projects that need a credible presence quickly.",
      monthly: 490,
      yearly: 4700,
      features: [
        "Up to 5 responsive pages",
        "Design system foundation",
        "Contact and lead forms",
        "Basic SEO setup",
        "2 revision rounds",
        "30 days of post-launch support",
      ],
      cta: "Start with Starter",
      featured: false,
    },
    {
      name: "Professional",
      desc: "For growing businesses that need depth, integrations and ongoing iteration.",
      monthly: 1290,
      yearly: 12400,
      features: [
        "Up to 15 pages or app screens",
        "Full component library",
        "Advanced animations and interactions",
        "Performance optimisation pass",
        "Accessibility audit (WCAG 2.2 AA)",
        "Unlimited revision rounds",
        "90 days of post-launch support",
      ],
      cta: "Choose Professional",
      featured: true,
    },
    {
      name: "Enterprise",
      desc: "For larger products and organisations with multiple teams and stakeholders.",
      monthly: 3450,
      yearly: 33100,
      features: [
        "Unlimited pages and product surfaces",
        "Multi-team design system governance",
        "Dedicated frontend architect",
        "Automated testing and CI guardrails",
        "Security and compliance review support",
        "Priority SLA response",
        "12 months of partnership support",
      ],
      cta: "Talk to us",
      featured: false,
    },
  ];

  const faqs = [
    {
      q: "How long does a typical project take?",
      a: "A focused marketing site usually runs three to five weeks. A product interface with a design system typically runs ten to sixteen weeks. We confirm the range after discovery, once scope and dependencies are clear.",
    },
    {
      q: "Which technologies do you build with?",
      a: "Semantic HTML, modern CSS and JavaScript form the base. For application work we use React with TypeScript and a token-based design system. We choose the smallest stack that solves the problem rather than defaulting to the largest.",
    },
    {
      q: "Is everything responsive across devices?",
      a: "Yes. Layouts are designed mobile-first and verified at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 pixels. Sections are reorganised for smaller screens rather than simply scaled down.",
    },
    {
      q: "How do revisions work?",
      a: "Starter includes two structured revision rounds; Professional and Enterprise include unlimited rounds inside the agreed scope. Feedback is collected per milestone so changes stay cheap and traceable.",
    },
    {
      q: "Do you offer maintenance after launch?",
      a: "Every plan includes a post-launch support window. Beyond that we offer monthly retainers covering dependency updates, performance monitoring, accessibility regression checks and small feature work.",
    },
    {
      q: "Will the site be optimised for search engines?",
      a: "Search readiness is part of the build: semantic structure, correct heading hierarchy, metadata, structured data, sensible internal linking and fast loading. We do not treat SEO as a separate bolt-on phase.",
    },
    {
      q: "How do you approach accessibility?",
      a: "We target WCAG 2.2 AA. That means keyboard operability, visible focus, sufficient contrast, correct ARIA usage, accessible forms and reduced-motion support — verified with both automated tooling and manual screen-reader passes.",
    },
    {
      q: "What kind of support do you provide?",
      a: "A named point of contact, a shared project board and scheduled check-ins. Enterprise engagements add a priority response SLA and a dedicated frontend architect.",
    },
    {
      q: "Can you build fully custom functionality?",
      a: "Yes. Custom interaction patterns, data visualisation, command interfaces and assistive AI surfaces are core work for us. We prototype the riskiest interaction first so feasibility is proven early.",
    },
  ];

  const articles = [
    {
      id: "a1",
      category: "Development",
      title: "Designing component APIs that survive three redesigns",
      date: "12 Jun 2026",
      read: "8 min read",
      image: "assets/images/insight-dev.svg",
      excerpt:
        "Component interfaces outlive the visuals they were built for. A look at the prop-design decisions that keep libraries usable through repeated brand changes.",
      body: [
        "Most component libraries do not fail because of styling. They fail because their public interface encodes today's visual decisions as permanent structure — a prop called isBlueHeader ages badly the moment the brand changes.",
        "The durable pattern is to describe intent rather than appearance. Variants named primary, subtle and destructive keep meaning when the palette shifts. Slots beat a growing list of boolean flags, because composition absorbs requirements a flag list cannot anticipate.",
        "Treat every prop as a contract you will support for years. Before adding one, ask whether composition already solves the case. Libraries that answer that question honestly stay small, and small libraries are the ones teams keep using.",
      ],
    },
    {
      id: "a2",
      category: "Design",
      title: "Motion that clarifies instead of decorates",
      date: "28 May 2026",
      read: "6 min read",
      image: "assets/images/insight-design.svg",
      excerpt:
        "Interface motion should explain a state change. When animation exists only to impress, it costs attention and adds perceived latency.",
      body: [
        "Useful motion answers a question: where did this come from, what changed, and where should I look next. Animation that does not answer one of those is decoration, and decoration accumulates cost across every interaction.",
        "Practical constraints help. Keep transitions between 150 and 400 milliseconds, use easing curves that decelerate into rest, and animate transform and opacity so the compositor does the work.",
        "Finally, honour prefers-reduced-motion properly. Reduced motion does not mean a broken interface — it means the same information delivered without vestibular risk.",
      ],
    },
    {
      id: "a3",
      category: "Performance",
      title: "A pragmatic Core Web Vitals audit checklist",
      date: "14 May 2026",
      read: "9 min read",
      image: "assets/images/insight-perf.svg",
      excerpt:
        "Field data first, lab data second. The order in which you investigate performance problems determines how much time you waste.",
      body: [
        "Start with field data. Lab tools tell you what a synthetic device experienced once; field data tells you what your actual users experience across networks and hardware you will never own.",
        "Then work in priority order: render-blocking resources, image weight and dimensions, font loading strategy, third-party scripts, and finally hydration cost. In most audits the first three account for the majority of the gain.",
        "Guard the result. A performance fix without a CI budget is temporary — the next feature branch will quietly undo it.",
      ],
    },
    {
      id: "a4",
      category: "AI",
      title: "Interface patterns for probabilistic systems",
      date: "02 May 2026",
      read: "7 min read",
      image: "assets/images/insight-ai.svg",
      excerpt:
        "AI features fail on interface design more often than on model quality. Streaming, attribution and correction paths do the heavy lifting.",
      body: [
        "Users forgive a wrong answer far more readily than an opaque one. The interface must communicate that output is generated, show where it came from, and make correction a first-class action rather than a workaround.",
        "Stream partial results as soon as they exist. A visible first token within a few hundred milliseconds changes perceived quality more than a marginally better model.",
        "Design the failure path deliberately: timeouts, refusals and low-confidence answers all need a defined, non-alarming presentation.",
      ],
    },
    {
      id: "a5",
      category: "Accessibility",
      title: "Focus management beyond the tab key",
      date: "19 Apr 2026",
      read: "10 min read",
      image: "assets/images/insight-a11y.svg",
      excerpt:
        "Dialogs, drawers and command palettes all need deliberate focus handling. Here is the behaviour to implement and how to verify it.",
      body: [
        "Opening an overlay should move focus into it, trap focus while it is open, close on Escape, and return focus to the trigger on dismissal. Each of those four steps is regularly missed, and missing any one strands keyboard users.",
        "Focus must also be visible. Removing outlines without an equivalent replacement is one of the most common accessibility regressions in modern interfaces.",
        "Verify by putting the mouse away. Complete the full journey with the keyboard alone, then repeat it with a screen reader — automated tooling will not catch a broken focus order.",
      ],
    },
    {
      id: "a6",
      category: "SEO",
      title: "Semantic HTML as a shared foundation",
      date: "05 Apr 2026",
      read: "5 min read",
      image: "assets/images/insight-seo.svg",
      excerpt:
        "The markup that helps crawlers understand a page is largely the same markup that helps assistive technology navigate it.",
      body: [
        "A correct heading hierarchy, real landmarks and descriptive link text serve search engines and screen readers simultaneously. Optimising for one usually improves the other for free.",
        "Div-based layouts with styled spans acting as headings lose that shared benefit. The visual result may match the design, but the structural meaning is gone.",
        "Structured data extends the same idea: describe what the content is, not how it looks. Semantics first, presentation second.",
      ],
    },
  ];

  const stats = [
    { value: 48, suffix: "+", label: "Projects Delivered" },
    { value: 97, suffix: "%", label: "Client Satisfaction" },
    { value: 12, suffix: "+", label: "Digital Products" },
    { value: 24, suffix: "/7", label: "Global Support" },
  ];

  const bigStats = [
    { value: 48, suffix: "+", label: "Projects shipped" },
    { value: 97, suffix: "%", label: "Client satisfaction" },
    { value: 2.4, suffix: "s", label: "Average load time", decimals: 1 },
    { value: 99.9, suffix: "%", label: "Platform availability", decimals: 1 },
  ];

  window.NEXORA_DATA = {
    services,
    solutions,
    projects,
    processSteps,
    technologies,
    values,
    testimonials,
    plans,
    faqs,
    articles,
    stats,
    bigStats,
  };
})();
