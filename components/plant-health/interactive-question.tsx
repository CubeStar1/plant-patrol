"use client";

import { Button } from "@/components/ui/button";
import { Question } from "@/lib/types";
import React from "react";

interface InteractiveQuestionProps {
  activeQuestion: Question;
  onQuestionAnswer: (answer: "yes" | "no") => void;
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export const InteractiveQuestion: React.FC<InteractiveQuestionProps> = ({
  activeQuestion,
  onQuestionAnswer,
}) => {
  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <CardTitle className="text-blue-800 dark:text-blue-300">
          Need more information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700 dark:text-blue-400 mb-4">
          {activeQuestion.text}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => onQuestionAnswer("yes")} variant="outline">
            {activeQuestion.options.yes.translation}
          </Button>
          <Button onClick={() => onQuestionAnswer("no")} variant="outline">
            {activeQuestion.options.no.translation}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
