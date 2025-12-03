"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function AIAssistant({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const portfolioId = resolvedParams.portfolioId;
  
  const [portfolio, setPortfolio] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [improvements, setImprovements] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedImprovement, setSelectedImprovement] = useState(null);

  useEffect(() => {
    loadPortfolioAndAnalyze();
  }, [portfolioId]);

  const loadPortfolioAndAnalyze = async () => {
    try {
      // Load portfolio data
      const portfolioResponse = await fetch(`/api/portfolios/${portfolioId}`);
      const portfolioData = await portfolioResponse.json();
      setPortfolio(portfolioData);

      // AI Analysis
      const analysisResponse = await fetch('/api/ai/analyze-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio: portfolioData })
      });

      const analysis = await analysisResponse.json();
      setAiAnalysis(analysis);
      setImprovements(analysis.improvements || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyImprovement = async (improvement) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/apply-improvement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ improvement })
      });

      if (response.ok) {
        const updatedPortfolio = await response.json();
        setPortfolio(updatedPortfolio);
        
        // Remove applied improvement
        setImprovements(prev => prev.filter(imp => imp.id !== improvement.id));
        
        // Show success message
        alert('Improvement applied successfully!');
      }
    } catch (error) {
      console.error('Error applying improvement:', error);
    }
  };

  const generateNewContent = async (contentType) => {
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId,
          contentType,
          currentContent: portfolio[contentType]
        })
      });

      const newContent = await response.json();
      
      setPortfolio(prev => ({
        ...prev,
        [contentType]: newContent.content
      }));
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">🤖 AI Analyzing Your Portfolio</h2>
          <p className="text-gray-400">Identifying opportunities for improvement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🤖 AI Portfolio Assistant</h1>
            <p className="text-gray-400">Intelligent suggestions to improve your portfolio</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Analysis Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/50 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📊 Portfolio Analysis
                <span className={`px-2 py-1 rounded-full text-xs ${
                  aiAnalysis?.score >= 80 ? 'bg-green-500/20 text-green-400' :
                  aiAnalysis?.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  Score: {aiAnalysis?.score}/100
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h3 className="font-semibold text-blue-400">Strengths</h3>
                  <ul className="text-sm mt-2 space-y-1">
                    {aiAnalysis?.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                  <h3 className="font-semibold text-yellow-400">Areas to Improve</h3>
                  <ul className="text-sm mt-2 space-y-1">
                    {aiAnalysis?.weaknesses?.map((weakness, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-yellow-400">⚠</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                  <h3 className="font-semibold text-purple-400">SEO Score</h3>
                  <div className="text-2xl font-bold mt-2">{aiAnalysis?.seoScore}/100</div>
                  <p className="text-xs text-gray-400 mt-1">Search visibility rating</p>
                </div>
              </div>
            </div>

            {/* AI Improvements */}
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/50">
              <h2 className="text-xl font-bold mb-4">🚀 Recommended Improvements</h2>
              
              <div className="space-y-4">
                {improvements.map((improvement, index) => (
                  <div key={index} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-100">{improvement.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        improvement.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        improvement.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {improvement.impact} impact
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{improvement.description}</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => applyImprovement(improvement)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        ✨ Apply Fix
                      </button>
                      <button
                        onClick={() => setSelectedImprovement(improvement)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        👁 Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/50">
              <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => generateNewContent('bio')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  🎯 Improve Bio with AI
                </button>
                
                <button
                  onClick={() => generateNewContent('skills')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  🛠 Optimize Skills Section
                </button>
                
                <button
                  onClick={() => generateNewContent('projects')}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white p-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
                >
                  📁 Enhance Project Descriptions
                </button>
                
                <button
                  onClick={() => router.push(`/portfolio/seo-optimizer/${portfolioId}`)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-3 rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all"
                >
                  🔍 SEO Optimization
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-600/50">
              <h2 className="text-xl font-bold mb-4">📈 Performance</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Load Speed</span>
                    <span>{aiAnalysis?.performance?.loadSpeed || 'N/A'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Mobile Friendly</span>
                    <span>{aiAnalysis?.performance?.mobile || 'N/A'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accessibility</span>
                    <span>{aiAnalysis?.performance?.accessibility || 'N/A'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}