"use client";

interface Donation {
  donationId: number;
  BillNo: string;
  donationSerial: string;
  donationClient: string;
  donationStatus: string;
  donationType: string;
  iptvServerName: string;
  serverName: string;
  dateBegin: string;
  dateEnd: string;
  status: number;
  inactive: number;
  admin_inactive: number;
  macaddress: string;
  iptv: number;
  iks: number;
}

interface Props {
  donations: Donation[];
  title: string;
  loading?: boolean;
}

export default function DonationsTable({ donations, title, loading }: Props) {
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const getStatusBadge = (d: Donation) => {
    if (d.inactive === 1 || d.admin_inactive === 1) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Inactive</span>;
    }
    if (d.status === 1) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Pending</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <span className="text-sm text-gray-500">{donations.length} records</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bill No</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Serial</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Server</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date Begin</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date End</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">MAC</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                donations.map((d, i) => (
                  <tr key={d.donationId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.BillNo}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700">{d.donationSerial}</td>
                    <td className="px-4 py-3">{d.donationClient}</td>
                    <td className="px-4 py-3">{getStatusBadge(d)}</td>
                    <td className="px-4 py-3">{d.donationType}</td>
                    <td className="px-4 py-3 text-xs">{d.iptvServerName || d.serverName}</td>
                    <td className="px-4 py-3 text-xs">{d.dateBegin}</td>
                    <td className="px-4 py-3 text-xs">{d.dateEnd}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.macaddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
