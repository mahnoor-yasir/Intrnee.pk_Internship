import { createFileRoute } from "@tanstack/react-router";

/**
 * TalkBox Assistant — secure AI layer.
 *
 * The browser posts the conversation here; this server route calls the LLM with
 * a key that only ever exists on the server. No API key reaches the frontend.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT =
  "You are TalkBox Assistant, a general-purpose AI assistant inside TalkBox, the internal communication app of a company called Vertex Labs. " +
  "Answer ANY question the user asks — general knowledge, science, history, geography, mathematics, programming, careers, study help, writing, " +
  "rewriting, summarising, brainstorming, stories, troubleshooting, code review — using your own knowledge and reasoning. " +
  "Use the whole conversation for context so follow-ups like 'is it object oriented?' or 'show me an example' work naturally. " +
  "Format with markdown: short paragraphs, headings when useful, bulleted or numbered lists, fenced code blocks with a language tag, inline code " +
  "for identifiers, and tables when they help. Be concrete, give examples, and ask a clarifying question when the request is genuinely ambiguous. " +
  "Never say a topic is unsupported.";

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseMessages(input: unknown): ChatMessage[] {
  const raw = (input as { messages?: unknown })?.messages;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => {
      const item = m as { role?: unknown; content?: unknown };
      const role = item?.role === "assistant" ? "assistant" : "user";
      const content = typeof item?.content === "string" ? item.content.slice(0, 8000) : "";
      return { role, content } as ChatMessage;
    })
    .filter((m) => m.content.trim().length > 0)
    .slice(-24);
}

async function readStreamedText(res: Response) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === "string") text += delta;
      } catch {
        /* partial or non-JSON keep-alive chunk */
      }
    }
  }
  return text;
}

export const Route = createFileRoute("/api/public/talkbox-chat")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const json = (await request.json().catch(() => null)) as unknown;
        const messages = parseMessages(json);
        if (!messages.length) {
          return Response.json({ error: "No message provided." }, { status: 400, headers: CORS });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "The AI service is not configured on the server." },
            { status: 500, headers: CORS },
          );
        }

        const model =
          typeof (json as { model?: unknown })?.model === "string" &&
          (json as { model: string }).model
            ? (json as { model: string }).model
            : "google/gemini-3.6-flash";

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model,
            stream: true,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          }),
        });

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          let message = detail;
          try {
            message = (JSON.parse(detail) as { error?: { message?: string } })?.error?.message || detail;
          } catch {
            /* plain-text error body */
          }
          const friendly =
            upstream.status === 429
              ? "The AI service is rate limited right now. Please try again in a moment."
              : upstream.status === 402
                ? "The AI workspace has run out of credits. Add credits to keep using the assistant."
                : message || `The AI service returned HTTP ${upstream.status}.`;
          return Response.json({ error: friendly }, { status: upstream.status, headers: CORS });
        }

        const text = (await readStreamedText(upstream)).trim();
        if (!text) {
          return Response.json(
            { error: "The model returned an empty response. Try rephrasing your question." },
            { status: 502, headers: CORS },
          );
        }

        return Response.json({ text, model }, { headers: CORS });
      },
    },
  },
});
