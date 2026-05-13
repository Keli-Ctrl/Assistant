import React from 'react';

export default function DashboardHome() {
  const stats = [
    { name: 'Active Conversations', value: '12' },
    { name: 'Escalated', value: '3', color: 'text-red-600' },
    { name: 'Resolved Today', value: '45' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
            <p className={`mt-1 text-3xl font-semibold ${stat.color || 'text-gray-900'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            Welcome to your AI assistant dashboard. From here you can manage your business profile and monitor customer interactions.
          </p>
          <div className="flex gap-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Update Profile
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
              View All Chats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
