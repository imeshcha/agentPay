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
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 border-2 border-black bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100"
      >
        <span>{isOpen ? "[-]" : "[+]"}</span>
        <span>DIRECTORY_CONTACT_LIST ({contacts.length})</span>
      </button>

      {isOpen && (
        <div className="mt-4 border-2 border-black bg-[#F0F0E8] p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
              APPEND_NEW_CONTACT
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="NAME..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-black placeholder-zinc-300 focus:outline-none"
              />
              <input
                type="text"
                placeholder="0x_ADDRESS..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1 border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold text-black placeholder-zinc-300 focus:outline-none"
              />
              <button
                onClick={handleAdd}
                disabled={isLoading || !newName.trim() || !newAddress.trim()}
                className="bg-black px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {isLoading ? "..." : "COMMIT"}
              </button>
            </div>

            {success && <p className="mt-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">{success}</p>}
            {error && <p className="mt-2 text-[9px] font-black text-red-600 uppercase tracking-widest">{error}</p>}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 border-b border-black/10 pb-1">
              SAVED_DATABASE_RECORDS
            </p>
            {contacts.length === 0 ? (
              <p className="py-4 text-center font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                NULL_DATA_RECORDS_FOUND
              </p>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between border-b border-black/10 bg-white/40 px-3 py-2 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase text-black">
                      {contact.contact_name}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-zinc-500">
                      {contact.contact_address.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(contact.contact_name)}
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-600"
                  >
                    PURGE_RECORD
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}