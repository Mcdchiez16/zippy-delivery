import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputCls } from "@/components/zippy/ui";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Zippy" },
      { name: "description", content: "Choose a new password for your Zippy account." },
      { property: "og:title", content: "Set a new password — Zippy" },
      { property: "og:description", content: "Choose a new password for your Zippy account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated!");
    navigate({ to: "/go" });
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-extrabold">New password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Password"><input type="password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required /></Field>
        <Button variant="zippy" size="xl" className="w-full" disabled={busy}>Save password</Button>
      </form>
    </main>
  );
}
