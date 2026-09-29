import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import type { Database } from "@/integrations/supabase/types";
import { HARDWARE_SUMMARY } from "./hardware";

export const AI_MODEL = "openai/gpt-6-astra";
const RUN_ID = "X-Lovable-AIG-Run-ID";

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/** Verify the bearer token and return a user-scoped client (RLS applies). */
export async function authenticate(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { supabase, userId: data.user.id };
}

export function createProvider(request: Request) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  let runId = request.headers.get(RUN_ID)?.trim() || undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
      return res;
    },
  });
  return provider;
}

export const providerOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
};

export const SAFETY_RULES = `
SAFETY RULES (mandatory):
- You are a device assistant, NOT a doctor. Never make a medical diagnosis or claim certainty about health.
- Separate DEVICE OBSERVATIONS (what sensors report) from possible explanations. Label health-related content as observations.
- For potentially dangerous readings (e.g. SpO2 < 92%, very high or very low heart rate at rest, suspected fall with no response, SOS active) recommend contacting a healthcare professional or emergency services.
- All telemetry is SIMULATED demo data from a virtual device, not a physical watch. Never claim otherwise.
- Only use values present in the provided context; do not invent readings.`;

export const CIRIS_BACKGROUND = `CIRIS is a solar-powered health & safety smartwatch prototype.
Hardware:
${HARDWARE_SUMMARY}
Fall detection: free-fall (<0.4 g) → impact (>3 g) → stillness → 15 s cancellable countdown → SOS.
Low Power mode below 15% battery. Battery 220 mAh LiPo (~814 mWh). Solar charging via CN3065 (~82% efficient in the model).`;
