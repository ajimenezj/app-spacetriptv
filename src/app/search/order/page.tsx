"use client";
import { useState } from "react";

interface OrderResult {
  order: {
    billNo: string;
    email: string;
    date: string;
    amount: number;
    quantity: number;
  };
  donations: {
    serial: string;
    portal: string;
    macAddress: string;
    dateEnd: string;
    remainingDays: number;
    status: string;
  }[];
}

export default function SearchOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/public/search-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }

      setResult(data);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="flex items-start justify-center px-4 pt-16 pb-20">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center text-gray-700 mb-8">
              SEARCH YOUR ORDER
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {!result && (
              <form onSubmit={handleSearch} className="space-y-4">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Order Number"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email used to make the order"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />

                <div className="flex items-center justify-between pt-2">
                  <a href="/login" className="text-sm text-gray-600 hover:underline">
                    Back to Login
                  </a>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {loading ? "Searching..." : "Search Order"}
                  </button>
                </div>
              </form>
            )}

            {result && (
              <div>
                {/* Order info */}
                <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold text-gray-600">Order:</span> {result.order.billNo}</div>
                    <div><span className="font-semibold text-gray-600">Email:</span> {result.order.email}</div>
                    <div><span className="font-semibold text-gray-600">Date:</span> {result.order.date}</div>
                    <div><span className="font-semibold text-gray-600">Amount:</span> ${result.order.amount}</div>
                  </div>
                </div>

                {/* Donations list */}
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Your Donation Codes ({result.donations.length})
                </h3>

                {result.donations.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No donation codes assigned to this order yet.</p>
                ) : (
                  <div className="space-y-3">
                    {result.donations.map((d) => (
                      <div key={d.serial} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-red-600 text-lg">{d.serial}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            d.status === "Running" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                          <div>Portal: <span className="text-blue-600">{d.portal}</span></div>
                          <div>Expires: {d.dateEnd}</div>
                          <div>MAC: {d.macAddress || "Not set"}</div>
                          <div>Remaining: <span className="font-semibold">{d.remainingDays} days</span></div>
                        </div>
                        <a
                          href={`/search?email=${encodeURIComponent(result.order.email)}&code=${encodeURIComponent(d.serial)}`}
                          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                        >
                          Manage this donation &rarr;
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex gap-4 text-sm">
                  <button onClick={() => setResult(null)} className="text-gray-600 hover:underline">
                    Search another order
                  </button>
                  <a href="/search" className="text-blue-600 hover:underline">Back to Donation Search</a>
                  <a href="/login" className="text-gray-600 hover:underline">Back to Login</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
