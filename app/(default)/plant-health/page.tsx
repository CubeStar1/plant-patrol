"use client";

import React, { useState, Suspense } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import useUser from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ImageUploadForm } from '@/components/plant-health/image-upload-form';
import RecentPlantHealthAnalyses from '@/components/plant-health/recent-analyses';
import { Skeleton } from '@/components/ui/skeleton';
import { KindwiseResponse } from '@/lib/types';

export default function PlantHealthPage() {
  const supabase = createSupabaseBrowser();
  const { data: user } = useUser();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !user) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. Upload image to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${selectedImage.name}`;
      const { error: uploadError } = await supabase.storage
        .from('agrolens_images')
        .upload(fileName, selectedImage);

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('agrolens_images')
        .getPublicUrl(fileName);

      // 3. Send URL to API for analysis
      const response = await fetch('/api/plant-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisData: KindwiseResponse = await response.json();

      // 4. Save analysis result to the database
      const { data: savedData, error: dbError } = await supabase
        .from('plant_health_analyses')
        .insert({ user_id: user.id, image_url: publicUrl, result: analysisData })
        .select('id')
        .single();

      if (dbError) {
        throw new Error(`Failed to save analysis: ${dbError.message}`);
      }

      // 5. Redirect to the results page
      if (savedData) {
        router.push(`/plant-health/${savedData.id}`);
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsAnalyzing(false);
    }
    // No finally block to set isAnalyzing to false, as the page will redirect on success.
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Plant Health Analysis" 
      />
      <div className="mt-6">
        <ImageUploadForm
          onImageSelect={handleImageSelect}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          previewUrl={previewUrl}
          selectedImage={selectedImage}
          error={error}
        />
        
        <Suspense fallback={<RecentAnalysesSkeleton />}>
          <RecentPlantHealthAnalyses />
        </Suspense>
      </div>
    </div>
  );
}

const RecentAnalysesSkeleton = () => (
  <div className="mt-12">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  </div>
);
