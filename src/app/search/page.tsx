"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface DonationData {
  donationId: number;
  serial: string;
  email: string;
  portal: string;
  status: string;
  remainingDays: number;
  macAddress: string;
  internetProviderLock: string;
  countryLock: string;
  banCount: number;
  maxBans: number;
  countries: { CountryCode: string; CountryName: string }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [serial, setSerial] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [donation, setDonation] = useState<DonationData | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // MAC change state
  const [showMacForm, setShowMacForm] = useState(false);
  const [newMac, setNewMac] = useState("");

  // Lock state
  const [providerLock, setProviderLock] = useState("Enabled");
  const [countryLock, setCountryLock] = useState("All");

  const [actionLoading, setActionLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDonation(null);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/public/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), serial: serial.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }

      setDonation(data);
      setProviderLock(data.internetProviderLock);
      setCountryLock(data.countryLock);
      setNewMac(data.macAddress);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function doAction(action: string, extra: Record<string, any> = {}) {
    if (!donation) return;
    setActionLoading(true);
    setSuccessMsg("");
    setError("");

    try {
      const res = await fetch("/api/public/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          donationId: donation.donationId,
          email: donation.email,
          serial: donation.serial,
          ...extra,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Action failed");
        return;
      }

      setSuccessMsg(data.message);

      if (action === "changePortal" && data.portal) {
        setDonation({ ...donation, portal: data.portal });
      }
      if (action === "changeMac" && data.macAddress) {
        setDonation({ ...donation, macAddress: data.macAddress });
        setShowMacForm(false);
      }
    } catch {
      setError("Connection error");
    } finally {
      setActionLoading(false);
    }
  }

  function handleBackToSearch() {
    setDonation(null);
    setSuccessMsg("");
    setError("");
    setShowMacForm(false);
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Top bar */}
      <div className="bg-[#2e1065] text-white text-center py-2 text-sm">
        {successMsg ? (
          <span className="text-green-300 font-semibold">{successMsg}</span>
        ) : (
          <span>SpaceTripTV - IPTV Management Portal</span>
        )}
      </div>

      <div className="flex items-start justify-center px-4 pt-10 pb-20">
        <div className="w-full max-w-2xl">
          {/* No donation yet - show search form */}
          {!donation && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-2xl font-light text-center text-gray-600 mb-8">
                IPTV Reset &amp; Donation Checker
              </h1>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Client E-Mail"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <input
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="Assigned Code"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />

                <a href="/search/order" className="block text-sm text-blue-600 hover:underline cursor-pointer">
                  Forgot your donation code?
                </a>

                <div className="flex items-center justify-between pt-2">
                  <a href="/login" className="text-sm text-gray-600 hover:underline">
                    Back to Login
                  </a>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {loading ? "Searching..." : "Search Donation"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Donation found - show details */}
          {donation && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-2xl font-light text-center text-gray-500 mb-2">
                IPTV Reset &amp; Donation Checker
              </h1>
              <h2 className="text-center text-blue-600 font-semibold mb-1">
                Hello, here is your Donation details:
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              {/* MAC address change form */}
              {showMacForm ? (
                <div className="mb-6">
                  <p className="text-center text-red-600 text-sm mb-3">
                    <strong>WARNING:</strong> If you configure a MAC Address you won&apos;t be able to use Kokaleka TV apps, IPTV Smarters or Playlists.
                  </p>
                  <input
                    type="text"
                    value={newMac}
                    onChange={(e) => setNewMac(e.target.value)}
                    placeholder="00:1A:79:32:05:E2"
                    className="w-full max-w-xs mx-auto block px-4 py-2 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex justify-center gap-2 mt-3">
                    <button
                      onClick={() => doAction("changeMac", { macAddress: newMac })}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setShowMacForm(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setShowMacForm(false); doAction("changePortal"); }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                    >
                      Change Portal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center gap-2 mb-6 mt-4">
                  <button
                    onClick={() => setShowMacForm(true)}
                    className="px-4 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
                  >
                    Change MAC address
                  </button>
                  <button
                    onClick={() => doAction("iptvReset")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    IPTV Reset
                  </button>
                  <button
                    onClick={() => doAction("changePortal")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    Change Portal
                  </button>
                </div>
              )}

              {/* Donation details table */}
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-gray-700">Help?</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-gray-800 text-white rounded text-sm">Support Forum</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-gray-700">Donation:#</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-red-600 font-semibold">{donation.serial}</span>
                      <br />
                      <span className="text-sm text-gray-400">Generate New One</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-blue-700">IPTV Portal:</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-blue-600 font-semibold">{donation.portal}</span>
                      <br />
                      <span className="text-xs text-red-500">
                        If the default IPTV Portal URL doesn&apos;t work please try the full version{" "}
                        <a href={`http://${donation.portal}/c/index.html`} className="text-blue-600 underline" target="_blank" rel="noopener">
                          http://{donation.portal}/c/index.html
                        </a>
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-green-700">Status:</td>
                    <td className="py-3 px-4 text-center font-semibold">{donation.status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-gray-700">Ban Count:</td>
                    <td className="py-3 px-4 text-center">{donation.banCount} Of {donation.maxBans}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-red-700">Remaining days:</td>
                    <td className="py-3 px-4 text-center font-semibold">{donation.remainingDays} days</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-blue-700">Mac Address:</td>
                    <td className="py-3 px-4 text-center text-blue-600">{donation.macAddress || "Not set"}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-gray-700">Official Applications</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block bg-gray-900 text-white px-4 py-2 rounded text-sm">
                        KokalekaTV Lite
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-blue-800">Internet Provider Lock</td>
                    <td className="py-3 px-4 text-center">
                      <select value={providerLock} onChange={(e) => setProviderLock(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm w-full max-w-xs">
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                      <br />
                      <button onClick={() => doAction("internetProviderLock", { enabled: providerLock === "Enabled" })}
                        disabled={actionLoading}
                        className="mt-2 px-4 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-900 disabled:opacity-50">
                        Apply
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-center text-blue-800">Country Lock</td>
                    <td className="py-3 px-4 text-center">
                      <select value={countryLock} onChange={(e) => setCountryLock(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm w-full max-w-xs">
                        <option value="All">Allow All Countries</option>
                        {donation.countries.map((c) => (
                          <option key={c.CountryCode} value={c.CountryCode}>{c.CountryName}</option>
                        ))}
                      </select>
                      <br />
                      <button onClick={() => doAction("countryLock", { country: countryLock })}
                        disabled={actionLoading}
                        className="mt-2 px-4 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-900 disabled:opacity-50">
                        Apply
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 text-center text-sm text-gray-600">
                <a href="/login" className="hover:underline">Back to Login</a>
                <span className="mx-2 text-orange-500">Or</span>
                <button onClick={handleBackToSearch} className="hover:underline text-gray-600">Back to Search</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-200 flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
