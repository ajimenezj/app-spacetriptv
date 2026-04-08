export default function PasswordResetPage() {
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
            <p className="text-sm text-gray-600 mb-4">Enter your email to receive a password reset link.</p>
            <form>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm"
                  placeholder="Email"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#2563eb] text-white py-2.5 px-4 rounded-md hover:bg-[#1d4ed8] transition-colors font-medium text-sm"
              >
                Reset Password
              </button>
            </form>
            <div className="mt-4 text-center">
              <a href="/login" className="text-sm text-[#2563eb] hover:underline">Back to Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
