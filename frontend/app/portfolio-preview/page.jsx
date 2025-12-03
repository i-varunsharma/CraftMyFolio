"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortfolioPreview() {
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('generatedPortfolio');
    if (data) {
      try {
        setPortfolioData(JSON.parse(data));
      } catch (error) {
        console.error('Error parsing portfolio data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Portfolio Data Found</h1>
          <button 
            onClick={() => router.push('/ai-agent')}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="w-full py-4 flex justify-between items-center px-6 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.push('/ai-agent')}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Portfolio Preview
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg hover:border-gray-600 transition-colors">
            Edit
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
            Publish
          </button>
        </div>
      </header>

      {/* Portfolio Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            {portfolioData.personalInfo?.name || "Your Name"}
          </h1>
          <h2 className="text-2xl text-blue-400 mb-6">
            {portfolioData.personalInfo?.title || "Your Title"}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {portfolioData.personalInfo?.bio || "Your professional bio will appear here."}
          </p>
        </section>

        {/* Sections */}
        <div className="space-y-16">
          {portfolioData.sections?.map((section, index) => (
            <section key={index} className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
              <h3 className="text-3xl font-bold mb-8 text-center">{section.title}</h3>
              
              {section.type === 'about' && (
                <p className="text-lg text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                  {section.content}
                </p>
              )}
              
              {section.type === 'skills' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {section.items?.map((skill, skillIndex) => (
                    <div key={skillIndex} className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 text-center">
                      <span className="text-blue-400 font-medium">{skill}</span>
                    </div>
                  )) || <p className="text-gray-400 text-center">Skills will be displayed here</p>}
                </div>
              )}
              
              {section.type === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.items?.map((project, projectIndex) => (
                    <div key={projectIndex} className="bg-gray-700/40 rounded-xl p-6 border border-gray-600/30">
                      <h4 className="text-xl font-semibold mb-3 text-blue-400">{project.name}</h4>
                      <p className="text-gray-300 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies?.map((tech, techIndex) => (
                          <span key={techIndex} className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-sm text-indigo-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )) || <p className="text-gray-400 text-center">Projects will be displayed here</p>}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Theme Info */}
        {portfolioData.theme && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: portfolioData.theme.primaryColor}}></div>
              <span className="text-sm text-purple-400">
                Theme: {portfolioData.theme.style} • {portfolioData.theme.primaryColor}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}