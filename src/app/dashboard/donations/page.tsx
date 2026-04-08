"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DonationsTable from "@/components/DonationsTable";

function getSession() {
  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [key, val] = c.trim().split("=");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
  try { return JSON.parse(decodeURIComponent(cookies["session"] || "{}")); } catch { return {}; }
}

export default function DonationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const session = getSession();
      if (!session.user_id) return;

      const { data } = await supabase
        .from("my_donation")
        .select("*")
        .eq("client_id", session.user_id)
        .eq("ResellerActivation", 1)
        .order("donationId", { ascending: false });

      setDonations(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return <DonationsTable donations={donations} title="All Donations" loading={loading} />;
}
