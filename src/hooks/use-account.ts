import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const accountQuery = queryOptions({
  queryKey: ["account"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const user = u.user;
    if (!user) return null;
    const [p, r, d] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("drivers").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    const roles = (r.data ?? []).map((x) => x.role);
    return { user, profile: p.data, roles, driver: d.data, isAdmin: roles.includes("admin") };
  },
});

export function useAccount() {
  return useQuery(accountQuery);
}

export function firstName(acc: { profile?: { full_name: string | null } | null; user: { email?: string } } | null | undefined) {
  const n = acc?.profile?.full_name?.trim() || acc?.user.email?.split("@")[0] || "there";
  return n.split(" ")[0];
}
