"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from '@monaco-editor/react';

export default function DemoEditor() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState('index.html');
  const [files, setFiles] = useState({
    'index.html': {
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Portfolio</title>
</head>
<body>
    <header>
        <nav>
            <h1>John Doe</h1>
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <section id="hero">
        <h2>Full Stack Developer</h2>
        <p>I create amazing web experiences</p>
        <a href="#projects" class="btn">View My Work</a>
    </section>
    
    <section id="about">
        <h2>About Me</h2>
        <p>I'm a passionate developer with 5+ years of experience.</p>
    </section>
    
    <section id="projects">
        <h2>My Projects</h2>
        <div class="project-grid">
            <div class="project">
                <h3>E-commerce Platform</h3>
                <p>Built with React and Node.js</p>
            </div>
            <div class="project">
                <h3>Portfolio Website</h3>
                <p>Responsive design with modern CSS</p>
            </div>
        </div>
    </section>
    
    <section id="contact">
        <h2>Contact Me</h2>
        <p>Email: john@example.com</p>
        <p>GitHub: github.com/johndoe</p>
    </section>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        header { background: #2c3e50; color: white; padding: 1rem 0; }
        nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        nav ul { display: flex; list-style: none; gap: 2rem; }
        nav a { color: white; text-decoration: none; }
        #hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 100px 2rem; }
        #hero h2 { font-size: 3rem; margin-bottom: 1rem; }
        .btn { display: inline-block; background: white; color: #667eea; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; }
        section { padding: 60px 2rem; max-width: 1200px; margin: 0 auto; }
        section h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; color: #2c3e50; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .project { background: #f8f9fa; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .project h3 { color: #667eea; margin-bottom: 1rem; }
        #contact { background: #f8f9fa; text-align: center; }
    </style>
</body>
</html>`,
      type: 'html'
    }
  });

  const [currentCode, setCurrentCode] = useState(files['index.html'].content);

  const handleCodeChange = (value) => {
    setCurrentCode(value);
    setFiles(prev => ({
      ...prev,
      [selectedFile]: { ...prev[selectedFile], content: value }
    }));
  };

  const downloadProject = () => {
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            🚀 CraftMyFolio - Live Portfolio Editor
          </h1>
          <button
            onClick={downloadProject}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            📁 Download Portfolio
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-1/2 border-r border-gray-700/50">
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50">
            <span className="text-sm text-gray-400">✏️ Edit Code</span>
          </div>
          <Editor
            height="calc(100vh - 160px)"
            language="html"
            value={currentCode}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true
            }}
          />
        </div>

        <div className="w-1/2">
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50">
            <span className="text-sm text-gray-400">👁️ Live Preview</span>
          </div>
          <iframe
            srcDoc={currentCode}
            className="w-full h-[calc(100vh-160px)] bg-white"
            title="Portfolio Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}