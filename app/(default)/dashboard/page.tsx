import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import DashboardClientWrapper from '@/components/dashboard/dashboard-client-wrapper';
import AlertConfigurationPopover from '@/components/dashboard/alert-configuration-popover';

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: healthData, error: healthError } = await supabase
    .from('plant_health_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: pestData, error: pestError } = await supabase
    .from('pest_detections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (healthError || pestError) {
    console.error('Error fetching dashboard data:', healthError || pestError);
    // A more robust UI error handling can be added here
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A real-time overview of pest and disease detections."
      >
        <AlertConfigurationPopover />
      </PageHeader>
      <div className="mt-8">
        <DashboardClientWrapper
          healthData={healthData || []}
          pestData={pestData || []}
        />
      </div>
    </>
  );
}

