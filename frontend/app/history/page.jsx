"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserHistory, getUserTotalSpent, isLoggedIn, getUser,
  formatRupiah, formatDate,
} from "../lib/api";
import Alert from "../components/Alert";

export default function HistoryPage() {
  const router = useRouter();
  const [rows, setRows]         = useState([]);
  const [totalSpent, setTotal]  = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const user    = typeof window !== "undefined" ? getUser() : null;
  const initial = user ? (user.name || user.email || "?")[0].toUpperCase() : "?";

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }

    async function load() {
      setLoading(true);
      try {
        const [history, total] = await Promise.all([
          getUserHistory(),
          getUserTotalSpent(),
        ]);
        setRows(history);
        setTotal(total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

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
        {totalSpent !== null && (
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Total Spent</p>
            <p className="font-bold text-brand-600 text-sm">{formatRupiah(totalSpent)}</p>
          </div>
        )}
      </div>

      {/* Heading */}
      <div className="mb-5">
        <h1 className="font-display text-2xl text-brand-600">Purchase History</h1>
        <p className="text-gray-400 text-sm mt-0.5">All your past transactions</p>
      </div>

      {error && <div className="mb-4"><Alert message={error} /></div>}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading history…</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-600 text-white">
                  <th className="text-left px-4 py-3 font-semibold text-xs">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Item</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Qty</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id ?? i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {r.item_name || r.name || `Item #${r.item_id}` || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.quantity ?? r.qty ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600">
                      {r.total_price != null
                        ? formatRupiah(r.total_price)
                        : r.price != null
                          ? formatRupiah(r.price)
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(r.created_at || r.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && rows.length > 0 && (
        <div className="mt-3 flex justify-end">
          <p className="text-xs text-gray-400">
            {rows.length} transaction{rows.length !== 1 ? "s" : ""}
            {totalSpent !== null && " · Total: "}
            {totalSpent !== null && (
              <span className="font-semibold text-brand-600">{formatRupiah(totalSpent)}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}