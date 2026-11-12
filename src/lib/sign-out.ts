import type { QueryClient } from "@tanstack/react-query";
import type { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export async function signOut(qc: QueryClient, navigate: ReturnType<typeof useNavigate>) {
  await qc.cancelQueries();
  qc.clear();
  await supabase.auth.signOut();
  navigate({ to: "/auth", replace: true });
}
