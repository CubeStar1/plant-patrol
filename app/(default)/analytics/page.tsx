import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import AnalyticsClientWrapper from '@/components/analytics/analytics-client-wrapper';

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: healthData, error: healthError } = await supabase
    .from('plant_health_analyses')
    .select('*')
    .eq('user_id', user.id);

  const { data: pestData, error: pestError } = await supabase
    .from('pest_detections')
    .select('*')
    .eq('user_id', user.id);

  if (healthError || pestError) {
    console.error('Error fetching analytics data:', healthError || pestError);
    // A more robust UI error handling can be added here
  }

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
      />
      <div className="mt-8">
        <AnalyticsClientWrapper
          healthData={healthData || []}
          pestData={pestData || []}
        />
      </div>
    </>
  );
}
