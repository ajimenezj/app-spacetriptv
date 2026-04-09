"use client";
import { useState, useEffect } from "react";
import AdminGuard from "@/components/AdminGuard";
import { registerSale } from "@/lib/admin";

// Price scale: quantity -> total amount
const PRICE_SCALE: Record<number, number> = {
  1: 60, 2: 100, 3: 145, 4: 185, 5: 225,
  6: 250, 7: 275, 8: 300, 9: 335, 10: 370,
  11: 395, 12: 420, 13: 445, 14: 470, 15: 495,
  16: 520, 17: 545, 18: 570, 19: 595, 20: 620,
};

// Normal: 1-4, Reseller: 5-20
const MAX_DONATIONS = 20;

// Format: 4409 (fixed) + YYMMDDHHMMSS = 16 digits total
// Example: 4409250401103505 = 4409 + 25/04/01 10:35:05
function generateOrderNumber(): string {
  const prefix = "4409";
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return prefix + yy + MM + dd + hh + mm + ss;
}

function getAmount(qty: number): number {
  return PRICE_SCALE[qty] || qty * 35;
}

export default function RegisterSalePage() {
  const [form, setForm] = useState({
    orderNumber: "",
    email: "",
    quantity: 1,
    amount: 60,
    webpage: "spacetriptv.com",
    iptv: 1,
    serverURL: "",
    nfpsOrder: "",
    serials: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setForm((f) => ({ ...f, orderNumber: generateOrderNumber() }));
  }, []);

  function handleQuantityChange(qty: number) {
    if (qty < 1) qty = 1;
    if (qty > MAX_DONATIONS) qty = MAX_DONATIONS;
    setForm((f) => ({ ...f, quantity: qty, amount: getAmount(qty) }));
  }

  const saleType = form.quantity >= 5 ? "Reseller" : "Normal";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");

    const serialList = form.serials.split("\n").map((s) => s.trim()).filter(Boolean);
    if (serialList.length === 0) {
      setErrorMsg("Enter at least one serial code");
      setStatus("error");
      return;
    }

    if (serialList.length !== form.quantity) {
      setErrorMsg(`You selected ${form.quantity} donations but entered ${serialList.length} serial codes. They must match.`);
      setStatus("error");
      return;
    }

    try {
      await registerSale({
        orderNumber: form.orderNumber,
        email: form.email,
        amount: form.amount,
        webpage: form.webpage,
        iptv: form.iptv,
        serverURL: form.serverURL,
        nfpsOrder: form.nfpsOrder,
        serials: serialList,
      });
      setStatus("success");
      setForm({
        orderNumber: generateOrderNumber(),
        email: "",
        quantity: 1,
        amount: 60,
        webpage: "spacetriptv.com",
        iptv: 1,
        serverURL: "",
        nfpsOrder: "",
        serials: "",
      });
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
          {/* Order Number (auto-generated, read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number (auto)</label>
              <input type="text" readOnly value={form.orderNumber}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-600 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          {/* Quantity selector + auto-calculated amount + sale type badge */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donations Qty</label>
              <select value={form.quantity} onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm">
                {Array.from({ length: MAX_DONATIONS }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "donation" : "donations"} - ${getAmount(n)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input type="text" readOnly value={`$${form.amount.toFixed(2)}`}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm font-semibold text-green-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Type</label>
              <div className={`w-full px-3 py-2 rounded-md text-sm font-semibold text-center ${
                saleType === "Reseller"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}>
                {saleType} ({form.quantity >= 5 ? "5-20" : "1-4"})
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPFS Order</label>
              <input type="text" value={form.nfpsOrder} onChange={(e) => setForm({ ...form, nfpsOrder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Server URL</label>
            <input type="text" value={form.serverURL} onChange={(e) => setForm({ ...form, serverURL: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Codes ({form.quantity} required, one per line)
            </label>
            <textarea rows={Math.max(3, form.quantity)} required value={form.serials} onChange={(e) => setForm({ ...form, serials: e.target.value })}
              placeholder={"Enter " + form.quantity + " serial code(s), one per line"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
          </div>

          {/* Price reference table */}
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">View price scale</summary>
            <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
              {Object.entries(PRICE_SCALE).map(([qty, price]) => (
                <div key={qty} className={`px-2 py-1 rounded text-center ${
                  Number(qty) === form.quantity ? "bg-orange-100 text-orange-700 font-bold" : "bg-gray-50"
                }`}>
                  {qty}x = ${price}
                </div>
              ))}
            </div>
          </details>

          <button type="submit" disabled={status === "saving"}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50">
            {status === "saving" ? "Registering..." : "Register Sale"}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
