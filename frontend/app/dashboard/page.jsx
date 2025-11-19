"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Load user from localStorage or URL params (OAuth callback)
  useEffect(() => {
    // Check URL params for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const userFromUrl = urlParams.get('user');
    
    if (tokenFromUrl && userFromUrl && userFromUrl !== 'undefined') {
      try {
        // OAuth callback - store token and user data
        localStorage.setItem('token', tokenFromUrl);
        localStorage.setItem('user', userFromUrl);
        setUser(JSON.parse(decodeURIComponent(userFromUrl)));
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } catch (error) {
        console.error('Error parsing OAuth user data:', error);
        // Clean URL anyway
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Check localStorage for existing session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    

  }, []);
  

  
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100 font-sans relative overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="200" cy="200" r="2" fill="#3b82f6" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="800" cy="300" r="2" fill="#6366f1" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="300" cy="700" r="2" fill="#8b5cf6" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <line x1="200" y1="200" x2="800" y2="300" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/>
          </line>
          <line x1="800" y1="300" x2="300" y2="700" stroke="#6366f1" strokeWidth="0.5" opacity="0.2">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite"/>
          </line>
        </svg>
      </div>
      
      {/* Header */}
      <header className="relative z-10 w-full py-6 flex justify-between items-center px-10 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CraftMyFolio</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-gray-400 font-medium">
          <a href="#" className="hover:text-blue-400 transition-colors duration-300 relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-blue-400 transition-colors duration-300 relative group">
            Templates
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-blue-400 transition-colors duration-300 relative group">
            Showcase
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {getInitials(user.name)}
                </div>
              )}
              <span className="text-gray-300 font-medium hidden md:block">{user.name.split(' ')[0]}</span>
            </div>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="text-gray-400 hover:text-red-400 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-300 hover:text-blue-400 transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
            >
              Sign Up
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center">
        {/* Floating AI Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-indigo-400 rounded-full animate-ping opacity-40"></div>
          <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce opacity-50"></div>
          <div className="absolute bottom-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-70"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* AI Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-blue-400 font-medium">Powered by AI</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Portfolio Creation
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Harness the power of artificial intelligence to create stunning, 
            professional portfolios that showcase your unique talents and achievements.
          </p>

          {user ? (
            <div className="mb-20">
              {/* Welcome Message */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-100 mb-4">
                  Welcome back, {user.name.split(' ')[0]}! 👋
                </h2>
                <p className="text-xl text-gray-400">
                  Ready to create something amazing?
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <button className="group p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Create New Portfolio</h3>
                  <p className="text-gray-400 text-sm">Start building your professional portfolio</p>
                </button>
                
                <button className="group p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Browse Templates</h3>
                  <p className="text-gray-400 text-sm">Explore our collection of designs</p>
                </button>
                
                <button 
                  onClick={() => router.push('/profile')}
                  className="group p-6 bg-gradient-to-br from-green-600/20 to-teal-600/20 rounded-2xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Manage Profile</h3>
                  <p className="text-gray-400 text-sm">Update your account settings</p>
                </button>
              </div>
              
              {/* Recent Activity */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
                  <h3 className="text-2xl font-semibold text-gray-100 mb-6">Recent Activity</h3>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-lg">No portfolios created yet</p>
                    <p className="text-gray-500 text-sm mt-2">Create your first portfolio to get started!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <button
                onClick={() => router.push("/signup")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="relative z-10 flex items-center">
                  Start Creating
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 text-gray-300 rounded-xl font-semibold text-lg border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/30 transition-all duration-300 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl mb-6 flex items-center justify-center border border-blue-500/20">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">AI-Powered Design</h3>
                <p className="text-gray-400 leading-relaxed">Our intelligent algorithms analyze your content and suggest optimal layouts, color schemes, and typography.</p>
              </div>
            </div>
            
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-indigo-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl mb-6 flex items-center justify-center border border-indigo-500/20">
                  <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Smart Templates</h3>
                <p className="text-gray-400 leading-relaxed">Choose from a curated collection of templates that adapt intelligently to your profession and style preferences.</p>
              </div>
            </div>
            
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 hover:border-purple-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-cyan-600/20 rounded-2xl mb-6 flex items-center justify-center border border-purple-500/20">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Instant Generation</h3>
                <p className="text-gray-400 leading-relaxed">Generate professional portfolios in seconds with our advanced AI that understands design principles and user experience.</p>
              </div>
            </div>
          </div>
        </div>
        


        {/* <div className="flex items-center justify-center mt-10 space-x-3">
          <div className="w-10 h-10 bg-pink-200 rounded-full" />
          <div className="w-10 h-10 bg-blue-200 rounded-full" />
          <div className="w-10 h-10 bg-yellow-200 rounded-full" />
          <div className="w-10 h-10 bg-green-200 rounded-full" />
          <span className="text-gray-500 text-sm ml-2">+200 creators</span>
        </div> */}
      </main>

      <footer className="relative z-10 py-8 text-gray-500 text-sm text-center border-t border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p>© 2025 CraftMyFolio. Crafted with AI for the future of portfolios.</p>
        </div>
      </footer>


    </div>
  );
}
