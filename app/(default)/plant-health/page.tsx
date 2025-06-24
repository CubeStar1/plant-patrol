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

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('/api/plant-health', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data: KindwiseResponse = await response.json();

      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${selectedImage.name}`;


      const { error: uploadError } = await supabase.storage
        .from('agrolens_images')
        .upload(fileName, selectedImage);

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('agrolens_images')
        .getPublicUrl(fileName);

      const { data: savedData, error: dbError } = await supabase
        .from('plant_health_analyses')
        .insert({ user_id: user.id, image_url: publicUrl, result: data })
        .select('id')
        .single();

      if (dbError) {
        throw new Error(`Failed to save analysis: ${dbError.message}`);
      }

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
