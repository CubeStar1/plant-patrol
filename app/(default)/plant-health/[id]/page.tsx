"use client";

import React, { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import PlantHealthDetails from '@/components/history/plant-health-details';
import { Card } from '@/components/ui/card';
import useUser from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { PlantHealthAnalysis } from '@/lib/types/database-types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PlantHealthDetailsPageProps {
  params: { id: string };
}

export default function PlantHealthDetailsPage({ params }: PlantHealthDetailsPageProps) {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const { id } = params;
  const { data: user } = useUser();
  
  const [analysis, setAnalysis] = useState<PlantHealthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return; // Wait for user to be loaded
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('plant_health_analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching analysis or analysis not found:', error);
        router.push('/plant-health?error=not_found');
      } else {
        setAnalysis(data);
      }
      setLoading(false);
    };

    fetchAnalysis();
  }, [id, user, supabase, router]);

  if (loading) {
    return <AnalysisSkeleton />;
  }

  if (!analysis) {
    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader title="Analysis Not Found" />
            <p className="mt-4">The requested analysis could not be found or you do not have permission to view it.</p>
        </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
        <Button
            onClick={() => router.back()}
            className="mb-8"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plant Health
        </Button>
      <PageHeader
        title="Plant Health Analysis Result"
      />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-1 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden">
                <img src={analysis.image_url} alt="Analyzed plant" className="rounded-lg w-full object-cover" />
            </Card>
            <Card>
                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Submission Details</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li><strong>ID:</strong> <span className='font-mono text-xs'>{analysis.id}</span></li>
                        <li><strong>Date:</strong> {new Date(analysis.created_at).toLocaleString()}</li>
                    </ul>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
          <PlantHealthDetails result={analysis.result as any} />
        </div>
      </div>
    </div>
  );
}

const AnalysisSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <PageHeader title="Plant Health Analysis Result" />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="w-full h-64" />
                <Skeleton className="w-full h-24" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="w-full h-48" />
                <Skeleton className="w-full h-96" />
            </div>
        </div>
    </div>
);
