import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">Telegram AI</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-50 hover:text-indigo-600">
            Overview
          </Link>
          <Link href="/dashboard/onboarding" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-50 hover:text-indigo-600">
            Business Profile
          </Link>
          <Link href="/dashboard/chats" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-50 hover:text-indigo-600">
            Conversations
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
