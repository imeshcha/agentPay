const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

if (typeof window !== "undefined") {
  console.log("Backend URL configured as:", BACKEND_URL);
  if (BACKEND_URL.includes("localhost") && window.location.hostname !== "localhost") {
    console.warn(
      "⚠️ WARNING: Frontend is running on Vercel but connecting to localhost! " +
      "Please set NEXT_PUBLIC_BACKEND_URL in your Vercel project settings."
    );
  }
}


type AgentMessageResponse = {
  reply: string;
  isPayment?: boolean;
  txHash?: string;
  explorerUrl?: string;
};

type SmartAccountResponse = {
  smartAccountAddress: string | null;
};

type SessionKeyCreateResponse = {
  success: boolean;
  sessionKeyAddress: string;
};

type SessionKeyStatusResponse = {
  hasSessionKey: boolean;
  sessionKeyAddress?: string;
};

export async function sendMessageAPI(
  walletAddress: string,
  message: string
): Promise<AgentMessageResponse> {
  const response = await fetch(`${BACKEND_URL}/agent/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, message }),
  });

  if (!response.ok) {
    let messageText = "Failed to send message";
    try {
      const errorBody = (await response.json()) as { message?: string; error?: string };
      messageText = errorBody.message || errorBody.error || messageText;
    } catch {
      // Ignore JSON parsing failures and use default message.
    }
    throw new Error(messageText);
  }

  return (await response.json()) as AgentMessageResponse;
}

export async function createSmartAccountAPI(
  walletAddress: string
): Promise<SmartAccountResponse> {
  const response = await fetch(`${BACKEND_URL}/account/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });

  if (!response.ok) {
    throw new Error("Failed to create smart account");
  }

  return (await response.json()) as SmartAccountResponse;
}

export async function getSmartAccountAPI(
  walletAddress: string
): Promise<SmartAccountResponse> {
  const response = await fetch(`${BACKEND_URL}/account/${walletAddress}`);

  if (!response.ok) {
    return { smartAccountAddress: null };
  }

  return (await response.json()) as SmartAccountResponse;
}

export async function createSessionKeyAPI(
  walletAddress: string,
  signature: string
): Promise<SessionKeyCreateResponse> {
  const response = await fetch(`${BACKEND_URL}/session/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, signature }),
  });

  if (!response.ok) {
    throw new Error("Failed to create session key");
  }

  return (await response.json()) as SessionKeyCreateResponse;
}

export async function getSessionKeyAPI(
  walletAddress: string
): Promise<SessionKeyStatusResponse> {
  const response = await fetch(`${BACKEND_URL}/session/${walletAddress}`);

  if (!response.ok) {
    return { hasSessionKey: false };
  }

  return (await response.json()) as SessionKeyStatusResponse;
}

// ─── Contacts ───────────────────────────────────────────────────────────────

type Contact = {
  id: string;
  contact_name: string;
  contact_address: string;
  created_at: string;
};

export async function getContactsAPI(
  walletAddress: string
): Promise<Contact[]> {
  const response = await fetch(`${BACKEND_URL}/contacts/${walletAddress}`);
  if (!response.ok) return [];
  return response.json();
}

export async function addContactAPI(
  walletAddress: string,
  contactName: string,
  contactAddress: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${BACKEND_URL}/contacts/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, contactName, contactAddress }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add contact");
  }
  return response.json();
}

export async function removeContactAPI(
  walletAddress: string,
  contactName: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${BACKEND_URL}/contacts/remove`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, contactName }),
  });
  if (!response.ok) return { success: false };
  return response.json();
}