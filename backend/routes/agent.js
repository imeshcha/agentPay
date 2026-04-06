const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { parsePaymentIntent } = require("../lib/groq");
const { executePayment } = require("../lib/executor");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Helper: look up contact address by name ───────────────────────────────────
async function lookupContact(walletAddress, contactName) {
  const { data } = await supabase
    .from("contacts")
    .select("contact_address, contact_name")
    .eq("wallet_address", walletAddress.toLowerCase())
    .eq("contact_name", contactName.trim().toLowerCase())
    .single();

  return data || null;
}

// ── Helper: get all contacts ──────────────────────────────────────────────────
async function getAllContacts(walletAddress) {
  const { data } = await supabase
    .from("contacts")
    .select("contact_name, contact_address")
    .eq("wallet_address", walletAddress.toLowerCase())
    .order("contact_name", { ascending: true });

  return data || [];
}

// ── POST /agent/message ───────────────────────────────────────────────────────
router.post("/message", async (req, res) => {
  try {
    const { walletAddress, message } = req.body;

    if (!walletAddress || !message) {
      return res.status(400).json({
        message: "walletAddress and message are required",
      });
    }

    console.log(`\nMessage from ${walletAddress}: "${message}"`);

    // Check user has session key
    const { data: userData } = await supabase
      .from("users")
      .select("session_key_encrypted")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (!userData?.session_key_encrypted) {
      return res.json({
        reply: "Please set up your agent first by clicking Authorize Agent.",
        isPayment: false,
        isContact: false,
      });
    }

    // Parse intent with Groq
    console.log("Parsing intent with Groq...");
    const intent = await parsePaymentIntent(message);
    console.log("Parsed intent:", intent);

    // ── Handle contact commands ───────────────────────────────────────────────
    if (intent.isContact) {

      // LIST contacts
      if (intent.action === "list") {
        const contacts = await getAllContacts(walletAddress);

        if (contacts.length === 0) {
          return res.json({
            reply: "You have no saved contacts yet. Try: Save 0x123... as Alice",
            isPayment: false,
            isContact: true,
            action: "list",
            contacts: [],
          });
        }

        const contactList = contacts
          .map((c) => c.contact_name + ": " + c.contact_address.slice(0, 6) + "..." + c.contact_address.slice(-4))
          .join("\n");

        return res.json({
          reply: "Your contacts:\n" + contactList,
          isPayment: false,
          isContact: true,
          action: "list",
          contacts,
        });
      }

      // SAVE contact
      if (intent.action === "save") {
        if (!intent.contactName || !intent.contactAddress) {
          return res.json({
            reply: "Please provide both a name and address. Example: Save 0x123... as Alice",
            isPayment: false,
            isContact: true,
          });
        }

        const { error } = await supabase
          .from("contacts")
          .upsert(
            {
              wallet_address: walletAddress.toLowerCase(),
              contact_name: intent.contactName.trim().toLowerCase(),
              contact_address: intent.contactAddress,
            },
            { onConflict: "wallet_address,contact_name" }
          );

        if (error) {
          return res.json({
            reply: "Failed to save contact. Please try again.",
            isPayment: false,
            isContact: true,
          });
        }

        return res.json({
          reply: "Contact saved! You can now pay " + intent.contactName + " by name.",
          isPayment: false,
          isContact: true,
          action: "save",
          contactName: intent.contactName,
          contactAddress: intent.contactAddress,
        });
      }

      // DELETE contact
      if (intent.action === "delete") {
        if (!intent.contactName) {
          return res.json({
            reply: "Please provide a contact name to remove.",
            isPayment: false,
            isContact: true,
          });
        }

        await supabase
          .from("contacts")
          .delete()
          .eq("wallet_address", walletAddress.toLowerCase())
          .eq("contact_name", intent.contactName.trim().toLowerCase());

        return res.json({
          reply: intent.contactName + " has been removed from your contacts.",
          isPayment: false,
          isContact: true,
          action: "delete",
        });
      }
    }

    // ── Handle payments ───────────────────────────────────────────────────────
    if (intent.isPayment) {
      let toAddress = intent.to;
      let displayName = null;

      // If paying to a contact name — look up the address
      if (intent.toType === "contact") {
        console.log("Looking up contact:", intent.to);
        const contact = await lookupContact(walletAddress, intent.to);

        if (!contact) {
          return res.json({
            reply: "Contact '" + intent.to + "' not found. Save them first: Save 0x123... as " + intent.to,
            isPayment: false,
            isContact: false,
          });
        }

        toAddress = contact.contact_address;
        displayName = contact.contact_name;
        console.log("Resolved contact:", displayName, "->", toAddress);
      }

      // Save payment as pending
      const { data: payment } = await supabase
        .from("payments")
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          to_address: toAddress,
          amount: intent.amount,
          token: intent.token || "USDC",
          status: "pending",
        })
        .select()
        .single();

      // Execute payment
      const result = await executePayment(
        walletAddress,
        toAddress,
        intent.amount
      );

      // Update payment record
      if (payment) {
        await supabase
          .from("payments")
          .update({ tx_hash: result.txHash, status: "success" })
          .eq("id", payment.id);
      }

      // Build reply with contact name if available
      const recipientDisplay = displayName
        ? displayName + " (" + toAddress.slice(0, 6) + "..." + toAddress.slice(-4) + ")"
        : toAddress.slice(0, 6) + "..." + toAddress.slice(-4);

      return res.json({
        reply: "Paid " + intent.amount + " USDC to " + recipientDisplay + " successfully!",
        isPayment: true,
        isContact: false,
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
      });
    }

    // ── Regular conversation ──────────────────────────────────────────────────
    return res.json({
      reply: intent.reply || "I can help you send USDC payments and manage contacts.",
      isPayment: false,
      isContact: false,
    });

  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({
      reply: "Payment failed: " + error.message,
      isPayment: false,
      isContact: false,
      error: error.message,
    });
  }
});

module.exports = router;