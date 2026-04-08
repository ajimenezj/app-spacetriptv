"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getSession() {
  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [key, val] = c.trim().split("=");
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
  try { return JSON.parse(decodeURIComponent(cookies["session"] || "{}")); } catch { return {}; }
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session.is_admin !== true) {
      router.replace("/dashboard");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Checking permissions...</div>
      </div>
    );
  }

  return <>{children}</>;
}
