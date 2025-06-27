"use client";

import { useState } from "react";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { ChatHeader } from "./chat-header";
import { Message } from "ai";
import { nanoid } from "nanoid";
import { saveMessages } from "../actions";

interface ChatProps {
  id: string;
  initialMessages?: Message[];
}

export function Chat({ id, initialMessages = [] }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }
      
      const { text } = await response.json();

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: text,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Only save the new messages to the database
      const newDbMessages = [userMessage, assistantMessage];
      await saveMessages(newDbMessages, id);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-background">
      <ChatHeader chatId={id} />
      <div className="flex-1 overflow-auto">
        <Messages messages={messages} isLoading={isLoading} />
      </div>
      <div className="sticky bottom-0 bg-gradient-to-t from-background to-transparent">
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <MultimodalInput
            value={input}
            onChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
