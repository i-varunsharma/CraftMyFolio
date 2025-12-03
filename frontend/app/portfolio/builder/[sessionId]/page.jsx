"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PortfolioBuilder({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const sessionId = resolvedParams.sessionId;
  
  const [step, setStep] = useState(1);
  const [portfolioData, setPortfolioData] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [livePreview, setLivePreview] = useState('');

  // AI-Powered Features
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI portfolio assistant. Let\'s create an amazing portfolio together! What\'s your profession?' }
  ]);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    // Initialize based on mode
    const mode = searchParams.get('mode');
    const templateId = searchParams.get('template');
    
    if (mode === 'scratch') {
      initializeFromScratch();
    } else if (templateId) {
      initializeFromTemplate(templateId);
    }
  }, []);

  const initializeFromScratch = () => {
    setPortfolioData({
      name: '',
      title: '',
      bio: '',
      skills: [],
      projects: [],
      experience: [],
      theme: 'modern'
    });
  };

  const initializeFromTemplate = async (templateId) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/analyze`);
      const templateData = await response.json();
      
      setPortfolioData({
        ...templateData,
        customizations: []
      });
      
      // AI analyzes template and provides suggestions
      analyzeTemplateWithAI(templateData);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const analyzeTemplateWithAI = async (templateData) => {
    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/ai/analyze-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateData, sessionId })
      });
      
      const analysis = await response.json();
      setAiSuggestions(analysis.suggestions);
      
      setAiChat(prev => [...prev, {
        role: 'assistant',
        content: `I've analyzed this template! Here are some ways we can customize it for you: ${analysis.suggestions.slice(0, 3).join(', ')}. What would you like to focus on first?`
      }]);
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiChat = async () => {
    if (!userInput.trim()) return;
    
    const newMessage = { role: 'user', content: userInput };
    setAiChat(prev => [...prev, newMessage]);
    setUserInput('');
    setIsAiProcessing(true);

    try {
      const response = await fetch('/api/ai/portfolio-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiChat, newMessage],
          portfolioData,
          sessionId
        })
      });

      const aiResponse = await response.json();
      
      setAiChat(prev => [...prev, {
        role: 'assistant',
        content: aiResponse.message
      }]);

      // Apply AI suggestions to portfolio data
      if (aiResponse.updates) {
        setPortfolioData(prev => ({ ...prev, ...aiResponse.updates }));
      }

      // Generate live preview
      if (aiResponse.previewCode) {
        setLivePreview(aiResponse.previewCode);
      }
    } catch (error) {
      console.error('AI chat error:', error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const generateLivePreview = async () => {
    try {
      const response = await fetch('/api/portfolio/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioData, sessionId })
      });

      const preview = await response.json();
      setLivePreview(preview.html);
    } catch (error) {
      console.error('Preview generation error:', error);
    }
  };

  const publishPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioData,
          sessionId,
          deploymentOptions: {
            subdomain: portfolioData.name?.toLowerCase().replace(/\s+/g, '-'),
            customDomain: portfolioData.customDomain,
            seoOptimized: true,
            analytics: true
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        router.push(`/portfolio/published/${result.portfolioId}?url=${result.liveUrl}`);
      }
    } catch (error) {
      console.error('Publishing error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="flex h-screen">
        {/* AI Chat Sidebar */}
        <div className="w-1/3 bg-gray-800/50 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🤖 AI Assistant
              {isAiProcessing && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiChat.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                placeholder="Ask AI anything about your portfolio..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAiChat}
                disabled={isAiProcessing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Portfolio Builder</h1>
            <div className="flex gap-2">
              <button
                onClick={generateLivePreview}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🔄 Refresh Preview
              </button>
              <button
                onClick={publishPortfolio}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                🚀 Publish Live
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex-1 p-4">
            <div className="bg-white rounded-lg h-full overflow-hidden">
              {livePreview ? (
                <iframe
                  srcDoc={livePreview}
                  className="w-full h-full border-0"
                  title="Portfolio Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-xl">Your portfolio preview will appear here</p>
                    <p className="text-sm mt-2">Chat with AI to start building!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Overlay */}
      {aiSuggestions.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm">
          <h3 className="font-bold mb-2">💡 AI Suggestions</h3>
          <div className="space-y-2">
            {aiSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setUserInput(suggestion)}
                className="block w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}