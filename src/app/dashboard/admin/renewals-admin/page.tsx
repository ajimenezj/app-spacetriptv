"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminTable from "@/components/AdminTable";
import { getRenewedDonations } from "@/lib/admin";

const columns = [
  { key: "donationSerial", label: "Serial" },
  { key: "BillNo", label: "Bill No" },
  { key: "email", label: "Email" },
  { key: "donationDate", label: "Date" },
  { key: "comment", label: "Comment" },
];

export default function RenewalsAdminPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRenewedDonations().then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <AdminGuard>
      <AdminTable title="Renewed Donations" columns={columns} data={data} loading={loading} />
    </AdminGuard>
  );
}
