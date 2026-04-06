const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── GET /contacts/:walletAddress ──────────────────────────────────────────────
// Get all contacts for a wallet
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .order("contact_name", { ascending: true });

    if (error) {
      return res.status(500).json({ message: "Failed to fetch contacts" });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /contacts/add ────────────────────────────────────────────────────────
// Add a new contact
router.post("/add", async (req, res) => {
  try {
    const { walletAddress, contactName, contactAddress } = req.body;

    if (!walletAddress || !contactName || !contactAddress) {
      return res.status(400).json({
        message: "walletAddress, contactName and contactAddress are required",
      });
    }

    // Validate ethereum address
    if (!contactAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        message: "Invalid Ethereum address format",
      });
    }

    // Sanitize name — lowercase for consistent lookup
    const cleanName = contactName.trim().toLowerCase();

    const { data, error } = await supabase
      .from("contacts")
      .upsert(
        {
          wallet_address: walletAddress.toLowerCase(),
          contact_name: cleanName,
          contact_address: contactAddress,
        },
        { onConflict: "wallet_address,contact_name" }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: "Failed to save contact" });
    }

    res.json({
      success: true,
      contact: data,
      message: "Contact saved: " + contactName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /contacts/remove ───────────────────────────────────────────────────
// Remove a contact by name
router.delete("/remove", async (req, res) => {
  try {
    const { walletAddress, contactName } = req.body;

    if (!walletAddress || !contactName) {
      return res.status(400).json({
        message: "walletAddress and contactName are required",
      });
    }

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("wallet_address", walletAddress.toLowerCase())
      .eq("contact_name", contactName.trim().toLowerCase());

    if (error) {
      return res.status(500).json({ message: "Failed to remove contact" });
    }

    res.json({ success: true, message: "Contact removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /contacts/:walletAddress/lookup/:name ─────────────────────────────────
// Look up a contact address by name
router.get("/:walletAddress/lookup/:name", async (req, res) => {
  try {
    const { walletAddress, name } = req.params;

    const { data } = await supabase
      .from("contacts")
      .select("contact_address, contact_name")
      .eq("wallet_address", walletAddress.toLowerCase())
      .eq("contact_name", name.trim().toLowerCase())
      .single();

    if (!data) {
      return res.json({ found: false });
    }

    res.json({
      found: true,
      contactAddress: data.contact_address,
      contactName: data.contact_name,
    });
  } catch (error) {
    res.json({ found: false });
  }
});

module.exports = router;