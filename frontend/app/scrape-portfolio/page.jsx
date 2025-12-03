"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScrapePortfolio() {
  const router = useRouter();
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrapedData, setScrapedData] = useState(null);

  const handleScrape = async () => {
    if (!githubUrl.trim()) {
      setError("Please enter a GitHub portfolio URL");
      return;
    }

    if (!githubUrl.includes('github.com')) {
      setError("Please enter a valid GitHub URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/portfolio/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to scrape portfolio");
        return;
      }

      setScrapedData(data);
    } catch (error) {
      setError("Failed to connect to scraping service");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCode = () => {
    if (scrapedData?.portfolioId) {
      router.push(`/code-editor/${scrapedData.portfolioId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">🔥 Scrape & Edit Portfolio Code</h1>
            <p className="text-gray-400 text-lg">
              Enter any GitHub portfolio URL to download, analyze, and edit the actual code with your details
            </p>
          </div>

          {!scrapedData ? (
            <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">GitHub Portfolio URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/portfolio-repo"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleScrape()}
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Examples: React portfolios, Vue.js sites, Next.js projects, or any HTML/CSS portfolio
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleScrape}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Scraping & Analyzing Code...
                    </div>
                  ) : (
                    "🚀 Scrape Portfolio Code"
                  )}
                </button>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <div className="text-2xl mb-2">📥</div>
                    <h3 className="font-semibold text-blue-400">Download Code</h3>
                    <p className="text-sm text-gray-400">Scrape entire portfolio codebase</p>
                  </div>
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="font-semibold text-green-400">AI Analysis</h3>
                    <p className="text-sm text-gray-400">Identify editable fields automatically</p>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <div className="text-2xl mb-2">✏️</div>
                    <h3 className="font-semibold text-purple-400">Code Editor</h3>
                    <p className="text-sm text-gray-400">Edit with your details & deploy</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">Portfolio Code Scraped Successfully!</h2>
                <p className="text-gray-300">
                  Downloaded and analyzed {scrapedData.data.fileCount} files from the repository
                </p>
              </div>

              <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
                <h3 className="text-2xl font-bold mb-6">📊 Analysis Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-3">Repository Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Name:</span> {scrapedData.data.repoInfo.name}</div>
                      <div><span className="text-gray-400">Framework:</span> {scrapedData.data.framework}</div>
                      <div><span className="text-gray-400">Files:</span> {scrapedData.data.fileCount} code files</div>
                      <div><span className="text-gray-400">Stars:</span> ⭐ {scrapedData.data.repoInfo.stars}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-400 mb-3">AI Detected Fields</h4>
                    <div className="space-y-2">
                      {scrapedData.data.editableFields?.slice(0, 4).map((field, index) => (
                        <div key={index} className="bg-gray-700/30 p-2 rounded text-sm">
                          <span className="text-yellow-400">{field.field}</span>
                          <div className="text-gray-400 text-xs">{field.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleEditCode}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium text-lg"
                  >
                    🛠️ Open Code Editor
                  </button>
                  <p className="text-gray-400 text-sm mt-3">
                    Edit the actual code files with your personal details
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setScrapedData(null);
                    setGithubUrl("");
                    setError("");
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Scrape Another Portfolio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}