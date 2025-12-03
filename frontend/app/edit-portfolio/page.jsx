"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from '@monaco-editor/react';

export default function EditPortfolio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get('repo');
  
  const [files, setFiles] = useState({});
  const [selectedFile, setSelectedFile] = useState('index.html');
  const [currentCode, setCurrentCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState(null);

  useEffect(() => {
    if (repoUrl) {
      fetchRepo();
    } else {
      loadDemo();
    }
  }, [repoUrl]);

  const fetchRepo = async () => {
    try {
      setLoading(true);
      
      // Extract username/repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (!match) {
        loadDemo();
        return;
      }
      
      const [, username, repoName] = match;
      
      // Try to fetch common files directly
      const commonFiles = [
        'index.html',
        'style.css', 'styles.css', 'main.css',
        'script.js', 'main.js', 'app.js'
      ];
      
      const fetchedFiles = {};
      let hasFiles = false;
      
      // Try main branch first, then master
      for (const branch of ['main', 'master']) {
        for (const fileName of commonFiles) {
          try {
            const rawUrl = `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${fileName}`;
            const response = await fetch(rawUrl);
            
            if (response.ok) {
              const content = await response.text();
              fetchedFiles[fileName] = {
                content,
                path: fileName,
                type: getFileType(fileName)
              };
              hasFiles = true;
            }
          } catch (e) {
            // Continue
          }
        }
        
        if (hasFiles) break; // Found files in this branch
      }
      
      if (hasFiles) {
        setRepository({
          name: repoName,
          owner: { login: username },
          html_url: repoUrl
        });
        setFiles(fetchedFiles);
        
        // Select first HTML file or create one
        const htmlFile = Object.keys(fetchedFiles).find(f => f.endsWith('.html'));
        if (htmlFile) {
          setSelectedFile(htmlFile);
          setCurrentCode(fetchedFiles[htmlFile].content);
        } else {
          // Create basic HTML with CSS
          const cssFiles = Object.keys(fetchedFiles).filter(f => f.endsWith('.css'));
          let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${repoName}</title>
</head>
<body>
    <h1>${repoName}</h1>
    <p>Repository: ${username}/${repoName}</p>
</body>
</html>`;
          
          if (cssFiles.length > 0) {
            const cssContent = cssFiles.map(f => fetchedFiles[f].content).join('\n');
            html = html.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
          }
          
          fetchedFiles['index.html'] = { content: html, path: 'index.html', type: 'html' };
          setFiles(fetchedFiles);
          setSelectedFile('index.html');
          setCurrentCode(html);
        }
      } else {
        loadDemo();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      loadDemo();
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    const match = repoUrl?.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/) || ['', 'demo-user', 'demo-repo'];
    const [, username, repoName] = match;
    
    const demoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${username || 'Demo'}'s Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 0; text-align: center; }
        h1 { font-size: 3rem; margin-bottom: 10px; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; }
        .section { padding: 60px 0; }
        .section h2 { font-size: 2rem; margin-bottom: 30px; text-align: center; color: #333; }
        .skills { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
        .skill { background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; }
        .projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
        .project { background: #f8f9fa; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .project h3 { color: #667eea; margin-bottom: 15px; }
        .contact { background: #f8f9fa; text-align: center; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px; }
        @media (max-width: 768px) { h1 { font-size: 2rem; } .container { padding: 10px; } }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>${username || 'Your Name'}</h1>
            <p class="subtitle">Full Stack Developer & Designer</p>
        </div>
    </header>
    
    <section class="section">
        <div class="container">
            <h2>About Me</h2>
            <p>I'm a passionate developer who loves creating amazing web experiences. I specialize in modern technologies and enjoy solving complex problems with elegant solutions.</p>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <h2>Skills</h2>
            <div class="skills">
                <span class="skill">JavaScript</span>
                <span class="skill">React</span>
                <span class="skill">Node.js</span>
                <span class="skill">Python</span>
                <span class="skill">CSS</span>
                <span class="skill">HTML</span>
                <span class="skill">Git</span>
                <span class="skill">MongoDB</span>
            </div>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <h2>Projects</h2>
            <div class="projects">
                <div class="project">
                    <h3>${repoName || 'Project One'}</h3>
                    <p>A modern web application built with cutting-edge technologies. Features responsive design, real-time updates, and seamless user experience.</p>
                </div>
                <div class="project">
                    <h3>Portfolio Website</h3>
                    <p>Personal portfolio showcasing my skills and projects. Built with modern web technologies and optimized for performance.</p>
                </div>
                <div class="project">
                    <h3>E-commerce Platform</h3>
                    <p>Full-stack e-commerce solution with payment integration, inventory management, and admin dashboard.</p>
                </div>
            </div>
        </div>
    </section>
    
    <section class="section contact">
        <div class="container">
            <h2>Let's Connect</h2>
            <p>I'm always interested in hearing about new opportunities and collaborations.</p>
            <a href="mailto:${username || 'your'}@example.com" class="btn">Email Me</a>
            <a href="https://github.com/${username || 'yourusername'}" class="btn">GitHub</a>
            <a href="https://linkedin.com/in/${username || 'yourprofile'}" class="btn">LinkedIn</a>
        </div>
    </section>
</body>
</html>`;

    setRepository({
      name: repoName || 'demo-portfolio',
      owner: { login: username || 'demo-user' },
      html_url: repoUrl || 'https://github.com/demo-user/demo-repo'
    });
    
    setFiles({
      'index.html': { content: demoHtml, path: 'index.html', type: 'html' }
    });
    
    setSelectedFile('index.html');
    setCurrentCode(demoHtml);
    setLoading(false);
  };

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
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const types = { 'html': 'html', 'css': 'css', 'js': 'javascript', 'json': 'json' };
    return types[ext] || 'text';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading repository...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/browse-portfolios')}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Edit: {repository?.name}
            </h1>
          </div>
          <button
            onClick={downloadProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 8h8a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
            </svg>
            Download
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* File Explorer */}
        <div className="w-64 bg-gray-800/40 border-r border-gray-700/50 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Files</h3>
            {Object.keys(files).map(fileName => (
              <div
                key={fileName}
                onClick={() => {
                  setSelectedFile(fileName);
                  setCurrentCode(files[fileName].content);
                }}
                className={`flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-700/50 rounded ${
                  selectedFile === fileName ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                {fileName}
              </div>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex">
          <div className="w-1/2 border-r border-gray-700/50">
            <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50">
              <span className="text-sm text-gray-400">{selectedFile}</span>
            </div>
            <Editor
              height="calc(100vh - 160px)"
              language={files[selectedFile]?.type || 'html'}
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

          {/* Live Preview */}
          <div className="w-1/2">
            <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50">
              <span className="text-sm text-gray-400">Live Preview</span>
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
    </div>
  );
}