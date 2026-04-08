"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getChangesToday } from "@/lib/admin";

const columns = [
  { key: "NewCode", label: "New Code" },
  { key: "OldCode", label: "Old Code" },
  { key: "modifdte", label: "Date" },
  { key: "customerClient", label: "Customer" },
  { key: "macaddress", label: "MAC Address" },
];

export default function ChangesTodayPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChangesToday().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Changes Today" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
