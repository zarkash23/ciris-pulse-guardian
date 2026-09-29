import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in — CIRIS" },
    { name: "description", content: "Sign in, register your device, or continue in demo mode." },
    { property: "og:title", content: "Sign in — CIRIS" },
    { property: "og:description", content: "Sign in, register your device, or continue in demo mode." },
  ] }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "up" && !data.session) return toast.success("Check your email to confirm your account.");
    nav({ to: "/console" });
  }
  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return toast.error("Google sign-in failed");
    if (!r.redirected) nav({ to: "/console" });
  }
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <p className="label-caps">CIRIS account</p>
      <h1 className="mt-2 text-3xl font-semibold">{mode === "in" ? "Sign in" : "Register device"}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-11 w-full rounded-sm border border-input bg-inset px-3 text-sm" />
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-11 w-full rounded-sm border border-input bg-inset px-3 text-sm" />
        <button disabled={busy} className="h-11 w-full rounded-sm bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button onClick={google} className="mt-3 h-11 w-full rounded-sm border border-border text-sm hover:bg-accent">Continue with Google</button>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-sm text-muted-foreground hover:text-foreground">{mode === "in" ? "New device? Register" : "Have an account? Sign in"}</button>
      <button onClick={() => nav({ to: "/console" })} className="mt-8 block w-full rounded-sm border border-border py-3 text-sm text-muted-foreground hover:text-foreground">Continue in Demo Mode</button>
    </div>
  );
}
