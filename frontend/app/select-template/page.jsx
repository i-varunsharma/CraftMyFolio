"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SelectTemplate() {
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'modern',
      name: 'Modern Developer',
      description: 'Clean, modern design with animations',
      preview: '/templates/modern-preview.jpg',
      colors: ['#3b82f6', '#1f2937', '#ffffff']
    },
    {
      id: 'minimal',
      name: 'Minimal Professional',
      description: 'Simple, elegant design for professionals',
      preview: '/templates/minimal-preview.jpg',
      colors: ['#000000', '#ffffff', '#6b7280']
    },
    {
      id: 'creative',
      name: 'Creative Designer',
      description: 'Vibrant, creative layout for designers',
      preview: '/templates/creative-preview.jpg',
      colors: ['#8b5cf6', '#ec4899', '#f59e0b']
    }
  ];

  useEffect(() => {
    const data = localStorage.getItem('portfolioData');
    if (data) {
      setPortfolioData(JSON.parse(data));
    } else {
      router.push('/create-portfolio');
    }
  }, []);

  const handleTemplateSelect = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: portfolioData.name || 'My Portfolio',
          template: template.name,
          templateId: template.id,
          content: portfolioData
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        localStorage.removeItem('portfolioData');
        router.push(`/portfolio/view/${result.portfolio.id}`);
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  if (!portfolioData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Template</h1>
            <p className="text-gray-400">Select a template that matches your style</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div 
                key={template.id}
                className={`bg-gray-800/40 rounded-2xl p-6 border transition-all cursor-pointer ${
                  selectedTemplate?.id === template.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-700/30 hover:border-gray-600'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="aspect-video bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex gap-2 justify-center mb-2">
                      {template.colors.map((color, i) => (
                        <div 
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">Preview</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/create-portfolio')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Back to Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}