"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortfolioViewer() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('/api/portfolio/list');
      const data = await response.json();
      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    }
    setLoading(false);
  };

  const handleDownload = async (portfolio) => {
    try {
      const packageId = portfolio.downloadUrl?.split('/').pop();
      if (!packageId) {
        // Fallback: direct GitHub download
        const githubZipUrl = portfolio.originalRepo + '/archive/refs/heads/main.zip';
        window.open(githubZipUrl, '_blank');
        return;
      }

      const response = await fetch(portfolio.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portfolio.id}-portfolio.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: direct GitHub download
      const githubZipUrl = portfolio.originalRepo + '/archive/refs/heads/main.zip';
      window.open(githubZipUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📁 Your Generated Portfolios
          </h1>
          <p className="text-gray-600 text-lg">
            Download and customize your AI-generated portfolios
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolios...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No portfolios generated yet</h3>
            <p className="text-gray-600 mb-6">Create your first personalized portfolio</p>
            <button
              onClick={() => router.push('/browse-portfolios')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              🎨 Browse & Personalize
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map(portfolio => (
              <div key={portfolio.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {portfolio.personalizedContent?.name || 'Generated Portfolio'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Framework: {portfolio.framework || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {portfolio.status === 'ready' ? '✅ Ready' : '⏳ Processing'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleDownload(portfolio)}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
                  >
                    📥 Download Portfolio
                  </button>
                  
                  <a
                    href={portfolio.originalRepo?.replace('github.com', 'github.dev')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all text-center"
                  >
                    ✏️ Edit in GitHub.dev
                  </a>
                  
                  <a
                    href={portfolio.originalRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-all text-center"
                  >
                    👁️ View Original
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}