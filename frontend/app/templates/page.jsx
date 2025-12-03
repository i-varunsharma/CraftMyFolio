"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [sortBy, setSortBy] = useState('stars');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch GitHub portfolio repositories dynamically
  useEffect(() => {
    const fetchGitHubPortfolios = async () => {
      try {
        const queries = [
          'portfolio+in:name+in:description+stars:>10',
          'personal-website+in:name+in:description+stars:>5',
          'developer-portfolio+in:name+in:description+stars:>5'
        ];
        
        const allRepos = [];
        
        for (const query of queries) {
          const response = await fetch(
            `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=20`
          );
          
          if (response.ok) {
            const data = await response.json();
            allRepos.push(...data.items);
          }
        }
        
        // Remove duplicates and format data
        const uniqueRepos = allRepos
          .filter((repo, index, self) => 
            index === self.findIndex(r => r.id === repo.id)
          )
          .filter(repo => repo.stargazers_count >= 5)
          .slice(0, 50)
          .map((repo, index) => ({
            id: repo.id,
            name: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            github: repo.html_url,
            demo: repo.homepage || `https://${repo.owner.login}.github.io/${repo.name}`,
            image: `https://images.unsplash.com/photo-${1461749280684 + index}?w=400&h=250&fit=crop`,
            tags: repo.topics?.slice(0, 3) || ['HTML', 'CSS', 'JavaScript'],
            description: repo.description || 'Portfolio website repository',
            stars: repo.stargazers_count,
            language: repo.language || 'JavaScript'
          }));
        
        setTemplates(uniqueRepos);
      } catch (error) {
        console.error('Error fetching GitHub portfolios:', error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGitHubPortfolios();
  }, []);

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesLanguage = filterLanguage === 'all' || template.language.toLowerCase() === filterLanguage.toLowerCase();
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLanguage && matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  // Get unique languages for filter
  const languages = ['all', ...new Set(templates.map(t => t.language).filter(Boolean))];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSaveTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/portfolios/from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: template.id,
          name: `${template.name} - Copy`,
          githubUrl: template.github
        })
      });
      
      if (response.ok) {
        alert(`Template "${template.name}" saved to your portfolios!`);
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">GitHub Portfolio Templates</h1>
            <p className="text-gray-400">Discover popular GitHub portfolio repositories with good ratings</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : lang}
              </option>
            ))}
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
          >
            <option value="stars-desc">Most Stars</option>
            <option value="stars-asc">Least Stars</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
          >
            <option value={6}>6 per page</option>
            <option value={9}>9 per page</option>
            <option value={12}>12 per page</option>
            <option value={18}>18 per page</option>
          </select>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading GitHub portfolios...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} templates
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTemplates.map((template) => (
              <div key={template.id} className="bg-gray-800/40 rounded-xl border border-gray-600/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                <div className="aspect-video bg-gray-600/50 overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">{template.name}</h4>
                  <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-yellow-400 text-sm font-medium">{template.stars}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{template.language}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <a 
                      href={template.demo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-600/50 text-gray-300 px-3 py-2 rounded-lg text-sm text-center hover:bg-gray-600 transition-colors"
                    >
                      Preview
                    </a>
                    <a 
                      href={template.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-600/50 text-gray-300 px-3 py-2 rounded-lg text-sm text-center hover:bg-gray-600 transition-colors"
                    >
                      GitHub
                    </a>
                    <button 
                      onClick={() => handleSaveTemplate(template)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
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
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No templates found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}