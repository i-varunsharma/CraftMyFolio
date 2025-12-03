"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function GitHubClone({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await fetch(`/api/portfolio/get/${resolvedParams.portfolioId}`);
      if (response.ok) {
        const portfolioData = await response.json();
        setPortfolio(portfolioData);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url, filename) => {
    setDownloading(true);
    
    try {
      // Create download link and trigger it
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      setTimeout(() => {
        alert(`✅ ${filename} download started! If the download doesn't work, try the other branch or use manual download.`);
        setDownloading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please use the manual download option below.');
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Portfolio Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{portfolio.name}</h1>
            <p className="text-gray-400 text-sm">GitHub Repository Clone</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Dashboard
            </button>
            <a
              href={portfolio.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              🔗 View Original
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-3xl font-bold mb-4">Download Complete Portfolio</h2>
            <p className="text-gray-400 text-lg">
              Get the entire {portfolio.owner}/{portfolio.repo} repository as a ZIP file
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-green-400">✅ What You Get:</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Complete source code</li>
                <li>• All HTML, CSS, JavaScript files</li>
                <li>• Images and assets</li>
                <li>• Configuration files</li>
                <li>• Documentation</li>
              </ul>
            </div>

            <div className="bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">🛠️ How to Use:</h3>
              <ul className="space-y-2 text-gray-300">
                <li>1. Download the ZIP file</li>
                <li>2. Extract to your computer</li>
                <li>3. Edit files with your details</li>
                <li>4. Open index.html in browser</li>
                <li>5. Deploy to your hosting</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleDownload(portfolio.downloadUrl, `${portfolio.repo}-main.zip`)}
              disabled={downloading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? 'Downloading...' : '📥 Download Main Branch'}
            </button>
            
            <button
              onClick={() => handleDownload(portfolio.backupDownloadUrl, `${portfolio.repo}-master.zip`)}
              disabled={downloading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? 'Downloading...' : '📥 Download Master Branch'}
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                💡 <strong>Tip:</strong> If one download doesn't work, try the other branch. Some repositories use 'main' while others use 'master' as the default branch.
              </p>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-300 font-semibold mb-2">🛠️ Manual Download (if buttons don't work):</h4>
              <ol className="text-blue-200 text-sm space-y-1">
                <li>1. Visit the GitHub repository</li>
                <li>2. Click the green "Code" button</li>
                <li>3. Select "Download ZIP"</li>
                <li>4. Extract and edit the files</li>
              </ol>
              <a
                href={portfolio.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                🔗 Open GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}