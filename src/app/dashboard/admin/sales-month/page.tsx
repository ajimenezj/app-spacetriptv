"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getSalesMonth } from "@/lib/admin";

const columns = [
  { key: "BillNo", label: "Bill No" },
  { key: "ClientEmail", label: "Client Email" },
  { key: "PurchaseDate", label: "Purchase Date" },
  { key: "webClient", label: "Website" },
  { key: "amount", label: "Amount" },
  { key: "cant", label: "Qty" },
];

export default function SalesMonthPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalesMonth().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Sales This Month" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
