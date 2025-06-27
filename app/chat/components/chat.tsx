"use client";

import { useChat } from "@ai-sdk/react";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { ChatHeader } from "./chat-header";
import { Message, ToolCall } from "ai";
import { saveMessages } from "../actions";
import { useState } from "react";

interface ChatProps {
  id: string;
  initialMessages?: Message[];
}

interface ExtendedMessage extends Message {
  toolCalls?: {
    tool: string;
    input: string;
    output: string | null;
  }[];
}

export function Chat({ id, initialMessages = [] }: ChatProps) {
  const [currentToolCalls, setCurrentToolCalls] = useState<{
    tool: string;
    input: string;
    output: string | null;
  }[]>([]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages,
    api: '/api/chat',
    onFinish: async (message) => {
      // Clear tool calls when message is finished
      // setCurrentToolCalls([]);
      
      // Save the completed assistant message
      if (message && message.role) {
        await saveMessages([message], id);
      }
    },
    onError: async (error) => {
      console.error("Error fetching response:", error);
      // Clear tool calls on error
      setCurrentToolCalls([]);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
      };
           
      // Save error message
      await saveMessages([errorMessage], id);
    },
    onResponse: async (response) => {
      // Log the response for debugging
      console.log('Received HTTP response from server:', response);
    },
    onToolCall: ({ toolCall }) => {
      // Add tool call to current state
      setCurrentToolCalls(prev => [...prev, {
        tool: toolCall.toolName,
        input: JSON.stringify(toolCall.args, null, 2),
        output: null
      }]);
    }
  });

  // Custom submit handler to save user messages
  const customHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing tool calls when starting new request
    setCurrentToolCalls([]);
         
    // Save user message before submitting
    if (input.trim()) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: input.trim(),
      };
           
      // Save user message to database
      await saveMessages([userMessage], id);
    }
         
    // Call the original handleSubmit
    handleSubmit(e);
  };

  // Combine messages with current tool calls for the last assistant message
  const messagesWithToolCalls: ExtendedMessage[] = messages.map((message, index) => {
    // If this is the last message, it's an assistant message, and we have current tool calls
    if (index === messages.length - 1 && 
        message.role === 'assistant' && 
        currentToolCalls.length > 0) {
      return {
        ...message,
        toolCalls: currentToolCalls
      };
    }
    return message;
  });

  // If we're loading and have tool calls but no assistant message yet, create a temporary one
  if (isLoading && currentToolCalls.length > 0 && 
      (messages.length === 0 || messages[messages.length - 1].role !== 'assistant')) {
    messagesWithToolCalls.push({
      id: 'temp-assistant',
      role: 'assistant',
      content: '',
      toolCalls: currentToolCalls
    });
  }


  return (
    <div className="relative flex-1 flex flex-col h-full bg-background">
      <ChatHeader chatId={id} />
      <div className="flex-1 overflow-auto">
        <Messages
          isLoading={isLoading}
          messages={messagesWithToolCalls}
        />
      </div>
      <div className="sticky bottom-0 bg-gradient-to-t from-background to-transparent">
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <MultimodalInput
            value={input}
            onChange={handleInputChange}
            handleSubmit={customHandleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
