"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getSalesToday } from "@/lib/admin";

const columns = [
  { key: "BillNo", label: "Bill No" },
  { key: "ClientEmail", label: "Client Email" },
  { key: "PurchaseDate", label: "Purchase Date" },
  { key: "webClient", label: "Website" },
  { key: "amount", label: "Amount" },
  { key: "cant", label: "Qty" },
  { key: "saleType", label: "Type" },
];

export default function SalesTodayPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "Normal" | "Reseller">("all");

  useEffect(() => {
    getSalesToday().then((d) => { setData(d); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? data : data.filter((r) => r.saleType === filter);
  const normalCount = data.filter((r) => r.saleType === "Normal").length;
  const resellerCount = data.filter((r) => r.saleType === "Reseller").length;

  return (
    <AdminGuard>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${filter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          All ({data.length})
        </button>
        <button onClick={() => setFilter("Normal")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${filter === "Normal" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
          Normal ({normalCount})
        </button>
        <button onClick={() => setFilter("Reseller")}
          className={`px-3 py-1.5 rounded text-sm font-medium ${filter === "Reseller" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-600 hover:bg-purple-100"}`}>
          Reseller ({resellerCount})
        </button>
      </div>
      <AdminTable title="Sales Today" columns={columns} data={filtered} loading={loading} />
    </AdminGuard>
  );
}
