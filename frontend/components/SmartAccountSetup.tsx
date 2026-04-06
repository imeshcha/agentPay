"use client";

import { useSmartAccount } from "@/lib/useSmartAccount";
import { useAccount } from "wagmi";

export function SmartAccountSetup() {
  const { isConnected } = useAccount();
  const { smartAccountAddress, isLoading, error, createAccount } =
    useSmartAccount();

  if (!isConnected) return null;

  if (smartAccountAddress) {
    return (
      <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 shadow-[0_12px_28px_-20px_rgba(16,185,129,0.8)]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-emerald-300 rounded-full" />
          <span className="text-emerald-300 font-medium text-sm">
            Smart account active
          </span>
        </div>
        <p className="text-slate-200 text-xs font-mono break-all">
          {smartAccountAddress}
        </p>
        {/* Fixed: Added the missing <a> opening tag below */}
        <a
          href={`https://testnet.arcscan.app/address/${smartAccountAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-emerald-300 transition-colors hover:text-emerald-200"
        >
          View on ArcScan →
        </a>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        <span className="text-yellow-400 font-medium text-sm">
          Smart account required
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-4">
        Create your smart account on Arc to enable agent payments.
        This is a one-time setup.
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={createAccount}
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 font-medium text-white transition-all duration-200 hover:from-indigo-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Creating smart account...
          </span>
        ) : (
          "Create Smart Account"
        )}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        No gas fee required on testnet
      </p>
    </div>
  );
}