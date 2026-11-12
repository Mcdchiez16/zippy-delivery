import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Field, inputCls } from "@/components/zippy/ui";
import box from "@/assets/box-hero.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Zippy" },
      { name: "description", content: "Sign in or create your Zippy account." },
      { property: "og:title", content: "Sign in — Zippy" },
      { property: "og:description", content: "Sign in or create your Zippy account." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && navigate({ to: "/go", replace: true }));
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/go", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        if (!agree) throw new Error("Please accept the terms and privacy policy.");
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/go", data: { full_name: name } },
        });
        if (error) throw error;
        setSent("Check your email to confirm your account, then come back to sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        setSent("We sent a password reset link to your email.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed. Please try again.");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <img src={box} alt="" className="h-24 w-24 object-contain animate-float" />
        <h1 className="mt-3 text-3xl font-extrabold">
          {mode === "signin" ? "Welcome back!" : mode === "signup" ? "Join Zippy" : "Reset password"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {mode === "forgot" ? "We'll email you a reset link." : "Let's get your deliveries moving."}
        </p>
      </div>

      {sent ? (
        <div className="mt-8 rounded-3xl bg-secondary p-6 text-center font-semibold text-secondary-foreground">
          {sent}
          <Button variant="soft" className="mt-4 w-full h-12" onClick={() => { setSent(null); setMode("signin"); }}>Back to sign in</Button>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <Field label="Full name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" /></Field>
            )}
            <Field label="Email"><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></Field>
            {mode !== "forgot" && (
              <Field label="Password"><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></Field>
            )}
            {mode === "signup" && (
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--color-primary)]" />
                <span>I agree to Zippy's Terms of Service and Privacy Policy.</span>
              </label>
            )}
            {mode === "signin" && (
              <button type="button" className="text-sm font-bold text-primary-deep" onClick={() => setMode("forgot")}>Forgot password?</button>
            )}
            <Button variant="zippy" size="xl" className="w-full" disabled={busy}>
              {busy ? "One sec…" : mode === "signin" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs font-bold text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
              <button type="button" onClick={google} className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[#747775] bg-[#FFFFFF] px-3 text-[14px] font-medium text-[#1F1F1F]">
                <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                Continue with Google
              </button>
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : mode === "signin" ? "New to Zippy? " : ""}
            <button className="font-bold text-primary-deep" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create an account" : "Log in"}
            </button>
          </p>
        </>
      )}
    </main>
  );
}
