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

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isReady = !!smartAccountAddress && hasSessionKey;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !address || isLoading || !isReady) return;
    const messageToSend = inputValue;
    setInputValue("");
    await sendMessage(messageToSend, address);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#F0F0E8] border-2 border-dashed border-zinc-300 rounded-xl">
        <p className="text-zinc-900 text-xl font-black uppercase tracking-tighter mb-2">
          AUTH_REQUIRED
        </p>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-tight">
          Connect your wallet to initialize protocol
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Brutalist Info Bar */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">WALLET_EOA_LINK</div>
          <div className="font-mono text-xs text-black font-bold">
            {address?.toUpperCase()}
          </div>
        </div>
        {smartAccountAddress && (
          <div className="border-2 border-black bg-black p-3 shadow-[4px_4px_0px_0px_rgba(209,209,198,1)]">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 text-white/50">SMART_ACCOUNT_CORE</div>
            <div className="font-mono text-xs text-white font-bold">
              {smartAccountAddress.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {isReady && <ContactsPanel />}

      {isReady && (
        <div className="mt-4 flex flex-col flex-1">
          {/* Messages container */}
          <div className="mb-6 min-h-[400px] max-h-[600px] overflow-y-auto border-4 border-black bg-white p-6 shadow-[inset_0px_4px_12px_rgba(0,0,0,0.05)]">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-300 grayscale opacity-20">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input control set */}
          <div className="relative">
            <div className="flex gap-2 p-1 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="PROMPT: PAY 5 USDC TO ALICE..."
                className="flex-1 bg-transparent px-4 py-4 font-mono text-sm font-bold text-black placeholder-zinc-300 focus:outline-none disabled:opacity-50 uppercase"
                disabled={isLoading}
              />
              
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="group flex items-center justify-center bg-black px-8 py-4 font-black text-white uppercase tracking-widest transition-all hover:bg-zinc-800 disabled:bg-zinc-300"
              >
                {isLoading ? "..." : "EXECUTE"}
              </button>
              
              <button
                onClick={clearMessages}
                className="border-l-2 border-black px-4 text-black hover:bg-zinc-100"
                title="TERMINATE_SESSION"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Protocol_Limit: 100.00_USDC
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Interface_Stable: 200ms_RTT
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}