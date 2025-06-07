// app/(default)/advanced-detection/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'; // Removed CubeIcon as it's not used after header change
import AdvancedDetectionControls from '@/components/advanced-detection/advanced-detection-controls'; 
import AdvancedDetectionDisplay from '@/components/advanced-detection/advanced-detection-display'; 
// Card, CardContent, CardHeader, CardTitle, Textarea might be removed if no longer used after this change
// For now, assume they might be used elsewhere or handle their removal in a separate cleanup step if confirmed unused.

interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
}

interface DetectionResponse {
  boxes: BoundingBox[];
  rawResponse?: string; 
  error?: string;
}

const AdvancedDetectionPage: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<BoundingBox[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiRawResponse, setApiRawResponse] = useState<string | null>(null); 

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null); 

  // Debounce resize handler
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (imageRef.current) {
          drawInitialImageOnCanvas(imageRef.current);
          if (detections.length > 0) {
            drawDetections(detections);
          }
        }
      }, 250); // Adjust debounce delay as needed
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [detections]); // Add other dependencies if they affect resizing logic

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        setImagePreviewUrl(resultUrl);
        setDetections([]);
        setError(null);
        setApiRawResponse(null);
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          drawInitialImageOnCanvas(img);
        };
        img.src = resultUrl;
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
      imageRef.current = null;
      setDetections([]);
      setApiRawResponse(null);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const drawInitialImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    const displayWidth = rect.width;
    const displayHeight = rect.height;

    let newWidth = img.naturalWidth;
    let newHeight = img.naturalHeight;
    const aspectRatio = newWidth / newHeight;

    if (newWidth > displayWidth) {
      newWidth = displayWidth;
      newHeight = newWidth / aspectRatio;
    }
    if (newHeight > displayHeight) {
      newHeight = displayHeight;
      newWidth = newHeight * aspectRatio;
    }
    if (newWidth > displayWidth) {
      newWidth = displayWidth;
      newHeight = newWidth / aspectRatio;
    }

    canvas.width = newWidth * dpr;
    canvas.height = newHeight * dpr;
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, newWidth, newHeight);
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    console.log(`Canvas drawn: ${newWidth}x${newHeight} (logical), ${canvas.width}x${canvas.height} (physical)`);
  };

  const drawDetections = (boxes: BoundingBox[]) => {
    const canvas = canvasRef.current;
    const originalImage = imageRef.current;
    if (!canvas || !originalImage || !canvas.getContext('2d')) return;

    const ctx = canvas.getContext('2d')!;
    const logicalWidth = parseFloat(canvas.style.width || canvas.width.toString());
    const logicalHeight = parseFloat(canvas.style.height || canvas.height.toString());

    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.drawImage(originalImage, 0, 0, logicalWidth, logicalHeight); 

    const scaleX = logicalWidth / 1000;
    const scaleY = logicalHeight / 1000;

    boxes.forEach(box => {
      const x = box.xmin * scaleX;
      const y = box.ymin * scaleY;
      const width = (box.xmax - box.xmin) * scaleX;
      const height = (box.ymax - box.ymin) * scaleY;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = Math.max(2, 2 * (window.devicePixelRatio || 1)); 
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = 'red';
      const fontSize = Math.max(14, 14 * (window.devicePixelRatio || 1));
      ctx.font = `${fontSize}px Arial`;
      const labelText = `${box.label}`;
      const textMetrics = ctx.measureText(labelText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize; 

      let textX = x;
      let textY = y > textHeight ? y - (textHeight * 0.2) : y + height + textHeight; 

      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.fillRect(textX, textY - textHeight, textWidth + 4, textHeight + 4);
      
      ctx.fillStyle = 'white';
      ctx.fillText(labelText, textX + 2, textY + 2);
    });
    console.log(`Detections drawn: ${boxes.length} boxes`);
  };

  useEffect(() => {
    if (imageRef.current && imagePreviewUrl) { // Ensure imagePreviewUrl is present
      drawInitialImageOnCanvas(imageRef.current);
      if (detections.length > 0) {
        drawDetections(detections);
      }
    }
  }, [imagePreviewUrl, detections, drawInitialImageOnCanvas, drawDetections]); // Added drawInitialImageOnCanvas and drawDetections to dependency array

  const handleDetect = async () => {
    if (!imageFile) {
      setError("Please select an image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDetections([]);
    setApiRawResponse(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/gemini-detect', {
        method: 'POST',
        body: formData,
      });

      const result: DetectionResponse = await response.json();
      setApiRawResponse(result.rawResponse || JSON.stringify(result)); 

      if (!response.ok) {
        throw new Error(result.error || `API request failed with status ${response.status}`);
      }

      if (result.error) {
        setError(result.error);
        setApiRawResponse(result.rawResponse || null);
      } else {
        setDetections(result.boxes || []);
        setApiRawResponse(result.rawResponse || null);
        // Drawing is handled by the useEffect hook watching `detections` and `imagePreviewUrl`
      }
    } catch (err) {
      console.error("Detection API error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to process detection: ${errorMessage}`);
      setApiRawResponse(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start py-2 bg-background text-foreground min-h-screen">
      <main className='container mx-auto px-4 py-8 w-full'>
        <header className="mb-8 text-center">
          <h1 className='text-3xl font-bold tracking-tight text-primary sm:text-3xl md:text-5xl'>
            Advanced Detection Interface
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
            Utilize advanced models for precise object detection with custom prompts.
          </p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6 w-full max-w-3xl mx-auto">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Controls Section (typically sidebar or smaller column) */}
          <div className="lg:w-1/3 w-full">
            <AdvancedDetectionControls 
              onImageChange={handleImageChange}
              onDetect={handleDetect}
              isLoading={isLoading}
              imageSelected={!!imageFile}
              apiRawResponse={apiRawResponse}
            />
          </div>

          {/* Display Section (main content area) */}
          <div className="lg:w-2/3 w-full">
            <AdvancedDetectionDisplay canvasRef={canvasRef} imagePreviewUrl={imagePreviewUrl} />
          </div>
        </div> {/* Closes <div className="flex flex-col lg:flex-row gap-8 w-full"> */}
      </main>
    </div>
  );
};

export default AdvancedDetectionPage;
