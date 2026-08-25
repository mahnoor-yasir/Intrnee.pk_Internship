/**
 * NEXORA — icon system
 * A single inline SVG sprite factory. Icons are stroke-based 24x24 paths so they
 * inherit colour and weight from their container (no icon font, no network cost).
 */
(function (ns) {
  "use strict";

  const P = {
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/><circle cx="12" cy="12" r="3"/>',
    gauge: '<path d="M12 14 8 8"/><path d="M20.4 16a9 9 0 1 0-16.8 0"/><circle cx="12" cy="14" r="1.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    palette:
      '<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.4-.3-.4-.4-.8-.4-1.1 0-.8.7-1.5 1.5-1.5H16a6 6 0 0 0 6-6c0-4.4-4.5-8-10-8z"/>',
    js: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M10 9v5.5A1.5 1.5 0 0 1 8.5 16"/><path d="M17 9.5c-.5-.5-1.2-.7-1.9-.5-.9.2-1.3 1.2-.8 1.9.6.9 2.7.6 2.9 2 .1.9-.8 1.6-1.7 1.5-.7 0-1.3-.3-1.8-.8"/>',
    ts: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 9h5M9.5 9v7"/><path d="M18 9.6c-.5-.4-1.1-.6-1.7-.5-.9.1-1.4 1-.9 1.7.6.9 2.6.6 2.7 2 .1.9-.8 1.5-1.6 1.4-.6 0-1.2-.3-1.6-.7"/>',
    atom: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4.4"/><ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(120 12 12)"/>',
    branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7"/><path d="M18 10.5c0 4-4 3.5-6 5.5"/>',
    github:
      '<path d="M9 19c-4 1.2-4-2-6-2.5m12 5v-3.3a2.9 2.9 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.4 11.4 0 0 0-6 0C6.7 3.3 5.7 3.6 5.7 3.6a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.3 10c0 4.7 2.8 5.7 5.5 6a2.9 2.9 0 0 0-.8 2.2V22"/>',
    plug: '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8z"/><path d="M12 17v5"/>',
    devices:
      '<rect x="2" y="4" width="14" height="10" rx="2"/><path d="M2 18h11"/><rect x="16" y="9" width="6" height="11" rx="2"/>',
    a11y: '<circle cx="12" cy="4.5" r="1.8"/><path d="M4 8.5c2.6 1 5.2 1.5 8 1.5s5.4-.5 8-1.5"/><path d="M12 9.5v5m0 0-3 7m3-7 3 7"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.2v.6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.6"/>',
    arrowRight: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    arrowUp: '<path d="M12 20V5"/><path d="m6 11 6-6 6 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9L12 3.5z"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    phone:
      '<path d="M21 16.5v2.6a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19.2 19.2 0 0 1-5.9-5.9 19.5 19.5 0 0 1-3-8.6A2 2 0 0 1 3.4 2H6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 9.8a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z"/>',
    pin: '<path d="M20 10.5c0 5.5-8 11.5-8 11.5s-8-6-8-11.5a8 8 0 1 1 16 0z"/><circle cx="12" cy="10.3" r="2.8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.3 2"/>',
    x: '<path d="M4 4l7.4 9.6L4.4 20h2.1l5.7-5.3L16.4 20H20l-7.7-10L19.6 4h-2.1l-5.2 4.8L8.6 4H4z"/>',
    linkedin:
      '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.6v.1M12 17v-3.6c0-1.3.9-2.2 2-2.2s2 .9 2 2.2V17"/>',
    dribbble:
      '<circle cx="12" cy="12" r="9"/><path d="M5.2 7.5c4.6 1 9.4.3 12.9-2M3.4 13.6c4.6-1.5 9.9-.4 13.4 3.6M9 3.6c3.2 4 5 8.9 5.4 15"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3.2 9.5h17.6M3.2 14.5h17.6"/><ellipse cx="12" cy="12" rx="4" ry="9"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    trash: '<path d="M4 7h16M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7"/><path d="M6.5 7l.9 12a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7"/>',
    bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6z"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/><path d="M12 14.5v2"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19"/><path d="M6 14.5h4"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h9M17 17h3"/><circle cx="15.5" cy="7" r="1.8"/><circle cx="9.5" cy="12" r="1.8"/><circle cx="14.5" cy="17" r="1.8"/>',
    bookmark: '<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/>',
    "bookmark-fill":
      '<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" fill="currentColor"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c.8-3.3 3.4-5 6.2-5s5.4 1.7 6.2 5"/><path d="M16.5 5.6a3.2 3.2 0 0 1 0 6.2M18 20c-.3-1.6-.9-2.9-1.8-3.9 2.4.2 4.3 1.7 5 3.9z"/>',
    briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/><path d="M3 12h18"/>',
  };


  /**
   * Build an inline SVG string.
   * @param {string} name key from the path map
   * @param {number} size pixel size
   */
  function icon(name, size) {
    const d = P[name] || P.info;
    const s = size || 20;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      s +
      '" height="' +
      s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      d +
      "</svg>"
    );
  }

  ns.icon = icon;
})((window.NEXORA = window.NEXORA || {}));
