"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useChains,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { useSmartAccount } from "@/lib/useSmartAccount";
import { useSessionKey } from "@/lib/useSessionKey";

// RainbowKit's ConnectButton handles everything:
// - Shows "Connect Wallet" when not connected
// - Shows wallet address + balance when connected
// - Handles network switching
// - Shows disconnect option
// We wrap it so we can add custom styling around it

export function WalletConnectButton() {
  const { disconnect } = useDisconnect();
  const { chainId } = useAccount();
  const chains = useChains();
  const { connectors, connect, isPending: isConnectPending } = useConnect();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [copiedField, setCopiedField] = useState<"wallet" | "smart" | "agent" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    smartAccountAddress,
    isLoading: isAccountLoading,
    createAccount,
    error: accountError,
  } = useSmartAccount();
  const {
    hasSessionKey,
    sessionKeyAddress,
    isLoading: isSessionLoading,
    setupSessionKey,
    error: sessionError,
  } = useSessionKey();

  const copyText = async (
    value: string,
    field: "wallet" | "smart" | "agent"
  ) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1200);
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setDetailsOpen(false);
        setInstructionsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          mounted,
          authenticationStatus,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          if (!connected) {
            return (
              <button
                onClick={() => setConnectModalOpen(true)}
                type="button"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_24px_-16px_rgba(99,102,241,0.9)] transition-all hover:from-indigo-400 hover:to-violet-400"
              >
                Connect Wallet
              </button>
            );
          }

          if (chain.unsupported) {
            return (
              <button
                onClick={() => setNetworkModalOpen(true)}
                type="button"
                className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
              >
                Wrong network
              </button>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNetworkModalOpen(true)}
                type="button"
                className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-200 transition-colors hover:bg-white/[0.1]"
              >
                {chain.name}
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.1]"
                >
                  {account.displayName}
                  {account.displayBalance ? ` (${account.displayBalance})` : ""}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 p-1 shadow-xl backdrop-blur">
                    <button
                      type="button"
                      onClick={async () => {
                        await copyText(account.address, "wallet");
                        setMenuOpen(false);
                        setDetailsOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-white/10"
                    >
                      Copy address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        disconnect();
                        setMenuOpen(false);
                        setDetailsOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-300 transition-colors hover:bg-red-500/20"
                    >
                      Disconnect
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDetailsOpen(false);
                        setInstructionsOpen(true);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-white/10"
                    >
                      Instructions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDetailsOpen(true);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-white/10"
                    >
                      More wallet options
                    </button>
                  </div>
                )}

                {detailsOpen && (
                  <div className="absolute right-0 top-full z-40 mt-2 w-[360px] space-y-3 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur">
                    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-300" />
                        <span className="text-sm font-medium text-emerald-300">
                          Smart account active
                        </span>
                      </div>
                      <div className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 p-2">
                        <p className="break-all font-mono text-[11px] text-emerald-100">
                          {smartAccountAddress || "Not created yet"}
                        </p>
                      </div>
                      {smartAccountAddress && (
                        <button
                          type="button"
                          onClick={() => copyText(smartAccountAddress, "smart")}
                          className="mt-2 rounded-md border border-emerald-300/40 bg-emerald-400/20 px-2 py-1 text-[11px] font-medium text-emerald-100 transition-colors hover:bg-emerald-400/30"
                        >
                          {copiedField === "smart" ? "Copied" : "Copy smart account"}
                        </button>
                      )}
                      {smartAccountAddress && (
                        <a
                          href={`https://testnet.arcscan.app/address/${smartAccountAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-emerald-300 hover:text-emerald-200"
                        >
                          View on ArcScan →
                        </a>
                      )}
                      {!smartAccountAddress && (
                        <button
                          type="button"
                          onClick={createAccount}
                          disabled={isAccountLoading}
                          className="mt-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-indigo-400 hover:to-violet-400 disabled:opacity-50"
                        >
                          {isAccountLoading ? "Creating..." : "Create smart account"}
                        </button>
                      )}
                      {accountError && (
                        <p className="mt-2 text-xs text-red-200">{accountError}</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-300" />
                        <span className="text-sm font-medium text-cyan-300">
                          Agent authorized
                        </span>
                      </div>
                      <p className="text-xs text-slate-200">
                        {hasSessionKey
                          ? "The agent can now execute payments automatically."
                          : "Agent is not authorized yet."}
                      </p>
                      <p className="mt-2 text-[11px] text-cyan-200">
                        Agent wallet address
                      </p>
                      <div className="mt-1 rounded-lg border border-cyan-300/40 bg-cyan-300/10 p-2">
                        <p className="break-all font-mono text-[11px] text-cyan-100">
                          {sessionKeyAddress || "Not available"}
                        </p>
                      </div>
                      {sessionKeyAddress && (
                        <button
                          type="button"
                          onClick={() => copyText(sessionKeyAddress, "agent")}
                          className="mt-2 rounded-md border border-cyan-300/40 bg-cyan-400/20 px-2 py-1 text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/30"
                        >
                          {copiedField === "agent" ? "Copied" : "Copy agent address"}
                        </button>
                      )}
                      {!hasSessionKey && smartAccountAddress && (
                        <button
                          type="button"
                          onClick={setupSessionKey}
                          disabled={isSessionLoading}
                          className="mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50"
                        >
                          {isSessionLoading ? "Authorizing..." : "Authorize agent"}
                        </button>
                      )}
                      {sessionError && (
                        <p className="mt-2 text-xs text-red-200">{sessionError}</p>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>
          );
        }}
      </ConnectButton.Custom>

      {isMounted &&
        connectModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Connect wallet</h3>
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="rounded-md px-2 py-1 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="mb-3 text-xs text-slate-400">
                Choose a wallet provider to continue.
              </p>
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    type="button"
                    onClick={() => {
                      connect({ connector });
                      setConnectModalOpen(false);
                    }}
                    disabled={isConnectPending}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-sm text-white transition-colors hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    {connector.name}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {isMounted &&
        networkModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Select network</h3>
                <button
                  type="button"
                  onClick={() => setNetworkModalOpen(false)}
                  className="rounded-md px-2 py-1 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="mb-3 text-xs text-slate-400">
                Switch to the correct chain for transactions.
              </p>
              <div className="space-y-2">
                {chains.map((network) => {
                  const active = network.id === chainId;
                  return (
                    <button
                      key={network.id}
                      type="button"
                      onClick={() => {
                        if (!active) {
                          switchChain({ chainId: network.id });
                        }
                        setNetworkModalOpen(false);
                      }}
                      disabled={isSwitchPending}
                      className={
                        "w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors disabled:opacity-50 " +
                        (active
                          ? "border-indigo-400/60 bg-indigo-500/15 text-indigo-200"
                          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]")
                      }
                    >
                      {network.name}
                      {active ? " (Current)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {isMounted &&
        instructionsOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setInstructionsOpen(false);
            }}
          >
            <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Instructions</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    How to use Arc Agent Pay in 3 simple steps
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInstructionsOpen(false)}
                  className="rounded-md px-2 py-1 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: "1",
                    title: "Connect wallet",
                    desc: "Your smart account is created automatically on Arc",
                    accent: "indigo",
                  },
                  {
                    step: "2",
                    title: "Set up agent",
                    desc: "Sign once to grant the agent spending permissions",
                    accent: "cyan",
                  },
                  {
                    step: "3",
                    title: "Pay by chat",
                    desc: "Type payment instructions — agent executes instantly",
                    accent: "violet",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_32px_-20px_rgba(99,102,241,0.55)] backdrop-blur transition-colors hover:bg-white/[0.08]"
                  >
                    <div className="mb-2 text-sm font-semibold text-indigo-300">
                      Step {item.step}
                    </div>
                    <div className="mb-1 text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* Chat commands section */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-3 text-sm font-semibold text-white">
                  Chat commands:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3 italic text-slate-300">
                    "Save 0x123... as Alice"
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3 italic text-slate-300">
                    "Pay 5 USDC to Alice"
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3 italic text-slate-300">
                    "Show my contacts"
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3 italic text-slate-300">
                    "Remove Alice"
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}