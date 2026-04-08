"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getActivatedToday } from "@/lib/admin";

const columns = [
  { key: "BillNo", label: "Bill No" },
  { key: "donationSerial", label: "Serial" },
  { key: "iptvServerName", label: "IPTV Server" },
  { key: "macaddress", label: "MAC Address" },
  { key: "customerclient", label: "Customer" },
  { key: "dateEnd", label: "Date End" },
  { key: "NPFS_Order_NO", label: "NPFS Order" },
];

export default function ActivatedTodayPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivatedToday().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Activated Today" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
