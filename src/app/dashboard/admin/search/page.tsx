"use client";
import { useState, useRef } from "react";
import AdminGuard from "@/components/AdminGuard";
import { adminSearchDonations, searchDonationsBulk } from "@/lib/admin";

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkInput, setBulkInput] = useState("");
  const [notFound, setNotFound] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Single search
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setNotFound([]);
    try {
      const data = await adminSearchDonations(query.trim());
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  // Bulk search from textarea or CSV
  async function handleBulkSearch(codes?: string[]) {
    const serials = codes || bulkInput
      .split(/[\n,;\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (serials.length === 0) return;
    setLoading(true);
    setNotFound([]);

    try {
      const data = await searchDonationsBulk(serials);
      setResults(data);

      // Find codes not returned
      const foundSerials = new Set(data.map((d: any) => d.donationSerial?.toUpperCase()));
      const missing = serials.filter(s => !foundSerials.has(s.toUpperCase()));
      setNotFound(missing);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  // CSV file upload
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      // Parse CSV: extract all non-empty cells that look like serial codes
      const codes = text
        .split(/[\n,;\r\t]+/)
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(s => s.length >= 5 && /^[A-Z0-9]+$/i.test(s));

      setBulkInput(codes.join("\n"));
      handleBulkSearch(codes);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  }

  // Export results to CSV
  function exportCSV() {
    if (results.length === 0) return;
    const headers = "Serial,Client Email,Customer,Status,Days Left,Date End,Portal,MAC Address,Bill No\n";
    const rows = results.map(r =>
      `${r.donationSerial},${r.donationClient},${r.customerclient},${r.statusText},${r.daysLeft},${r.dateEnd},${r.iptvServerName},${r.macaddress},${r.BillNo}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-search-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getDaysClass(days: number) {
    if (days <= 0) return "bg-red-100 text-red-700 font-bold";
    if (days <= 7) return "bg-orange-100 text-orange-700";
    if (days <= 30) return "bg-yellow-100 text-yellow-700";
    return "bg-green-50 text-green-700";
  }

  return (
    <AdminGuard>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Donation Search</h1>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode("single"); setResults([]); setNotFound([]); }}
          className={`px-4 py-2 rounded text-sm font-medium ${mode === "single" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Single Search
        </button>
        <button onClick={() => { setMode("bulk"); setResults([]); setNotFound([]); }}
          className={`px-4 py-2 rounded text-sm font-medium ${mode === "bulk" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Bulk / CSV Search
        </button>
      </div>

      {/* Single search */}
      {mode === "single" && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by serial, email, or order number..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 text-sm"
          />
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm font-medium disabled:opacity-50">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      )}

      {/* Bulk search */}
      {mode === "bulk" && (
        <div className="mb-6 space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paste serial codes (one per line, comma, or space separated)
              </label>
              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={"GN6753A67374J\nUX6453V95053J\nNU3851C29842N\n..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 text-sm font-mono"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleBulkSearch()} disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm font-medium disabled:opacity-50">
              {loading ? "Searching..." : `Search (${bulkInput.split(/[\n,;\s]+/).filter(Boolean).length} codes)`}
            </button>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium cursor-pointer">
              Upload CSV
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
            {bulkInput && (
              <button onClick={() => { setBulkInput(""); setResults([]); setNotFound([]); }}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 text-sm">
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Not found codes */}
      {notFound.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-semibold text-yellow-800 mb-1">
            {notFound.length} code(s) not found:
          </p>
          <p className="text-xs font-mono text-yellow-700">{notFound.join(", ")}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {results.length} results
              {" | "}
              <span className="text-green-600">{results.filter(r => r.statusText === "Active").length} active</span>
              {" | "}
              <span className="text-red-600">{results.filter(r => r.statusText === "Inactive").length} inactive</span>
              {" | "}
              <span className="text-orange-600">{results.filter(r => r.daysLeft <= 30 && r.daysLeft > 0).length} expiring soon</span>
            </span>
            <button onClick={exportCSV}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">#</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Serial</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Client Email</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Customer</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Days Left</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Expires</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Portal</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">MAC</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-600">Bill No</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.donationId || i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold">{r.donationSerial}</td>
                      <td className="px-3 py-2.5 text-xs">{r.donationClient}</td>
                      <td className="px-3 py-2.5">{r.customerclient}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.statusText === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>{r.statusText}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getDaysClass(r.daysLeft)}`}>
                          {r.daysLeft <= 0 ? "EXPIRED" : `${r.daysLeft}d`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">{r.dateEnd}</td>
                      <td className="px-3 py-2.5 text-xs">{r.iptvServerName}</td>
                      <td className="px-3 py-2.5 font-mono text-xs">{r.macaddress}</td>
                      <td className="px-3 py-2.5 text-xs">{r.BillNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && results.length === 0 && (query || bulkInput) && (
        <div className="text-center text-gray-400 py-8">No results</div>
      )}
    </AdminGuard>
  );
}
