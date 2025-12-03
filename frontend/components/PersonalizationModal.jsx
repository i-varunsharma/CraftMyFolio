"use client";
import { useState } from 'react';

export default function PersonalizationModal({ portfolio, isOpen, onClose, onGenerate }) {
  const [userData, setUserData] = useState({
    name: '',
    title: '',
    email: '',
    github: '',
    linkedin: '',
    location: '',
    bio: '',
    skills: [],
    avatar: null
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (skillsText) => {
    const skills = skillsText.split(',').map(s => s.trim()).filter(s => s);
    setUserData(prev => ({ ...prev, skills }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/portfolio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioData: portfolio,
          userData
        })
      });
      
      const result = await response.json();
      if (result.success) {
        onGenerate(result.portfolio);
        onClose();
      } else {
        alert('Generation failed: ' + result.error);
      }
    } catch (error) {
      alert('Generation failed: ' + error.message);
    }
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🎨 Personalize Your Portfolio
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-purple-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">👤 Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="Job Title *"
                  value={userData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <input
                  type="email"
                  placeholder="Email Address"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="Location"
                  value={userData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <textarea
                placeholder="Brief bio or description about yourself"
                value={userData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Step 2: Social & Skills */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">🔗 Social Links & Skills</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="GitHub Username"
                  value={userData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="LinkedIn Username"
                  value={userData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <textarea
                placeholder="Skills (comma-separated): React, JavaScript, Node.js, Python..."
                value={userData.skills.join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              <div className="text-sm text-gray-600">
                💡 We'll automatically fetch your GitHub projects and enhance them with AI
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">✅ Review & Generate</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Name:</strong> {userData.name}</div>
                <div><strong>Title:</strong> {userData.title}</div>
                <div><strong>GitHub:</strong> {userData.github || 'Not provided'}</div>
                <div><strong>Skills:</strong> {userData.skills.join(', ') || 'None specified'}</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🚀 What we'll do:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Replace placeholder content with your information</li>
                  <li>• Fetch and enhance your GitHub projects</li>
                  <li>• Generate personalized bio and descriptions</li>
                  <li>• Update contact information and social links</li>
                  <li>• Create deployment-ready package</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!userData.name || !userData.title}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !userData.name || !userData.title}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '🔄 Generating...' : '🚀 Generate Portfolio'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}