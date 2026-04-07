import { WalletConnectButton } from "@/components/ConnectButton";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="relative min-h-screen pb-20 selection:bg-black selection:text-white overflow-x-hidden">
      {/* Calm Watermark Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.03]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="stroke-black"
        >
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                strokeWidth="0.05"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simplified Header */}
      <nav className="relative z-10 flex items-center justify-between border-b border-black/5 bg-white/60 backdrop-blur px-6 py-6 sm:px-12">
        <div className="flex flex-col">
          <span className="text-2xl font-extrabold tracking-tighter text-black">ZingPay</span>
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Protocol Core v1.0</span>
        </div>
        <WalletConnectButton />
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Softened Hero */}
        <section className="flex flex-col items-center justify-center py-20 text-center md:py-28">
          <div className="mb-4 inline-block rounded-full bg-zinc-100 px-4 py-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            Arc Testnet Active
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold leading-tight text-black tracking-tight">
            Payments made <br /> <span className="text-[#6366f1]">simply personal</span>.
          </h2>
          <p className="mt-6 max-w-xl text-md font-medium text-zinc-500 leading-relaxed md:text-lg">
            Chat with your bills like a close friend. A minimalist AI agent that settles assets instantly on-chain.
          </p>

          {/* Simple Terminal Info Block */}
          <div className="mt-12 w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-black p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              </div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold">session_logs</span>
            </div>
            <div className="font-mono text-sm text-zinc-300">
              <div className="flex gap-2">
                <span className="text-[#6366f1]">root@zing:~$</span>
                <span className="animate-pulse">initializing_agent_interface...</span>
              </div>
              <div className="text-zinc-500 text-xs mt-1">Ready for natural language input.</div>
            </div>
          </div>
        </section>

        {/* Chat Experience Container */}
        <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-2 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.1)]">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}