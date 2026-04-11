export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const success = params.success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#2563eb] px-6 py-5 text-center">
            <h1 className="text-white text-xl font-bold tracking-wide">
              SPACETRIPTV <span className="font-light">|</span> LOGIN
            </h1>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <form action="/api/auth/login" method="POST">
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-sm"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between mb-6 text-sm">
                <a
                  href="/password-reset"
                  className="text-[#2563eb] hover:underline"
                >
                  Forgot Password?
                </a>
                <a href="#" className="text-[#2563eb] hover:underline">
                  Contact US
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563eb] text-white py-2.5 px-4 rounded-md hover:bg-[#1d4ed8] transition-colors font-medium text-sm"
              >
                Log in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
