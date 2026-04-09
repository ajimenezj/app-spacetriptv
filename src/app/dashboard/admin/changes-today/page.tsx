"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { getChangesToday } from "@/lib/admin";

export default function ChangesTodayPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChangesToday().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <AdminGuard>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Changes Today</h1>
        <div className="text-gray-500">Loading...</div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Changes Today</h1>
        <span className="text-sm text-gray-500">{data.length} records</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date/Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Client Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Serial</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bill No</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Old Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">New Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">MAC Address</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Server</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Expires</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    No changes today
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={row.ChangeId || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-xs">{row.modifdte ? new Date(row.modifdte).toLocaleString() : ''}</td>
                    <td className="px-4 py-3 text-xs">{row.donationClient}</td>
                    <td className="px-4 py-3">{row.customerClient}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.donationSerial}</td>
                    <td className="px-4 py-3">{row.BillNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-red-600">{row.OldCode}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-600">{row.NewCode}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.macaddress}</td>
                    <td className="px-4 py-3">{row.iptvServerName}</td>
                    <td className="px-4 py-3">{row.dateEnd}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          These changes were requested by clients from the reseller panel. Review and apply manually in the server.
        </p>
      )}
    </AdminGuard>
  );
}
