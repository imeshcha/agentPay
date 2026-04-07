"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSmartAccount } from "@/lib/useSmartAccount";
import { useSessionKey } from "@/lib/useSessionKey";
import { useAccount } from "wagmi";

interface SetupContextType {
  smartAccountAddress: string | null;
  hasSessionKey: boolean;
  isReady: boolean;
  isLoading: boolean;
  createAccount: () => Promise<void>;
  setupSessionKey: () => Promise<void>;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const { smartAccountAddress, isLoading: saLoading, createAccount } = useSmartAccount();
  const { hasSessionKey, isLoading: skLoading, setupSessionKey } = useSessionKey();

  const isReady = !!isConnected && !!smartAccountAddress && hasSessionKey;
  const isLoading = saLoading || skLoading;

  return (
    <SetupContext.Provider
      value={{
        smartAccountAddress,
        hasSessionKey,
        isReady,
        isLoading,
        createAccount,
        setupSessionKey,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export function useGlobalSetup() {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error("useGlobalSetup must be used within a SetupProvider");
  }
  return context;
}
