"use client";
import { useState } from 'react';
import JSZip from 'jszip';

const portfolioTemplates = [
  {
    id: 1,
    name: "Modern Developer",
    preview: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400",
    code: `<!DOCTYPE html>
<html>
<head>
    <title>{{NAME}} - Developer</title>
    <style>
        body { font-family: Arial; margin: 0; background: #f0f0f0; }
        .container { max-width: 800px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 40px; }
        .name { font-size: 2.5em; color: #333; margin: 0; }
        .title { font-size: 1.2em; color: #666; margin: 10px 0; }
        .contact { background: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .projects { margin: 30px 0; }
        .project { background: #fff; border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="name">{{NAME}}</h1>
            <p class="title">{{TITLE}}</p>
        </div>
        
        <div class="contact">
            <p><strong>Email:</strong> {{EMAIL}}</p>
            <p><strong>GitHub:</strong> github.com/{{GITHUB}}</p>
            <p><strong>LinkedIn:</strong> linkedin.com/in/{{LINKEDIN}}</p>
        </div>
        
        <div class="projects">
            <h2>Projects</h2>
            <div class="project">
                <h3>Project 1</h3>
                <p>Description of your amazing project</p>
            </div>
            <div class="project">
                <h3>Project 2</h3>
                <p>Another cool project you built</p>
            </div>
        </div>
    </div>
</body>
</html>`
  },
  {
    id: 2,
    name: "Minimal Clean",
    preview: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
    code: `<!DOCTYPE html>
<html>
<head>
    <title>{{NAME}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 100px auto; padding: 20px; }
        h1 { font-size: 3em; margin-bottom: 10px; }
        .subtitle { font-size: 1.1em; color: #666; margin-bottom: 40px; }
        .section { margin: 40px 0; }
        .contact-item { margin: 10px 0; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{NAME}}</h1>
        <p class="subtitle">{{TITLE}}</p>
        
        <div class="section">
            <h2>About</h2>
            <p>I'm a passionate developer who loves creating digital experiences.</p>
        </div>
        
        <div class="section">
            <h2>Contact</h2>
            <div class="contact-item">Email: <a href="mailto:{{EMAIL}}">{{EMAIL}}</a></div>
            <div class="contact-item">GitHub: <a href="https://github.com/{{GITHUB}}">{{GITHUB}}</a></div>
            <div class="contact-item">LinkedIn: <a href="https://linkedin.com/in/{{LINKEDIN}}">{{LINKEDIN}}</a></div>
        </div>
        
        <div class="section">
            <h2>Work</h2>
            <p>• Project One - Description</p>
            <p>• Project Two - Description</p>
            <p>• Project Three - Description</p>
        </div>
    </div>
</body>
</html>`
  },
  {
    id: 3,
    name: "Dark Theme",
    preview: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    code: `<!DOCTYPE html>
<html>
<head>
    <title>{{NAME}} - Portfolio</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            background: #1a1a1a; 
            color: #00ff00; 
            margin: 0; 
            padding: 20px; 
        }
        .terminal { 
            max-width: 800px; 
            margin: 0 auto; 
            background: #000; 
            padding: 20px; 
            border-radius: 5px; 
            border: 1px solid #333; 
        }
        .prompt { color: #00ff00; }
        .command { color: #ffffff; }
        .output { color: #cccccc; margin: 10px 0; }
        .link { color: #00aaff; }
    </style>
</head>
<body>
    <div class="terminal">
        <div class="prompt">$ whoami</div>
        <div class="output">{{NAME}}</div>
        
        <div class="prompt">$ cat about.txt</div>
        <div class="output">{{TITLE}}<br>Passionate about code and technology</div>
        
        <div class="prompt">$ ls contact/</div>
        <div class="output">
            email: <span class="link">{{EMAIL}}</span><br>
            github: <span class="link">github.com/{{GITHUB}}</span><br>
            linkedin: <span class="link">linkedin.com/in/{{LINKEDIN}}</span>
        </div>
        
        <div class="prompt">$ ls projects/</div>
        <div class="output">
            project1.js<br>
            project2.py<br>
            project3.html<br>
        </div>
        
        <div class="prompt">$ echo "Thanks for visiting!"</div>
        <div class="output">Thanks for visiting!</div>
        
        <div class="prompt">$ <span class="command">_</span></div>
    </div>
</body>
</html>`
  }
];

export default function SimplePortfolio() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState('');
  const [projectName, setProjectName] = useState('my-portfolio');

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setCode(template.code);
    setShowEditor(true);
  };

  const downloadProject = () => {
    const folderName = projectName || 'my-portfolio';
    
    // Create files content
    const files = {
      'index.html': code,
      'README.md': `# ${folderName}\n\nMy personal portfolio website.\n\n## Setup\n1. Open index.html in browser\n2. Deploy to GitHub Pages or Netlify\n\n## Customize\nEdit index.html to update your information.`,
      'package.json': `{\n  "name": "${folderName}",\n  "version": "1.0.0",\n  "description": "Personal portfolio website",\n  "main": "index.html",\n  "scripts": {\n    "start": "open index.html"\n  }\n}`
    };

    // Create and download zip
    const zip = new JSZip();
    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    zip.generateAsync({type: 'blob'}).then(content => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`📁 ${folderName}.zip downloaded!\n\n1. Extract the zip file\n2. Open folder in VS Code\n3. Edit index.html as needed\n4. Push to GitHub for hosting`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ⚡ Instant Portfolio Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Choose a template, enter your info, get your portfolio code instantly
          </p>
        </div>

        {!showEditor ? (
          <>
            {/* Templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolioTemplates.map(template => (
                <div 
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className="cursor-pointer border-2 rounded-lg p-4 transition-all border-gray-200 hover:border-blue-500 hover:shadow-lg"
                >
                  <img 
                    src={template.preview} 
                    alt={template.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 text-center">{template.name}</h3>
                  <p className="text-center text-blue-500 mt-2 font-medium">Click to Edit →</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">✏️ Edit Your Portfolio</h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-gray-300 hover:text-white"
                >
                  ← Back to Templates
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 h-96">
                {/* Code Editor */}
                <div className="border-r">
                  <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    index.html
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
                    style={{height: '350px'}}
                  />
                </div>
                
                {/* Live Preview */}
                <div>
                  <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    Live Preview
                  </div>
                  <iframe
                    srcDoc={code}
                    className="w-full border-0"
                    style={{height: '350px'}}
                  />
                </div>
              </div>
              
              {/* Download Section */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Project name (e.g., my-portfolio)"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={downloadProject}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    📁 Download Project
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  💡 Edit the code above, then download as a complete project folder
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}