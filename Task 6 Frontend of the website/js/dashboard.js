/**
 * NEXORA — customer dashboard (frontend only)
 * Overview, usage, billing, account and settings views driven entirely by
 * locally stored demo data. Includes plan changes, billing-cycle changes,
 * invoice preview, cancellation flow and a notification centre.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const esc = ns.esc;
  const store = ns.store;

  let ov = null;
  let view = "overview";
  let pending = null; // { type: 'plan'|'cycle'|'cancel', value }
  let showNotifications = false;

  const NAV = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "usage", label: "Usage", icon: "gauge" },
    { id: "billing", label: "Billing", icon: "card" },
    { id: "account", label: "Account", icon: "user" },
    { id: "settings", label: "Settings", icon: "sliders" },
  ];

  function sub() {
    return store.getSubscription();
  }

  function planById(id) {
    return (
      D.plans.filter(function (p) {
        return p.id === id;
      })[0] || D.plans[1]
    );
  }

  function statusLabel(s) {
    if (!s) return "None";
    if (s.status === "cancellation_scheduled") return "Cancellation Scheduled";
    return "Active";
  }

  /* --------------------------------------------------------------------- */
  /* Building blocks                                                       */
  /* --------------------------------------------------------------------- */

  function usageBar(label, used, limit) {
    const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
    return (
      '<div class="usage"><div class="usage__row"><span>' +
      esc(label) +
      "</span><strong>" +
      used +
      " / " +
      limit +
      '</strong></div><div class="usage__track" role="progressbar" aria-valuenow="' +
      pct +
      '" aria-valuemin="0" aria-valuemax="100" aria-label="' +
      esc(label) +
      ' usage"><span style="width:' +
      pct +
      '%"></span></div><small class="counter">' +
      pct +
      "% of your allowance used</small></div>"
    );
  }

  function notificationsPanel() {
    const list = store.getNotifications();
    return (
      '<div class="notif" role="region" aria-label="Notifications"><div class="notif__head"><strong>Notifications</strong>' +
      '<div class="notif__actions"><button class="btn btn--quiet btn--sm" type="button" data-notif="all">Mark all as read</button>' +
      '<button class="btn btn--quiet btn--sm" type="button" data-notif="clear">Clear</button></div></div>' +
      (list.length
        ? '<ul class="notif__list">' +
          list
            .map(function (n) {
              return (
                '<li class="notif__item' +
                (n.read ? " is-read" : "") +
                '"><div><strong>' +
                esc(n.title) +
                "</strong><p>" +
                esc(n.body) +
                '</p><small class="counter">' +
                esc(store.relativeTime(n.at)) +
                "</small></div>" +
                (n.read
                  ? '<span class="pill">Read</span>'
                  : '<button class="btn btn--quiet btn--sm" type="button" data-notif-read="' +
                    esc(n.id) +
                    '">Mark as read</button>') +
                "</li>"
              );
            })
            .join("") +
          "</ul>"
        : '<div class="empty-state"><strong>No notifications</strong>Activity such as subscription changes will appear here.</div>') +
      "</div>"
    );
  }

  function overview() {
    const s = sub();
    const p = planById(s.planId);
    const activity = store.getActivity();
    return (
      '<h2 class="ov__title">Welcome back</h2><p class="counter">Here is the current state of your NEXORA demo subscription.</p>' +
      '<div class="dash-cards">' +
      '<div class="panel"><span class="panel__label">Current plan</span><strong class="panel__value">' +
      esc(p.name) +
      '</strong><span class="pill pill--accent">' +
      (s.cycle === "yearly" ? "Yearly billing" : "Monthly billing") +
      "</span></div>" +
      '<div class="panel"><span class="panel__label">Status</span><strong class="panel__value">' +
      esc(statusLabel(s)) +
      '</strong><span class="status-badge"><span class="status-dot" aria-hidden="true"></span>' +
      (s.status === "active" ? "Everything running" : "Ends " + esc(store.formatDate(s.cancelAt || s.renewsAt))) +
      "</span></div>" +
      '<div class="panel"><span class="panel__label">' +
      (s.status === "active" ? "Renews on" : "Access until") +
      '</span><strong class="panel__value">' +
      esc(store.formatDate(s.cancelAt || s.renewsAt)) +
      '</strong><span class="counter">' +
      store.money(s.amount) +
      " per " +
      (s.cycle === "yearly" ? "year" : "month") +
      "</span></div>" +
      '<div class="panel"><span class="panel__label">Reference</span><strong class="panel__value panel__value--sm">' +
      esc(s.reference) +
      '</strong><span class="counter">Started ' +
      esc(store.formatDate(s.startedAt)) +
      "</span></div></div>" +
      '<div class="dash-split"><section class="panel" aria-label="Usage summary"><h3>Usage this cycle</h3>' +
      usageBar("Pages / screens", s.usage.pages, p.limits.pages) +
      usageBar("Team seats", s.usage.seats, p.limits.seats) +
      '<button class="btn btn--ghost btn--sm" type="button" data-view="usage">View full usage</button></section>' +
      '<section class="panel" aria-label="Recent activity"><h3>Recent activity</h3>' +
      (activity.length
        ? '<ul class="timeline">' +
          activity
            .slice(0, 6)
            .map(function (a) {
              return (
                "<li><strong>" +
                esc(a.label) +
                "</strong>" +
                (a.detail ? "<span>" + esc(a.detail) + "</span>" : "") +
                '<small class="counter">' +
                esc(store.relativeTime(a.at)) +
                "</small></li>"
              );
            })
            .join("") +
          "</ul>"
        : '<div class="empty-state"><strong>No recent activity</strong>Browse services, work or articles and your actions appear here.</div>') +
      (activity.length
        ? '<button class="btn btn--quiet btn--sm" type="button" data-action="clear-activity">Clear activity</button>'
        : "") +
      "</section></div>"
    );
  }

  function usage() {
    const s = sub();
    const p = planById(s.planId);
    return (
      '<h2 class="ov__title">Usage</h2><p class="counter">Simulated consumption for the current billing cycle.</p>' +
      '<section class="panel">' +
      usageBar("Pages / screens", s.usage.pages, p.limits.pages) +
      usageBar("Team seats", s.usage.seats, p.limits.seats) +
      usageBar("Support requests", s.usage.requests, p.limits.requests) +
      "</section>" +
      '<div class="dash-cards"><div class="panel"><span class="panel__label">Cycle started</span><strong class="panel__value panel__value--sm">' +
      esc(store.formatDate(s.startedAt)) +
      '</strong></div><div class="panel"><span class="panel__label">Resets on</span><strong class="panel__value panel__value--sm">' +
      esc(store.formatDate(s.renewsAt)) +
      '</strong></div><div class="panel"><span class="panel__label">Plan allowance</span><strong class="panel__value panel__value--sm">' +
      p.limits.pages +
      " pages · " +
      p.limits.seats +
      " seats</strong></div></div>" +
      '<p class="counter">Need more headroom? <button class="link-btn" type="button" data-action="change-plan">Change plan</button></p>'
    );
  }

  function billing() {
    const s = sub();
    const p = planById(s.planId);
    return (
      '<h2 class="ov__title">Billing</h2><p class="counter">Demo billing summary — no real payment method is stored.</p>' +
      '<section class="panel"><dl class="summary summary--wide"><div><dt>Current plan</dt><dd>' +
      esc(p.name) +
      "</dd></div><div><dt>Billing cycle</dt><dd>" +
      (s.cycle === "yearly" ? "Yearly" : "Monthly") +
      "</dd></div><div><dt>Amount</dt><dd>" +
      store.money(s.amount) +
      " / " +
      (s.cycle === "yearly" ? "year" : "month") +
      "</dd></div><div><dt>Next billing date</dt><dd>" +
      esc(store.formatDate(s.renewsAt)) +
      "</dd></div><div><dt>Payment method</dt><dd>Demo card •••• " +
      esc(s.last4) +
      "</dd></div><div><dt>Status</dt><dd>" +
      esc(statusLabel(s)) +
      "</dd></div></dl>" +
      '<div class="ov__actions ov__actions--wrap"><button class="btn btn--primary btn--sm" type="button" data-action="change-plan">Change Plan</button>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-action="change-cycle">Change Billing Cycle</button>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-action="invoice">View Invoice</button>' +
      (s.status === "active"
        ? '<button class="btn btn--quiet btn--sm" type="button" data-action="cancel">Cancel Subscription</button>'
        : '<button class="btn btn--quiet btn--sm" type="button" data-action="resume">Resume Subscription</button>') +
      "</div></section>" +
      '<p class="note-secure">' +
      ns.icon("lock", 14) +
      " Card details are never stored by this demonstration.</p>"
    );
  }

  function account() {
    const prefs = store.getPrefs();
    const bookmarks = store.getBookmarks();
    return (
      '<h2 class="ov__title">Account</h2><p class="counter">Demo account details stored only in this browser.</p>' +
      '<form class="panel" id="accountForm" novalidate><div class="field-row">' +
      '<div class="field"><label class="field__label" for="acctName">Display name</label><input class="input" id="acctName" name="acctName" type="text" value="' +
      esc(prefs.accountName || "Demo Customer") +
      '" maxlength="60"><p class="error-msg" id="err-acctName" role="alert"></p></div>' +
      '<div class="field"><label class="field__label" for="acctEmail">Email</label><input class="input" id="acctEmail" name="acctEmail" type="email" value="' +
      esc(prefs.accountEmail || "customer@example.com") +
      '" maxlength="120"><p class="error-msg" id="err-acctEmail" role="alert"></p></div></div>' +
      '<div class="field"><label class="field__label" for="acctCompany">Company</label><input class="input" id="acctCompany" name="acctCompany" type="text" value="' +
      esc(prefs.accountCompany || "") +
      '" placeholder="Optional" maxlength="80"></div>' +
      '<button class="btn btn--primary btn--sm" type="submit">Save changes</button></form>' +
      '<section class="panel"><h3>Saved articles</h3>' +
      (bookmarks.length
        ? '<p class="counter">' +
          bookmarks.length +
          (bookmarks.length === 1 ? " article saved." : " articles saved.") +
          '</p><button class="btn btn--ghost btn--sm" type="button" data-action="saved">Open Saved Articles</button>'
        : '<div class="empty-state"><strong>No saved articles</strong>Bookmark an article from Insights and it appears here.</div>') +
      "</section>" +
      '<section class="panel"><h3>Danger zone</h3><p class="counter">Removes every locally stored demo value: subscription, bookmarks, activity, notifications and preferences.</p>' +
      '<button class="btn btn--quiet btn--sm" type="button" data-action="reset-all">Reset demo data</button></section>'
    );
  }

  function settings() {
    const prefs = store.getPrefs();
    function toggleRow(key, label, desc) {
      return (
        '<div class="pref-row"><div><strong>' +
        esc(label) +
        "</strong><p class=\"counter\">" +
        esc(desc) +
        '</p></div><button class="switch" type="button" role="switch" aria-checked="' +
        String(!!prefs[key]) +
        '" data-pref="' +
        key +
        '"><span class="sr-only">' +
        esc(label) +
        "</span></button></div>"
      );
    }
    return (
      '<h2 class="ov__title">Settings</h2><p class="counter">Interface preferences saved to this browser only.</p>' +
      '<section class="panel"><div class="pref-row"><div><strong>Theme</strong><p class="counter">Choose the appearance of the site.</p></div>' +
      '<div class="seg">' +
      ["system", "dark", "light"]
        .map(function (t) {
          return (
            '<button class="seg__btn' +
            (prefs.theme === t ? " is-active" : "") +
            '" type="button" data-theme-pref="' +
            t +
            '" aria-pressed="' +
            String(prefs.theme === t) +
            '">' +
            t.charAt(0).toUpperCase() +
            t.slice(1) +
            "</button>"
          );
        })
        .join("") +
      "</div></div>" +
      toggleRow("reducedMotion", "Reduced motion", "Disable non-essential animation and autoplay.") +
      toggleRow("newsletter", "Newsletter subscription", "Receive the monthly frontend note (simulated).") +
      toggleRow("compactCards", "Compact cards", "Tighter spacing across card grids.") +
      toggleRow("autoplayCarousel", "Autoplay testimonials", "Advance testimonials automatically.") +
      "</section>" +
      '<section class="panel"><h3>Notifications</h3>' +
      notificationsPanel() +
      "</section>"
    );
  }

  /* --------------------------------------------------------------------- */
  /* Confirmations                                                         */
  /* --------------------------------------------------------------------- */

  function confirmBlock() {
    if (!pending) return "";
    const s = sub();
    if (pending.type === "plan") {
      const p = planById(pending.value);
      const price = s.cycle === "yearly" ? p.yearly : p.monthly;
      return (
        '<div class="confirm" role="alertdialog" aria-label="Confirm plan change"><h3>Switch to ' +
        esc(p.name) +
        "?</h3><p class=\"counter\">Your subscription will change to " +
        store.money(price) +
        " per " +
        (s.cycle === "yearly" ? "year" : "month") +
        ', effective immediately in this demonstration.</p><div class="ov__actions">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-action="cancel-pending">Keep current plan</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-action="confirm" data-autofocus>Confirm change</button></div></div>'
      );
    }
    if (pending.type === "cycle") {
      const p = planById(s.planId);
      const next = pending.value;
      const price = next === "yearly" ? p.yearly : p.monthly;
      return (
        '<div class="confirm" role="alertdialog" aria-label="Confirm billing cycle change"><h3>Switch to ' +
        (next === "yearly" ? "yearly" : "monthly") +
        " billing?</h3><p class=\"counter\">New amount: " +
        store.money(price) +
        " per " +
        (next === "yearly" ? "year" : "month") +
        (next === "yearly" ? " — saving " + store.money(p.monthly * 12 - p.yearly) + " annually." : ".") +
        '</p><div class="ov__actions"><button class="btn btn--ghost btn--sm" type="button" data-action="cancel-pending">Keep current cycle</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-action="confirm" data-autofocus>Confirm change</button></div></div>'
      );
    }
    if (pending.type === "cancel") {
      return (
        '<div class="confirm confirm--danger" role="alertdialog" aria-label="Confirm cancellation"><h3>Are you sure you want to cancel your subscription?</h3>' +
        '<p class="counter">You keep access until ' +
        esc(store.formatDate(s.renewsAt)) +
        '. This is a simulation — nothing is charged or refunded.</p><div class="ov__actions">' +
        '<button class="btn btn--primary btn--sm" type="button" data-action="cancel-pending" data-autofocus>Keep Subscription</button>' +
        '<button class="btn btn--quiet btn--sm" type="button" data-action="confirm">Continue Cancellation</button></div></div>'
      );
    }
    if (pending.type === "invoice") {
      const p = planById(s.planId);
      return (
        '<div class="confirm" role="alertdialog" aria-label="Invoice preview"><h3>Invoice ' +
        esc(s.reference) +
        '</h3><dl class="summary summary--wide"><div><dt>Issued</dt><dd>' +
        esc(store.formatDate(s.startedAt)) +
        "</dd></div><div><dt>Plan</dt><dd>" +
        esc(p.name) +
        " (" +
        (s.cycle === "yearly" ? "yearly" : "monthly") +
        ")</dd></div><div><dt>Payment method</dt><dd>Demo card •••• " +
        esc(s.last4) +
        '</dd></div><div class="summary__total"><dt>Total</dt><dd>' +
        store.money(s.amount) +
        '</dd></div></dl><p class="note-secure">Demonstration invoice — not a real financial document.</p>' +
        '<div class="ov__actions"><button class="btn btn--ghost btn--sm" type="button" data-action="cancel-pending" data-autofocus>Close invoice</button></div></div>'
      );
    }
    if (pending.type === "change-plan") {
      return (
        '<div class="confirm" role="region" aria-label="Choose a plan"><h3>Choose a plan</h3><div class="plan-picker">' +
        D.plans
          .map(function (p) {
            const price = s.cycle === "yearly" ? p.yearly : p.monthly;
            const current = p.id === s.planId;
            return (
              '<div class="plan-picker__item' +
              (current ? " is-current" : "") +
              '"><strong>' +
              esc(p.name) +
              '</strong><span class="price__amount">' +
              store.money(price) +
              '</span><small class="counter">per ' +
              (s.cycle === "yearly" ? "year" : "month") +
              "</small>" +
              (current
                ? '<span class="pill pill--accent">Current plan</span>'
                : '<button class="btn btn--ghost btn--sm" type="button" data-select-plan="' +
                  p.id +
                  '">Select ' +
                  esc(p.name) +
                  "</button>") +
              "</div>"
            );
          })
          .join("") +
        '</div><div class="ov__actions"><button class="btn btn--quiet btn--sm" type="button" data-action="cancel-pending">Close</button></div></div>'
      );
    }
    return "";
  }

  /* --------------------------------------------------------------------- */
  /* Shell                                                                 */
  /* --------------------------------------------------------------------- */

  function emptyState() {
    return (
      '<div class="ov__head"><div><span class="pill pill--accent">Dashboard</span><h2 class="ov__title">No active subscription</h2>' +
      '<p class="counter">Choose a plan to unlock the demo dashboard.</p></div>' +
      '<button class="icon-btn" type="button" data-ov-close aria-label="Close dashboard">' +
      ns.icon("close", 18) +
      '</button></div><div class="ov__body ov__body--center"><div class="empty-state"><strong>Nothing to show yet</strong>' +
      "Complete the demo checkout and your plan, usage, billing and activity appear here." +
      '<div class="ov__actions ov__actions--center"><button class="btn btn--primary" type="button" data-action="see-pricing" data-autofocus>See pricing</button>' +
      '<button class="btn btn--ghost" type="button" data-ov-close>Back to site</button></div></div></div>'
    );
  }

  function render() {
    if (!ov) return;
    const s = sub();
    if (!s) {
      ov.setContent(emptyState());
      return;
    }
    const unread = store.unreadCount();
    const views = { overview: overview, usage: usage, billing: billing, account: account, settings: settings };
    const body = (views[view] || overview)();

    ov.setContent(
      '<div class="ov__head"><div><span class="pill pill--accent">Customer dashboard</span>' +
        '<h2 class="ov__title">' +
        esc(planById(s.planId).name) +
        " Plan</h2><p class=\"counter\">Status: " +
        esc(statusLabel(s)) +
        '</p></div><div class="ov__head-actions">' +
        '<button class="icon-btn tt" type="button" data-action="notifications" aria-label="Notifications' +
        (unread ? ", " + unread + " unread" : "") +
        '" aria-expanded="' +
        String(showNotifications) +
        '">' +
        ns.icon("bell", 18) +
        (unread ? '<span class="badge-dot">' + unread + "</span>" : "") +
        "</button>" +
        '<button class="icon-btn" type="button" data-ov-close aria-label="Close dashboard">' +
        ns.icon("close", 18) +
        "</button></div></div>" +
        '<div class="dash">' +
        '<nav class="dash__nav" aria-label="Dashboard sections">' +
        NAV.map(function (item) {
          return (
            '<button class="dash__navlink' +
            (view === item.id ? " is-active" : "") +
            '" type="button" data-view="' +
            item.id +
            '"' +
            (view === item.id ? ' aria-current="page"' : "") +
            ">" +
            ns.icon(item.icon, 16) +
            "<span>" +
            esc(item.label) +
            "</span></button>"
          );
        }).join("") +
        "</nav>" +
        '<div class="dash__main">' +
        (showNotifications ? notificationsPanel() : "") +
        confirmBlock() +
        body +
        "</div></div>"
    );
    const focusTarget = ov.panel.querySelector("[data-autofocus]");
    if (focusTarget && focusTarget.focus) focusTarget.focus();
  }

  /* --------------------------------------------------------------------- */
  /* Actions                                                               */
  /* --------------------------------------------------------------------- */

  function applyPending() {
    const s = sub();
    if (!pending || !s) return;
    if (pending.type === "plan") {
      const p = planById(pending.value);
      const next = Object.assign({}, s, {
        planId: p.id,
        planName: p.name,
        amount: s.cycle === "yearly" ? p.yearly : p.monthly,
      });
      store.setSubscription(next);
      store.logActivity("Changed plan to " + p.name, store.money(next.amount) + " · " + next.cycle);
      store.notify("Plan changed", "You are now on the " + p.name + " plan.");
      ns.toast({ kind: "success", title: "Plan changed", message: "You are now on the " + p.name + " plan." });
    } else if (pending.type === "cycle") {
      const p = planById(s.planId);
      const cycle = pending.value;
      const next = Object.assign({}, s, {
        cycle: cycle,
        amount: cycle === "yearly" ? p.yearly : p.monthly,
        renewsAt: store.addMonths(new Date(), cycle === "yearly" ? 12 : 1).getTime(),
      });
      store.setSubscription(next);
      ns.pricing.setCycle(cycle);
      store.logActivity("Changed billing cycle to " + cycle, store.money(next.amount));
      store.notify("Billing cycle updated", "Now billed " + cycle + ".");
      ns.toast({ kind: "success", title: "Billing cycle updated", message: "Now billed " + cycle + "." });
    } else if (pending.type === "cancel") {
      const next = Object.assign({}, s, { status: "cancellation_scheduled", cancelAt: s.renewsAt });
      store.setSubscription(next);
      store.logActivity("Scheduled subscription cancellation", "Access until " + store.formatDate(s.renewsAt));
      store.notify("Cancellation scheduled", "Access continues until " + store.formatDate(s.renewsAt) + ".");
      ns.toast({
        kind: "info",
        title: "Cancellation scheduled",
        message: "Access continues until " + store.formatDate(s.renewsAt) + ".",
      });
    }
    pending = null;
    render();
  }

  function bind() {
    ov.panel.addEventListener("click", function (e) {
      const viewBtn = e.target.closest("[data-view]");
      if (viewBtn) {
        view = viewBtn.dataset.view;
        pending = null;
        showNotifications = false;
        render();
        return;
      }
      const selectPlan = e.target.closest("[data-select-plan]");
      if (selectPlan) {
        pending = { type: "plan", value: selectPlan.dataset.selectPlan };
        render();
        return;
      }
      const notif = e.target.closest("[data-notif]");
      if (notif) {
        if (notif.dataset.notif === "all") {
          store.markAllRead();
          ns.toast({ kind: "info", title: "Notifications read", message: "All notifications marked as read." });
        } else {
          store.clearNotifications();
          ns.toast({ kind: "info", title: "Notifications cleared", message: "Your notification list is empty." });
        }
        render();
        return;
      }
      const readBtn = e.target.closest("[data-notif-read]");
      if (readBtn) {
        store.markRead(readBtn.dataset.notifRead);
        render();
        return;
      }
      const themePref = e.target.closest("[data-theme-pref]");
      if (themePref) {
        const value = themePref.dataset.themePref;
        store.setPref("theme", value);
        ns.theme.applyPreference(value);
        store.logActivity("Changed theme", value);
        ns.toast({ kind: "info", title: "Theme updated", message: "Using the " + value + " appearance." });
        render();
        return;
      }
      const prefBtn = e.target.closest("[data-pref]");
      if (prefBtn) {
        const key = prefBtn.dataset.pref;
        const value = prefBtn.getAttribute("aria-checked") !== "true";
        store.setPref(key, value);
        ns.prefs.apply();
        store.logActivity("Updated preference", key + ": " + (value ? "on" : "off"));
        ns.toast({ kind: "success", title: "Preferences updated", message: "Your choice is saved on this device." });
        render();
        return;
      }
      const action = e.target.closest("[data-action]");
      if (!action) return;
      const s = sub();
      switch (action.dataset.action) {
        case "notifications":
          showNotifications = !showNotifications;
          render();
          break;
        case "change-plan":
          pending = { type: "change-plan" };
          view = "billing";
          render();
          break;
        case "change-cycle":
          pending = { type: "cycle", value: s.cycle === "yearly" ? "monthly" : "yearly" };
          render();
          break;
        case "invoice":
          pending = { type: "invoice" };
          render();
          break;
        case "cancel":
          pending = { type: "cancel" };
          render();
          break;
        case "resume":
          store.setSubscription(Object.assign({}, s, { status: "active", cancelAt: null }));
          store.logActivity("Resumed subscription", planById(s.planId).name);
          store.notify("Subscription resumed", "Your plan continues as normal.");
          ns.toast({ kind: "success", title: "Subscription resumed", message: "Your plan continues as normal." });
          render();
          break;
        case "confirm":
          applyPending();
          break;
        case "cancel-pending":
          pending = null;
          render();
          break;
        case "clear-activity":
          store.clearActivity();
          ns.toast({ kind: "info", title: "Activity cleared", message: "Your local activity log is empty." });
          render();
          break;
        case "saved":
          ov.close(true);
          ns.router.go("/saved");
          break;
        case "see-pricing":
          ov.close();
          ns.router.go("/pricing");
          break;
        case "reset-all":
          store.clearAll();
          ns.toast({ kind: "info", title: "Demo data cleared", message: "All local demo state was removed." });
          view = "overview";
          render();
          break;
        default:
          break;
      }
    });

    ov.panel.addEventListener("submit", function (e) {
      if (!e.target.closest("#accountForm")) return;
      e.preventDefault();
      const form = e.target;
      const name = form.querySelector("#acctName");
      const email = form.querySelector("#acctEmail");
      const company = form.querySelector("#acctCompany");
      let ok = true;
      if (!name.value.trim() || name.value.trim().length < 2) {
        form.querySelector("#err-acctName").textContent = "Enter a display name of at least 2 characters.";
        name.setAttribute("aria-invalid", "true");
        ok = false;
      } else {
        form.querySelector("#err-acctName").textContent = "";
        name.setAttribute("aria-invalid", "false");
      }
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim())) {
        form.querySelector("#err-acctEmail").textContent = "Enter a valid email address.";
        email.setAttribute("aria-invalid", "true");
        ok = false;
      } else {
        form.querySelector("#err-acctEmail").textContent = "";
        email.setAttribute("aria-invalid", "false");
      }
      if (!ok) {
        ns.toast({ kind: "error", title: "Check your details", message: "Some account fields need attention." });
        return;
      }
      store.setPref("accountName", name.value.trim());
      store.setPref("accountEmail", email.value.trim());
      store.setPref("accountCompany", company.value.trim());
      store.logActivity("Updated account details", name.value.trim());
      ns.toast({ kind: "success", title: "Settings saved", message: "Your account details were updated." });
    });

    ov.onClose(function () {
      pending = null;
      showNotifications = false;
      ns.router.leave("/dashboard");
    });
  }

  function open(section) {
    if (!ov) {
      ov = ns.overlay.create({ id: "dashboardOverlay", label: "Customer dashboard", variant: "sheet" });
      bind();
      store.subscribe(function () {
        if (ov.isOpen()) render();
      });
    }
    view = section && NAV.some(function (n) { return n.id === section; }) ? section : "overview";
    pending = null;
    render();
    ov.open();
  }

  ns.dashboard = { open: open, close: function () { if (ov) ov.close(); }, render: render };
})((window.NEXORA = window.NEXORA || {}));
