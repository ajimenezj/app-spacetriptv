"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function getSession() {
  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [key, val] = c.trim().split("=");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
  try { return JSON.parse(decodeURIComponent(cookies["session"] || "{}")); } catch { return {}; }
}

interface Renewal {
  renew_id: number;
  donationSerial: string;
  donationDate: string;
  email: string;
  BillNo: string;
  comment: string;
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const session = getSession();
      if (!session.user_email) return;

      const { data } = await supabase
        .from("my_renewDonation")
        .select("*")
        .eq("email", session.user_email)
        .order("renew_id", { ascending: false });

      setRenewals((data || []) as Renewal[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Renewals</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Serial</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Bill No</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Comment</th>
                </tr>
              </thead>
              <tbody>
                {renewals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No renewals found</td>
                  </tr>
                ) : (
                  renewals.map((r, i) => (
                    <tr key={r.renew_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700">{r.donationSerial}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.BillNo}</td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3 text-xs">{r.donationDate}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.comment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
