'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100 relative overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-400" />
          <circle cx="200" cy="200" r="2" fill="#3b82f6" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-6 flex justify-between items-center px-10 border-b border-gray-800/50 backdrop-blur-sm">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-100 font-medium border border-gray-700/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CraftMyFolio</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-700/50">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">{user.name}</h1>
            <p className="text-gray-300 text-lg">{user.email}</p>
            <div className="inline-flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-green-400 text-sm font-medium">Verified</span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  className="w-full px-4 py-3.5 bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:bg-gray-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 text-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full px-4 py-3.5 bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-blue-400 focus:bg-gray-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 text-gray-100"
                  readOnly
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-gray-700/30 rounded-2xl border border-gray-600/30">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Portfolios Created</span>
                    <span className="text-blue-400 font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Templates Used</span>
                    <span className="text-blue-400 font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Account Status</span>
                    <span className="text-green-400 font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              Edit Profile
            </button>
            <button className="flex-1 bg-gray-700/50 text-gray-200 py-3 rounded-xl font-semibold border border-gray-600 hover:bg-gray-700 transition-all duration-300">
              Change Password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}