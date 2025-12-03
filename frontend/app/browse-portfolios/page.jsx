"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonalizationModal from '../../components/PersonalizationModal';

export default function BrowsePortfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [generatedPortfolio, setGeneratedPortfolio] = useState(null);
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'All Portfolios', icon: '🌟' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'minimal', name: 'Minimal', icon: '⚪' }
  ];

  useEffect(() => {
    fetchPortfolios();
  }, [selectedCategory]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/discover?category=${selectedCategory}&limit=24`);
      const data = await response.json();
      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    }
    setLoading(false);
  };

  const handlePersonalizePortfolio = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setShowPersonalizationModal(true);
  };

  const handleGeneratePortfolio = (generatedPortfolio) => {
    setGeneratedPortfolio(generatedPortfolio);
    setShowPersonalizationModal(false);
  };

  const handleQuickClone = async (portfolio, event) => {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Opening...';
    button.disabled = true;

    try {
      const repoUrl = portfolio.url;
      const githubDevUrl = repoUrl.replace('github.com', 'github.dev');
      window.open(githubDevUrl, '_blank');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    } catch (error) {
      button.textContent = originalText;
      button.disabled = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔍 Copy Great Portfolio Designs
          </h1>
          <p className="text-gray-600 text-lg">
            Find portfolios you like, copy the code, and replace with your info
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Discovering amazing portfolios...</p>
          </div>
        )}

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolios.map(portfolio => (
            <div key={portfolio.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={portfolio.owner.avatar} 
                  alt={portfolio.owner.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{portfolio.name}</h3>
                  <p className="text-sm text-gray-500">@{portfolio.owner.username}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {portfolio.description || 'No description available'}
              </p>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  ⭐ {portfolio.stars}
                </span>
                <span className="flex items-center gap-1">
                  💻 {portfolio.language}
                </span>
                {portfolio.hasPages && (
                  <span className="flex items-center gap-1">
                    🌐 Live
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const repoUrl = encodeURIComponent(portfolio.url);
                    router.push(`/edit-portfolio?repo=${repoUrl}`);
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all text-sm"
                >
                  ✏️ Select & Edit
                </button>
                <a
                  href={portfolio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all text-sm"
                >
                  👁️ View
                </a>
                {portfolio.liveUrl && (
                  <a
                    href={portfolio.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all text-sm"
                  >
                    🌐 Live
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && portfolios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No portfolios found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        )}
      </div>


    </div>
  );
}