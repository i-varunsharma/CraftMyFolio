"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function CodeEditor({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [portfolioCode, setPortfolioCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "",
    title: "",
    about: "",
    contact: { email: "", github: "", linkedin: "" }
  });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadPortfolioCode();
  }, []);

  const loadPortfolioCode = async () => {
    try {
      const response = await fetch(`/api/portfolio/code/${resolvedParams.portfolioId}`);
      const data = await response.json();
      
      if (data.success) {
        setPortfolioCode(data);
        setSelectedFile(Object.keys(data.codeFiles)[0]);
      }
    } catch (error) {
      console.error('Error loading portfolio code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (newContent) => {
    if (selectedFile && portfolioCode) {
      setPortfolioCode(prev => ({
        ...prev,
        codeFiles: {
          ...prev.codeFiles,
          [selectedFile]: typeof prev.codeFiles[selectedFile] === 'string' 
            ? newContent
            : {
                ...prev.codeFiles[selectedFile],
                content: newContent,
                modified: true
              }
        }
      }));
    }
  };

  const applyUserDetails = async () => {
    try {
      const response = await fetch(`/api/portfolio/apply-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: resolvedParams.portfolioId,
          userDetails: userDetails,
          codeFiles: portfolioCode.codeFiles
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPortfolioCode(prev => ({
          ...prev,
          codeFiles: result.updatedFiles
        }));
        alert('Your details have been applied to the code!');
      }
    } catch (error) {
      console.error('Error applying user details:', error);
    }
  };

  const generatePreview = async () => {
    try {
      const response = await fetch(`/api/portfolio/generate-live-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeFiles: portfolioCode.codeFiles,
          framework: portfolioCode.analysis.framework
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(result.html);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const downloadPortfolio = async () => {
    try {
      const response = await fetch(`/api/portfolio/download-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeFiles: portfolioCode.codeFiles,
          repoInfo: portfolioCode.repoInfo
        })
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${portfolioCode.repoInfo.name}-customized.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading portfolio:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading portfolio code...</p>
        </div>
      </div>
    );
  }

  if (!portfolioCode) {
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
            <h1 className="text-xl font-bold">{portfolioCode.repoInfo.name}</h1>
            <p className="text-gray-400 text-sm">{portfolioCode.repoInfo.description}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Dashboard
            </button>
            <button
              onClick={generatePreview}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
            >
              🚀 Preview Live
            </button>
            <button
              onClick={downloadPortfolio}
              className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              📦 Download Code
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar - File Explorer & User Details */}
        <div className="w-1/4 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {/* User Details Form */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-4">Your Details</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                value={userDetails.name}
                onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Professional Title"
                value={userDetails.title}
                onChange={(e) => setUserDetails({...userDetails, title: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <textarea
                placeholder="About yourself"
                value={userDetails.about}
                onChange={(e) => setUserDetails({...userDetails, about: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm h-20"
              />
              <input
                type="email"
                placeholder="Email"
                value={userDetails.contact.email}
                onChange={(e) => setUserDetails({
                  ...userDetails, 
                  contact: {...userDetails.contact, email: e.target.value}
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={applyUserDetails}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
              >
                Apply to Code
              </button>
            </div>
          </div>

          {/* File Explorer */}
          <div className="p-4">
            <h3 className="font-semibold mb-4">Files</h3>
            <div className="space-y-1">
              {Object.keys(portfolioCode.codeFiles).map((filePath) => (
                <button
                  key={filePath}
                  onClick={() => setSelectedFile(filePath)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedFile === filePath 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {portfolioCode.codeFiles[filePath].type}
                    </span>
                    <span className="truncate">{filePath.split('/').pop()}</span>
                    {portfolioCode.codeFiles[filePath].modified && (
                      <span className="text-yellow-400 text-xs">●</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="p-4 border-t border-gray-700">
            <h3 className="font-semibold mb-4">Editable Fields</h3>
            <div className="space-y-2">
              {portfolioCode.editableFields?.map((field, index) => (
                <div key={index} className="bg-gray-700/50 p-3 rounded text-sm">
                  <div className="font-medium text-blue-400">{field.field}</div>
                  <div className="text-gray-400 text-xs">{field.description}</div>
                  <div className="text-gray-300 text-xs mt-1">
                    Current: "{field.currentValue}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {selectedFile && (
            <>
              <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium">{selectedFile}</span>
                <span className="text-xs text-gray-400">
                  {portfolioCode.codeFiles[selectedFile].type}
                </span>
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  value={portfolioCode.codeFiles[selectedFile].content || portfolioCode.codeFiles[selectedFile]}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-full bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none border-none outline-none"
                  style={{ fontFamily: 'Monaco, Consolas, monospace' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}