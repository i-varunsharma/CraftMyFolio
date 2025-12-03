"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyProjects() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async (githubUsername) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/github/user/${githubUsername}`);
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error);
        return;
      }
      
      setProfile(data.profile);
      setProjects(data.projects);
      localStorage.setItem('githubUsername', githubUsername);
    } catch (err) {
      setError("Failed to fetch projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem('githubUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      fetchProjects(savedUsername);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      fetchProjects(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              My GitHub Projects
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* GitHub Username Input */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Fetch"}
            </button>
          </form>
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        {/* Profile Section */}
        {profile && (
          <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/30 mb-8">
            <div className="flex items-center gap-6">
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-gray-400">@{profile.username}</p>
                {profile.bio && <p className="text-gray-300 mt-2">{profile.bio}</p>}
                <div className="flex gap-4 mt-3 text-sm text-gray-400">
                  <span>{profile.public_repos} repos</span>
                  <span>{profile.followers} followers</span>
                  {profile.location && <span>📍 {profile.location}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                  <div className="flex gap-2">
                    {project.stars > 0 && (
                      <span className="text-yellow-400 text-sm flex items-center gap-1">
                        ⭐ {project.stars}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 4).map((tech, i) => (
                    <span
                      key={i}
                      className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3">
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-700/50 text-gray-300 py-2 px-4 rounded-lg text-center text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Code
                  </a>
                  {project.demo_url ? (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-center text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  ) : (
                    <div className="flex-1 bg-gray-600/50 text-gray-500 py-2 px-4 rounded-lg text-center text-sm cursor-not-allowed">
                      No Demo
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && username && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Projects Found</h3>
            <p className="text-gray-500">Enter a valid GitHub username to view projects</p>
          </div>
        )}
      </div>
    </div>
  );
}