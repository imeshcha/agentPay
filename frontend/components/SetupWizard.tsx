"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useGlobalSetup } from "./SetupProvider";
import { WalletConnectButton } from "./ConnectButton";

export function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const { isConnected, address } = useAccount();
  
  // Use the global setup instead of local hooks for perfect synchronization
  const { 
    smartAccountAddress, 
    hasSessionKey, 
    createAccount, 
    setupSessionKey, 
    isLoading 
  } = useGlobalSetup();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Auto-advance steps based on actual global state
  useEffect(() => {
    if (!isConnected) {
      setStep(1);
    } else if (!smartAccountAddress) {
      setStep(2);
    } else if (!hasSessionKey) {
      setStep(3);
    } else {
      // Setup complete
      onComplete();
    }
  }, [isConnected, smartAccountAddress, hasSessionKey, onComplete]);

  const handleCreateAccount = async () => {
    try {
      setError(null);
      await createAccount();
    } catch (err: any) {
      setError(err.message || "Failed to provision smart account.");
    }
  };

  const handleSetupSessionKey = async () => {
    try {
      setError(null);
      await setupSessionKey();
    } catch (err: any) {
      setError(err.message || "Failed to authorize session key.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-lg bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Decorative Grid Watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="stroke-black">
            <path d="M 0 10 L 100 10 M 0 20 L 100 20 M 0 30 L 100 30 M 0 40 L 100 40 M 0 50 L 100 50 M 0 60 L 100 60 M 0 70 L 100 70 M 0 80 L 100 80 M 0 90 L 100 90" strokeWidth="0.1" />
            <path d="M 10 0 L 10 100 M 20 0 L 20 100 M 30 0 L 30 100 M 40 0 L 40 100 M 50 0 L 50 100 M 60 0 L 60 100 M 70 0 L 70 100 M 80 0 L 80 100 M 90 0 L 90 100" strokeWidth="0.1" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Agent_Setup</h2>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 w-6 rounded-full transition-all duration-500 ${s <= step ? 'bg-black' : 'bg-zinc-200'}`} 
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Step 01</p>
                <h3 className="text-4xl font-extrabold leading-none tracking-tighter">Initialize Identity</h3>
              </div>
              <p className="text-zinc-600 font-medium text-lg leading-relaxed">
                Connect your primary wallet to begin the agent provisioning process. This will be used to deploy your Smart Account.
              </p>
              <div className="pt-4">
                <WalletConnectButton />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Step 02</p>
                <h3 className="text-4xl font-extrabold leading-none tracking-tighter">Deploy Account</h3>
              </div>
              <p className="text-zinc-600 font-medium text-lg leading-relaxed">
                We're deploying a secure Smart Account on the Arc Network. This account allows your agent to handle complex payment logic.
              </p>
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl font-mono text-xs text-zinc-500">
                <div className="flex justify-between mb-1">
                  <span>NETWORK:</span>
                  <span className="text-black font-bold">ARC_TESTNET_V1</span>
                </div>
                <div className="flex justify-between">
                  <span>WALLET:</span>
                  <span className="text-black font-bold truncate ml-4">{address}</span>
                </div>
              </div>
              <button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-black/10"
              >
                {isLoading ? "Provisioning..." : "Provision Smart Account →"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Step 03</p>
                <h3 className="text-4xl font-extrabold leading-none tracking-tighter">Authorize Agent</h3>
              </div>
              <p className="text-zinc-600 font-medium text-lg leading-relaxed">
                Grant your AI agent permission to execute payments within predefined limits. No gas required for this authorization.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                  <div className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Daily Limit</div>
                  <div className="text-xl font-black text-emerald-900">100 USDC</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <div className="text-[9px] font-bold text-blue-600 uppercase mb-1">Asset Support</div>
                  <div className="text-xl font-black text-blue-900">Multi-Chain</div>
                </div>
              </div>
              <button
                onClick={handleSetupSessionKey}
                disabled={isLoading}
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-black/10"
              >
                {isLoading ? "Authorizing..." : "Grant Permissions →"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold font-mono">
              [ERROR]: {error}
            </div>
          )}

          {/* Terminal Footer */}
          <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {isLoading ? 'System_Processing' : 'System_Ready'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-300">v0.4.2-stable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
