"use client";

import { Message } from "@/app/chat/types";
import { memo } from "react";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";
interface MessagesProps {
  isLoading: boolean;
  messages: Message[];
}
function PureMessages({
  isLoading,
  messages,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 pt-4"
    >
      {messages.map((message) => (
        <PreviewMessage
          key={message.id || Math.random()}
          message={message}
          isLoading={isLoading}
        />
      ))}

      {isLoading && <ThinkingMessage />}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}
export const Messages = memo(PureMessages);
