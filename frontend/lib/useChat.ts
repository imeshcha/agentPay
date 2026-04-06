"use client";

import { useState, useCallback } from "react";
import { sendMessageAPI } from "./api";

// Types for our messages
export type MessageRole = "user" | "agent";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isPayment?: boolean;
  txHash?: string;
  explorerUrl?: string;
  isLoading?: boolean;
  isError?: boolean;
};

type UseChatReturn = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string, walletAddress: string) => Promise<void>;
  clearMessages: () => void;
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([
    // Welcome message shown when chat first loads
    {
      id: "welcome",
      role: "agent",
      content:
        "Hello! I am your Arc payment agent. I can send USDC payments on your behalf. Try saying: Pay 1 USDC to 0x...",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string, walletAddress: string) => {
      if (!content.trim() || isLoading) return;

      // Generate unique ID for each message
      const userMessageId = Date.now().toString();
      const agentMessageId = (Date.now() + 1).toString();

      // Step 1 — Add user message to chat immediately
      // This makes the UI feel instant and responsive
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Step 2 — Add loading placeholder for agent response
      const loadingMessage: Message = {
        id: agentMessageId,
        role: "agent",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, loadingMessage]);

      try {
        // Step 3 — Call backend agent API
        const response = await sendMessageAPI(walletAddress, content.trim());

        // Step 4 — Replace loading bubble with actual response
        const agentMessage: Message = {
          id: agentMessageId,
          role: "agent",
          content: response.reply,
          timestamp: new Date(),
          isPayment: response.isPayment,
          txHash: response.txHash,
          explorerUrl: response.explorerUrl,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMessageId ? agentMessage : msg
          )
        );
      } catch (error: unknown) {
        const errorText =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";

        // Step 5 — Replace loading with error message
        const errorMessage: Message = {
          id: agentMessageId,
          role: "agent",
          content: errorText,
          timestamp: new Date(),
          isError: true,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMessageId ? errorMessage : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "agent",
        content:
          "Hello! I am your Arc payment agent. I can send USDC payments on your behalf. Try saying: Pay 1 USDC to 0x...",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}