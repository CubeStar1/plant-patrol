"use client";

import { useEffect, useRef } from 'react';
import AdvancedDetectionDisplay from '@/components/advanced-detection/advanced-detection-display';

// Correct BoundingBox interface to match the database structure
interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  label: string;
}

interface PestDetectionDetailsProps {
  imageUrl: string;
  detections: BoundingBox[];
}

export default function PestDetectionDetails({ imageUrl, detections }: PestDetectionDetailsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !imageUrl) return;

    const image = new Image();
    image.crossOrigin = "anonymous"; // Handle CORS issues
    image.src = imageUrl;

    image.onload = () => {
      // Set canvas size to match image
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Draw the image on the canvas
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Draw detections if they exist
      if (detections && detections.length > 0) {
        detections.forEach(({ xmin, ymin, xmax, ymax, label }) => {
          const color = '#FF0000'; // Red for all boxes

          // Draw bounding box
          context.strokeStyle = color;
          context.lineWidth = 4; 
          context.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);

          // Set font size for measuring
          context.font = '30px sans-serif'; // Increased font size

          // Draw label background
          context.fillStyle = color;
          const text = `${label}`;
          const textMetrics = context.measureText(text);
          const textWidth = textMetrics.width;
          const textHeight = 35; // Adjusted height for larger font
          context.fillRect(xmin, ymin - textHeight, textWidth + 10, textHeight);

          // Draw label text
          context.fillStyle = '#FFFFFF'; // White text for better contrast
          context.fillText(text, xmin + 5, ymin - 8);
        });
      }
    };

    image.onerror = () => {
      console.error("Failed to load image for canvas from URL:", imageUrl);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'red';
      context.font = '16px sans-serif';
      context.fillText('Error: Could not load image.', 10, 30);
    };

  }, [imageUrl, detections]);

  return (
    <div className="space-y-4">
      <AdvancedDetectionDisplay canvasRef={canvasRef} imagePreviewUrl={imageUrl} />
      
      {detections && detections.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Detected Pests ({detections.length})</h3>
          <ul className="list-disc pl-5 mt-2 text-muted-foreground">
            {detections.map((d, i) => (
              <li key={i}>
                {d.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
