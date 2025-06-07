"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { FileImage, Zap } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdvancedDetectionControlsProps {
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDetect: () => void;
  isLoading: boolean;
  imageSelected: boolean; // To enable/disable detect button
  apiRawResponse: string | null;
}

const AdvancedDetectionControls: React.FC<AdvancedDetectionControlsProps> = ({
  onImageChange,
  onDetect,
  isLoading,
  imageSelected,
  apiRawResponse,
}) => {
  const imageUploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadButtonClick = () => {
    imageUploadInputRef.current?.click();
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <input
        type="file"
        id="advancedImageUploadInput"
        accept="image/*"
        onChange={onImageChange}
        style={{ display: 'none' }}
        ref={imageUploadInputRef}
        disabled={isLoading}
      />
      <Button
        onClick={handleUploadButtonClick}
        variant="outline"
        className="w-full"
        disabled={isLoading}
      >
        <FileImage className="mr-2 h-4 w-4" /> Upload Image
      </Button>

      <Button
        onClick={onDetect}
        disabled={isLoading || !imageSelected}
        className="w-full text-sm font-medium"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Detecting...
          </div>
        ) : (
          <span className="flex items-center justify-center"><Zap className="mr-2 h-5 w-5" /> Detect Objects</span>
        )}
      </Button>

      {apiRawResponse && (
        <div className="space-y-1.5 pt-3 border-t border-muted">
          <Label htmlFor="raw-api-output" className="text-sm font-medium">Raw API Response</Label>
          <Textarea
            id="raw-api-output"
            readOnly
            value={apiRawResponse}
            className="min-h-[300px] max-h-[500px] text-xs bg-muted/50"
            rows={5}
          />
        </div>
      )}
    </div>
  );
};

export default AdvancedDetectionControls;
