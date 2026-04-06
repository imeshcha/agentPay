require("dotenv").config();
const {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  encodeFunctionData,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { createClient } = require("@supabase/supabase-js");
const CryptoJS = require("crypto-js");

// ── Arc testnet configuration ─────────────────────────────────────────────────
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
};

// USDC system contract on Arc testnet
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

// ERC-20 ABI — only the functions we need
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Decrypt session key ───────────────────────────────────────────────────────
function decryptKey(encryptedKey) {
  const bytes = CryptoJS.AES.decrypt(
    encryptedKey,
    process.env.SESSION_ENCRYPTION_SECRET
  );
  return bytes.toString(CryptoJS.enc.Utf8);
}

// ── Test RPC connection ───────────────────────────────────────────────────────
async function testRpcConnection() {
  try {
    const response = await fetch("https://rpc.testnet.arc.network", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1,
      }),
    });
    const data = await response.json();
    console.log("RPC connection test:", data.result);
    return true;
  } catch (err) {
    console.error("RPC connection failed:", err.message);
    return false;
  }
}

// ── Check USDC balance ────────────────────────────────────────────────────────
async function checkBalance(publicClient, address) {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    // USDC has 6 decimals on Arc
    const formatted = Number(balance) / 1_000_000;
    console.log("Session key USDC balance:", formatted, "USDC");
    return balance;
  } catch (err) {
    console.log("Could not read balance:", err.message);
    return 0n;
  }
}

// ── Main function: execute a USDC payment ─────────────────────────────────────
async function executePayment(walletAddress, toAddress, amount) {
  console.log(`\nExecuting payment: ${amount} USDC to ${toAddress}`);

  // Step 1 — Test RPC connection
  const rpcOk = await testRpcConnection();
  if (!rpcOk) {
    throw new Error(
      "Cannot connect to Arc testnet RPC. Check your internet connection."
    );
  }

  // Step 2 — Load session key from database
  console.log("Loading session key for:", walletAddress);
  const { data: userData, error: dbError } = await supabase
    .from("users")
    .select(
      "session_key_encrypted, session_key_address, smart_account_address"
    )
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (dbError || !userData) {
    throw new Error("User not found in database");
  }

  if (!userData.session_key_encrypted) {
    throw new Error(
      "No session key found. Please authorize the agent first."
    );
  }

  // Step 3 — Decrypt the session key
  const sessionPrivateKey = decryptKey(userData.session_key_encrypted);

  if (!sessionPrivateKey) {
    throw new Error(
      "Failed to decrypt session key. Check SESSION_ENCRYPTION_SECRET."
    );
  }

  // Step 4 — Create account from session key
  const sessionAccount = privateKeyToAccount(sessionPrivateKey);
  console.log("Session account:", sessionAccount.address);

  // Step 5 — Create blockchain clients
  const transport = http("https://rpc.testnet.arc.network", {
    retryCount: 3,
    retryDelay: 1000,
  });

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport,
  });

  const walletClient = createWalletClient({
    account: sessionAccount,
    chain: arcTestnet,
    transport,
  });

  // Step 6 — Check balance before sending
  const balance = await checkBalance(publicClient, sessionAccount.address);
  const amountInUnits = parseUnits(amount.toString(), 6); // 6 decimals for USDC on Arc

  if (balance < amountInUnits) {
    const balanceFormatted = Number(balance) / 1_000_000;
    throw new Error(
      "Insufficient USDC balance in session key wallet. " +
        "Balance: " + balanceFormatted + " USDC, " +
        "Required: " + amount + " USDC. " +
        "Please fund the session key: " + sessionAccount.address
    );
  }

  // Step 7 — Encode the transfer function call
  // USDC uses 6 decimals on Arc — 1 USDC = 1,000,000 raw units
  console.log("Amount in raw units (6 decimals):", amountInUnits.toString());

  const transferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [toAddress, amountInUnits],
  });

  // Step 8 — Send the transaction
  console.log("Sending transaction...");
  const txHash = await walletClient.sendTransaction({
    to: USDC_ADDRESS,
    data: transferData,
  });

  console.log("Transaction hash:", txHash);

  // Step 9 — Wait for confirmation
  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    timeout: 60000,
  });

  console.log("Transaction status:", receipt.status);

  if (receipt.status !== "success") {
    throw new Error("Transaction failed on chain");
  }

  console.log("Payment successful!");

  return {
    txHash,
    explorerUrl: "https://testnet.arcscan.app/tx/" + txHash,
  };
}

module.exports = { executePayment };