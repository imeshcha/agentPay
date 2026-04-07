import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen py-10 selection:bg-black selection:text-white overflow-hidden bg-[#F0F0E8]">
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

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Welcome Section - Identical to Screenshot */}
        <section className="flex flex-col items-center justify-center py-24 text-center md:py-36">
          <div className="mb-6 inline-block rounded-full bg-white px-5 py-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-100 shadow-sm">
            Arc Testnet Active
          </div>
          <h1 className="text-6xl md:text-[8rem] font-extrabold leading-[0.9] text-black tracking-tighter">
            Payments made <br /> <span className="text-[#6366f1]">simply personal</span><span className="text-black">.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
            Chat with your bills like a close friend. A minimalist AI agent that settles assets instantly on-chain.
          </p>

          <div className="mt-12 flex flex-col items-center gap-6">
            <Link 
              href="/chat"
              className="bg-black text-white px-10 py-5 rounded-full text-lg font-bold tracking-tight hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
              Start Chatting →
            </Link>
            <div className="flex items-center gap-2 overflow-hidden px-4 py-2 bg-zinc-100/50 rounded-lg">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Agent_Stable_Connection_Active</span>
            </div>
          </div>

          {/* Simple Terminal Info Block - Exclusively on Welcome Page */}
          <div className="mt-20 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-black p-8 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-zinc-800" />
                <div className="h-3 w-3 rounded-full bg-zinc-900" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase font-black tracking-widest">session_logs</span>
            </div>
            <div className="font-mono text-base text-zinc-400 leading-relaxed">
              <div className="flex gap-3 mb-2">
                <span className="text-[#6366f1] font-bold">root@zing:~$</span>
                <span className="text-zinc-200 animate-pulse">initializing_agent_interface...</span>
              </div>
              <div className="text-zinc-500 text-sm ml-10">Ready for natural language input.</div>
            </div>
          </div>
        </section>
      </div>

      <footer className="relative z-10 py-10 border-t border-black/5 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">© 2026 ZingPay__Autonomous_Protocol</p>
      </footer>
    </main>
  );
}