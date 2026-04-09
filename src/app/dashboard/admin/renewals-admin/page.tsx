"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { getRenewedDonations, markRenewalsProcessed } from "@/lib/admin";

export default function RenewalsAdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"pending" | "processed" | "all">("pending");

  useEffect(() => {
    getRenewedDonations().then((d) => { setData(d); setLoading(false); });
  }, []);

  function toggleSelect(renewId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(renewId)) next.delete(renewId);
      else next.add(renewId);
      return next;
    });
  }

  function selectAllPending() {
    const pending = data.filter((r) => !r.processed).map((r) => r.renew_id);
    if (selected.size === pending.length) setSelected(new Set());
    else setSelected(new Set(pending));
  }

  async function handleMarkProcessed() {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      await markRenewalsProcessed(Array.from(selected));
      setData((prev) =>
        prev.map((r) => selected.has(r.renew_id) ? { ...r, processed: 1 } : r)
      );
      setSelected(new Set());
    } catch (err) {
      alert("Error: " + String(err));
    }
    setSaving(false);
  }

  const filtered = filter === "all" ? data
    : filter === "pending" ? data.filter((r) => !r.processed)
    : data.filter((r) => r.processed);

  const pendingCount = data.filter((r) => !r.processed).length;
  const processedCount = data.filter((r) => r.processed).length;

  if (loading) {
    return (
      <AdminGuard>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Renewed Donations</h1>
        <div className="text-gray-500">Loading...</div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Renewed Donations</h1>
        <span className="text-sm text-gray-500">{data.length} records</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${filter === "pending" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
          Pending ({pendingCount})
        </button>
        <button onClick={() => setFilter("processed")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${filter === "processed" ? "bg-green-600 text-white" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
          Processed ({processedCount})
        </button>
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${filter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          All ({data.length})
        </button>
      </div>

      {/* Action bar */}
      {filter !== "processed" && selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <button onClick={handleMarkProcessed} disabled={saving}
            className="px-4 py-1.5 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : `Mark as Processed (${selected.size})`}
          </button>
          <span className="text-xs text-gray-500">{selected.size} selected</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {filter !== "processed" && (
                  <th className="px-3 py-3 w-10">
                    <input type="checkbox"
                      checked={selected.size > 0 && selected.size === data.filter((r) => !r.processed).length}
                      onChange={selectAllPending} className="rounded border-gray-300" />
                  </th>
                )}
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Serial</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bill No</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Comment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={row.renew_id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected.has(row.renew_id) ? "bg-green-50" : ""}`}>
                    {filter !== "processed" && (
                      <td className="px-3 py-3">
                        {!row.processed ? (
                          <input type="checkbox" checked={selected.has(row.renew_id)}
                            onChange={() => toggleSelect(row.renew_id)} className="rounded border-gray-300" />
                        ) : (
                          <span className="text-green-500">&#10003;</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      {row.processed ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Processed</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.donationSerial}</td>
                    <td className="px-4 py-3">{row.BillNo}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.donationDate}</td>
                    <td className="px-4 py-3">{row.comment}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
