"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getFullRefunds } from "@/lib/admin";

const columns = [
  { key: "BillNo", label: "Bill No" },
  { key: "ClientEmail", label: "Client Email" },
  { key: "PurchaseDate", label: "Purchase Date" },
  { key: "webClient", label: "Website" },
  { key: "refundDate", label: "Refund Date" },
];

export default function FullRefundPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFullRefunds().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Full Refunds" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
