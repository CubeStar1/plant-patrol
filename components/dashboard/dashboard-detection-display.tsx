"use client";

import { useEffect, useRef } from 'react';
import { BoundingBox } from '@/lib/types/database-types';

interface DashboardDetectionDisplayProps {
  imageUrl: string;
  detections: BoundingBox[];
  createdAt: string;
}

export default function DashboardDetectionDisplay({ imageUrl, detections, createdAt }: DashboardDetectionDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !imageUrl) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;

    image.onload = () => {
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      canvas.width = canvas.parentElement?.clientWidth || image.naturalWidth;
      canvas.height = canvas.width / aspectRatio;

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      if (detections && detections.length > 0) {
        const scaleX = canvas.width / image.naturalWidth;
        const scaleY = canvas.height / image.naturalHeight;

        detections.forEach(({ xmin, ymin, xmax, ymax, label }) => {
          const color = '#FF0000'; // Red for all boxes

          const rectX = xmin * scaleX;
          const rectY = ymin * scaleY;
          const rectWidth = (xmax - xmin) * scaleX;
          const rectHeight = (ymax - ymin) * scaleY;

          context.strokeStyle = color;
          context.lineWidth = 2;
          context.strokeRect(rectX, rectY, rectWidth, rectHeight);

          context.font = '14px sans-serif';
          context.fillStyle = color;
          const text = `${label}`;
          const textMetrics = context.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = 16;
          context.fillRect(rectX, rectY - textHeight, textWidth + 4, textHeight);

          context.fillStyle = '#FFFFFF';
          context.fillText(text, rectX + 2, rectY - 4);
        });
      }
    };

    image.onerror = () => {
      console.error("Failed to load image for canvas from URL:", imageUrl);
    };

  }, [imageUrl, detections]);

  return (
    <div className="relative w-full aspect-video bg-black">
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 text-xs font-mono bg-black/50 text-white px-2 py-1 rounded">
        {new Date(createdAt).toLocaleString()}
      </div>
    </div>
  );
}
