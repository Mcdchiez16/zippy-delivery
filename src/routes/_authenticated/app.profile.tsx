import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bike, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, Field, inputCls } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { signOut } from "@/lib/sign-out";

export const Route = createFileRoute("/_authenticated/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Zippy" }, { name: "description", content: "Your Zippy profile and settings." }] }),
  component: Profile,
});

function Profile() {
  const { data: acc } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    setName(acc?.profile?.full_name ?? "");
    setPhone(acc?.profile?.phone ?? "");
  }, [acc]);

  async function save() {
    if (!acc) return;
    const { error } = await supabase.from("profiles").update({ full_name: name.trim(), phone: phone.trim() }).eq("id", acc.user.id);
    if (error) { toast.error("Couldn't save. Try again."); return; }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["account"] });
  }

  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-2xl font-extrabold text-primary-foreground">{(name || acc?.user.email || "?").charAt(0).toUpperCase()}</div>
        <div><h1 className="text-xl font-extrabold">{name || "Your profile"}</h1><p className="text-sm text-muted-foreground">{acc?.user.email}</p></div>
      </div>
      <Card className="space-y-4 p-4">
        <Field label="Full name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Phone"><input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Button variant="zippy" className="h-12 w-full" onClick={save}>Save</Button>
      </Card>
      <Card className="divide-y divide-border">
        <Link to="/driver" className="flex items-center gap-3 p-4 font-bold"><Bike className="h-5 w-5 text-primary" />{acc?.driver ? "Switch to driver mode" : "Deliver with Zippy & earn"}</Link>
        {acc?.isAdmin && <Link to="/admin" className="flex items-center gap-3 p-4 font-bold"><Shield className="h-5 w-5 text-sky" />Admin dashboard</Link>}
        <button onClick={() => signOut(qc, navigate)} className="flex w-full items-center gap-3 p-4 font-bold text-destructive"><LogOut className="h-5 w-5" />Log out</button>
      </Card>
    </div>
  );
}
