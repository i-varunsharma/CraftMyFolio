"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePortfolio() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [portfolioData, setPortfolioData] = useState({
    name: "",
    title: "",
    about: "",
    skills: [],
    projects: [],
    contact: { email: "", phone: "", linkedin: "", github: "" }
  });
  const [currentProject, setCurrentProject] = useState({ name: "", description: "", tech: "" });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSave = async () => {
    try {
      // Save portfolio data to localStorage for template selection
      localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
      
      // Redirect to template selection
      router.push('/select-template');
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving portfolio data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Your Portfolio</h1>
            <p className="text-gray-400">Step {step} of 4</p>
          </div>

          <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={portfolioData.name}
                    onChange={(e) => setPortfolioData({...portfolioData, name: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Professional Title"
                    value={portfolioData.title}
                    onChange={(e) => setPortfolioData({...portfolioData, title: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                  />
                  <textarea
                    placeholder="About yourself"
                    value={portfolioData.about}
                    onChange={(e) => setPortfolioData({...portfolioData, about: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 h-32"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Skills</h2>
                <input
                  type="text"
                  placeholder="Add skills (comma separated)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const skills = e.target.value.split(',').map(s => s.trim());
                      setPortfolioData({...portfolioData, skills});
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {portfolioData.skills.map((skill, i) => (
                    <span key={i} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Projects</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={currentProject.name}
                    onChange={(e) => setCurrentProject({...currentProject, name: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                  />
                  <textarea
                    placeholder="Project Description"
                    value={currentProject.description}
                    onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 h-24"
                  />
                  <input
                    type="text"
                    placeholder="Technologies Used"
                    value={currentProject.tech}
                    onChange={(e) => setCurrentProject({...currentProject, tech: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentProject.name) {
                        setPortfolioData({...portfolioData, projects: [...portfolioData.projects, currentProject]});
                        setCurrentProject({ name: "", description: "", tech: "" });
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Project
                  </button>
                </div>
                
                {portfolioData.projects.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Added Projects:</h3>
                    <div className="space-y-2">
                      {portfolioData.projects.map((project, i) => (
                        <div key={i} className="bg-gray-700/30 p-3 rounded-lg">
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-gray-400">{project.description}</p>
                          <p className="text-xs text-blue-400">{project.tech}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={portfolioData.contact.email}
                    onChange={(e) => setPortfolioData({
                      ...portfolioData, 
                      contact: {...portfolioData.contact, email: e.target.value}
                    })}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={portfolioData.contact.linkedin}
                    onChange={(e) => setPortfolioData({
                      ...portfolioData, 
                      contact: {...portfolioData.contact, linkedin: e.target.value}
                    })}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={portfolioData.contact.github}
                    onChange={(e) => setPortfolioData({
                      ...portfolioData, 
                      contact: {...portfolioData.contact, github: e.target.value}
                    })}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 ml-auto"
                >
                  Create Portfolio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}