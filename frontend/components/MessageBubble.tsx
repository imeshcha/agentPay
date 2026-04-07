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
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 px-1">
          {isUser ? "Authorized_User" : "Agent_System"}
        </span>

        {/* Message bubble */}
        <div
          className={
            "px-4 py-3 border-2 text-sm font-bold leading-relaxed " +
            (isUser
              ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(209,209,198,1)]"
              : message.isError
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")
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