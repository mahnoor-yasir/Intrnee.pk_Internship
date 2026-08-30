/* TalkBox — application logic (frontend only, no backend) */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const KEY = "talkbox.state.v3";
  const uid = () => "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initialsOf = (n) => String(n || "?").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const SEED = window.TB_SEED || { me: {}, conversations: [], directory: [], company: {} };
  const DIRECTORY = SEED.directory || [];
  const COMPANY = SEED.company || { name: "Vertex Labs" };

  /* ---------------- state ---------------- */
  const defaults = () => ({
    v: 3,
    me: Object.assign({ name: "You", initials: "YO", status: "Active now" }, SEED.me),
    settings: { theme: "light", sound: false, toast: true, auto: true, ambient: true, enterSends: true },
    activeId: "assistant",
    conversations: JSON.parse(JSON.stringify(SEED.conversations || [])),
  });

  function sanitize(raw) {
    const d = defaults();
    if (!raw || typeof raw !== "object") return d;
    const out = d;
    out.settings = Object.assign(d.settings, raw.settings && typeof raw.settings === "object" ? raw.settings : {});
    out.me = Object.assign(d.me, raw.me && typeof raw.me === "object" ? raw.me : {});
    if (Array.isArray(raw.conversations) && raw.conversations.length) {
      // Only known workspace members (or the assistant) can exist as conversations.
      const allowed = new Set(DIRECTORY.map((p) => p.id).concat(["assistant"]));
      out.conversations = raw.conversations
        .filter((c) => c && typeof c === "object" && c.id && c.name && allowed.has(String(c.id)))
        .map((c) => {
        const dir = DIRECTORY.find((p) => p.id === String(c.id)) || {};
        return {
        id: String(c.id), name: dir.name || String(c.name), username: dir.username || c.username || "@" + String(c.name).toLowerCase().replace(/\s+/g, "."),
        role: dir.role || c.role || "Vertex Labs", initials: dir.initials || c.initials || initialsOf(c.name),
        department: dir.department || c.department || "Vertex Labs", domain: dir.domain || c.domain || "engineering",
        personality: dir.personality || c.personality || "", style: dir.style || c.style || "",
        expertise: dir.expertise || c.expertise || [], interests: dir.interests || c.interests || [],
        context: dir.context || c.context || "",
        a1: dir.a1 || c.a1 || "#5b7cfa", a2: dir.a2 || c.a2 || "#3f52c9",
        online: c.online !== undefined ? !!c.online : !!dir.online,
        lastSeen: c.lastSeen || dir.lastSeen || null, pinned: !!c.pinned, muted: !!c.muted,
        unread: Number(c.unread) || 0, bot: !!c.bot,
        draft: typeof c.draft === "string" ? c.draft : "",
        pins: Array.isArray(c.pins) ? c.pins.filter((x) => typeof x === "string") : [],
        messages: (Array.isArray(c.messages) ? c.messages : []).filter((m) => m && typeof m === "object").map((m) => ({
          id: m.id || uid(), from: m.from === "me" ? "me" : "them", text: typeof m.text === "string" ? m.text : "",
          at: Number(m.at) || Date.now(), reactions: m.reactions && typeof m.reactions === "object" ? m.reactions : {},
          status: m.status || "read", replyTo: m.replyTo && typeof m.replyTo === "object" ? m.replyTo : null,
          file: m.file && typeof m.file === "object" ? {
            name: String(m.file.name || "file"), size: String(m.file.size || ""), type: String(m.file.type || "file"),
            dataUrl: typeof m.file.dataUrl === "string" ? m.file.dataUrl : null,
          } : null,
        })),
        };
      });
      if (!out.conversations.length) out.conversations = d.conversations;
    }
    out.activeId = out.conversations.some((c) => c.id === raw.activeId) ? raw.activeId : out.conversations[0].id;
    return out;
  }

  let state;
  try {
    const raw = localStorage.getItem(KEY);
    state = sanitize(raw ? JSON.parse(raw) : null);
  } catch (e) {
    console.warn("TalkBox: stored data was unreadable — starting from defaults.", e);
    try { localStorage.removeItem(KEY); } catch (_) {}
    state = defaults();
  }

  let saveTimer, warnedQuota = false;
  function writeNow() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) {
      // quota: drop the oldest image payloads (keep the message + a note) and retry
      const withImages = [];
      state.conversations.forEach((c) => c.messages.forEach((m) => { if (m.file && m.file.dataUrl) withImages.push(m); }));
      withImages.sort((a, b) => a.at - b.at);
      let dropped = 0;
      while (withImages.length && dropped < 40) {
        const m = withImages.shift(); m.file.dataUrl = null; m.file.evicted = true; dropped++;
        try { localStorage.setItem(KEY, JSON.stringify(state)); 
          if (!warnedQuota) { warnedQuota = true; toast("Storage almost full", "Older image previews were removed so new messages could be saved."); }
          return true;
        } catch (_) { /* keep dropping */ }
      }
      if (!warnedQuota) { warnedQuota = true; toast("Storage full", "Could not save everything locally."); }
      return false;
    }
  }
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(writeNow, 140); }
  window.addEventListener("beforeunload", () => { clearTimeout(saveTimer); writeNow(); });

  const conv = (id = state.activeId) => state.conversations.find((c) => c.id === id) || null;
  const lastMsg = (c) => c.messages[c.messages.length - 1];
  const sortConvs = () => [...state.conversations].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return (lastMsg(b)?.at || 0) - (lastMsg(a)?.at || 0);
  });

  /* ---------------- time ---------------- */
  const timeStr = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  function relStr(t) {
    if (!t) return "";
    const d = Date.now() - t, day = 86400000;
    if (d < 60000) return "now";
    if (d < 3600000) return Math.floor(d / 60000) + "m";
    if (new Date(t).toDateString() === new Date().toDateString()) return timeStr(t);
    if (d < 2 * day) return "Yesterday";
    if (d < 7 * day) return new Date(t).toLocaleDateString([], { weekday: "short" });
    return new Date(t).toLocaleDateString([], { day: "2-digit", month: "short" });
  }
  function dayLabel(t) {
    const d = new Date(t), today = new Date(), y = new Date(Date.now() - 86400000);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === y.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  }

  /* ---------------- theme ---------------- */
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const t = state.settings.theme;
    const resolved = t === "system" ? (mq.matches ? "dark" : "light") : t;
    document.documentElement.setAttribute("data-theme", resolved);
    $("#themeIcon").textContent = resolved === "dark" ? "☀" : "◐";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "dark" ? "#0c0f17" : "#4f6bed");
  }
  if (mq.addEventListener) mq.addEventListener("change", () => { if (state.settings.theme === "system") applyTheme(); });

  /* ---------------- toasts + sound ---------------- */
  function toast(title, body) {
    if (!state.settings.toast) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<strong>${esc(title)}</strong><small>${esc(body || "")}</small>`;
    $("#toasts").appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 220); }, 3200);
  }
  let actx;
  function ping() {
    if (!state.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = 660; o.type = "sine"; g.gain.value = 0.05;
      o.connect(g).connect(actx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.18);
      o.stop(actx.currentTime + 0.2);
    } catch (e) { /* audio unavailable */ }
  }

  /* ---------------- mobile view routing ---------------- */
  const app = $("#app");
  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
  function setView(v) { app.dataset.view = v; }
  function showChatView() { if (isMobile()) setView("chat"); }
  function showListView() { if (isMobile()) setView("list"); }

  /* ---------------- sidebar list ---------------- */
  function renderList() {
    const q = $("#searchInput").value.trim().toLowerCase();
    const list = $("#convList");
    const items = sortConvs().filter((c) => {
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || (c.username || "").toLowerCase().includes(q) ||
        (c.role || "").toLowerCase().includes(q) || c.messages.some((m) => (m.text || "").toLowerCase().includes(q));
    });
    list.innerHTML = "";
    if (!items.length) {
      list.innerHTML = `<p class="muted" style="padding:24px 10px;text-align:center;font-size:13px">No conversations match “${esc(q)}”.<br><button class="chip" type="button" id="searchPeopleFromList" style="margin-top:12px">Search people instead</button></p>`;
      const b = $("#searchPeopleFromList");
      if (b) b.addEventListener("click", () => openPeople(q));
      return;
    }
    let group = null;
    const frag = document.createDocumentFragment();
    items.forEach((c, i) => {
      const g = c.pinned ? "Pinned" : "All conversations";
      if (g !== group) { group = g; const h = document.createElement("div"); h.className = "conv-group"; h.textContent = g; frag.appendChild(h); }
      const lm = lastMsg(c);
      const plain = (s) => String(s || "")
        .replace(/```[\s\S]*?```/g, " [code] ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/(^|\s)\*([^*]+)\*/g, "$1$2")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^\s*\d+\.\s+/gm, "")
        .replace(/^\s*>\s?/gm, "")
        .replace(/#+\s*/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const preview = lm ? (lm.from === "me" ? "You: " : "") + (plain(lm.text) || (lm.file ? (lm.file.type.startsWith("image/") ? "📷 Photo" : "📎 " + lm.file.name) : "")) : (c.draft ? "Draft: " + plain(c.draft) : "No messages yet");
      const b = document.createElement("button");
      b.className = "conv" + (c.id === state.activeId ? " active" : "");
      b.style.animationDelay = Math.min(i * 18, 200) + "ms";
      b.type = "button"; b.dataset.id = c.id;
      b.setAttribute("aria-current", c.id === state.activeId ? "true" : "false");
      b.innerHTML = `
        <span class="avatar avatar--sm${c.bot ? " avatar--bot" : ""}" style="--a1:${esc(c.a1)};--a2:${esc(c.a2)}" data-initials="${esc(c.initials)}" ${c.online ? 'data-online="1"' : ""}></span>
        <span class="conv__body">
          <span class="conv__row">
            <span class="conv__name">${c.pinned ? "📌" : ""}<span>${esc(c.name)}</span>${c.bot ? '<i class="bot-tag">bot</i>' : ""}</span>
            <span class="conv__time">${lm ? relStr(lm.at) : ""}</span>
          </span>
          <span class="conv__row">
            <span class="conv__preview">${esc(preview.slice(0, 70))}</span>
            <span class="tags">${c.muted ? "🔕" : ""}${c.unread ? `<span class="badge">${c.unread > 99 ? "99+" : c.unread}</span>` : ""}</span>
          </span>
        </span>`;
      frag.appendChild(b);
    });
    list.appendChild(frag);
  }

  /* ---------------- chat header ---------------- */
  function renderHeader() {
    const c = conv();
    const av = $("#peerAvatar");
    if (!c) { $("#peerName").textContent = "Select a conversation"; $("#peerStatus").textContent = ""; return; }
    av.dataset.initials = c.initials; av.style.setProperty("--a1", c.a1); av.style.setProperty("--a2", c.a2);
    av.classList.toggle("avatar--bot", !!c.bot);
    if (c.online) av.setAttribute("data-online", "1"); else av.removeAttribute("data-online");
    $("#peerName").innerHTML = esc(c.name) + (c.bot ? ' <i class="bot-tag">assistant</i>' : "");
    $("#peerStatus").innerHTML = c.online
      ? `<span style="color:var(--success)">● Online</span> · ${esc(c.role || "")}`
      : `Last seen ${esc(c.lastSeen || "recently")} · ${esc(c.role || "")}`;
    const menu = $("#moreMenu");
    menu.querySelector('[data-act="pin"]').textContent = c.pinned ? "Unpin conversation" : "Pin conversation";
    menu.querySelector('[data-act="mute"]').textContent = c.muted ? "Unmute notifications" : "Mute notifications";
    if (typeof setAIBadge === "function") setAIBadge();
  }

  /* ---------------- message rendering ---------------- */
  let atBottom = true, pendingNew = 0;

  function fmtBody(text) {
    // full escaped markdown subset: code blocks, lists, headings, links, bold…
    try { return window.TBFormat.render(text); }
    catch (e) { console.error("TalkBox: markdown render failed", e); return esc(text); }
  }

  function msgEl(m, c) {
    const el = document.createElement("article");
    el.className = "msg " + (m.from === "me" ? "msg--out" : "msg--in") + ((c.pins || []).includes(m.id) ? " pinned" : "");
    el.dataset.id = m.id;
    let body = "";
    if (m.replyTo) body += `<div class="msg__quote">${esc(m.replyTo.name)}: ${esc(String(m.replyTo.text || "attachment").slice(0, 90))}</div>`;
    if (m.file) {
      if (m.file.type.startsWith("image/") && m.file.dataUrl) {
        body += `<button type="button" class="msg__img" data-img="${esc(m.id)}"><img src="${esc(m.file.dataUrl)}" alt="${esc(m.file.name)}" loading="lazy" onerror="this.parentNode.innerHTML='<span class=&quot;broken&quot;>Image unavailable — ${esc(m.file.name)}</span>'" /></button>`;
      } else if (m.file.type.startsWith("image/")) {
        body += `<span class="msg__file"><span class="doc">🖼</span><span class="fname">${esc(m.file.name)}<br><small class="muted">${esc(m.file.size)} · preview not stored</small></span></span>`;
      } else {
        body += `<span class="msg__file"><span class="doc">📄</span><span class="fname">${esc(m.file.name)}<br><small class="muted">${esc(m.file.size)}</small></span></span>`;
      }
      if (m.text) body += `<div style="margin-top:6px">${fmtBody(m.text)}</div>`;
    } else body += fmtBody(m.text);

    const reacts = Object.entries(m.reactions || {}).filter(([, v]) => v);
    const ticks = m.status === "sending" ? "🕓" : m.status === "sent" ? "✓" : "✓✓";
    el.innerHTML = `
      <div class="msg__bubble">${body}</div>
      ${reacts.length ? `<div class="reactions">${reacts.map(([e]) => `<button type="button" class="mine" data-react="${esc(e)}">${esc(e)} 1</button>`).join("")}</div>` : ""}
      <div class="msg__meta">
        <span>${timeStr(m.at)}</span>${m.from === "me" ? `<span class="ticks${m.status === "read" ? " read" : ""}">${ticks}</span>` : ""}
        <span class="msg__tools">
          <button type="button" data-tool="react" title="React" aria-label="React">☺</button>
          <button type="button" data-tool="reply" title="Reply" aria-label="Reply">↩</button>
          <button type="button" data-tool="copy" title="Copy" aria-label="Copy">⧉</button>
          <button type="button" data-tool="pin" title="Pin" aria-label="Pin">📌</button>
          <button type="button" data-tool="delete" title="Delete" aria-label="Delete">🗑</button>
        </span>
      </div>`;
    return el;
  }

  function emptyState(c) {
    const w = document.createElement("div");
    w.className = "empty";
    const chips = c.bot ? ["Hello", "What can you do?", "Explain closures", "20% of 250"] : ["Hello", "How are you?", "Quick question"];
    w.innerHTML = `
      <div class="avatar avatar--lg" style="--a1:${esc(c.a1)};--a2:${esc(c.a2)};margin:0 auto" data-initials="${esc(c.initials)}"></div>
      <h2>Say hello to ${esc(c.name)}</h2>
      <p>${esc(c.role || "")} · ${esc(c.username || "")}<br>Everything you send stays saved in this browser.</p>
      <div class="chips">${chips.map((t) => `<button class="chip" type="button" data-quick="${esc(t)}">${esc(t)}</button>`).join("")}</div>`;
    return w;
  }

  function renderMessages(keepScroll) {
    const c = conv(), box = $("#messages");
    const prev = box.scrollTop;
    box.innerHTML = "";
    if (!c) return;
    if (!c.messages.length) { box.appendChild(emptyState(c)); return; }
    let day = null;
    const frag = document.createDocumentFragment();
    c.messages.forEach((m) => {
      const dl = dayLabel(m.at);
      if (dl !== day) { day = dl; const d = document.createElement("div"); d.className = "day"; d.textContent = dl; frag.appendChild(d); }
      frag.appendChild(msgEl(m, c));
    });
    box.appendChild(frag);
    if (keepScroll) box.scrollTop = prev; else scrollToBottom(false);
    applyMsgFilter();
  }

  function scrollToBottom(smooth = true) {
    const box = $("#messages");
    box.scrollTo({ top: box.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    atBottom = true; pendingNew = 0; $("#jumpBtn").hidden = true;
  }

  $("#messages").addEventListener("scroll", () => {
    const box = $("#messages");
    atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 90;
    if (atBottom) { pendingNew = 0; $("#jumpBtn").hidden = true; }
  }, { passive: true });
  $("#jumpBtn").addEventListener("click", () => scrollToBottom(true));

  /* ---------------- details + shared media ---------------- */
  const imagesOf = (c) => c.messages.filter((m) => m.file && m.file.dataUrl && m.file.type.startsWith("image/"));
  const filesOf = (c) => c.messages.filter((m) => m.file && !(m.file.type.startsWith("image/") && m.file.dataUrl));

  function renderDetails() {
    const c = conv(); if (!c) return;
    const imgs = imagesOf(c), files = filesOf(c);
    const pins = (c.pins || []).map((id) => c.messages.find((m) => m.id === id)).filter(Boolean);
    $("#detailsBody").innerHTML = `
      <div class="center">
        <span class="avatar avatar--lg${c.bot ? " avatar--bot" : ""}" style="--a1:${esc(c.a1)};--a2:${esc(c.a2)}" data-initials="${esc(c.initials)}" ${c.online ? 'data-online="1"' : ""}></span>
        <strong style="font-size:16px">${esc(c.name)}</strong>
        <span class="muted" style="font-size:13px">${esc(c.role || "")}</span>
        <span class="muted" style="font-size:12px">${esc(c.username || "")}</span>
        <span class="muted" style="font-size:12px">${c.online ? "Online now" : "Last seen " + esc(c.lastSeen || "recently")}</span>
      </div>
      <div class="section"><h3><span>Shared media</span><span>${imgs.length}</span></h3>
        ${imgs.length ? `<div class="media-grid">${imgs.slice().reverse().map((m) => `<button type="button" data-img="${esc(m.id)}" title="${esc(m.file.name)}"><img src="${esc(m.file.dataUrl)}" alt="${esc(m.file.name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'⚠',style:'display:grid;place-items:center;height:100%'}))" /></button>`).join("")}</div>`
          : '<div class="empty-mini">No images shared yet. Send a photo with the 📎 button and it will appear here instantly.</div>'}
      </div>
      <div class="section"><h3><span>Files</span><span>${files.length}</span></h3>
        ${files.length ? files.slice().reverse().slice(0, 8).map((f) => `<div class="list-row"><span>📄</span><span>${esc(f.file.name)}<small>${esc(f.file.size)}</small></span></div>`).join("")
          : '<div class="empty-mini">No files shared yet.</div>'}
      </div>
      <div class="section"><h3><span>Pinned messages</span><span>${pins.length}</span></h3>
        ${pins.length ? pins.map((m) => `<div class="list-row" data-goto="${esc(m.id)}" style="cursor:pointer"><span>📌</span><span>${esc((m.text || m.file?.name || "").slice(0, 80))}</span></div>`).join("")
          : '<div class="empty-mini">Nothing pinned. Use 📌 on any message.</div>'}
      </div>
      <div class="section"><h3><span>Conversation settings</span></h3>
        <div class="toggle-row"><span>Pin conversation</span><button class="switch" data-toggle="pinned" aria-checked="${!!c.pinned}" role="switch" aria-label="Pin conversation"></button></div>
        <div class="toggle-row"><span>Mute notifications</span><button class="switch" data-toggle="muted" aria-checked="${!!c.muted}" role="switch" aria-label="Mute notifications"></button></div>
        <div class="toggle-row" style="border:0"><span>Messages</span><span class="muted">${c.messages.length}</span></div>
        <button class="btn btn--danger-ghost" data-act="clear-here" style="margin-top:10px">Clear this conversation</button>
      </div>`;
  }

  $("#detailsBody").addEventListener("click", (e) => {
    const img = e.target.closest("[data-img]");
    if (img) { openLightbox(img.dataset.img); return; }
    const go = e.target.closest("[data-goto]");
    if (go) {
      const el = $(`.msg[data-id="${go.dataset.goto}"]`);
      if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); el.classList.add("hit"); setTimeout(() => el.classList.remove("hit"), 1600); }
      if (isMobile()) closeDetails();
      return;
    }
    if (e.target.closest('[data-act="clear-here"]')) { clearConversation(); return; }
    const t = e.target.closest("[data-toggle]"); if (!t) return;
    const c = conv(); c[t.dataset.toggle] = !c[t.dataset.toggle];
    save(); renderDetails(); renderList(); renderHeader();
    toast("Conversation updated", `${c.name}: ${t.dataset.toggle} ${c[t.dataset.toggle] ? "on" : "off"}.`);
  });

  /* ---------------- lightbox ---------------- */
  let lbList = [], lbIndex = 0;
  function openLightbox(msgId) {
    const c = conv(); if (!c) return;
    lbList = imagesOf(c);
    lbIndex = Math.max(0, lbList.findIndex((m) => m.id === msgId));
    if (!lbList.length) return;
    $("#lightbox").hidden = false;
    paintLightbox();
  }
  function paintLightbox() {
    const m = lbList[lbIndex]; if (!m) return;
    $("#lbImg").src = m.file.dataUrl;
    $("#lbImg").alt = m.file.name;
    $("#lbName").textContent = `${m.file.name} · ${m.file.size}`;
    $("#lbCount").textContent = `${lbIndex + 1} / ${lbList.length}`;
    $("#lbPrev").disabled = lbList.length < 2;
    $("#lbNext").disabled = lbList.length < 2;
  }
  const closeLightbox = () => { $("#lightbox").hidden = true; $("#lbImg").src = ""; };
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; paintLightbox(); });
  $("#lbNext").addEventListener("click", () => { lbIndex = (lbIndex + 1) % lbList.length; paintLightbox(); });
  $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox" || e.target.classList.contains("lightbox__stage")) closeLightbox(); });

  /* ---------------- sending ---------------- */
  function pushMsg(c, msg, { notify } = {}) {
    c.messages.push(msg);
    if (c.id === state.activeId) {
      const box = $("#messages");
      if (!box.querySelector(".msg")) renderMessages();
      else {
        const dl = dayLabel(msg.at);
        const days = $$(".day", box);
        if (!days.length || days[days.length - 1].textContent !== dl) {
          const d = document.createElement("div"); d.className = "day"; d.textContent = dl; box.appendChild(d);
        }
        box.appendChild(msgEl(msg, c));
        applyMsgFilter();
      }
      if (atBottom || msg.from === "me") scrollToBottom(true);
      else { pendingNew++; const j = $("#jumpBtn"); j.hidden = false; j.textContent = `${pendingNew} new message${pendingNew > 1 ? "s" : ""} ↓`; }
    } else if (msg.from === "them") {
      c.unread = (c.unread || 0) + 1;
    }
    if (notify && msg.from === "them" && !c.muted) { toast(c.name, msg.text || "Sent an attachment"); ping(); }
    save(); renderList(); renderDetails();
    return msg;
  }

  function updateStatus(c, msg, status) {
    msg.status = status;
    if (c.id !== state.activeId) return;
    const el = $(`.msg[data-id="${msg.id}"] .ticks`);
    if (el) { el.textContent = status === "sending" ? "🕓" : status === "sent" ? "✓" : "✓✓"; el.classList.toggle("read", status === "read"); }
  }

  let replyTo = null;
  function setReply(m, c) {
    replyTo = m ? { id: m.id, name: m.from === "me" ? state.me.name : c.name, text: m.text || (m.file ? m.file.name : "") } : null;
    $("#replyStrip").hidden = !replyTo;
    if (replyTo) { $("#replyText").textContent = `Replying to ${replyTo.name}: ${replyTo.text.slice(0, 80)}`; ta.focus(); }
  }
  $("#replyCancel").addEventListener("click", () => setReply(null));

  function send(text, file) {
    const c = conv(); if (!c) return;
    const clean = String(text || "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (!clean && !file) return;
    const msg = pushMsg(c, {
      id: uid(), from: "me", text: clean, at: Date.now(), reactions: {},
      status: "sending", file: file || null, replyTo: replyTo,
    });
    setReply(null);
    const target = c;
    setTimeout(() => { updateStatus(target, msg, "sent"); save(); }, 350);
    setTimeout(() => { updateStatus(target, msg, "read"); save(); }, 1100);
    respond(c, clean, file);
  }

  const typingTimers = {};
  function showTyping(c, on) {
    if (c.id !== state.activeId) { return; }
    $("#typing").hidden = !on;
    $("#typingText").textContent = `${c.name.split(" ")[0]} is typing…`;
    if (on && atBottom) scrollToBottom(true);
  }

  function setThinking(c, on, label) {
    if (c.id !== state.activeId) return;
    const t = $("#typing");
    t.hidden = !on;
    t.classList.toggle("typing--ai", !!on && !!c.bot);
    $("#typingText").textContent = on
      ? (c.bot ? (label || "Assistant is thinking…") : `${c.name.split(" ")[0]} is typing…`)
      : "";
    if (on && atBottom) scrollToBottom(true);
  }

  async function respond(c, text, file) {
    /* ------- TalkBox Assistant: a real AI model, every answer generated live ------- */
    if (c.bot) {
      const history = c.messages.slice(-24).map((m) => ({
        from: m.from,
        text: m.text || (m.file ? "[attached file: " + m.file.name + "]" : ""),
        file: m.file || null,
      }));
      clearTimeout(typingTimers[c.id]);
      typingTimers[c.id] = setTimeout(() => setThinking(c, true, "Assistant is thinking…"), 250);
      let out;
      try {
        out = await window.TBAI.reply(history);
      } catch (e) {
        console.error("TalkBox: assistant failed", e);
        out = { text: "**Unable to reach the AI service.** Open Settings → AI assistant and press Test connection.", mode: "error" };
      }
      clearTimeout(typingTimers[c.id]);
      setThinking(c, false);
      setAIBadge();
      pushMsg(c, { id: uid(), from: "them", text: out.text, at: Date.now(), reactions: {} }, { notify: c.id !== state.activeId });
      return;
    }

    /* ------- Vertex Labs colleagues: contextual, role-aware replies ------- */
    if (!state.settings.auto) return;
    let reply;
    try {
      reply = window.TBContacts.reply(c, text, c.messages.slice(-20), file || null);
    } catch (e) {
      console.error("TalkBox: contact reply failed", e);
      reply = "Got it — let me come back to you on that.";
    }
    const delay = Math.min(4200, 900 + reply.length * 12 + Math.random() * 700);
    clearTimeout(typingTimers[c.id]);
    setTimeout(() => setThinking(c, true), 600);
    typingTimers[c.id] = setTimeout(() => {
      setThinking(c, false);
      if (!c.online) { c.online = true; c.lastSeen = null; renderHeader(); }
      pushMsg(c, { id: uid(), from: "them", text: reply, at: Date.now(), reactions: {} }, { notify: c.id !== state.activeId });
    }, delay);
  }


  /* ---------------- composer ---------------- */
  const ta = $("#composer-input");
  function autoGrow() { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 132) + "px"; }
  ta.addEventListener("input", () => {
    autoGrow();
    const c = conv(); if (c) { c.draft = ta.value; save(); }
  });
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && state.settings.enterSends) { e.preventDefault(); $("#composer").requestSubmit(); }
  });
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = ta.value;
    ta.value = ""; autoGrow();
    const c = conv(); if (c) c.draft = "";
    if (v.trim()) send(v);
    ta.focus();
  });

  const EMOJI = "😀 😄 😁 😊 🙂 😉 😍 🤩 😎 🤔 😴 😢 😅 🙌 👍 👏 🙏 🔥 ✨ 🎉 💡 ✅ ❌ ⚡ 📌 📎 💬 ❤️".split(" ");
  const emojiPanel = $("#emojiPanel");
  emojiPanel.innerHTML = EMOJI.map((e) => `<button type="button">${e}</button>`).join("");
  emojiPanel.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    ta.value += e.target.textContent; autoGrow(); ta.focus();
    const c = conv(); if (c) { c.draft = ta.value; save(); }
  });
  $("#emojiBtn").addEventListener("click", () => {
    emojiPanel.hidden = !emojiPanel.hidden;
    $("#emojiBtn").setAttribute("aria-expanded", String(!emojiPanel.hidden));
  });

  /* ---------------- attachments ---------------- */
  const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");

  function compress(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const max = 1100;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const cv = document.createElement("canvas");
          cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          resolve(cv.toDataURL("image/jpeg", 0.72));
        } catch (e) { resolve(null); }
        finally { URL.revokeObjectURL(url); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  $("#attachBtn").addEventListener("click", () => $("#fileInput").click());
  $("#fileInput").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    for (const f of files) {
      const meta = { name: f.name, size: fmtSize(f.size), type: f.type || "application/octet-stream" };
      if (meta.type.startsWith("image/")) {
        const dataUrl = await compress(f);
        if (dataUrl) { send("", Object.assign(meta, { dataUrl })); toast("Photo sent", f.name); }
        else { send("", meta); toast("Image problem", `${f.name} could not be read — sent as a file reference.`); }
      } else {
        send("", meta); toast("Attachment sent", f.name);
      }
    }
  });

  /* ---------------- message actions ---------------- */
  $("#messages").addEventListener("click", (e) => {
    const quick = e.target.closest("[data-quick]");
    if (quick) { send(quick.dataset.quick); return; }
    const imgBtn = e.target.closest("[data-img]");
    if (imgBtn) { openLightbox(imgBtn.dataset.img); return; }
    const react = e.target.closest("[data-react]");
    const tool = e.target.closest("[data-tool]");
    const host = e.target.closest(".msg"); if (!host) return;
    const c = conv(); if (!c) return;
    const m = c.messages.find((x) => x.id === host.dataset.id); if (!m) return;

    if (react) { m.reactions[react.dataset.react] = !m.reactions[react.dataset.react]; save(); renderMessages(true); return; }
    if (!tool) return;
    const act = tool.dataset.tool;
    if (act === "copy") {
      const txt = m.text || (m.file ? m.file.name : "");
      const done = () => toast("Copied", "Message copied to clipboard.");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done).catch(() => fallbackCopy(txt, done));
      else fallbackCopy(txt, done);
    } else if (act === "delete") {
      c.messages = c.messages.filter((x) => x.id !== m.id);
      c.pins = (c.pins || []).filter((x) => x !== m.id);
      save(); renderMessages(true); renderList(); renderDetails(); toast("Message deleted", "Removed from this device.");
    } else if (act === "reply") {
      setReply(m, c);
    } else if (act === "pin") {
      c.pins = c.pins || [];
      const has = c.pins.includes(m.id);
      c.pins = has ? c.pins.filter((x) => x !== m.id) : c.pins.concat(m.id);
      save(); renderMessages(true); renderDetails(); toast(has ? "Unpinned" : "Pinned", has ? "Removed from pinned messages." : "Added to pinned messages.");
    } else if (act === "react") {
      host.querySelectorAll(".react-bar").forEach((n) => n.remove());
      const bar = document.createElement("div");
      bar.className = "react-bar";
      bar.innerHTML = ["👍", "❤️", "😂", "🎉", "😮", "🙏"].map((x) => `<button type="button" data-react="${x}">${x}</button>`).join("");
      host.appendChild(bar);
      setTimeout(() => document.addEventListener("click", function once() { bar.remove(); document.removeEventListener("click", once); }), 0);
    }
  });
  function fallbackCopy(text, done) {
    const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("Copy blocked", "Your browser blocked clipboard access."); }
    t.remove();
  }

  /* ---------------- conversation switching ---------------- */
  $("#convList").addEventListener("click", (e) => {
    const b = e.target.closest(".conv"); if (!b) return;
    openConv(b.dataset.id);
  });
  function openConv(id) {
    const c = conv(id); if (!c) return;
    state.activeId = id; c.unread = 0;
    $("#msgSearch").hidden = true; $("#msgSearchInput").value = "";
    $("#typing").hidden = true;
    setReply(null);
    ta.value = c.draft || ""; autoGrow();
    atBottom = true; pendingNew = 0; $("#jumpBtn").hidden = true;
    save(); renderList(); renderHeader(); renderMessages(); renderDetails();
    showChatView();
    if (!isMobile()) setTimeout(() => ta.focus(), 60);
  }

  $("#backBtn").addEventListener("click", showListView);

  /* ---------------- search ---------------- */
  $("#searchInput").addEventListener("input", renderList);
  function applyMsgFilter() {
    const q = $("#msgSearchInput").value.trim().toLowerCase();
    const msgs = $$(".msg");
    if (!q) { msgs.forEach((m) => m.classList.remove("hit", "dim")); $("#msgSearchCount").textContent = ""; return; }
    let n = 0;
    msgs.forEach((m) => {
      const hit = m.textContent.toLowerCase().includes(q);
      m.classList.toggle("hit", hit); m.classList.toggle("dim", !hit); if (hit) n++;
    });
    $("#msgSearchCount").textContent = `${n} match${n === 1 ? "" : "es"}`;
    const first = $(".msg.hit"); if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  $("#msgSearchInput").addEventListener("input", applyMsgFilter);
  $("#searchMsgBtn").addEventListener("click", () => { $("#msgSearch").hidden = false; $("#msgSearchInput").focus(); });
  $("#msgSearchClose").addEventListener("click", () => { $("#msgSearchInput").value = ""; applyMsgFilter(); $("#msgSearch").hidden = true; });

  /* ---------------- header menu ---------------- */
  const moreMenu = $("#moreMenu");
  $("#moreBtn").addEventListener("click", (e) => {
    e.stopPropagation(); moreMenu.hidden = !moreMenu.hidden;
    $("#moreBtn").setAttribute("aria-expanded", String(!moreMenu.hidden));
  });
  function clearConversation() {
    const c = conv(); if (!c) return;
    if (!confirm(`Clear all messages with ${c.name}? This cannot be undone.`)) return;
    c.messages = []; c.pins = [];
    save(); renderMessages(); renderList(); renderDetails(); toast("Cleared", "Conversation emptied.");
  }
  moreMenu.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const c = conv(); if (!c) return;
    moreMenu.hidden = true;
    switch (b.dataset.act) {
      case "pin": c.pinned = !c.pinned; toast("TalkBox", `${c.name} ${c.pinned ? "pinned" : "unpinned"}.`); break;
      case "mute": c.muted = !c.muted; toast("TalkBox", `${c.name} ${c.muted ? "muted" : "unmuted"}.`); break;
      case "read": c.unread = 0; toast("TalkBox", "Marked as read."); break;
      case "media": openDetails(); break;
      case "export": download(`talkbox-${c.id}.json`, JSON.stringify(c, null, 2)); toast("Exported", "Conversation downloaded as JSON."); break;
      case "clear": clearConversation(); return;
      case "delete":
        if (state.conversations.length <= 1) { toast("Not possible", "Keep at least one conversation."); break; }
        if (!confirm(`Delete the conversation with ${c.name}? This removes its history from this device.`)) break;
        state.conversations = state.conversations.filter((x) => x.id !== c.id);
        state.activeId = state.conversations[0].id;
        save(); openConv(state.activeId); toast("Deleted", `${c.name} removed.`);
        return;
    }
    save(); renderList(); renderHeader(); renderDetails();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#moreBtn") && !e.target.closest("#moreMenu")) { moreMenu.hidden = true; $("#moreBtn").setAttribute("aria-expanded", "false"); }
    if (!e.target.closest("#emojiBtn") && !e.target.closest("#emojiPanel")) { emojiPanel.hidden = true; $("#emojiBtn").setAttribute("aria-expanded", "false"); }
  });

  /* ---------------- calls (simulated) ---------------- */
  $$("[data-call]").forEach((b) => b.addEventListener("click", () => {
    const c = conv(); if (!c) return;
    toast(b.dataset.call === "video" ? "Video call" : "Voice call", `Calling ${c.name}… TalkBox is frontend-only, so this is a simulated call.`);
  }));

  /* ---------------- panels ---------------- */
  function openDetails() { app.classList.add("show-details"); if (window.innerWidth <= 992) $("#scrim").hidden = false; renderDetails(); }
  function closeDetails() { app.classList.remove("show-details"); $("#scrim").hidden = true; }
  $("#infoBtn").addEventListener("click", () => (app.classList.contains("show-details") ? closeDetails() : openDetails()));
  $("#peerInfoBtn").addEventListener("click", openDetails);
  $("#peerInfoBtn").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetails(); } });
  $("#detailsClose").addEventListener("click", closeDetails);
  $("#scrim").addEventListener("click", closeDetails);

  /* ---------------- modals ---------------- */
  function openModal(id) {
    const m = $(id); m.hidden = false;
    const f = m.querySelector("input,select,button"); if (f) f.focus();
  }
  function closeModals() { $$(".modal").forEach((m) => (m.hidden = true)); }
  $$("[data-close-modal]").forEach((b) => b.addEventListener("click", closeModals));
  $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) closeModals(); }));

  $("#settingsBtn").addEventListener("click", () => {
    $("#setName").value = state.me.name; $("#setStatus").value = state.me.status;
    $("#setTheme").value = state.settings.theme;
    $("#setSound").checked = state.settings.sound; $("#setToast").checked = state.settings.toast;
    $("#setAuto").checked = state.settings.auto; $("#setEnter").checked = state.settings.enterSends;
    $("#setAmbient").checked = state.settings.ambient;
    loadAIFields();
    let bytes = 0;
    try { bytes = (localStorage.getItem(KEY) || "").length; } catch (e) {}
    const msgs = state.conversations.reduce((n, c) => n + c.messages.length, 0);
    $("#storageInfo").textContent = `Stored locally: ${state.conversations.length} conversations · ${msgs} messages · ~${Math.round(bytes / 1024)} KB under the key ${KEY}.`;
    openModal("#settingsModal");
  });
  const bindSetting = (sel, fn) => $(sel).addEventListener("change", (e) => { fn(e.target); save(); });
  bindSetting("#setTheme", (t) => { state.settings.theme = t.value; applyTheme(); });
  bindSetting("#setSound", (t) => { state.settings.sound = t.checked; if (t.checked) ping(); });
  bindSetting("#setToast", (t) => { state.settings.toast = t.checked; });
  bindSetting("#setAuto", (t) => { state.settings.auto = t.checked; });
  bindSetting("#setAmbient", (t) => { state.settings.ambient = t.checked; });
  bindSetting("#setEnter", (t) => { state.settings.enterSends = t.checked; });

  /* ---------------- AI assistant settings ---------------- */
  function setAIBadge() {
    const el = $("#aiBadge"); if (!el) return;
    const live = window.TBAI.isConfigured();
    el.textContent = live ? "Knowledge ready" : "Knowledge unavailable";
    el.classList.toggle("ai-badge--live", live);
    el.classList.toggle("ai-badge--offline", !live);
    el.hidden = !(conv() && conv().bot);
  }
  function loadAIFields() {
    const cfg = window.TBAI.config();
    const custom = cfg.provider === "custom";
    const sel = $("#aiProvider"); if (sel) sel.value = cfg.provider;
    $("#aiServiceUrl").value = cfg.serviceUrl || "";
    $("#aiBaseUrl").value = cfg.baseUrl || "";
    $("#aiModel").value = cfg.model || "";
    $("#aiKey").value = cfg.apiKey || "";
    $("#aiServiceRow").hidden = custom;
    $$(".ai-custom").forEach((el) => { el.hidden = !custom; });
    const st = $("#aiStatus");
    const ok = window.TBAI.isConfigured();
    st.classList.toggle("ai-status--ok", ok);
    st.classList.toggle("ai-status--bad", !ok);
    st.textContent = ok
      ? "Ready — " + window.TBAI.modelLabel() + " is available locally with no API key."
      : "Knowledge pack unavailable.";
  }
  function saveAIFields() {
    window.TBAI.setConfig({
      provider: $("#aiProvider").value === "custom" ? "custom" : "talkbox",
      serviceUrl: $("#aiServiceUrl").value.trim(),
      baseUrl: $("#aiBaseUrl").value.trim() || "https://api.openai.com/v1",
      model: $("#aiModel").value.trim(),
      apiKey: $("#aiKey").value.trim(),
    });
    loadAIFields(); setAIBadge(); renderHeader();
  }
  ["#aiProvider", "#aiServiceUrl", "#aiBaseUrl", "#aiModel", "#aiKey"].forEach((sel) => {
    const el = $(sel); if (el) el.addEventListener("change", saveAIFields);
  });
  const aiTest = $("#aiTestBtn");
  if (aiTest) aiTest.addEventListener("click", async () => {
    saveAIFields();
    if (!window.TBAI.isConfigured()) { toast("Unavailable", "The built-in knowledge pack could not be loaded."); return; }
    aiTest.disabled = true; aiTest.textContent = "Testing…";
    const out = await window.TBAI.reply([{ from: "me", text: "Reply with the single word: ready" }]);
    aiTest.disabled = false; aiTest.textContent = "Test connection";
    if (out.mode === "live") toast("Knowledge ready", "The built-in 100-question assistant answered successfully.");
    else toast("Connection failed", out.error || "The model could not be reached.");
    loadAIFields(); setAIBadge();
  });


  /* ---------------- code block copy ---------------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-code-copy]"); if (!btn) return;
    const block = btn.closest(".code-block");
    const code = block && block.querySelector("code");
    if (!code) return;
    const text = code.textContent;
    const done = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy"), 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => toast("Copy failed", "Your browser blocked clipboard access."));
    } else {
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (_) { toast("Copy failed", "Select the code and copy manually."); }
      t.remove();
    }
  });

  const bindProfile = (sel, key) => $(sel).addEventListener("input", (e) => {
    state.me[key] = e.target.value.trim() || (key === "name" ? "You" : "Active now");
    state.me.initials = initialsOf(state.me.name);
    renderMe(); save();
  });
  bindProfile("#setName", "name"); bindProfile("#setStatus", "status");
  function renderMe() {
    $("#meName").textContent = state.me.name;
    $("#meStatus").textContent = state.me.status;
    $("#meAvatar").dataset.initials = state.me.initials || "YO";
  }

  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reset TalkBox? All local messages and settings will be restored to the demo defaults.")) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    state = defaults();
    applyTheme(); closeModals(); renderMe(); renderList(); renderHeader(); renderMessages(); renderDetails();
    save(); toast("TalkBox reset", "Demo conversations restored.");
  });

  /* ---------------- people search (Vertex Labs directory only) ---------------- */
  function openPeople(prefill) {
    closeModals();
    $("#peopleSearch").value = prefill || "";
    renderPeople();
    openModal("#newModal");
    setTimeout(() => $("#peopleSearch").focus(), 40);
  }
  const matches = (o, q) => !q || [o.name, o.username, o.role, o.department, (o.expertise || []).join(" ")]
    .some((f) => String(f || "").toLowerCase().includes(q));

  function renderPeople() {
    const q = $("#peopleSearch").value.trim().replace(/^@/, "").toLowerCase();
    const existing = state.conversations.filter((c) => matches(c, q));
    const dir = (SEED.directory || [])
      .filter((p) => !state.conversations.some((c) => c.id === p.id))
      .filter((p) => matches(p, q));
    const box = $("#peopleResults");
    const row = (o, tag, data) => `
      <button type="button" class="person" ${data}>
        <span class="avatar avatar--sm" style="--a1:${esc(o.a1)};--a2:${esc(o.a2)}" data-initials="${esc(o.initials || initialsOf(o.name))}" ${o.online ? 'data-online="1"' : ""}></span>
        <span class="person__meta"><span class="person__name">${esc(o.name)}</span><span class="person__sub">${esc(o.username || "")} · ${esc(o.role || "")}</span></span>
        <span class="person__tag">${tag}</span>
      </button>`;
    let html = "";
    if (existing.length) html += `<div class="conv-group">Your conversations</div>` + existing.map((c) => row(c, "Open", `data-open="${esc(c.id)}"`)).join("");
    if (dir.length) html += `<div class="conv-group">${esc(COMPANY.name)} directory</div>` + dir.map((p) => row(p, "Message", `data-new="${esc(p.id)}"`)).join("");
    if (!existing.length && !dir.length) html = `<div class="empty-mini">No team member found.</div>`;
    box.innerHTML = html;
  }
  $("#peopleSearch").addEventListener("input", renderPeople);
  $("#peopleResults").addEventListener("click", (e) => {
    const b = e.target.closest("[data-open],[data-new]"); if (!b) return;
    if (b.dataset.open) { closeModals(); openConv(b.dataset.open); return; }
    const p = (SEED.directory || []).find((x) => x.id === b.dataset.new); if (!p) return;
    const c = createConv(p);
    closeModals(); openConv(c.id);
    toast("Conversation started", `You can now message ${p.name}.`);
  });

  // Conversations can only be created from the directory, with their seeded history.
  function createConv(p) {
    const existing = conv(p.id);
    if (existing) return existing;
    const c = typeof SEED.conversationFor === "function"
      ? SEED.conversationFor(p)
      : Object.assign({}, p, { pinned: false, muted: false, unread: 0, bot: false, draft: "", pins: [], messages: [] });
    state.conversations.push(c);
    save(); renderList();
    return c;
  }

  $("#newChatBtn").addEventListener("click", () => openPeople(""));
  $("#peopleBtn").addEventListener("click", () => openPeople(""));


  /* ---------------- export ---------------- */
  function download(name, text) {
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { toast("Export failed", "Your browser blocked the download."); }
  }
  $("#exportBtn").addEventListener("click", () => {
    download("talkbox-export.json", JSON.stringify(state, null, 2));
    toast("Export ready", "Your TalkBox history was downloaded.");
  });

  /* ---------------- theme button ---------------- */
  $("#themeBtnTop").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    state.settings.theme = cur === "dark" ? "light" : "dark";
    applyTheme(); save();
  });

  /* ---------------- shortcuts ---------------- */
  document.addEventListener("keydown", (e) => {
    const meta = e.ctrlKey || e.metaKey;
    if (e.key === "Escape") {
      if (!$("#lightbox").hidden) { closeLightbox(); return; }
      closeModals(); closeDetails(); moreMenu.hidden = true; emojiPanel.hidden = true;
      $("#msgSearch").hidden = true; $("#msgSearchInput").value = ""; applyMsgFilter(); setReply(null);
      return;
    }
    if (!$("#lightbox").hidden) {
      if (e.key === "ArrowLeft") $("#lbPrev").click();
      if (e.key === "ArrowRight") $("#lbNext").click();
    }
    if (!meta) return;
    const k = e.key.toLowerCase();
    if (k === "k") { e.preventDefault(); showListView(); $("#searchInput").focus(); }
    else if (k === "f") { e.preventDefault(); $("#msgSearch").hidden = false; $("#msgSearchInput").focus(); }
    else if (k === "j") { e.preventDefault(); $("#themeBtnTop").click(); }
    else if (k === "n") { e.preventDefault(); openPeople(""); }
    else if (e.key === ",") { e.preventDefault(); $("#settingsBtn").click(); }
  });

  /* ---------------- ambient activity (role-aware) ---------------- */
  setInterval(() => {
    if (!state.settings.ambient || !state.settings.auto) return;
    const others = state.conversations.filter((c) => !c.bot && c.online && c.id !== state.activeId);
    if (!others.length || Math.random() > 0.3) return;
    const c = others[Math.floor(Math.random() * others.length)];
    let text;
    try { text = window.TBContacts.ambient(c); }
    catch (e) { text = "Quick question when you're free."; }
    pushMsg(c, { id: uid(), from: "them", text, at: Date.now(), reactions: {} }, { notify: true });
  }, 45000);


  /* ---------------- resize handling ---------------- */
  let wasMobile = isMobile();
  function syncLayout() {
    const m = isMobile();
    if (m) {
      if (!app.dataset.view) setView("list");
      closeDetails();
    } else {
      app.removeAttribute("data-view");
      $("#scrim").hidden = true;
      if (window.innerWidth >= 1200 && !app.classList.contains("show-details")) app.classList.add("show-details");
      if (window.innerWidth < 1200) app.classList.remove("show-details");
    }
    if (m !== wasMobile) { wasMobile = m; if (m) setView(state.activeId ? "list" : "list"); }
  }
  window.addEventListener("resize", syncLayout);
  window.addEventListener("orientationchange", syncLayout);

  /* ---------------- global error safety ---------------- */
  window.addEventListener("error", (e) => console.error("TalkBox error:", e.message));

  /* ---------------- boot ---------------- */
  applyTheme(); loadAIFields(); renderMe(); renderList(); renderHeader(); renderMessages(); renderDetails();
  const c0 = conv();
  if (c0) { c0.unread = 0; ta.value = c0.draft || ""; autoGrow(); }
  syncLayout();
  if (isMobile()) setView("list");
  save(); renderList();
  if (!isMobile()) setTimeout(() => ta.focus(), 200);
  console.log("%cTalkBox", "color:#4f6bed;font-weight:700", "— Conversations, beautifully connected.");
})();
