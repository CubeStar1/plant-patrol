"use client";

import { Message } from "@/app/chat/types";
import { ToolCall } from "ai";
import { ToolCallMessage } from "./tool-call-message";
import { memo } from "react";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";

interface ExtendedMessage extends Message {
  toolCalls?: {
    tool: string;
    input: string;
    output: string | null;
  }[];
}

interface MessagesProps {
  isLoading: boolean;
  messages: ExtendedMessage[];
}

function PureMessages({
  isLoading,
  messages,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom();

  return (
    <div
      ref={messagesContainerRef as React.RefObject<HTMLDivElement>}
      className="flex flex-col min-w-0 gap-6 flex-1 pt-4"

    >
      {messages.map((message, index) => (
        <div key={message.id || index}>
          {/* Show tool calls first if they exist for this message */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mb-4">
              {message.toolCalls.map((call, callIndex) => (
                <ToolCallMessage
                  key={`${message.id}-tool-${callIndex}`}
                  tool={call.tool}
                  input={call.input}
                  output={call.output}
                />
              ))}
            </div>
          )}
          
          {/* Show the actual message content */}
          {message.content && (
            <PreviewMessage
              message={message}
              isLoading={isLoading && index === messages.length - 1}
            />
          )}
        </div>
      ))}

      {/* Show thinking indicator when loading and no tool calls are active */}
      {isLoading && (
        messages.length === 0 || 
        !messages[messages.length - 1]?.toolCalls?.length
      ) && (
        <ThinkingMessage />
      )}

      <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
    </div>
  );
}

export const Messages = memo(PureMessages);