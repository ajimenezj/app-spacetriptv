"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const resellerItems = [
  { label: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { label: "Donations", href: "/dashboard/donations", icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "Active", href: "/dashboard/active", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Inactive", href: "/dashboard/inactive", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Renewals", href: "/dashboard/renewals", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { label: "Search", href: "/dashboard/search", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
];

const adminItems = [
  { label: "Register Sale", href: "/dashboard/admin/register-sale", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
  { label: "Register Reseller", href: "/dashboard/admin/register-reseller", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Sales Today", href: "/dashboard/admin/sales-today", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Sales Month", href: "/dashboard/admin/sales-month", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Activated Today", href: "/dashboard/admin/activated-today", icon: "M5 13l4 4L19 7" },
  { label: "Expiring Today", href: "/dashboard/admin/expiring-today", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Expiring Month", href: "/dashboard/admin/expiring-month", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Failed Payments", href: "/dashboard/admin/failed-payments", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" },
  { label: "Full Refund", href: "/dashboard/admin/full-refund", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
  { label: "Pending Pay", href: "/dashboard/admin/pending-pay", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
  { label: "Renewed", href: "/dashboard/admin/renewals-admin", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { label: "Changes Today", href: "/dashboard/admin/changes-today", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { label: "Reports", href: "/dashboard/admin/reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function getSession() {
  if (typeof window === 'undefined') return {};
  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [key, val] = c.trim().split("=");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
  try { return JSON.parse(decodeURIComponent(cookies["session"] || "{}")); } catch { return {}; }
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsAdminUser(session.is_admin === true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <Link href="/dashboard" className="text-xl font-bold text-[#2563eb]" onClick={onClose}>
            SpaceTripTV
          </Link>
        </div>

        {/* Reseller Navigation */}
        <nav className="mt-4 px-3">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reseller</p>
          {resellerItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 text-sm font-medium transition-colors ${
                isActive(item.href) ? "bg-[#2563eb] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Admin Navigation - Only visible to super admin */}
        {isAdminUser && (
          <nav className="mt-4 px-3 pb-6">
            <p className="px-3 text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">Admin Panel</p>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 text-sm font-medium transition-colors ${
                  isActive(item.href) ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                <NavIcon d={item.icon} />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </aside>
    </>
  );
}
