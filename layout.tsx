import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || !["ADMIN", "MANAGEMENT"].includes(profile.role)) redirect("/parent/dashboard");

  return children;
}
