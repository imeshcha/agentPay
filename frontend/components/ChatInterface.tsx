"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { MessageBubble } from "./MessageBubble";
import { useSmartAccount } from "@/lib/useSmartAccount";
import { useSessionKey } from "@/lib/useSessionKey";
import { useChat } from "@/lib/useChat";
import { ContactsPanel } from "./ContactsPanel";
import { formatUnits } from "viem";

export function ChatInterface() {
  const { isConnected, address } = useAccount();
  const { smartAccountAddress } = useSmartAccount();
  const { hasSessionKey, sessionKeyAddress } = useSessionKey();
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  // Fetch balances
  const { data: saBalance } = useBalance({
    address: smartAccountAddress as `0x${string}`,
  });
  
  const { data: skBalance } = useBalance({
    address: sessionKeyAddress as `0x${string}`,
  });

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
      <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-200 rounded-3xl shadow-sm">
        <p className="text-zinc-900 text-2xl font-extrabold tracking-tight mb-2">
          Ready to start?
        </p>
        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs text-center px-6">
          Connect your wallet to set up your AI payment agent.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-zinc-50/30 p-2 sm:p-4 rounded-[2rem]">
      {/* Calm Status Bar */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex justify-between">
            <span>Wallet (EOA)</span>
            <span className="text-zinc-300">Default</span>
          </div>
          <div className="font-mono text-xs text-zinc-600 truncate mb-1">
            {address}
          </div>
        </div>

        {smartAccountAddress && (
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm group">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex justify-between">
              <span>Smart Account</span>
              <span className="text-emerald-500 font-black">
                {saBalance ? `${parseFloat(saBalance.formatted).toFixed(4)} ${saBalance.symbol}` : "0.00 ARC"}
              </span>
            </div>
            <div className="font-mono text-xs text-zinc-300 truncate">
              {smartAccountAddress}
            </div>
          </div>
        )}

        {sessionKeyAddress && (
          <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex justify-between">
              <span>Agent Key</span>
              <span className="text-blue-500 font-black">
                {skBalance ? `${parseFloat(skBalance.formatted).toFixed(4)} ${skBalance.symbol}` : "0.00 ARC"}
              </span>
            </div>
            <div className="font-mono text-xs text-zinc-600 truncate">
              {sessionKeyAddress}
            </div>
          </div>
        )}
      </div>

      {isReady && <ContactsPanel />}

      {isReady && (
        <div className="mt-2 flex flex-col flex-1">
          {/* Messages container */}
          <div className="mb-6 min-h-[450px] max-h-[650px] overflow-y-auto bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-200">
                <div className="text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-20">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-30">Waiting for your first message</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input control set */}
          <div className="relative group">
            <div className="flex gap-2 p-2 bg-white border border-zinc-200 rounded-[2rem] shadow-lg transition-all focus-within:shadow-xl focus-within:border-zinc-300">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message (e.g. 'Pay 5 USDC to Kamal')"
                className="flex-1 bg-transparent px-5 py-4 font-medium text-black placeholder-zinc-300 focus:outline-none disabled:opacity-50"
                disabled={isLoading}
              />
              
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="flex items-center justify-center bg-black px-8 py-4 rounded-[1.5rem] font-extrabold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-zinc-200 disabled:scale-100"
              >
                {isLoading ? "..." : "Send"}
              </button>
              
              <button
                onClick={clearMessages}
                className="px-5 text-zinc-300 hover:text-black transition-colors"
                title="Clear messages"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-between px-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Daily Limit: 100.00 USDC
              </span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                Protected by Session Keys
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
