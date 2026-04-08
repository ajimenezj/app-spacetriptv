"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Counts {
  active: number;
  inactive: number;
  total: number;
}

function getSession() {
  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [key, val] = c.trim().split("=");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
  try {
    return JSON.parse(decodeURIComponent(cookies["session"] || "{}"));
  } catch {
    return {};
  }
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<Counts>({ active: 0, inactive: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const session = getSession();
      const clientId = session.user_id;
      if (!clientId) return;

      const [activeRes, inactiveRes, totalRes] = await Promise.all([
        supabase.from("my_donation").select("*", { count: "exact", head: true })
          .eq("client_id", clientId).eq("status", 1).eq("inactive", 0).eq("admin_inactive", 0).eq("ResellerActivation", 1),
        supabase.from("my_donation").select("*", { count: "exact", head: true })
          .eq("client_id", clientId).eq("ResellerActivation", 1).or("inactive.eq.1,admin_inactive.eq.1"),
        supabase.from("my_donation").select("*", { count: "exact", head: true })
          .eq("client_id", clientId).eq("ResellerActivation", 1),
      ]);

      setCounts({
        active: activeRes.count || 0,
        inactive: inactiveRes.count || 0,
        total: totalRes.count || 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const stats = [
    { label: "Active Donations", value: counts.active, color: "border-green-500", bg: "bg-green-50", text: "text-green-700" },
    { label: "Inactive Donations", value: counts.inactive, color: "border-red-500", bg: "bg-red-50", text: "text-red-700" },
    { label: "Total Donations", value: counts.total, color: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className={`bg-white rounded-lg shadow-sm border-l-4 ${s.color} p-6`}>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{s.label}</div>
              <div className={`text-3xl font-bold mt-2 ${s.text}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
