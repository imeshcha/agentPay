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
                className="rounded-full bg-black px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(209,209,198,1)]"
              >
                CONNECT_PROTOCOL
              </button>
            );
          }

          if (chain.unsupported) {
            return (
              <button
                onClick={() => setNetworkModalOpen(true)}
                type="button"
                className="rounded-full border-2 border-red-500 bg-red-50 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-100"
              >
                CHAIN_ERROR
              </button>
            );
          }

          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNetworkModalOpen(true)}
                type="button"
                className="hidden sm:block border-2 border-black bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black hover:bg-zinc-100"
              >
                {chain.name}
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  type="button"
                  className="rounded-full bg-black px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(209,209,198,1)]"
                >
                  {account.displayName}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-4 w-52 overflow-hidden border-2 border-black bg-white p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <button
                      type="button"
                      onClick={async () => {
                        await copyText(account.address, "wallet");
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-black hover:bg-zinc-100 border-b-2 border-black last:border-0"
                    >
                      Copy_Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDetailsOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-black hover:bg-zinc-100 border-b-2 border-black last:border-0"
                    >
                      Security_Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setInstructionsOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-black hover:bg-zinc-100 border-b-2 border-black last:border-0"
                    >
                      Protocol_Documentation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        disconnect();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
                    >
                      Terminate_Connection
                    </button>
                  </div>
                )}

                {detailsOpen && (
                  <div className="absolute right-0 top-full z-40 mt-4 w-[380px] border-4 border-black bg-[#F0F0E8] p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-2">
                        <span className="text-xs font-black uppercase tracking-widest">Security_Details</span>
                        <button onClick={() => setDetailsOpen(false)} className="text-black font-black">✕</button>
                    </div>
                    
                    <div className="mb-4 border-2 border-black bg-white p-3">
                      <div className="mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">SMART_ACCOUNT_CORE</div>
                      <p className="break-all font-mono text-[11px] font-bold text-black mb-3">
                        {smartAccountAddress || "NOT_INITIALIZED_ERROR"}
                      </p>
                      {smartAccountAddress && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => copyText(smartAccountAddress, "smart")}
                            className="bg-black px-2 py-1 text-[9px] font-black text-white uppercase hover:bg-zinc-800"
                          >
                            {copiedField === "smart" ? "COPIED" : "COPY_ADDRESS"}
                          </button>
                        </div>
                      )}
                      {!smartAccountAddress && (
                        <button
                          type="button"
                          onClick={createAccount}
                          disabled={isAccountLoading}
                          className="w-full bg-black px-4 py-2 text-xs font-black text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {isAccountLoading ? "INITIALIZING..." : "INITIALIZE_SMART_ACCOUNT"}
                        </button>
                      )}
                    </div>

                    <div className="border-2 border-black bg-white p-3">
                      <div className="mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">AGENT_DELEGATION_STATE</div>
                      <p className="text-[11px] font-bold text-black mb-3">
                        {hasSessionKey
                          ? "DELEGATION_ACTIVE_RECURRING_PAYMENTS_ENABLED"
                          : "DELEGATION_PENDING_MANUAL_AUTH_REQUIRED"}
                      </p>
                      {!hasSessionKey && smartAccountAddress && (
                        <button
                          type="button"
                          onClick={setupSessionKey}
                          disabled={isSessionLoading}
                          className="w-full bg-black px-4 py-2 text-xs font-black text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {isSessionLoading ? "AUTHORIZING..." : "AUTHORIZE_DELEGATION"}
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
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm border-4 border-black bg-white p-6 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="mb-4 text-xl font-black uppercase tracking-tighter text-black">INITIALIZE_CONNECTION</h3>
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
                    className="w-full border-2 border-black bg-white px-4 py-3 text-left font-black uppercase tracking-widest text-black transition-colors hover:bg-zinc-100 disabled:opacity-50"
                  >
                    {connector.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="w-full px-4 py-2 text-[10px] font-black uppercase text-zinc-400 hover:text-black"
                >
                  ABORT_SESSION
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isMounted &&
        networkModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm border-4 border-black bg-white p-6 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="mb-4 text-xl font-black uppercase tracking-tighter text-black">SELECT_GRID_CORE</h3>
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
                        "w-full border-2 px-4 py-3 text-left font-black uppercase tracking-widest transition-colors " +
                        (active
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-black hover:bg-zinc-100")
                      }
                    >
                      {network.name} {active ? "(CORE_STABLE)" : ""}
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
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setInstructionsOpen(false);
            }}
          >
            <div className="w-full max-w-2xl border-4 border-black bg-[#F0F0E8] p-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-10 flex items-center justify-between border-b-2 border-black pb-4">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-black">Protocol_Documentation</h3>
                  <p className="mt-1 text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Initializing_Infrastructure_Sequence</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInstructionsOpen(false)}
                  className="text-2xl font-black text-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Initialize_Core",
                    desc: "Handshake with EOA wallet to create smart infrastructure bank account.",
                  },
                  {
                    step: "02",
                    title: "Authorize_Agent",
                    desc: "Delegate spending authority to AI settlement agent via secure cryptographic session key.",
                  },
                  {
                    step: "03",
                    title: "Execute_Command",
                    desc: "Deploy instructions via natural language chat interface for immediate asset settlement.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 border-2 border-black bg-white p-4 items-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-lg font-black text-zinc-300">{item.step}</span>
                    <div>
                      <div className="text-sm font-black uppercase text-black mb-1">{item.title}</div>
                      <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-tight leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-2 border-black bg-black p-4">
                <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Supported_Commands</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-white/80">
                  <div className="border border-white/20 p-2">"PAY 5 USDC TO ALICE"</div>
                  <div className="border border-white/20 p-2">"SAVE 0x... AS BOB"</div>
                  <div className="border border-white/20 p-2">"SHOW MY CONTACTS"</div>
                  <div className="border border-white/20 p-2">"REMOVE ALICE"</div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}