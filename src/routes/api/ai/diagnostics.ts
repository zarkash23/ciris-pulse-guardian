import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { AI_MODEL, CIRIS_BACKGROUND, SAFETY_RULES, authenticate, createProvider, json, providerOptions } from "@/lib/ciris/ai.server";

const MODES: Record<string, string> = {
  full: "Run a FULL diagnostic across every subsystem (power, solar, optical, motion, thermal, environment, safety, sensor consistency).",
  quick: "Run a QUICK health check: only the most important 1-3 findings.",
  event: "Analyse the MOST RECENT significant event in the event log and explain it using telemetry evidence.",
  sensor: "Analyse SENSOR health: anomalies, stuck/flat readings, drift, noise, and inconsistent sensor combinations.",
  battery: "Analyse the BATTERY and POWER system: consumption vs solar harvest, trend, runtime estimate.",
  safety: "Analyse the SAFETY subsystem: fall/impact/SOS events, motion evidence, and escalation guidance.",
};

const FORMAT = `Respond with ONLY a JSON object (no markdown fences) of this shape:
{"status":"OK"|"WARNING"|"CRITICAL","summary":string,"findings":[{"detected":string,"evidence":string,"subsystem":string,"likely_cause":string,"recommended_action":string,"confidence":number (0-100),"severity":"OK"|"WARNING"|"CRITICAL"}],"safety_note":string}
Evidence must cite concrete numbers from the context. 1-6 findings, most severe first. Keep each field under 220 characters.`;

export const Route = createFileRoute("/api/ai/diagnostics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticate(request);
        if (!auth) return json({ error: "Sign in to use AI diagnostics." }, 401);
        const body = (await request.json().catch(() => null)) as { mode?: string; context?: unknown } | null;
        if (!body?.mode || !MODES[body.mode] || !body.context) return json({ error: "Invalid request" }, 400);
        const provider = createProvider(request);
        if (!provider) return json({ error: "AI provider not configured" }, 503);
        try {
          const result = streamText({
            model: provider.responses(AI_MODEL),
            system: `You are CIRIS AI Diagnostics, an engineering diagnostic engine for a wearable.\n${CIRIS_BACKGROUND}\n${SAFETY_RULES}\n${FORMAT}`,
            prompt: `${MODES[body.mode]}\n\nCIRIS CONTEXT (JSON):\n${JSON.stringify(body.context).slice(0, 24000)}`,
            abortSignal: request.signal,
            maxRetries: 0,
            providerOptions,
          });
          const text = await result.text;
          const match = text.match(/\{[\s\S]*\}/);
          if (!match) return json({ error: "AI returned no result" }, 502);
          const parsed = JSON.parse(match[0]);
          if (!parsed.status || !Array.isArray(parsed.findings)) return json({ error: "AI returned an invalid result" }, 502);
          parsed.findings = parsed.findings.slice(0, 6).map((f: Record<string, unknown>) => ({ ...f, confidence: Math.max(0, Math.min(100, Number(f.confidence) || 0)) }));
          return json({ result: parsed });
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          console.error("Diagnostics AI error", e);
          if (status === 429) return json({ error: "AI is busy (rate limited). Try again shortly." }, 429);
          if (status === 402) return json({ error: "AI credits exhausted for this workspace." }, 402);
          return json({ error: "AI unavailable" }, status && status >= 400 ? status : 502);
        }
      },
    },
  },
});
