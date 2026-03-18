'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'KS';

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Left — breadcrumb placeholder */}
      <div className="flex flex-1 items-center gap-2">
        {user && (
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{user.organizationName}</span>
          </span>
        )}
      </div>

      {/* Right — user menu */}
      <div className="relative flex items-center gap-x-4">
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
        <button
          id="user-menu-button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold text-white">
            {initials}
          </div>
          {user && (
            <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {user.name}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            {/* Dropdown */}
            <div className="absolute right-0 top-12 z-20 w-56 rounded-xl bg-white shadow-lg ring-1 ring-gray-200 overflow-hidden">
              {user && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                    {user.role}
                  </span>
                </div>
              )}
              <button
                id="logout-button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
