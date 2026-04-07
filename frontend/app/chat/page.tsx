import { WalletConnectButton } from "@/components/ConnectButton";
import { ChatInterface } from "@/components/ChatInterface";
import Link from "next/link";

export default function ChatPage() {
  return (
    <main className="relative min-h-screen pb-20 selection:bg-black selection:text-white bg-[#F0F0E8]">
      {/* Subtle Background Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="black" />
          </pattern>
          <rect width="100" height="100" fill="url(#dotGrid)" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between border-b border-black/5 bg-white/60 backdrop-blur px-6 py-6 sm:px-12">
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-extrabold tracking-tighter text-black">ZingPay</span>
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Protocol Core v1.0</span>
        </Link>
        <div className="flex items-center gap-4">
          <WalletConnectButton />
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-10">
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-black">Payments_Dashboard</h1>
            <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-black transition-colors">
              ← Back to Home
            </Link>
        </div>
        
        {/* Clean Chat Interface - No Hero/Terminal here */}
        <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-2 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.08)]">
          <ChatInterface />
        </div>
      </div>

      <footer className="relative z-10 py-20 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">© 2026 _ Developed By Imesh Chathura (Non-commercial showcase project)</p>
      </footer>
    </main>
  );
}

