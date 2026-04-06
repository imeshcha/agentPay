const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── POST /account/create ──────────────────────────────────────────────────────
// Saves a smart account address for a wallet
// In our architecture the smart account address is deterministic
// ZeroDev always generates the same address for the same EOA wallet
// So we just need to compute and store it
router.post("/create", async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "walletAddress is required" });
    }

    // For now we store the wallet address as the smart account
    // In Module 7 we'll compute the real deterministic smart account address
    // using ZeroDev SDK on the backend
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          wallet_address: walletAddress.toLowerCase(),
          // Placeholder — will be replaced with real smart account address
          smart_account_address: walletAddress.toLowerCase(),
        },
        { onConflict: "wallet_address" }
      )
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Failed to create account" });
    }

    res.json({
      smartAccountAddress: data.smart_account_address,
    });

  } catch (error) {
    console.error("Account creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /account/:walletAddress ───────────────────────────────────────────────
// Get smart account address for a wallet
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const { data } = await supabase
      .from("users")
      .select("smart_account_address")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    res.json({
      smartAccountAddress: data?.smart_account_address || null,
    });

  } catch (error) {
    res.json({ smartAccountAddress: null });
  }
});

module.exports = router;