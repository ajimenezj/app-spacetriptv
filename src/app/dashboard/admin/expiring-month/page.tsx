"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getExpiringMonth } from "@/lib/admin";

const columns = [
  { key: "BillNo", label: "Bill No" },
  { key: "donationSerial", label: "Serial" },
  { key: "iptvServerName", label: "Server" },
  { key: "macaddress", label: "MAC" },
  { key: "customerclient", label: "Customer" },
  { key: "dateEnd", label: "Date End" },
  { key: "NPFS_Order_NO", label: "NPFS" },
];

export default function ExpiringMonthPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExpiringMonth().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Expiring This Month" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
