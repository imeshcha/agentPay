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
      setSuccess(newName.toUpperCase() + " SAVED_SUCCESSFULLY");
      setNewName("");
      setNewAddress("");
      loadContacts();
    } catch (err: any) {
      setError(err.message || "SAVE_ERROR");
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
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 border border-zinc-200 bg-white px-5 py-2.5 rounded-full text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50 transition-all active:scale-95"
      >
        <span className="text-zinc-300">{isOpen ? "Hide" : "Show"}</span>
        <span className="uppercase tracking-widest">Saved Contacts ({contacts.length})</span>
      </button>

      {isOpen && (
        <div className="mt-4 border border-zinc-200 bg-white p-6 rounded-[2rem] shadow-xl">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Add New Contact
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Alias (e.g. Kamal)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 border border-zinc-100 bg-zinc-50 px-4 py-3 rounded-xl text-sm font-medium text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-zinc-200 transition-all"
              />
              <input
                type="text"
                placeholder="Wallet Address (0x...)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1 border border-zinc-100 bg-zinc-50 px-4 py-3 rounded-xl text-sm font-medium text-black placeholder-zinc-300 focus:outline-none focus:bg-white focus:border-zinc-200 transition-all font-mono"
              />
              <button
                onClick={handleAdd}
                disabled={isLoading || !newName.trim() || !newAddress.trim()}
                className="bg-black px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-zinc-800 disabled:opacity-50 transition-all"
              >
                {isLoading ? "..." : "Save"}
              </button>
            </div>

            {success && <p className="mt-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{success}</p>}
            {error && <p className="mt-3 text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-50 pb-2">
              Recent Records
            </p>
            {contacts.length === 0 ? (
              <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                  No contacts in database
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-50 p-4 rounded-2xl transition-colors group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-black">
                        {contact.contact_name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 group-hover:text-zinc-500 transition-colors">
                        {contact.contact_address}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemove(contact.contact_name)}
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
