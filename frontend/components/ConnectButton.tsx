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
                className="rounded-full bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
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
                className="rounded-full border border-red-200 bg-red-50 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-100"
              >
                Network Error
              </button>
            );
          }

          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNetworkModalOpen(true)}
                type="button"
                className="hidden sm:block border border-zinc-200 bg-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
              >
                {chain.name}
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  type="button"
                  className="rounded-full bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105 shadow-lg shadow-black/10"
                >
                  {account.displayName}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-4 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl">
                    <button
                      type="button"
                      onClick={async () => {
                        await copyText(account.address, "wallet");
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 rounded-xl"
                    >
                      Copy Wallet Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDetailsOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 rounded-xl"
                    >
                      Security Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setInstructionsOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 rounded-xl"
                    >
                      How it works
                    </button>
                    <div className="h-px bg-zinc-100 my-1 mx-2" />
                    <button
                      type="button"
                      onClick={() => {
                        disconnect();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      Disconnect
                    </button>
                  </div>
                )}

                {detailsOpen && (
                  <div className="absolute right-0 top-full z-40 mt-4 w-[400px] border border-zinc-200 bg-white p-6 rounded-3xl shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-sm font-extrabold tracking-tight">Security & Accounts</span>
                        <button onClick={() => setDetailsOpen(false)} className="text-zinc-400 hover:text-black">✕</button>
                    </div>
                    
                    <div className="mb-6 bg-zinc-50 border border-zinc-100 p-5 rounded-2xl">
                      <div className="mb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Your Smart Account</div>
                      <p className="break-all font-mono text-[11px] text-zinc-600 mb-4 bg-white p-3 border border-zinc-100 rounded-xl">
                        {smartAccountAddress || "No account found"}
                      </p>
                      {smartAccountAddress && (
                        <button
                          type="button"
                          onClick={() => copyText(smartAccountAddress, "smart")}
                          className="bg-black px-4 py-2 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                        >
                          {copiedField === "smart" ? "Copied" : "Copy Smart Address"}
                        </button>
                      )}
                      {!smartAccountAddress && (
                        <button
                          type="button"
                          onClick={createAccount}
                          disabled={isAccountLoading}
                          className="w-full bg-black px-4 py-3 rounded-xl text-[11px] font-bold text-white uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {isAccountLoading ? "Setting up..." : "Setup Smart Account"}
                        </button>
                      )}
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl">
                      <div className="mb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Agent Authorization</div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`h-2 w-2 rounded-full ${hasSessionKey ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500'}`} />
                        <p className="text-xs font-bold text-zinc-700">
                          {hasSessionKey ? "Automated payments active" : "Manual authorization required"}
                        </p>
                      </div>
                      {!hasSessionKey && smartAccountAddress && (
                        <button
                          type="button"
                          onClick={setupSessionKey}
                          disabled={isSessionLoading}
                          className="w-full bg-black px-4 py-3 rounded-xl text-[11px] font-bold text-white uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {isSessionLoading ? "Authorizing..." : "Grant Permission"}
                        </button>
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
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm border border-zinc-200 bg-white p-8 rounded-[2rem] shadow-2xl">
              <h3 className="mb-6 text-2xl font-extrabold tracking-tight text-black">Connect</h3>
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    type="button"
                    onClick={() => {
                      connect({ connector });
                      setConnectModalOpen(false);
                    }}
                    disabled={isConnectPending}
                    className="w-full border border-zinc-200 bg-zinc-50 px-5 py-4 rounded-2xl text-left font-bold text-zinc-700 transition-all hover:bg-white hover:border-zinc-300 hover:shadow-md disabled:opacity-50"
                  >
                    {connector.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="w-full px-4 py-1 text-[11px] font-bold uppercase text-zinc-400 hover:text-black mt-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isMounted &&
        networkModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm border border-zinc-200 bg-white p-8 rounded-[2rem] shadow-2xl">
              <h3 className="mb-6 text-2xl font-extrabold tracking-tight text-black">Switch Network</h3>
              <div className="space-y-3">
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
                        "w-full px-5 py-4 rounded-2xl text-left font-bold transition-all " +
                        (active
                          ? "bg-black text-white shadow-lg"
                          : "bg-zinc-50 text-zinc-600 border border-zinc-100 hover:bg-white hover:border-zinc-300")
                      }
                    >
                      {network.name} {active ? "(Active)" : ""}
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
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setInstructionsOpen(false);
            }}
          >
            <div className="w-full max-w-2xl border border-zinc-200 bg-white p-10 rounded-[2.5rem] shadow-2xl">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold tracking-tight text-black">How it works</h3>
                  <p className="mt-2 text-sm font-medium text-zinc-400 leading-relaxed">Start using your smart agent in three simple steps.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInstructionsOpen(false)}
                  className="p-3 bg-zinc-50 rounded-full text-zinc-400 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: "01",
                    title: "Setup Account",
                    desc: "Handshake with your wallet to create a secure smart account.",
                  },
                  {
                    step: "02",
                    title: "Grant Access",
                    desc: "Grant spending permissions via a one-time session key.",
                  },
                  {
                    step: "03",
                    title: "Chat to Pay",
                    desc: "Send commands in natural language to settle payments.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex flex-col gap-4 bg-zinc-50/50 border border-zinc-100 p-6 rounded-[2rem]">
                    <span className="text-4xl font-extrabold text-zinc-200">{item.step}</span>
                    <div>
                      <div className="text-sm font-extrabold text-black mb-2">{item.title}</div>
                      <div className="text-xs font-medium text-zinc-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 border border-zinc-100 bg-zinc-50 rounded-[2rem] p-8">
                <div className="mb-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Example Commands</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-white border border-zinc-100 p-4 rounded-xl text-zinc-600 shadow-sm">"Pay 5 USDC to Kamal"</div>
                  <div className="bg-white border border-zinc-100 p-4 rounded-xl text-zinc-600 shadow-sm">"Save 0x... as Sanduni"</div>
                  <div className="bg-white border border-zinc-100 p-4 rounded-xl text-zinc-600 shadow-sm">"Show my contacts"</div>
                  <div className="bg-white border border-zinc-100 p-4 rounded-xl text-zinc-600 shadow-sm">"Remove Kamal"</div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>
  );
}