"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import DonationsTable from "@/components/DonationsTable";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    // Search by serial code
    let { data } = await supabase
      .from("my_donation")
      .select("*")
      .ilike("donationSerial", `%${query.trim()}%`)
      .limit(50);

    // If no results, search by client email
    if (!data || data.length === 0) {
      const res = await supabase
        .from("my_donation")
        .select("*")
        .ilike("donationClient", `%${query.trim()}%`)
        .limit(50);
      data = res.data;
    }

    // If still no results, search by macaddress
    if (!data || data.length === 0) {
      const res = await supabase
        .from("my_donation")
        .select("*")
        .ilike("macaddress", `%${query.trim()}%`)
        .limit(50);
      data = res.data;
    }

    setResults(data || []);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Donations</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3 max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by serial code, email, or MAC address..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {searched && <DonationsTable donations={results} title="Search Results" loading={loading} />}
    </div>
  );
}
