"use client";

import { useSessionKey } from "@/lib/useSessionKey";
import { useAccount } from "wagmi";
import { useSmartAccount } from "@/lib/useSmartAccount";

export function SessionKeySetup() {
  const { isConnected } = useAccount();
  const { smartAccountAddress } = useSmartAccount();
  const { hasSessionKey, sessionKeyAddress, isLoading, error, setupSessionKey } =
    useSessionKey();

  // Only show if wallet is connected AND smart account exists
  if (!isConnected || !smartAccountAddress) return null;

  // Session key already set up — show success state
  if (hasSessionKey) {
    return (
      <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 shadow-[0_12px_28px_-20px_rgba(16,185,129,0.8)]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-emerald-300 rounded-full" />
          <span className="text-emerald-300 font-medium text-sm">
            Agent authorized
          </span>
        </div>
        <p className="text-slate-200 text-xs mb-1">
          The agent can now execute payments automatically.
        </p>
        {sessionKeyAddress && (
          <p className="text-slate-400 text-xs font-mono break-all">
            Session key: {sessionKeyAddress}
          </p>
        )}
      </div>
    );
  }

  // Session key not set up yet — show setup button
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-blue-400 font-medium text-sm">
          Authorize agent
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-2">
        Sign a message to authorize the agent to execute payments.
        This is a one-time setup — no gas required.
      </p>

      {/* Spending rules info */}
      <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-3">
        <p className="text-slate-300 text-xs font-medium mb-2">
          Agent limits:
        </p>
        <ul className="text-slate-400 text-xs space-y-1">
          <li>• Max 100 USDC per transaction</li>
          <li>• USDC payments only</li>
          <li>• You can revoke anytime</li>
        </ul>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={setupSessionKey}
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-medium text-white transition-all duration-200 hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Setting up agent...
          </span>
        ) : (
          "Authorize Agent"
        )}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        MetaMask will ask you to sign a message — not a transaction
      </p>
    </div>
  );
}