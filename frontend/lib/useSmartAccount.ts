"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { createSmartAccountAPI, getSmartAccountAPI } from "./api";

type UseSmartAccountReturn = {
  smartAccountAddress: string | null;
  isLoading: boolean;
  error: string | null;
  createAccount: () => Promise<void>;
};

export function useSmartAccount(): UseSmartAccountReturn {
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();

  // Check for existing smart account when wallet connects
  useEffect(() => {
    if (!isConnected || !address) {
      setSmartAccountAddress(null);
      return;
    }

    const checkExisting = async () => {
      try {
        const result = await getSmartAccountAPI(address);
        if (result.smartAccountAddress) {
          setSmartAccountAddress(result.smartAccountAddress);
        }
      } catch (err) {
        console.error("Failed to check existing account:", err);
      }
    };

    checkExisting();
  }, [isConnected, address]);

  const createAccount = async () => {
    if (!address) {
      setError("No wallet connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call backend to create smart account
      const result = await createSmartAccountAPI(address);
      setSmartAccountAddress(result.smartAccountAddress);
    } catch (err: any) {
      setError(err.message || "Failed to create smart account");
    } finally {
      setIsLoading(false);
    }
  };

  return { smartAccountAddress, isLoading, error, createAccount };
}