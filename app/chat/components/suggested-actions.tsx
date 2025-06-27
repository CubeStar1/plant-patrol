"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Message } from "ai";
import { memo } from "react";
interface SuggestedActionsProps {
  chatId: string;
  append: (message: Message) => Promise<string | null | undefined>;
  handleSubmit: (e: React.FormEvent, value: string) => void;
}
function PureSuggestedActions({
  chatId,
  append,
  handleSubmit,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: "What are the",
      label: "highest packages offered?",
      action:
        "What are the highest packages offered in placements so far in 2025?",
    },
    {
      title: "How many companies",
      label: "visited this year?",
      action:
        "How many companies have visited for campus placements this year in 2025?",
    },
    {
      title: "Which department has",
      label: "the most placements?",
      action:
        "Which department has the highest number of placements this year in 2025?",
    },
    {
      title: "What is the average",
      label: "package for CSE?",
      action:
        "What is the average package offered to CSE students this year in 2025?",
    },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 20,
          }}
          transition={{
            delay: 0.05 * index,
          }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={(e) => {
              const event = new Event("submit", {
                bubbles: true,
                cancelable: true,
              }) as unknown as React.FormEvent;
              handleSubmit(event, suggestedAction.action);
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
export const SuggestedActions = memo(PureSuggestedActions, () => true);
