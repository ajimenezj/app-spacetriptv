"use client";
import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { registerSale } from "@/lib/admin";

export default function RegisterSalePage() {
  const [form, setForm] = useState({
    orderNumber: "",
    email: "",
    amount: "",
    webpage: "spacetriptv.com",
    iptv: 1,
    serverURL: "",
    nfpsOrder: "",
    serials: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    const serialList = form.serials.split("\n").map((s) => s.trim()).filter(Boolean);
    if (serialList.length === 0) {
      setErrorMsg("Enter at least one serial code");
      setStatus("error");
      return;
    }

    try {
      await registerSale({
        orderNumber: form.orderNumber,
        email: form.email,
        amount: parseFloat(form.amount) || 0,
        webpage: form.webpage,
        iptv: form.iptv,
        serverURL: form.serverURL,
        nfpsOrder: form.nfpsOrder,
        serials: serialList,
      });
      setStatus("success");
      setForm({ orderNumber: "", email: "", amount: "", webpage: "spacetriptv.com", iptv: 1, serverURL: "", nfpsOrder: "", serials: "" });
    } catch (err) {
      setErrorMsg(String(err));
      setStatus("error");
    }
  }

  return (
    <AdminGuard>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Register Sale</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        {status === "success" && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            Sale registered successfully!
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <input type="text" required value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="text" value={form.webpage} onChange={(e) => setForm({ ...form, webpage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IPTV</label>
              <select value={form.iptv} onChange={(e) => setForm({ ...form, iptv: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm">
                <option value={1}>Enabled</option>
                <option value={0}>Disabled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Server URL</label>
              <input type="text" value={form.serverURL} onChange={(e) => setForm({ ...form, serverURL: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPFS Order</label>
              <input type="text" value={form.nfpsOrder} onChange={(e) => setForm({ ...form, nfpsOrder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Codes (one per line)</label>
            <textarea rows={5} required value={form.serials} onChange={(e) => setForm({ ...form, serials: e.target.value })}
              placeholder="A12345B67890C&#10;X98765Y43210Z"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
          </div>

          <button type="submit" disabled={status === "saving"}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50">
            {status === "saving" ? "Registering..." : "Register Sale"}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
