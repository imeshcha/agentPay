"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { MessageBubble } from "./MessageBubble";
import { useSmartAccount } from "@/lib/useSmartAccount";
import { useSessionKey } from "@/lib/useSessionKey";
import { useChat } from "@/lib/useChat";
import { ContactsPanel } from "./ContactsPanel";

export function ChatInterface() {
  const { isConnected, address } = useAccount();
  const { smartAccountAddress } = useSmartAccount();
  const { hasSessionKey } = useSessionKey();
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  // Input field state
  const [inputValue, setInputValue] = useState("");

  // Ref to the bottom of the messages list
  // Used to auto-scroll when new messages arrive
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Agent is fully ready when smart account + session key both exist
  const isReady = !!smartAccountAddress && hasSessionKey;

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send button click or Enter key
  const handleSend = async () => {
    if (!inputValue.trim() || !address || isLoading || !isReady) return;

    const messageToSend = inputValue;
    setInputValue(""); // Clear input immediately

    await sendMessage(messageToSend, address);
  };

  // Handle Enter key in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-white/20 bg-white/[0.03]">
        <p className="text-slate-200 text-lg font-medium mb-2">
          Connect your wallet to start
        </p>
        <p className="text-slate-400 text-sm">
          Your smart account will be set up automatically
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Wallet info bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur">
        <div>
          <span className="text-slate-400 text-xs">EOA wallet: </span>
          <span className="text-emerald-300 font-mono text-xs">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        {smartAccountAddress && (
          <div>
            <span className="text-slate-400 text-xs">Smart account: </span>
            <span className="text-indigo-300 font-mono text-xs">
              {smartAccountAddress.slice(0, 6)}...
              {smartAccountAddress.slice(-4)}
            </span>
          </div>
        )}
      </div>

      {/* Contacts panel — shown after setup complete */}
      {isReady && <ContactsPanel />}

      {/* Chat messages area — only shown when ready */}
      {isReady && (
        <>
          {/* Messages container */}
          <div className="mb-3 flex-1 min-h-64 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">

            {/* Render each message */}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Invisible div at the bottom for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Try: "Pay 1 USDC to 0x742d35Cc..."'
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none disabled:opacity-50 transition-colors"
              disabled={isLoading}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-medium text-white shadow-[0_12px_24px_-16px_rgba(99,102,241,0.9)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                "Send"
              )}
            </button>

            {/* Clear chat button */}
            <button
              onClick={clearMessages}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white"
              title="Clear chat"
            >
              ✕
            </button>
          </div>

          {/* Hint text below input */}
          <p className="mt-2 text-center text-xs text-slate-400">
            Press Enter to send · Max 100 USDC per transaction
          </p>
        </>
      )}
    </div>
  );
}