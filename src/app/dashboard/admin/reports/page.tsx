"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getSalesSummary } from "@/lib/admin";

const columns = [
  { key: "webClient", label: "Website" },
  { key: "totalSales", label: "Total Sales ($)" },
  { key: "totalCodes", label: "Total Codes" },
];

export default function ReportsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalesSummary().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Reports - Sales Summary (This Month)" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
