const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── GET /payments/:walletAddress ──────────────────────────────────────────────
// Returns payment history for a wallet
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Failed to fetch payments" });
    }

    res.json(data || []);

  } catch (error) {
    console.error("Payments fetch error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;