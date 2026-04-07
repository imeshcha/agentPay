"use client";

import { Message } from "@/lib/useChat";
import { PaymentReceipt } from "./PaymentReceipt";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const timeString = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-6">
        <div className="border-2 border-dashed border-zinc-400 bg-white px-4 py-3">
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] font-black text-zinc-400 animate-pulse uppercase">
              Processing_Data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={"flex mb-6 " + (isUser ? "justify-end" : "justify-start")}>
      <div className={"max-w-[85%] sm:max-w-md " + (isUser ? "items-end" : "items-start") + " flex flex-col"}>
        
        {/* Message label */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 px-2">
          {isUser ? "You" : "Zing Agent"}
        </span>

        {/* Message bubble */}
        <div
          className={
            "px-5 py-3.5 border text-sm font-medium leading-relaxed rounded-2xl " +
            (isUser
              ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
              : message.isError
              ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200 shadow-sm")
          }
        >
          {message.content}
        </div>


        {/* Payment receipt */}
        {!isUser && message.isPayment && message.txHash && message.explorerUrl && (
          <div className="w-full mt-2">
            <PaymentReceipt
              txHash={message.txHash}
              explorerUrl={message.explorerUrl}
            />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[9px] font-black text-zinc-400 mt-1 uppercase">
          {timeString} // TX_ID: {message.id.slice(0, 8)}
        </span>
      </div>
    </div>
  );
}