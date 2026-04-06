const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const CryptoJS = require("crypto-js");
const { generatePrivateKey, privateKeyToAccount } = require("viem/accounts");

// Initialize Supabase with service role key
// Service role key bypasses row level security — only use in backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ENCRYPTION_SECRET = process.env.SESSION_ENCRYPTION_SECRET;

// ── Helper: encrypt a private key before storing ──────────────────────────────
// We never store private keys in plain text
// AES encryption with our secret key protects it in the database
function encryptKey(privateKey) {
  return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_SECRET).toString();
}

// ── Helper: decrypt a private key when we need to use it ─────────────────────
function decryptKey(encryptedKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// ── POST /session/create ──────────────────────────────────────────────────────
// Creates a new session key for a wallet
// The frontend sends the wallet address and a signature proving ownership
router.post("/create", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({
        message: "walletAddress and signature are required",
      });
    }

    // Check if user exists in database
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found. Create smart account first.",
      });
    }

    // Generate a brand new private key for the session
    // This key is separate from the user's MetaMask key
    // It only has permission to act within the rules we set
    const sessionPrivateKey = generatePrivateKey();

    // Derive the public address from the private key
    const sessionAccount = privateKeyToAccount(sessionPrivateKey);

    // Encrypt the private key before storing
    // Never store raw private keys in a database
    const encryptedKey = encryptKey(sessionPrivateKey);

    // Save session key to database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        session_key_encrypted: encryptedKey,
        session_key_address: sessionAccount.address,
      })
      .eq("wallet_address", walletAddress.toLowerCase());

    if (updateError) {
      console.error("Database error:", updateError);
      return res.status(500).json({ message: "Failed to save session key" });
    }

    console.log(
      `Session key created for ${walletAddress}: ${sessionAccount.address}`
    );

    res.json({
      success: true,
      sessionKeyAddress: sessionAccount.address,
    });

  } catch (error) {
    console.error("Session key creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /session/:walletAddress ───────────────────────────────────────────────
// Check if a session key exists for a wallet
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const { data } = await supabase
      .from("users")
      .select("session_key_address, session_key_encrypted")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (!data || !data.session_key_encrypted) {
      return res.json({ hasSessionKey: false });
    }

    res.json({
      hasSessionKey: true,
      sessionKeyAddress: data.session_key_address,
    });

  } catch (error) {
    console.error("Session key check error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /session/:walletAddress/key ───────────────────────────────────────────
// Returns the DECRYPTED session key — only called internally by the agent
// Never expose this endpoint publicly in production
router.get("/:walletAddress/key", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const { data } = await supabase
      .from("users")
      .select("session_key_encrypted, session_key_address, smart_account_address")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (!data || !data.session_key_encrypted) {
      return res.status(404).json({ message: "No session key found" });
    }

    // Decrypt the key so the agent can use it to sign
    const decryptedKey = decryptKey(data.session_key_encrypted);

    res.json({
      sessionPrivateKey: decryptedKey,
      sessionKeyAddress: data.session_key_address,
      smartAccountAddress: data.smart_account_address,
    });

  } catch (error) {
    console.error("Key retrieval error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;