"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getFailedPayments } from "@/lib/admin";

const columns = [
  { key: "BillNo", label: "Bill No" },
  { key: "ClientEmail", label: "Client Email" },
  { key: "PurchaseDate", label: "Date" },
  { key: "webClient", label: "Website" },
];

export default function FailedPaymentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFailedPayments().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Failed Payments" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
