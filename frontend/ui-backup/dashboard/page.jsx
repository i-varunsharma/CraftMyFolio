"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Load user from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans relative overflow-hidden">
      {/* Header */}
      <header className="w-full py-6 flex justify-between items-center px-10 border-b border-gray-100">
        <div className="text-2xl font-bold text-pink-600">CraftMyFolio</div>

        <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
          <a href="#" className="hover:text-pink-600 transition">Features</a>
          <a href="#" className="hover:text-pink-600 transition">Public Portfolios</a>
          <a href="#" className="hover:text-pink-600 transition">Pricing</a>
        </nav>

        <div className="relative group">
          <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition">
            {user?.profilePic ? (
              <img 
                src={user.profilePic} 
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {user ? getInitials(user.name) : 'U'}
              </div>
            )}
            <span className="text-gray-700 font-medium hidden md:block">{user ? user.name.split(' ')[0] : 'User'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {user ? (
              <>
                <div className="p-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Portfolios</a>
                  <hr className="my-2" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="py-2">
                <button 
                  onClick={() => router.push('/login')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => router.push('/signup')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 text-center bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] [background-size:20px_20px]">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight max-w-3xl mb-6">
          Your portfolio, ready in{" "}
          <span className="text-pink-600">10 minutes</span> — not days.
        </h1>

        <p className="text-lg text-gray-600 max-w-xl mb-10">
          Stop spending days coding your portfolio when you can build it in just
          10 minutes — without writing a single line of code.
        </p>

        {user ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition shadow-md"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition shadow-md"
          >
            Create Your Portfolio
          </button>
        )}
        


        {/* <div className="flex items-center justify-center mt-10 space-x-3">
          <div className="w-10 h-10 bg-pink-200 rounded-full" />
          <div className="w-10 h-10 bg-blue-200 rounded-full" />
          <div className="w-10 h-10 bg-yellow-200 rounded-full" />
          <div className="w-10 h-10 bg-green-200 rounded-full" />
          <span className="text-gray-500 text-sm ml-2">+200 creators</span>
        </div> */}
      </main>

      <footer className="py-6 text-gray-400 text-sm text-center border-t border-gray-100">
        © 2025 Portfolio Builder. All rights reserved.
      </footer>


    </div>
  );
}
