"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PasswordResetForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#2563eb] px-6 py-5 text-center">
            <h1 className="text-white text-xl font-bold tracking-wide">
              SPACETRIPTV <span className="font-light">|</span> RESET PASSWORD
            </h1>
          </div>
          <div className="px-6 py-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}

            {!success && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
                <form action="/api/auth/password-reset" method="POST">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#2563eb] text-white py-2.5 px-4 rounded-md hover:bg-[#1d4ed8] transition-colors font-medium text-sm"
                  >
                    Send Reset Link
                  </button>
                </form>
              </>
            )}

            <div className="mt-4 text-center">
              <a href="/login" className="text-sm text-[#2563eb] hover:underline">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>}>
      <PasswordResetForm />
    </Suspense>
  );
}
