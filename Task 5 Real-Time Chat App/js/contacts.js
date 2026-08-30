/* TalkBox — contextual reply engine for Vertex Labs colleagues.
 *
 * A reply is built from three things:
 *   1. WHO is answering  — their department, expertise and communication style
 *   2. WHAT was said     — detected intent plus the topics inside the message
 *   3. WHAT CAME BEFORE  — the recent thread, used to resolve references such as
 *                          "the second approach" or "that file"
 *
 * Nothing here is random: the same message to the same person in the same
 * thread always produces the same, on-topic answer.
 */
window.TBContacts = (function () {
  "use strict";

  /* --------------------------- helpers --------------------------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }
  const pick = (arr, seed) => arr[hash(seed) % arr.length];
  const firstName = (n) => String(n || "").split(" ")[0];
  const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1).trim() + "…" : String(s));

  /* --------------------------- intents --------------------------- */
  function detectIntent(text) {
    const t = text.toLowerCase().trim();
    if (!t) return "attachment";
    if (/^(hi|hey|hello|yo|hiya|salam|assalam|good (morning|afternoon|evening))\b/.test(t) && t.length < 45) return "greeting";
    if (/\b(thanks|thank you|thx|cheers|appreciate|nice work|great job|well done|awesome work)\b/.test(t)) return "thanks";
    if (/\b(bug|broken|doesn'?t work|not working|fails?|failing|crash(es|ing)?|error|regression|500|404)\b/.test(t)) return "bug";
    if (/\b(deploy|deployment|pipeline|ci|build|release|rollback|staging|production)\b/.test(t) && /\b(fail|broke|stuck|error|red|down|issue|problem)\b/.test(t)) return "incident";
    if (/\b(spacing|layout|padding|margin|alignment|contrast|font|typography|colou?r|design|ui|ux|mockup|figma)\b/.test(t)) return "design";
    if (/\b(can you|could you|please|would you|send me|share the|pass me|give me|need the)\b/.test(t)) return "request";
    if (/\b(meeting|call|standup|sync|catch up|schedule|calendar|invite)\b/.test(t)) return "meeting";
    if (/\b(deadline|due|by (monday|tuesday|wednesday|thursday|friday|tomorrow|today|friday)|eta|when will|timeline|ship(ping)? date)\b/.test(t)) return "deadline";
    if (/\b(can you take|please handle|assign|own this|pick(ing)? up|you'?ll do|over to you)\b/.test(t)) return "task";
    if (/\b(done|finished|completed|merged|shipped|deployed|updated|pushed|fixed)\b/.test(t)) return "status";
    if (/\b(yes|yep|agreed|sounds good|ok|okay|sure|let'?s do|go ahead|approved)\b/.test(t) && t.length < 60) return "confirmation";
    if (/\?\s*$|^(what|how|why|when|where|who|which|is|are|do|does|did|should|could|can|would|will)\b/.test(t)) return "question";
    return "statement";
  }

  /* --------------------- reference resolution -------------------- */
  const ORDINALS = { first: 1, second: 2, third: 3, fourth: 4, "1st": 1, "2nd": 2, "3rd": 3, one: 1, two: 2, three: 3 };

  function resolveReference(text, history) {
    const t = text.toLowerCase();
    const recent = history.slice(-14);

    // "the second approach / option / idea"
    const ord = t.match(/\b(first|second|third|fourth|1st|2nd|3rd|one|two|three)\b\s+(approach|option|idea|plan|way|solution|suggestion|one)\b/);
    if (ord) {
      const n = ORDINALS[ord[1]];
      for (let i = recent.length - 1; i >= 0; i--) {
        const msg = recent[i];
        if (!msg.text) continue;
        const items = msg.text.split("\n").map((l) => l.replace(/^\s*(?:\d+[.)]|[-*•])\s+/, (mm) => mm)).filter((l) => /^\s*(?:\d+[.)]|[-*•])\s+/.test(l));
        if (items.length >= n) {
          return { kind: "option", n, label: items[n - 1].replace(/^\s*(?:\d+[.)]|[-*•])\s+/, "").trim() };
        }
        const parts = msg.text.split(/\bor\b/i);
        if (parts.length >= n && msg.text.length > 30) {
          return { kind: "option", n, label: clip(parts[n - 1].replace(/[.?]$/, "").trim(), 90) };
        }
      }
      return { kind: "option", n, label: null };
    }

    // "that file / the document / send it over"
    if (/\b(that|the|this)\s+(file|doc|document|report|deck|spec|screenshot|image|pdf|export)\b|\bsend it\b|\bshare it\b/.test(t)) {
      for (let i = recent.length - 1; i >= 0; i--) {
        if (recent[i].file) return { kind: "file", label: recent[i].file.name };
      }
      const named = recent.slice().reverse().find((mm) => mm.text && /\b[\w-]+\.(pdf|csv|json|zip|docx?|xlsx?|png|jpe?g|sql|md)\b/i.test(mm.text));
      if (named) {
        return { kind: "file", label: named.text.match(/\b[\w-]+\.(pdf|csv|json|zip|docx?|xlsx?|png|jpe?g|sql|md)\b/i)[0] };
      }
      const subject = recent.slice().reverse().find((mm) => mm.text && /\b(report|spec|deck|doc|design file|notes|plan)\b/i.test(mm.text));
      if (subject) return { kind: "file", label: clip(subject.text, 70) };
      return { kind: "file", label: null };
    }

    return null;
  }

  /* ------------------- domain-specific substance ----------------- */
  /* Each domain maps topic keywords to answers written in that role's voice. */
  const DOMAINS = {
    engineering: {
      topics: [
        { k: ["deploy", "deployment", "pipeline", "release", "rollback", "production", "staging"], r: [
          "Let's look at the deploy: check whether the failing step is the build or the migration. If it's the build, it's almost always a lockfile drift; if it's the migration, we roll back to the previous image and re-run it manually.",
          "I'd rather roll back first and debug on staging than keep production red. Ahmed can warm the previous image while we read the pipeline logs.",
        ] },
        { k: ["architecture", "design pattern", "refactor", "structure", "scale", "service"], r: [
          "Architecturally I'd keep it boring: one service owns the data, everything else asks it. Splitting it now buys complexity we can't staff.",
          "Before we refactor, let's write down the two failure modes we're actually trying to remove. If the change doesn't remove one of them, it's not worth the churn.",
        ] },
        { k: ["review", "pr", "pull request", "merge", "branch"], r: [
          "Put it up as a draft PR and I'll review it this afternoon. Keep it under ~400 lines if you can — anything bigger and the review quality drops off a cliff.",
          "I'll take the review. Add a short description of the trade-off you chose and I'll approve or push back on that, not on style.",
        ] },
        { k: ["bug", "error", "crash", "failing", "broken"], r: [
          "Send me the stack trace and the commit range. If it started after yesterday's merge, the caching layer is the first suspect and we can flip the flag off in a minute.",
          "Let's reproduce it on staging first. If it only happens in production, it's config or data, not code.",
        ] },
        { k: ["performance", "slow", "latency", "optimi"], r: [
          "Measure before we change anything — p95, not average. Nine times out of ten it's an N+1 query or an unbounded list, not the framework.",
        ] },
        { k: ["estimate", "how long", "eta", "timeline"], r: [
          "Roughly two days for the implementation plus one for review and rollout. I'd commit to Thursday, not Wednesday.",
        ] },
      ],
      generic: [
        "Makes sense. I'll fold it into the current release train and flag it in standup so nobody duplicates the work.",
        "Agreed. Let's do the smallest version behind a flag, watch it for a day, then widen the rollout.",
      ],
      question: "Good question — my instinct is the simpler option, but let me check the code path before I commit to it.",
    },
    frontend: {
      topics: [
        { k: ["spacing", "layout", "css", "responsive", "mobile", "breakpoint", "overflow"], r: [
          "On the frontend side that's a container problem: the flex child needs `min-width: 0` or the long content forces the row wider than the viewport. I'll fix it in the layout component so every screen gets it.",
          "I can tighten that with the spacing tokens rather than one-off margins — 16px on mobile, 24px from the medium breakpoint up.",
        ] },
        { k: ["react", "component", "state", "hook", "rerender", "props"], r: [
          "I'd lift that state one level and pass a callback down — right now two components own the same truth, which is why it flickers.",
          "That re-render is coming from a new object identity in the props each render. Memoising the value fixes it, but the cleaner fix is not creating it inline.",
        ] },
        { k: ["performance", "slow", "bundle", "load time"], r: [
          "I'll profile it — usually it's a large dependency or an unvirtualised list. The last 62KB I removed came from dropping a date library for `Intl`.",
        ] },
        { k: ["bug", "broken", "doesn't work", "not working", "error"], r: [
          "Can you tell me the browser and whether it reproduces after a hard reload? If it's Safari only, it's almost certainly the sticky positioning again. I'll add it to my branch today.",
        ] },
        { k: ["accessib", "screen reader", "keyboard", "contrast", "aria"], r: [
          "I'll fix that properly: real `button` elements, a visible focus ring, and focus moved to the next control when one is removed. Sarah and I agreed on 4.5:1 as the floor.",
        ] },
      ],
      generic: [
        "Got it. I'll implement it in the shared component so we don't fix it in three places.",
        "Reasonable. I'll do it on my current branch and put it in front of Alex for review today.",
      ],
      question: "Depends on where the state lives — let me check the component and I'll answer with the actual constraint rather than a guess.",
    },
    backend: {
      topics: [
        { k: ["database", "query", "sql", "index", "slow", "migration", "schema"], r: [
          "I'd look at the query plan first. If it's a sequential scan on a large table, a composite index on the filter plus the sort column usually takes it from seconds to milliseconds.",
          "Schema change needs a migration with a backfill — I'll write it so it's reversible and run the index build concurrently to avoid locking.",
        ] },
        { k: ["api", "endpoint", "response", "payload", "rest", "contract"], r: [
          "I'll expose it as `GET /v1/…` with cursor pagination and keep the response shape stable. Tell me which fields you need and I'll avoid over-fetching.",
        ] },
        { k: ["error", "500", "failing", "bug", "timeout"], r: [
          "Give me the request id from the response header and I'll pull the trace. A 500 there is usually a timeout downstream rather than our handler.",
        ] },
        { k: ["queue", "job", "async", "retry", "webhook"], r: [
          "That should go through the queue with retries and a dead-letter table — synchronous work in the request path is what makes signups slow.",
        ] },
      ],
      generic: [
        "Noted. I'll write it up as a small change with a migration and a test before I touch production.",
        "I can do that. I'd rather ship it behind a versioned endpoint so existing clients keep working.",
      ],
      question: "Let me confirm against the schema before I answer — I don't want to promise a shape that isn't indexed.",
    },
    design: {
      topics: [
        { k: ["spacing", "padding", "margin", "gap", "layout", "mobile", "responsive", "cramped", "tight"], r: [
          "Agreed on the spacing. On mobile I'd drop the row gap to 8 and the card padding to 16 — the current 24 was scaled for desktop and it pushes the primary action below the fold.",
          "That's a rhythm problem rather than a size problem: everything is spaced the same, so nothing groups. I'll tighten related controls to 8 and keep 24 between sections.",
        ] },
        { k: ["contrast", "colour", "color", "accessib", "readable", "font", "typography", "text size"], r: [
          "I'll raise the contrast to at least 4.5:1 and bump the label to 13px medium. The grey we're using now fails AA on the light background.",
        ] },
        { k: ["flow", "ux", "confusing", "user", "onboarding", "journey"], r: [
          "Let me mock two versions and we test them: one keeps everything on a single screen, the other splits it into two steps. Chloe's study showed people look for controls in the toolbar, not inside the chart.",
        ] },
        { k: ["component", "design system", "token", "consistent", "pattern"], r: [
          "I'll add it to the design system rather than the page, so the spacing and states come from tokens and Ethan can implement it without guessing.",
        ] },
        { k: ["empty state", "loading", "error state", "skeleton"], r: [
          "Every state needs a design, not just the happy one — empty, loading, error and too-much-data. I'll add the four variants to the file today.",
        ] },
      ],
      generic: [
        "Good catch. I'll update the file and drop the before/after in here so you can see the difference.",
        "That's fair feedback. I'll adjust the hierarchy so the primary action reads first and everything else steps back.",
      ],
      question: "From a UX point of view I'd choose the option with fewer decisions on screen — but let me prototype both so we're arguing about pixels, not opinions.",
    },
    product: {
      topics: [
        { k: ["priorit", "roadmap", "scope", "backlog", "next quarter", "cycle"], r: [
          "Where does this sit against dashboard v3? If it isn't blocking the launch, I'd schedule it for the cycle after and keep this one focused.",
        ] },
        { k: ["deadline", "date", "when", "timeline", "launch", "ship"], r: [
          "Beta on the 18th, general availability on the 29th. If this changes either date I need to know today so I can tell Olivia before the campaign is locked.",
        ] },
        { k: ["feature", "request", "customer", "requirement", "spec"], r: [
          "Let me write it up as a proper requirement: the user problem, the success metric and what we're explicitly not doing. Otherwise it grows during build.",
        ] },
        { k: ["metric", "impact", "success", "kpi"], r: [
          "What does success look like numerically? If we can't name the metric that moves, it's a nice-to-have and it goes below the line.",
        ] },
      ],
      generic: [
        "Understood. I'll add it to the roadmap doc with an owner and a rough size so we can decide properly on Monday.",
        "Noted — I'll trade it against something already in the cycle rather than adding it on top.",
      ],
      question: "Good question. My answer depends on impact: tell me who it unblocks and I'll tell you where it lands.",
    },
    research: {
      topics: [
        { k: ["user", "test", "usability", "feedback", "study", "participant", "interview"], r: [
          "I can put it in the next round — six participants is enough to find the big usability problems. I'll write the task so we observe behaviour rather than ask for opinions.",
        ] },
        { k: ["confusing", "ux", "flow", "onboarding", "drop"], r: [
          "That matches what I saw: three of twelve participants looked for the control in the wrong place. It's a placement issue, not a labelling one.",
        ] },
        { k: ["data", "evidence", "assumption", "hypothesis"], r: [
          "Let's phrase it as a hypothesis we can disprove, otherwise we'll read the sessions to confirm what we already believe.",
        ] },
      ],
      generic: [
        "Interesting — I'll add it to the research backlog and see whether the existing session recordings already answer it.",
        "I'll check the study notes; there may already be evidence for that from round two.",
      ],
      question: "I'd want data before answering that — I can get a signal from six sessions by the end of the week.",
    },
    data: {
      topics: [
        { k: ["metric", "kpi", "number", "report", "dashboard", "chart"], r: [
          "I'll pull it and add it to the weekly report. Do you want it by workspace or by cohort? Those two views usually tell different stories.",
        ] },
        { k: ["retention", "churn", "growth", "funnel", "conversion", "activation"], r: [
          "Week-4 retention is 41.2%, up 2.3 points, and activation is flat. The lift is concentrated in workspaces that got the new dashboard, which is suggestive but not yet conclusive.",
        ] },
        { k: ["increase", "decrease", "drop", "spike", "trend", "why"], r: [
          "Before we explain the change, let me check whether the definition changed — half the 'trends' I investigate are instrumentation, not behaviour.",
        ] },
        { k: ["sql", "query", "data", "export", "table"], r: [
          "I can write that query — tell me the date range and the grain you need, and whether you want it as a CSV or a scheduled dashboard tile.",
        ] },
      ],
      generic: [
        "Noted. I'll add a chart for it in the weekly report so we track it rather than ask each time.",
        "Fine by me, with one caveat: the sample is still small, so I'd label it as directional.",
      ],
      question: "Let me query it properly rather than eyeball the dashboard — I'll come back with the number and the caveat.",
    },
    datascience: {
      topics: [
        { k: ["model", "predict", "churn", "score", "accuracy", "ml", "ai"], r: [
          "The churn model is at 0.81 AUC. It's good enough to prioritise outreach, not to forecast revenue — it isn't calibrated for that.",
        ] },
        { k: ["experiment", "a/b", "test", "significan", "sample"], r: [
          "With the current traffic we need about two weeks for that to be significant at 95%. Stopping early is how we end up shipping noise.",
        ] },
        { k: ["python", "notebook", "pandas", "feature"], r: [
          "I'll prototype it in a notebook first, then move the feature computation into the pipeline so it isn't only reproducible on my machine.",
        ] },
      ],
      generic: [
        "I'll look at whether the data supports that. If it does, I'd rather add one strong feature than five weak ones.",
        "Reasonable hypothesis — let me quantify it before we act on it.",
      ],
      question: "I can answer that with a model, but let's agree the success metric first so we know what 'working' means.",
    },
    marketing: {
      topics: [
        { k: ["campaign", "launch", "post", "announce", "social", "email", "newsletter"], r: [
          "I'll build it into the launch sequence: teaser on the 15th, launch post on the 18th, customer story on the 22nd. I need two 2x screenshots and one sentence on the speed improvement.",
        ] },
        { k: ["message", "copy", "headline", "positioning", "wording", "tagline"], r: [
          "Lead with the benefit, not the feature: 'Reports load in under a second' beats 'new caching layer'. I'll write two headlines and we A/B them.",
        ] },
        { k: ["customer", "audience", "segment", "persona"], r: [
          "This lands best with existing admins rather than new signups, so I'd put it in the product email and skip paid entirely.",
        ] },
        { k: ["date", "deadline", "when", "timeline"], r: [
          "The campaign is locked 48 hours before launch, so any change to the date needs to reach me by Thursday morning.",
        ] },
      ],
      generic: [
        "Love it — adding it to the campaign brief now.",
        "That's a great angle for the launch post. I'll draft it and share it for a fact check.",
      ],
      question: "Good question — I'd test two versions rather than guess. Give me a day and I'll bring the numbers.",
    },
    content: {
      topics: [
        { k: ["write", "copy", "docs", "documentation", "release notes", "draft", "edit"], r: [
          "I'll rewrite it: point first, one idea per paragraph, and the warning at the top where people actually read it. Send me the draft and I'll turn it around today.",
        ] },
        { k: ["tone", "style", "jargon", "clear", "wording"], r: [
          "That's a bit jargon-heavy for the audience. Same sentence in plain language is shorter and tests better in support tickets.",
        ] },
        { k: ["blog", "article", "seo", "help centre", "help center", "guide"], r: [
          "I'll structure it as a task-based guide — people search for the thing they're trying to do, not the feature name.",
        ] },
      ],
      generic: [
        "Got it. I'll draft it and put it in review so you can sanity check the technical details.",
        "Noted — I'll fold it into the release notes rather than publishing a separate post.",
      ],
      question: "I'd say keep it short and concrete; if you send me the paragraph I'll show you the edit rather than describe it.",
    },
    qa: {
      topics: [
        { k: ["bug", "broken", "doesn't work", "not working", "fails", "crash", "error", "regression"], r: [
          "I'll log it. Can you give me the exact steps, the device and browser, and whether it happens on staging as well as production? Right now I'd class it as a functional bug until I can reproduce it.",
          "Reproduced. Steps: open the page, trigger the action, observe the failure — it happens on mobile Safari but not Chrome, so I'd bet on the touch handler. Filing it as a blocker for the release.",
        ] },
        { k: ["test", "testing", "coverage", "automation", "suite", "verify"], r: [
          "I'll add it to the regression suite so it can't come back silently. The manual pass takes 40 minutes; automating this case takes an hour and saves it every release.",
        ] },
        { k: ["release", "sign off", "ship", "deploy", "ready"], r: [
          "Latest run: 214 passed, 3 failed — two flaky mocks and one real accessibility issue. I can sign off once that last one is fixed and re-tested.",
        ] },
        { k: ["mobile", "safari", "chrome", "device", "screen"], r: [
          "I'll test it across the matrix: iOS Safari, Android Chrome, desktop Chrome and Firefox, plus a small-screen 320px pass. That's where layout bugs usually surface.",
        ] },
      ],
      generic: [
        "Understood — I'll verify it on staging and report back with the result rather than an impression.",
        "Filed with steps and a severity. I'll re-test as soon as the fix is on staging.",
      ],
      question: "I'd need to reproduce it before answering — send me the steps and I'll confirm within the hour.",
    },
    success: {
      topics: [
        { k: ["customer", "account", "client", "user complain", "churn", "renewal", "escalat"], r: [
          "Two accounts have raised this, including Lumen, who renew in six weeks. I'll tell them it's being looked at — can I give them a rough timeframe?",
        ] },
        { k: ["bug", "issue", "broken", "not working", "error"], r: [
          "I've had three tickets on that today. Workaround for now is to refresh and retry, but I'd like a fix date so I can close the loop with them properly.",
        ] },
        { k: ["feedback", "request", "feature", "ask"], r: [
          "That's the most requested thing from my top accounts right now — the export cap at 50k rows. I'll write it up with the account names attached so it isn't just anecdote.",
        ] },
        { k: ["onboarding", "training", "demo", "call"], r: [
          "I'll cover it in the onboarding call and add it to the welcome sequence so new admins see it in week one.",
        ] },
      ],
      generic: [
        "Thanks — I'll pass that to the customers who asked and log it against their accounts.",
        "Good to know. That unblocks a conversation I'm having tomorrow.",
      ],
      question: "Let me check the account first — I'd rather confirm than promise something we can't deliver.",
    },
    devops: {
      topics: [
        { k: ["deploy", "deployment", "pipeline", "ci", "build", "release", "rollback"], r: [
          "Let's read the pipeline: which step went red? If it's the build, check for lockfile drift; if it's the deploy step, I'll roll back — the previous image is still warm for 30 minutes.",
          "I can redeploy from the last green commit in about four minutes. Rollback is one command now, so we're never stuck with a broken production.",
        ] },
        { k: ["docker", "container", "image", "kubernetes", "infra", "server", "environment"], r: [
          "I'll pin the base image and rebuild — 'works locally, fails in CI' is nearly always an environment difference rather than the code.",
        ] },
        { k: ["monitor", "alert", "logs", "downtime", "incident", "outage"], r: [
          "Alert fired at the same time as the deploy, so treat it as caused by it until proven otherwise. Logs are in the staging stream; I'll pull the last 15 minutes.",
        ] },
        { k: ["slow", "performance", "cost", "cache", "scaling"], r: [
          "I cached the dependency layer and the build dropped four minutes. For runtime cost, the cheapest win is right-sizing the staging instances — they're idle most of the night.",
        ] },
        { k: ["secret", "env", "variable", "config", "key"], r: [
          "Keep it out of the repo — it goes in the environment config and gets injected at deploy time. I'll rotate the current one since it's been in a log.",
        ] },
      ],
      generic: [
        "On it. I'll make the change in the pipeline config and keep the rollback path intact.",
        "Fine — but let's make it reproducible rather than a manual step someone has to remember.",
      ],
      question: "Give me the failing job link and I'll tell you exactly which step broke rather than guessing.",
    },
  };

  const DOMAIN_ALIASES = { assistant: "engineering" };
  const domainOf = (c) => {
    const d = c.domain || "engineering";
    return DOMAINS[DOMAIN_ALIASES[d] || d] ? DOMAINS[DOMAIN_ALIASES[d] || d] : DOMAINS.engineering;
  };

  /* ---------------------- intent openers ------------------------- */
  function opener(intent, contact, seed) {
    const you = "";
    switch (intent) {
      case "greeting":
        return pick([
          "Hey! Good timing — I'm between meetings.",
          "Hi! What are you working on?",
          "Morning. I've got half an hour before standup if you need anything.",
        ], seed + "g");
      case "thanks":
        return pick(["Anytime.", "Happy to help.", "No problem at all."], seed + "t");
      case "bug":
        return pick(["Thanks for flagging that.", "Right, let's get that pinned down."], seed + "b");
      case "incident":
        return pick(["Okay, treating that as priority.", "Let's stop the bleeding first."], seed + "i");
      case "design":
        return pick(["Good eye.", "Yes, I see what you mean."], seed + "d");
      case "request":
        return pick(["Sure.", "Yes, I can do that."], seed + "r");
      case "meeting":
        return pick(["Works for me.", "I can make that."], seed + "m");
      case "deadline":
        return pick(["Let me be realistic about the date.", "On timing:"], seed + "dl");
      case "task":
        return pick(["I'll take it.", "Consider it mine."], seed + "k");
      case "status":
        return pick(["Nice one.", "Great — that unblocks the next bit."], seed + "s");
      case "confirmation":
        return pick(["Agreed.", "Perfect, let's do that."], seed + "c");
      default:
        return you;
    }
  }

  /* ------------------------- closers ----------------------------- */
  function closer(intent, contact, seed) {
    const opts = {
      bug: ["I'll update you as soon as I know more.", "I'll come back with a cause, not just a symptom."],
      incident: ["I'll post an update here in fifteen minutes.", "I'll confirm once production is green again."],
      request: ["Anything else you need with it?", "I'll send it over shortly."],
      meeting: ["I'll send the invite.", "Add anything you want covered to the agenda."],
      deadline: ["Shout if that date doesn't work for you.", "Tell me now if that's too late and I'll re-plan."],
      task: ["I'll flag it in standup so it's visible.", "I'll let you know when it's done."],
      question: ["Does that answer it, or do you want the detail?", "Happy to go deeper if that's useful."],
      design: ["I'll share the updated version here.", "Tell me if that reads better to you."],
    };
    const list = opts[intent];
    return list ? pick(list, seed + "z") : "";
  }

  /* ---------------------- substance picker ----------------------- */
  function substance(contact, text, intent, seed) {
    const dom = domainOf(contact);
    const t = text.toLowerCase();
    let best = null, bestScore = 0;
    dom.topics.forEach((topic) => {
      let s = 0;
      topic.k.forEach((kw) => { if (t.includes(kw)) s += kw.length > 6 ? 2 : 1; });
      if (s > bestScore) { best = topic; bestScore = s; }
    });
    if (best) return pick(best.r, seed);
    if (intent === "question") return dom.question;
    return pick(dom.generic, seed);
  }

  /* --------------------------- main ------------------------------ */
  function reply(contact, text, history, file) {
    const msgs = Array.isArray(history) ? history : [];
    const raw = String(text || "").trim();
    const seed = (contact.id || contact.name) + "|" + raw.toLowerCase();

    if (file && !raw) {
      const isImage = String(file.type || "").startsWith("image/");
      const dom = contact.department || "the team";
      return isImage
        ? "Got the screenshot — thanks. " + substance(contact, "design layout screenshot", "design", seed) +
          "\n\nI'll keep it with the " + dom.toLowerCase() + " notes for reference."
        : "Thanks, I have **" + file.name + "**. I'll read it properly and come back with comments rather than a quick reaction.";
    }

    const intent = detectIntent(raw);
    const ref = resolveReference(raw, msgs);
    const parts = [];

    const op = opener(intent, contact, seed);
    if (op) parts.push(op);

    // reference-aware sentence
    if (ref && ref.kind === "option") {
      parts.push(
        ref.label
          ? "Just to confirm we mean the same thing — option " + ref.n + " was “" + clip(ref.label, 110) + "”. I'm happy with that one."
          : "I want to make sure I pick up the right one — can you paste the option " + ref.n + " line again? I don't want to build the wrong thing."
      );
    } else if (ref && ref.kind === "file") {
      parts.push(
        ref.label
          ? "You mean **" + clip(ref.label, 60) + "** — sending it over now."
          : "Which one do you mean? The last thing I shared here was a link rather than a file, so tell me the name and I'll dig it out."
      );
    }

    // main substance, unless the message was purely social
    if (intent === "greeting" && raw.split(/\s+/).length <= 4) {
      parts.push(contact.context ? "Right now I'm mostly on " + contact.context.replace(/^Owns |^Running |^Working on /i, "").replace(/\.$/, "") + "." : "");
      parts.push("What do you need?");
    } else if (intent === "thanks" && raw.split(/\s+/).length <= 5) {
      parts.push("Ping me whenever — this is my area anyway.");
    } else {
      parts.push(substance(contact, raw, intent, seed));
    }

    const cl = closer(intent, contact, seed);
    if (cl && intent !== "greeting" && intent !== "thanks") parts.push(cl);

    return parts.filter(Boolean).join(" ").replace(/\s{2,}/g, " ").trim();
  }

  /* ------------- ambient background message (role-aware) --------- */
  function ambient(contact) {
    const dom = domainOf(contact);
    const seed = (contact.id || "x") + "|" + Math.floor(Date.now() / 60000);
    const topic = dom.topics[hash(seed) % dom.topics.length];
    return pick(topic.r, seed + "amb");
  }

  return { reply, ambient, detectIntent };
})();
