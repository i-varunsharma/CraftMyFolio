"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";



// Portfolio Manager Component with Pagination, Sorting, and Filtering
function PortfolioManager() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch user's portfolios from API
  useEffect(() => {
    const fetchUserPortfolios = async () => {
      try {
        // Fetch generated portfolios from storage
        const response = await fetch('/api/portfolio/list');
        
        if (response.ok) {
          const data = await response.json();
          const formattedPortfolios = data.portfolios.map(p => ({
            id: p.id,
            name: p.personalizedContent?.name || 'Generated Portfolio',
            template: p.framework || 'Unknown',
            status: p.status === 'ready' ? 'Published' : 'Draft',
            created: new Date(p.id && typeof p.id === 'string' && p.id.includes('_') ? parseInt(p.id.split('_')[1]) : Date.now()).toLocaleDateString(),
            views: Math.floor(Math.random() * 100),
            downloadUrl: p.downloadUrl,
            previewUrl: p.previewUrl
          }));
          setPortfolios(formattedPortfolios);
        } else {
          setPortfolios([]);
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPortfolios();
  }, [refreshKey]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort portfolios
  const filteredPortfolios = portfolios
    .filter(portfolio => {
      const matchesStatus = filterStatus === 'all' || (portfolio.status && portfolio.status.toLowerCase() === filterStatus);
      const matchesSearch = portfolio.name && portfolio.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPortfolios = filteredPortfolios.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (portfolio) => {
    if (portfolio.downloadUrl) {
      window.open(portfolio.downloadUrl, '_blank');
    } else {
      alert('Download URL not available');
    }
  };

  const handleView = (portfolio) => {
    if (portfolio.previewUrl) {
      window.open(portfolio.previewUrl, '_blank');
    } else {
      alert('Preview URL not available');
    }
  };

  const handleDelete = async (portfolioId) => {
    if (confirm('Are you sure you want to delete this portfolio?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/portfolios/${portfolioId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setPortfolios(portfolios.filter(p => p.id !== portfolioId));
        } else {
          alert('Failed to delete portfolio');
        }
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('Error deleting portfolio');
      }
    }
  };
  
  const handleCreateNew = () => {
    // Simple portfolio creation
    window.location.href = '/create-portfolio';
  };
  
  const handleAIAssist = (portfolio) => {
    // Open AI assistant for existing portfolio
    window.location.href = `/portfolio/ai-assist/${portfolio.id}?mode=edit`;
  };
  
  const handleClone = async (portfolio) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/portfolios/${portfolio.id}/clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = `/portfolio/builder/${data.sessionId}?cloned=true&ai=true`;
      }
    } catch (error) {
      console.error('Error cloning portfolio:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h3 className="text-2xl font-semibold text-gray-100">My Portfolios</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all font-medium"
            >
              🔄 Refresh
            </button>
            <button 
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
            >
              + Create New
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search portfolios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
          >
            <option value={4}>4 per page</option>
            <option value={8}>8 per page</option>
            <option value={12}>12 per page</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th 
                  className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => handleSort('created')}
                >
                  Created {sortBy === 'created' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => handleSort('views')}
                >
                  Views {sortBy === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPortfolios.map((portfolio) => (
                <tr key={portfolio.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-gray-100 font-medium">{portfolio.name}</div>
                      <div className="text-gray-400 text-sm">{portfolio.template} Template</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      portfolio.status === 'Published' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {portfolio.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{portfolio.created}</td>
                  <td className="py-4 px-4 text-gray-300">{portfolio.views}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">

                      <button 
                        onClick={() => handleEdit(portfolio)}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-xs px-2 py-1 bg-blue-500/10 rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleView(portfolio)}
                        className="text-green-400 hover:text-green-300 transition-colors text-xs px-2 py-1 bg-green-500/10 rounded"
                      >
                        View
                      </button>

                      <button 
                        onClick={() => handleDelete(portfolio.id)}
                        className="text-red-400 hover:text-red-300 transition-colors text-xs px-2 py-1 bg-red-500/10 rounded"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-gray-400 text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPortfolios.length)} of {filteredPortfolios.length} portfolios
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded border border-gray-600 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded border transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded border border-gray-600 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your portfolios...</p>
          </div>
        ) : filteredPortfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No portfolios created yet</p>
            <p className="text-gray-500 text-sm mt-2 mb-4">Create your first portfolio to get started!</p>
            <button 
              onClick={handleCreateNew}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Portfolio
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

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
          <a href="/templates" className="hover:text-blue-400 transition-colors duration-300 relative group">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                <button 
                  onClick={() => router.push('/create-portfolio')}
                  className="group p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Create from Scratch</h3>
                  <p className="text-gray-400 text-sm">Build your portfolio step by step</p>
                </button>
                
                <button 
                  onClick={() => router.push('/github-import')}
                  className="group p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Import from GitHub</h3>
                  <p className="text-gray-400 text-sm">Auto-generate from your repositories</p>
                </button>
                
                <button 
                  onClick={() => router.push('/browse-portfolios')}
                  className="group p-6 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-2xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">🔍 Browse & Customize</h3>
                  <p className="text-gray-400 text-sm">Discover curated portfolios & edit code</p>
                </button>
              </div>
              
              {/* Additional Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
                <button 
                  onClick={() => router.push('/my-projects')}
                  className="group p-6 bg-gradient-to-br from-green-600/20 to-teal-600/20 rounded-2xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">📂 My GitHub Projects</h3>
                  <p className="text-gray-400 text-sm">View your projects with repo & deploy links</p>
                </button>
                
                <button 
                  onClick={() => router.push('/demo-editor')}
                  className="group p-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">🚀 DEMO Editor</h3>
                  <p className="text-gray-400 text-sm">Live portfolio code editor - READY FOR DEMO!</p>
                </button>
              </div>
              
              {/* Main Dashboard Content */}
              <PortfolioManager />
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
      </main>

      <footer className="relative z-10 py-8 text-gray-500 text-sm text-center border-t border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p>© 2025 CraftMyFolio. Crafted with AI for the future of portfolios.</p>
        </div>
      </footer>


    </div>
  );
}
