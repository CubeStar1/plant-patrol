"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Replace, ScanLine, UploadCloud } from "lucide-react";
import React from "react";

interface ImageUploadFormProps {
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  previewUrl: string | null;
  selectedImage: File | null;
  error: string | null;
}

export const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  onImageSelect,
  onAnalyze,
  isAnalyzing,
  previewUrl,
  error,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload Plant Image</h3>
            <p className="text-muted-foreground mb-4">Drag & drop or click to select a file</p>
            <Input
              id="plant-image-input"
              type="file"
              accept="image/*"
              onChange={onImageSelect}
              disabled={isAnalyzing}
              className="sr-only"
            />
            <Label htmlFor="plant-image-input" className={cn(buttonVariants(), "cursor-pointer")}>
              Choose File
            </Label>
          </div>
        ) : (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Selected plant"
              className="rounded-lg w-full h-auto max-h-[400px] object-contain"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <Input
                id="plant-image-replace"
                type="file"
                accept="image/*"
                onChange={onImageSelect}
                disabled={isAnalyzing}
                className="sr-only"
              />
              <Label htmlFor="plant-image-replace" className={cn(buttonVariants({ variant: "secondary" }), "cursor-pointer")}>
                <Replace className="mr-2 h-4 w-4" />
                Change Image
              </Label>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch bg-muted/50 px-6 py-4">
        <Button onClick={onAnalyze} disabled={!previewUrl || isAnalyzing} className="w-full">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ScanLine className="mr-2 h-4 w-4" />
              Analyze Plant
            </>
          )}
        </Button>
        {error && (
          <p className="mt-2 text-sm text-center text-red-600 dark:text-red-400">{error}</p>
        )}
      </CardFooter>
    </Card>
  );
};
