"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getContactsAPI, addContactAPI, removeContactAPI } from "@/lib/api";

type Contact = {
  id: string;
  contact_name: string;
  contact_address: string;
};

export function ContactsPanel() {
  const { address, isConnected } = useAccount();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load contacts when panel opens
  useEffect(() => {
    if (isOpen && address) {
      loadContacts();
    }
  }, [isOpen, address]);

  const loadContacts = async () => {
    if (!address) return;
    try {
      const data = await getContactsAPI(address);
      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  };

  const handleAdd = async () => {
    if (!address || !newName.trim() || !newAddress.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await addContactAPI(address, newName.trim(), newAddress.trim());
      setSuccess(newName + " saved successfully!");
      setNewName("");
      setNewAddress("");
      loadContacts();
    } catch (err: any) {
      setError(err.message || "Failed to save contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (contactName: string) => {
    if (!address) return;
    try {
      await removeContactAPI(address, contactName);
      setContacts((prev) =>
        prev.filter((c) => c.contact_name !== contactName)
      );
    } catch (err) {
      console.error("Failed to remove contact:", err);
    }
  };

  if (!isConnected) return null;

  return (
    <div className="mb-4">

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <span>{isOpen ? "▼" : "▶"}</span>
        <span>Contacts ({contacts.length})</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">

          {/* Add new contact form */}
          <div className="mb-4">
            <p className="text-slate-300 text-xs font-medium mb-2">
              Add contact
            </p>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Name (e.g. Alice)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="0x address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none font-mono"
              />
              <button
                onClick={handleAdd}
                disabled={isLoading || !newName.trim() || !newAddress.trim()}
                className="whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-sm font-medium text-white transition-all hover:from-indigo-400 hover:to-violet-400 disabled:opacity-50"
              >
                {isLoading ? "..." : "Save"}
              </button>
            </div>

            {/* Success message */}
            {success && (
              <p className="text-emerald-300 text-xs">{success}</p>
            )}

            {/* Error message */}
            {error && (
              <p className="text-red-200 text-xs">{error}</p>
            )}
          </div>

          {/* Contacts list */}
          {contacts.length === 0 ? (
            <p className="py-2 text-center text-sm text-slate-400">
              No contacts yet. Add one above or say "Save 0x... as Alice" in chat.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="mb-2 text-xs font-medium text-slate-300">
                Saved contacts
              </p>
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  <div>
                    <span className="text-white text-sm font-medium capitalize">
                      {contact.contact_name}
                    </span>
                    <span className="ml-2 text-xs font-mono text-slate-400">
                      {contact.contact_address.slice(0, 6)}...
                      {contact.contact_address.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(contact.contact_name)}
                    className="ml-2 text-xs text-slate-400 transition-colors hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}