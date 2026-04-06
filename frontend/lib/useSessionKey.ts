"use client";

import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { createSessionKeyAPI, getSessionKeyAPI } from "./api";

type UseSessionKeyReturn = {
  hasSessionKey: boolean;
  sessionKeyAddress: string | null;
  isLoading: boolean;
  error: string | null;
  setupSessionKey: () => Promise<void>;
};

export function useSessionKey(): UseSessionKeyReturn {
  const [hasSessionKey, setHasSessionKey] = useState(false);
  const [sessionKeyAddress, setSessionKeyAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useAccount gives us the connected wallet address
  const { address, isConnected } = useAccount();

  // useSignMessage is a wagmi hook that asks MetaMask to sign a message
  // This is NOT a transaction — it costs no gas
  // It just proves the user owns this wallet
  const { signMessageAsync } = useSignMessage();

  // Check if session key already exists when wallet connects
  useEffect(() => {
    if (!isConnected || !address) {
      setHasSessionKey(false);
      setSessionKeyAddress(null);
      return;
    }

    const checkExisting = async () => {
      try {
        const result = await getSessionKeyAPI(address);
        if (result.hasSessionKey) {
          setHasSessionKey(true);
          setSessionKeyAddress(result.sessionKeyAddress || null);
        }
      } catch (err) {
        console.error("Failed to check session key:", err);
      }
    };

    checkExisting();
  }, [isConnected, address]);

  const setupSessionKey = async () => {
    if (!address) {
      setError("No wallet connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1 — Ask the user to sign a message
      // This proves they own the wallet and authorizes the session key
      // The message is human readable so the user knows what they're signing
      const message = `Arc Agent Pay - Authorize payment agent\n\nWallet: ${address}\nTime: ${new Date().toISOString()}\n\nBy signing this message, you authorize the agent to execute payments within your set limits.\n\nThis signature costs no gas.`;

      // This opens MetaMask with the message to sign
      const signature = await signMessageAsync({ message });

      // Step 2 — Send signature to backend
      // Backend generates the session key and stores it encrypted
      const result = await createSessionKeyAPI(address, signature);

      if (result.success) {
        setHasSessionKey(true);
        setSessionKeyAddress(result.sessionKeyAddress);
      }

    } catch (err: any) {
      // User rejected the signature — handle gracefully
      if (err.message?.includes("User rejected")) {
        setError("Signature rejected. Please try again and click Sign in MetaMask.");
      } else {
        setError(err.message || "Failed to setup session key");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasSessionKey,
    sessionKeyAddress,
    isLoading,
    error,
    setupSessionKey,
  };
}