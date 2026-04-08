"use client";

interface NavbarProps {
  userEmail: string;
  onMenuToggle: () => void;
}

export default function Navbar({ userEmail, onMenuToggle }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      {/* Hamburger - mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Welcome */}
      <div className="text-sm text-gray-600">
        Welcome, <span className="font-medium text-gray-900">{userEmail}</span>
      </div>

      {/* Logout */}
      <a
        href="/api/auth/logout"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </a>
    </header>
  );
}
