"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function ViewPortfolio({ params }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`/api/portfolios/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/portfolio/edit/${resolvedParams.id}`);
  };

  const handleDeploy = async () => {
    try {
      // Generate portfolio HTML and open in new tab
      const response = await fetch('/api/portfolio/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: portfolio.content, 
          style: portfolio.templateId || 'modern' 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const newWindow = window.open('', '_blank');
        newWindow.document.write(result.html);
        newWindow.document.close();
        alert('Portfolio deployed in new tab!');
      }
    } catch (error) {
      console.error('Deploy error:', error);
      alert('Deployment failed');
    }
  };

  const handleGitHubPush = async () => {
    try {
      // Generate portfolio HTML for download
      const response = await fetch('/api/portfolio/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: portfolio.content, 
          style: portfolio.templateId || 'modern' 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Create downloadable HTML file
        const blob = new Blob([result.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${portfolio.name.replace(/\s+/g, '-').toLowerCase()}-portfolio.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Portfolio HTML file downloaded! You can now upload it to GitHub Pages or any hosting service.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!portfolio) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Portfolio not found</div>;

  const { content } = portfolio;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Action Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">{portfolio.name}</h1>
            <p className="text-gray-400 text-sm">{portfolio.template} Template</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDeploy}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              🚀 Preview Live
            </button>
            <button
              onClick={handleGitHubPush}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              📥 Download HTML
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="portfolio-content">
        {portfolio.templateId === 'modern' && <ModernTemplate content={content} />}
        {portfolio.templateId === 'minimal' && <MinimalTemplate content={content} />}
        {portfolio.templateId === 'creative' && <CreativeTemplate content={content} />}
        {!portfolio.templateId && <DefaultTemplate content={content} />}
      </div>
    </div>
  );
}

// Modern Template
function ModernTemplate({ content }) {
  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-indigo-900 text-white min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {content.name}
          </h1>
          <p className="text-2xl text-gray-300 mb-6">{content.title}</p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">{content.about}</p>
        </div>

        {/* Skills */}
        {content.skills?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Skills</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {content.skills.map((skill, i) => (
                <span key={i} className="bg-blue-600 px-6 py-3 rounded-full text-lg font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {content.projects?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.projects.map((project, i) => (
                <div key={i} className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">{project.name}</h3>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <p className="text-sm text-gray-400">Tech: {project.tech}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Contact</h2>
          <div className="space-y-2">
            <p className="text-xl">📧 {content.contact?.email}</p>
            {content.contact?.linkedin && <p className="text-xl">💼 {content.contact.linkedin}</p>}
            {content.contact?.github && <p className="text-xl">🐙 {content.contact.github}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal Template
function MinimalTemplate({ content }) {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light mb-4">{content.name}</h1>
          <p className="text-xl text-gray-600 mb-6">{content.title}</p>
          <div className="w-24 h-1 bg-gray-900 mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 leading-relaxed">{content.about}</p>
        </div>

        {content.skills?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light mb-8 text-center">Skills</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {content.skills.map((skill, i) => (
                <span key={i} className="border border-gray-300 px-4 py-2 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {content.projects?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light mb-8 text-center">Projects</h2>
            <div className="space-y-8">
              {content.projects.map((project, i) => (
                <div key={i} className="border-l-4 border-gray-900 pl-6">
                  <h3 className="text-xl font-medium mb-2">{project.name}</h3>
                  <p className="text-gray-700 mb-2">{project.description}</p>
                  <p className="text-sm text-gray-500">{project.tech}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-2xl font-light mb-8">Contact</h2>
          <div className="space-y-2">
            <p>{content.contact?.email}</p>
            {content.contact?.linkedin && <p>{content.contact.linkedin}</p>}
            {content.contact?.github && <p>{content.contact.github}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Creative Template
function CreativeTemplate({ content }) {
  return (
    <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-white min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent transform -rotate-2">
            {content.name}
          </h1>
          <p className="text-2xl font-bold text-yellow-300 transform rotate-1">{content.title}</p>
          <p className="text-lg text-gray-200 mt-6 max-w-2xl mx-auto">{content.about}</p>
        </div>

        {content.skills?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-4xl font-black mb-8 text-center text-yellow-300">Skills</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {content.skills.map((skill, i) => (
                <span key={i} className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 rounded-full text-lg font-bold transform hover:scale-110 transition-transform">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {content.projects?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-4xl font-black mb-8 text-center text-yellow-300">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.projects.map((project, i) => (
                <div key={i} className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-8 rounded-3xl border-2 border-pink-500/30 transform hover:scale-105 transition-transform">
                  <h3 className="text-2xl font-bold mb-4 text-yellow-300">{project.name}</h3>
                  <p className="text-gray-200 mb-4">{project.description}</p>
                  <p className="text-sm text-pink-300 font-bold">{project.tech}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-4xl font-black mb-8 text-yellow-300">Let's Connect!</h2>
          <div className="space-y-4">
            <p className="text-2xl">📧 {content.contact?.email}</p>
            {content.contact?.linkedin && <p className="text-2xl">💼 {content.contact.linkedin}</p>}
            {content.contact?.github && <p className="text-2xl">🐙 {content.contact.github}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Default Template
function DefaultTemplate({ content }) {
  return <ModernTemplate content={content} />;
}