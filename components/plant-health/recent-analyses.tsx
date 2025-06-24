import { createSupabaseBrowser } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf } from 'lucide-react';

async function RecentPlantHealthAnalyses() {
  const supabase = await createSupabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Don't show for logged-out users
  }

  const { data: analyses, error } = await supabase
    .from('plant_health_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Analyses</h2>
        
        {error && <p className="text-destructive">Could not load recent analyses.</p>}

        {!error && (!analyses || analyses.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-lg border border-dashed">
                <Leaf className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No recent analyses found.</p>
                <p className="text-sm text-muted-foreground">Your submissions will appear here.</p>
            </div>
        )}

        {!error && analyses && analyses.length > 0 && (
            <div className="space-y-4">
                {analyses.map(analysis => (
                    <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <img src={analysis.image_url} alt="Analyzed plant" className="w-16 h-16 object-cover rounded-md" />
                                <div>
                                    <p className="font-semibold">Analysis from {new Date(analysis.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{analysis.id}</p>
                                </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/plant-health/${analysis.id}`}>
                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}

export default RecentPlantHealthAnalyses;
