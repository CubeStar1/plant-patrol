"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Disease, KindwiseSuggestion } from "@/lib/types";
import { Bug, FileText, Microscope, ShieldCheck, Stethoscope } from "lucide-react";
import React from "react";

interface DiseaseSuggestionsProps {
  disease: Disease;
  highlightedSuggestion: number | null;
}

export const DiseaseSuggestions: React.FC<DiseaseSuggestionsProps> = ({
  disease,
  highlightedSuggestion,
}) => {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 mb-6">
        <Bug className="h-7 w-7 text-destructive" />
        Disease Suggestions
      </h2>
      <div className="grid gap-6">
        {disease.suggestions.map((suggestion: KindwiseSuggestion, index) => (
          <Card
            key={suggestion.id}
            className={`overflow-hidden border-l-4 transition-all ${
              highlightedSuggestion === index
                ? "border-destructive ring-2 ring-destructive"
                : "border-destructive"
            }`}
          >
            <CardContent className="p-6 grid md:grid-cols-12 gap-6">
              <div className="md:col-span-9">
                <h3 className="text-2xl font-bold text-destructive mb-2">{suggestion.name}</h3>

                {suggestion.details.description?.value && (
                  <div className="flex items-start gap-3 mt-4">
                    <FileText className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                    <p className="text-muted-foreground">
                      {suggestion.details.description.value}
                    </p>
                  </div>
                )}

                {suggestion.details.treatment &&
                  typeof suggestion.details.treatment !== "string" && (
                    <div className="mt-6 space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2"><Stethoscope className="h-5 w-5"/> Recommended Treatment</h4>
                      <div className="pl-7 space-y-4">
                        {suggestion.details.treatment.biological &&
                          suggestion.details.treatment.biological.length > 0 && (
                            <div>
                              <h5 className="font-semibold flex items-center gap-2 mb-2"><Microscope className="h-4 w-4"/> Biological</h5>
                              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {suggestion.details.treatment.biological.map(
                                  (item, i) => (
                                    <li key={i}>{item}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        {suggestion.details.treatment.prevention &&
                          suggestion.details.treatment.prevention.length > 0 && (
                            <div>
                              <h5 className="font-semibold flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4"/> Prevention</h5>
                              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {suggestion.details.treatment.prevention.map(
                                  (item, i) => (
                                    <li key={i}>{item}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
                <div className="relative h-32 w-32">
                  <CircularProgress 
                    value={suggestion.probability * 100} 
                    className="text-destructive"
                    strokeWidth={8}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-destructive">
                      {(suggestion.probability * 100).toFixed(0)}
                      <span className="text-xl">%</span>
                    </span>
                    <span className="text-sm text-muted-foreground">Confidence</span>
                  </div>
                </div>
              </div>
            </CardContent>

            {suggestion.similar_images &&
              suggestion.similar_images.length > 0 && (
                <div className="bg-muted/30 px-6 py-4 border-t">
                  <h4 className="font-semibold mb-3">Similar Images</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {suggestion.similar_images.map((image) => (
                      <Dialog key={image.id}>
                        <DialogTrigger asChild>
                          <button className="block rounded-lg overflow-hidden border-2 border-transparent hover:border-destructive transition-all aspect-square focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <img
                              src={image.url}
                              alt={suggestion.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-2">
                          <DialogHeader className="sr-only">
                            <DialogTitle>{suggestion.name}</DialogTitle>
                            <DialogDescription>
                              An expanded view of a similar image for {suggestion.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <img
                            src={image.url}
                            alt={suggestion.name}
                            className="rounded-lg w-full h-auto max-h-[80vh] object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              )}
          </Card>
        ))}
      </div>
    </section>
  );
};
