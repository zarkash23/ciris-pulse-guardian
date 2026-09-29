import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { AI_MODEL, CIRIS_BACKGROUND, SAFETY_RULES, authenticate, createProvider, json, providerOptions } from "@/lib/ciris/ai.server";

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticate(request);
        if (!auth) return json({ error: "Sign in to chat with CIRIS Intelligence." }, 401);
        const body = (await request.json().catch(() => null)) as { messages?: UIMessage[]; context?: unknown } | null;
        if (!body?.messages?.length) return json({ error: "Invalid request" }, 400);
        const provider = createProvider(request);
        if (!provider) return json({ error: "AI provider not configured" }, 503);

        const messages = body.messages.slice(-30);
        const lastUser = [...messages].reverse().find((m) => m.role === "user");

        const result = streamText({
          model: provider.responses(AI_MODEL),
          system: `You are CIRIS Intelligence, a context-aware assistant for the CIRIS wearable.
${CIRIS_BACKGROUND}
${SAFETY_RULES}
Answer concisely using markdown. Reference specific current values, recent events and diagnostic results from the context when relevant. If the question is about health, start with the device observation and add escalation guidance where appropriate.

CURRENT CIRIS CONTEXT (JSON, refreshed each message):
${JSON.stringify(body.context ?? {}).slice(0, 24000)}`,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          maxRetries: 0,
          providerOptions,
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onError: (e) => {
            console.error("Chat AI error", e);
            const status = (e as { statusCode?: number }).statusCode;
            if (status === 429) return "AI is busy (rate limited). Please try again shortly.";
            if (status === 402) return "AI credits are exhausted for this workspace.";
            return "AI unavailable. Please retry.";
          },
          onFinish: async ({ responseMessage }) => {
            const rows = [
              ...(lastUser ? [{ user_id: auth.userId, message_id: lastUser.id, role: "user", parts: lastUser.parts as never }] : []),
              { user_id: auth.userId, message_id: responseMessage.id, role: "assistant", parts: responseMessage.parts.filter((p) => p.type === "text") as never },
            ];
            const { error } = await auth.supabase.from("chat_messages").insert(rows);
            if (error) console.error("Chat persist failed", error);
          },
        });
      },
    },
  },
});
