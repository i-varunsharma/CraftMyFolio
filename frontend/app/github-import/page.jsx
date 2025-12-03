"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function GitHubImport() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/github/user/${username}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to fetch GitHub data");
        return;
      }

      setUserData(data);
    } catch (error) {
      setError("Failed to connect to GitHub. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = async () => {
    try {
      const portfolioData = {
        name: userData.profile.name || userData.profile.username,
        title: "Software Developer",
        about: userData.profile.bio || "Passionate developer building amazing projects",
        skills: userData.skills,
        projects: userData.projects.map(project => ({
          name: project.name,
          description: project.description,
          tech: project.technologies.join(", "),
          github: project.github_url,
          demo: project.demo_url
        })),
        contact: {
          email: userData.profile.email || "",
          github: userData.profile.html_url,
          linkedin: "",
          website: userData.profile.blog || ""
        }
      };

      localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
      localStorage.setItem('githubImported', 'true');
      
      router.push('/select-template');
    } catch (error) {
      setError("Failed to create portfolio from GitHub data");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Import from GitHub</h1>
            <p className="text-gray-400">
              Automatically generate your portfolio from your GitHub profile and repositories
            </p>
          </div>

          {!userData ? (
            <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">GitHub Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your GitHub username"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleImport()}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importing...
                    </div>
                  ) : (
                    "Import from GitHub"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gray-800/40 rounded-2xl p-8 border border-gray-700/30">
                <h2 className="text-2xl font-bold mb-6">Profile Preview</h2>
                
                <div className="flex items-start gap-6 mb-6">
                  <img
                    src={userData.profile.avatar_url}
                    alt={userData.profile.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{userData.profile.name}</h3>
                    <p className="text-gray-400">@{userData.profile.username}</p>
                    {userData.profile.bio && (
                      <p className="text-gray-300 mt-2">{userData.profile.bio}</p>
                    )}
                    <div className="flex gap-4 mt-3 text-sm text-gray-400">
                      <span>{userData.stats.totalRepos} repositories</span>
                      <span>{userData.stats.totalStars} stars</span>
                      <span>{userData.profile.followers} followers</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Detected Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Top Projects ({userData.projects.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.projects.slice(0, 4).map((project, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50"
                      >
                        <h5 className="font-semibold mb-2">{project.name}</h5>
                        <p className="text-gray-400 text-sm mb-3">
                          {project.description || "No description available"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="bg-gray-600/50 text-gray-300 px-2 py-1 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        {project.stars > 0 && (
                          <div className="mt-2 text-yellow-400 text-sm">
                            ⭐ {project.stars} stars
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setUserData(null)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Try Different Username
                </button>
                <button
                  onClick={handleCreatePortfolio}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Portfolio from This Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}