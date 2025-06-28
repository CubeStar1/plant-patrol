"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { SparklesIcon } from "./icons";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ToolCallMessageProps {
  tool: string;
  input: string;
  output: string | null;
}

const PureToolCallMessage = ({ tool, input, output }: ToolCallMessageProps) => {
  const parsedInput = JSON.parse(input);
  const query = parsedInput.query || "Searching database...";
  const toolLabel = {
    "querySupabase": "Querying Database...",
    "default": "Searching database..."
  }[tool] || "Searching database...";

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{
          y: 5,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        data-role="assistant"
      >
        <div className="flex gap-4 w-full">
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Accordion type="single" collapsible>
              <AccordionItem value="tool-call">
                <AccordionTrigger className="font-medium">
                  <div className="flex items-center gap-2">
                    <SearchIcon className="w-4 h-4" />
                    {toolLabel}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 bg-muted/50 px-3 py-2 rounded-xl">
                    <div className="text-sm font-medium mb-2">Input Details</div>
                    <div className="text-sm text-muted-foreground">
                      <pre className="whitespace-pre-wrap p-2 bg-muted rounded-md">
                        {input}
                      </pre>
                    </div>
                    {output ? (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Output</div>
                        <MarkdownContent
                          content={output}
                          id={`tool-call-output-${Math.random()}`}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">Processing...</div>
                        <div className="h-2 w-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const ToolCallMessage = memo(PureToolCallMessage, (prevProps, nextProps) => {
  if (prevProps.output !== nextProps.output) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
