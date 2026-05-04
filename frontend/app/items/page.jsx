"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getItems, createTransaction, isLoggedIn, getUser,
  formatRupiah,
} from "../lib/api";
import Alert from "../components/Alert";

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [pageAlert, setPageAlert]     = useState({ msg: "", type: "success" });

  // Modal
  const [selected, setSelected]       = useState(null);
  const [qty, setQty]                 = useState(1);
  const [buyError, setBuyError]       = useState("");
  const [buyLoading, setBuyLoading]   = useState(false);

  const user    = typeof window !== "undefined" ? getUser() : null;
  const initial = user ? (user.name || user.email || "?")[0].toUpperCase() : "?";

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    loadItems();
  }, [router]);

  async function loadItems() {
    setLoading(true);
    try {
      setItems(await getItems());
    } catch (err) {
      setPageAlert({ msg: err instanceof Error ? err.message : "Failed to load items.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() =>
    items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.store_name || "").toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  );

  function openModal(item) {
    setSelected(item);
    setQty(1);
    setBuyError("");
  }
  function closeModal() { setSelected(null); }

  async function confirmBuy() {
    if (!selected) return;
    setBuyError("");

    if (!qty || qty < 1) { setBuyError("Enter a valid quantity."); return; }
    if (selected.stock !== undefined && qty > selected.stock) {
      setBuyError(`Only ${selected.stock} in stock.`);
      return;
    }

    setBuyLoading(true);
    try {
      await createTransaction(selected.id, qty);
      closeModal();
      setPageAlert({ msg: `✓ Purchased ${qty}× ${selected.name}!`, type: "success" });
      loadItems();
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setBuyLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* User bar */}
      <div className="card flex items-center gap-3 px-4 py-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
          {initial}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-800">{user?.name || "User"}</p>
          <p className="text-xs text-gray-400">{user?.email || ""}</p>
        </div>
      </div>

      {/* Heading + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl text-brand-600">All Items</h1>
          <p className="text-gray-400 text-sm mt-0.5">Browse and buy items from the store</p>
        </div>
        <input
          type="text"
          className="input sm:w-60"
          placeholder="🔍  Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Page alert */}
      {pageAlert.msg && (
        <div className="mb-4">
          <Alert message={pageAlert.msg} type={pageAlert.type} />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading items…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No items found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-4xl">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : "🛍️"}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                <p className="text-brand-600 font-bold text-sm mt-0.5">{formatRupiah(item.price)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Stock: {item.stock ?? "N/A"}</p>
                {item.store_name && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">📦 {item.store_name}</p>
                )}
                <button
                  className="mt-2.5 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
                  disabled={item.stock === 0}
                  onClick={() => openModal(item)}
                >
                  {item.stock === 0 ? "Out of Stock" : "Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="card w-full max-w-sm p-6">
            <h2 className="font-display text-xl text-brand-600 mb-1">{selected.name}</h2>
            <p className="font-bold text-brand-600 text-base">{formatRupiah(selected.price)}</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">
              Available stock: {selected.stock ?? "N/A"}
            </p>

            {buyError && <div className="mb-3"><Alert message={buyError} /></div>}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity</label>
              <input
                type="number"
                className="input"
                min={1}
                max={selected.stock ?? 99}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={closeModal}>Cancel</button>
              <button
                className="flex-1 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-2 rounded-lg text-sm transition-all disabled:opacity-60"
                onClick={confirmBuy}
                disabled={buyLoading}
              >
                {buyLoading ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}