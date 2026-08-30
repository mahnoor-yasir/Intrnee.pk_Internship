/* TalkBox — safe markdown renderer for chat bubbles.
 * Everything is escaped first, then a small, predictable subset of markdown is
 * turned back into HTML: fenced code blocks, inline code, headings, ordered and
 * unordered lists, blockquotes, bold, italic, links and paragraphs.
 */
window.TBFormat = (function () {
  "use strict";

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  function inline(text) {
    let out = esc(text);
    // inline code first so its contents are not further formatted
    const codes = [];
    out = out.replace(/`([^`]+)`/g, (_, c) => {
      codes.push(c);
      return "\u0000CODE" + (codes.length - 1) + "\u0000";
    });
    out = out
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/(^|[\s(])((?:https?:\/\/)[^\s<)]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/(^|\s)_([^_\n]+)_/g, "$1<em>$2</em>");
    out = out.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => "<code>" + esc(codes[Number(i)]) + "</code>");
    return out;
  }

  function codeBlock(lang, body) {
    const label = lang ? esc(lang) : "code";
    return (
      '<div class="code-block"><div class="code-block__bar"><span>' + label +
      '</span><button type="button" class="code-copy" data-code-copy>Copy</button></div>' +
      '<pre><code>' + esc(body.replace(/\n+$/, "")) + "</code></pre></div>"
    );
  }

  function renderBlocks(src) {
    const lines = String(src == null ? "" : src).replace(/\r\n?/g, "\n").split("\n");
    let html = "";
    let i = 0;

    const flushList = (ordered, items) =>
      (ordered ? "<ol>" : "<ul>") + items.map((t) => "<li>" + inline(t) + "</li>").join("") + (ordered ? "</ol>" : "</ul>");

    while (i < lines.length) {
      const line = lines[i];

      // fenced code block
      const fence = line.match(/^\s*```\s*([a-zA-Z0-9+#._-]*)\s*$/);
      if (fence) {
        const lang = fence[1];
        const body = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
        i++; // closing fence
        html += codeBlock(lang, body.join("\n"));
        continue;
      }

      if (!line.trim()) { i++; continue; }

      // heading
      const h = line.match(/^\s*(#{1,4})\s+(.*)$/);
      if (h) {
        const level = Math.min(4, h[1].length) + 2; // h3..h6 inside bubbles
        html += "<h" + level + ">" + inline(h[2]) + "</h" + level + ">";
        i++;
        continue;
      }

      // horizontal rule
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { html += "<hr />"; i++; continue; }

      // blockquote
      if (/^\s*>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ""));
        html += "<blockquote>" + inline(buf.join(" ")) + "</blockquote>";
        continue;
      }

      // ordered list
      if (/^\s*\d+[.)]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
        html += flushList(true, items);
        continue;
      }

      // unordered list
      if (/^\s*[-*•]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ""));
        html += flushList(false, items);
        continue;
      }

      // paragraph
      const buf = [];
      while (
        i < lines.length && lines[i].trim() &&
        !/^\s*```/.test(lines[i]) && !/^\s*#{1,4}\s/.test(lines[i]) &&
        !/^\s*\d+[.)]\s+/.test(lines[i]) && !/^\s*[-*•]\s+/.test(lines[i]) &&
        !/^\s*>\s?/.test(lines[i])
      ) buf.push(lines[i++]);
      html += "<p>" + inline(buf.join("\n")).replace(/\n/g, "<br />") + "</p>";
    }

    return html || "";
  }

  return { render: renderBlocks, inline, escape: esc };
})();
