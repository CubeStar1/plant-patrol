"use client";

import React from 'react';
import { ImageIcon } from '@radix-ui/react-icons';

interface AdvancedDetectionDisplayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imagePreviewUrl: string | null; // Used to trigger re-render and show placeholder
}

const AdvancedDetectionDisplay: React.FC<AdvancedDetectionDisplayProps> = ({ canvasRef, imagePreviewUrl }) => {
  return (
    <div className="relative w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] aspect-video bg-muted rounded-lg overflow-hidden border border-border shadow-sm flex items-center justify-center text-muted-foreground">
      {imagePreviewUrl ? (
        // Canvas will be drawn onto by the parent component's logic
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="text-center p-4 flex flex-col items-center justify-center">
          <ImageIcon className="w-16 h-16 mb-4 text-muted-foreground/70" />
          <p className="text-lg font-semibold text-foreground">Upload an image to begin</p>
          <p className="text-sm text-muted-foreground">Your image and detection results will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedDetectionDisplay;
