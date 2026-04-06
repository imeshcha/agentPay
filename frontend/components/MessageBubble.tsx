"use client";

import { Message } from "@/lib/useChat";
import { PaymentReceipt } from "./PaymentReceipt";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Format timestamp — shows "3:45 PM"
  const timeString = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Loading bubble — animated dots
  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-xs rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full
                            animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div className="w-2 h-2 bg-slate-400 rounded-full
                            animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div className="w-2 h-2 bg-slate-400 rounded-full
                            animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={"flex mb-4 " + (isUser ? "justify-end" : "justify-start")}>
      <div className={"max-w-sm lg:max-w-md " + (isUser ? "items-end" : "items-start") + " flex flex-col"}>

        {/* Message bubble */}
        <div
          className={
            "px-4 py-3 rounded-2xl text-sm leading-relaxed " +
            (isUser
              ? // User bubble — right side, indigo
                "bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-tr-sm shadow-[0_10px_26px_-16px_rgba(99,102,241,0.95)]"
              : message.isError
              ? // Error bubble — red tint
                "bg-red-950/60 border border-red-700/70 text-red-200 rounded-tl-sm"
              : // Agent bubble — left side, dark gray
                "border border-white/10 bg-white/[0.05] text-slate-100 rounded-tl-sm backdrop-blur")
          }
        >
          {message.content}
        </div>

        {/* Payment receipt — shown below agent bubble if payment succeeded */}
        {!isUser && message.isPayment && message.txHash && message.explorerUrl && (
          <div className="w-full mt-1">
            <PaymentReceipt
              txHash={message.txHash}
              explorerUrl={message.explorerUrl}
            />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-slate-400 text-xs mt-1 px-1">
          {timeString}
        </span>
      </div>
    </div>
  );
}