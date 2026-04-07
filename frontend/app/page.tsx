import { WalletConnectButton } from "@/components/ConnectButton";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="relative min-h-screen pb-20 selection:bg-black selection:text-white">
      {/* Brutalist Watermark */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.05]">
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
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                strokeWidth="0.1"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="0.05"
            strokeDasharray="1 1"
          />
          <line x1="0" y1="0" x2="100" y2="100" strokeWidth="0.02" />
          <line x1="100" y1="0" x2="0" y2="100" strokeWidth="0.02" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between border-b-4 border-black bg-white px-6 py-6 font-black uppercase tracking-tighter sm:px-12">
        <div className="flex flex-col">
          <span className="text-2xl leading-none text-black">ZingPay__</span>
          <span className="text-[10px] text-zinc-500">Autonomous_Infrastructure_v1</span>
        </div>
        <WalletConnectButton />
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 inline-block bg-black px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest">
            Protocol_Active
          </div>
          <h2 className="text-6xl md:text-8xl font-black leading-none text-black tracking-[0.02em] sm:text-9xl">
            ZINGPAY
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-medium uppercase tracking-tight text-zinc-600 sm:text-xl">
            Chat with your bills like a friend. Direct settlement agent on the Arc testnet.
          </p>

          {/* Terminal Block */}
          <div className="mt-16 w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-300 bg-black p-1 shadow-2xl">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
              <div className="h-2 w-2 rounded-full bg-red-500/50" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
              <div className="h-2 w-2 rounded-full bg-green-500/50" />
              <span className="ml-2 font-mono text-[9px] text-zinc-500 uppercase">system_terminal_01</span>
            </div>
            <div className="p-4 text-left font-mono text-sm leading-relaxed text-zinc-300">
              <div className="flex gap-2">
                <span className="text-indigo-400">admin@zing:~ $</span>
                <span>agent initialize --network=arc_testnet</span>
              </div>
              <div className="text-emerald-400 opacity-60 mt-1">[SYSTEM] Smart Account Connected</div>
              <div className="text-indigo-400 mt-2">$ <span className="animate-pulse">_</span></div>
            </div>
          </div>
        </section>

        {/* Chat Interface Container */}
        <div className="mt-12 rounded-3xl border-4 border-black bg-white p-2 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-x-1 hover:-translate-y-1">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}