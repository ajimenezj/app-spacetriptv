"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { getExpiringNext20Days } from "@/lib/admin";

export default function ExpiringPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailResult, setEmailResult] = useState<string>("");

  useEffect(() => {
    getExpiringNext20Days().then((d) => { setData(d); setLoading(false); });
  }, []);

  function toggleSelect(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map((_, i) => i)));
  }

  function getSelectedRecipients() {
    const recipients: { to: string; customerName: string; serial: string; dateEnd: string; daysLeft: number }[] = [];
    selected.forEach((idx) => {
      const row = data[idx];
      if (row?.donationClient) {
        recipients.push({
          to: row.donationClient,
          customerName: row.customerclient || '',
          serial: row.donationSerial || '',
          dateEnd: row.dateEnd || '',
          daysLeft: row.daysLeft || 0,
        });
      }
    });
    return recipients;
  }

  async function handleSendReminders() {
    const recipients = getSelectedRecipients();
    if (recipients.length === 0) return;

    setEmailStatus("sending");
    setEmailResult("");

    try {
      const res = await fetch("/api/email/send-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients }),
      });
      const result = await res.json();

      if (!res.ok) {
        setEmailStatus("error");
        setEmailResult(result.error || "Failed to send emails");
        return;
      }

      setEmailStatus("sent");
      setEmailResult(`Sent: ${result.sent}, Failed: ${result.failed}`);
      if (result.sent > 0) {
        setSelected(new Set());
      }
      setTimeout(() => { setEmailStatus("idle"); setEmailResult(""); }, 5000);
    } catch (err) {
      setEmailStatus("error");
      setEmailResult(String(err));
    }
  }

  function getDaysLeftBadge(days: number) {
    if (days === 0) return "bg-red-100 text-red-700 font-bold";
    if (days <= 3) return "bg-orange-100 text-orange-700 font-semibold";
    if (days <= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-green-50 text-green-700";
  }

  if (loading) {
    return (
      <AdminGuard>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Expiring - Next 20 Days</h1>
        <div className="text-gray-500">Loading...</div>
      </AdminGuard>
    );
  }

  const todayCount = data.filter((r) => r.daysLeft === 0).length;
  const weekCount = data.filter((r) => r.daysLeft <= 7).length;

  return (
    <AdminGuard>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Expiring - Next 20 Days</h1>
        <span className="text-sm text-gray-500">{data.length} records</span>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 mb-4">
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Today: {todayCount}
        </span>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          This week: {weekCount}
        </span>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          Total: {data.length}
        </span>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={toggleAll}
          className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
          {selected.size === data.length ? "Deselect All" : "Select All"}
        </button>
        {selected.size > 0 && (
          <button onClick={handleSendReminders}
            disabled={emailStatus === "sending"}
            className="px-4 py-1.5 rounded text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">
            {emailStatus === "sending" ? "Sending..."
              : emailStatus === "sent" ? "Sent!"
              : `Send Reminder via SendGrid (${getSelectedRecipients().length})`}
          </button>
        )}
        {selected.size > 0 && (
          <span className="text-xs text-gray-500">{selected.size} selected</span>
        )}
        {emailResult && (
          <span className={`text-xs ${emailStatus === "error" ? "text-red-600" : "text-green-600"}`}>
            {emailResult}
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={selected.size === data.length && data.length > 0}
                    onChange={toggleAll} className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Days Left</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date End</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Serial</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Server</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">MAC</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bill No</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No expiring donations in the next 20 days
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected.has(i) ? "bg-orange-50" : ""}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selected.has(i)}
                        onChange={() => toggleSelect(i)} className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getDaysLeftBadge(row.daysLeft)}`}>
                        {row.daysLeft === 0 ? "TODAY" : `${row.daysLeft}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.dateEnd}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.donationSerial}</td>
                    <td className="px-4 py-3">{row.customerclient}</td>
                    <td className="px-4 py-3 text-xs">{row.donationClient}</td>
                    <td className="px-4 py-3">{row.iptvServerName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.macaddress}</td>
                    <td className="px-4 py-3">{row.BillNo}</td>
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
