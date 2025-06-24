import { createSupabaseServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import HistoryClientWrapper from '@/components/history/history-client-wrapper';

export default async function HistoryPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: healthData, error: healthError } = await supabase
    .from("plant_health_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: pestData, error: pestError } = await supabase
    .from("pest_detections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Detection History" />
      <div className="mt-6">
        <HistoryClientWrapper 
          healthData={healthData || []} 
          pestData={pestData || []} 
        />
      </div>
    </div>
  );
}
