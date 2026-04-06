import { WalletConnectButton } from "@/components/ConnectButton";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900 text-white">

      {/* Top navigation bar */}
      <nav className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center 
                        justify-between">

          {/* App name and description */}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              ZingPay
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              AI payment agent on Arc testnet
            </p>
          </div>

          {/* Wallet connect button — top right */}
          <WalletConnectButton />
        </div>
      </nav>

      {/* Main content area */}
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-10">

        {/* Page header */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_10px_40px_-16px_rgba(99,102,241,0.55)] backdrop-blur">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">
            ZingPay
          </h2>
          <p className="text-slate-300">
            Chat with your Bills - like a friend
          </p>
        </div>

        {/* Chat interface */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:p-6 shadow-[0_18px_60px_-30px_rgba(139,92,246,0.7)] backdrop-blur-xl">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}