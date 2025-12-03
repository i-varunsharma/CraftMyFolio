"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';

export default function CodeEditor() {
  const [portfolio, setPortfolio] = useState(null);
  const [code, setCode] = useState('');
  const [projectName, setProjectName] = useState('my-portfolio');
  const router = useRouter();

  useEffect(() => {
    // Get portfolio from localStorage
    const storedPortfolio = localStorage.getItem('selectedPortfolio');
    if (storedPortfolio) {
      const portfolioData = JSON.parse(storedPortfolio);
      setPortfolio(portfolioData);
      
      // Fetch the actual code from GitHub
      fetchPortfolioCode(portfolioData.url);
    } else {
      router.push('/browse-portfolios');
    }
  }, []);

  const fetchPortfolioCode = async (repoUrl) => {
    try {
      // Convert GitHub URL to raw content URL
      const parts = repoUrl.replace('https://github.com/', '').split('/');
      const owner = parts[0];
      const repo = parts[1];
      
      // First try to get the live GitHub Pages site
      const githubPagesUrl = `https://${owner}.github.io/${repo}`;
      
      try {
        // Use a CORS proxy to fetch the live site
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(githubPagesUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.contents && data.contents.includes('<html')) {
          setCode(data.contents);
          return;
        }
      } catch (error) {
        console.log('GitHub Pages not available, trying raw files...');
      }
      
      // Try to fetch actual HTML files from repository
      const possibleFiles = [
        'index.html', 
        'src/index.html', 
        'public/index.html',
        'docs/index.html',
        'dist/index.html'
      ];
      
      for (const file of possibleFiles) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`;
          const response = await fetch(rawUrl);
          if (response.ok) {
            const content = await response.text();
            if (content.includes('<html') || content.includes('<!DOCTYPE')) {
              setCode(content);
              return;
            }
          }
        } catch (error) {
          // Try master branch if main doesn't work
          try {
            const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${file}`;
            const masterResponse = await fetch(masterUrl);
            if (masterResponse.ok) {
              const content = await masterResponse.text();
              if (content.includes('<html') || content.includes('<!DOCTYPE')) {
                setCode(content);
                return;
              }
            }
          } catch (masterError) {
            console.log(`Failed to fetch ${file} from both main and master`);
          }
        }
      }
      
      // If no HTML found, create template based on portfolio info
      setCode(createTemplateFromPortfolio());
      
    } catch (error) {
      console.error('Error fetching code:', error);
      setCode(createTemplateFromPortfolio());
    }
  };

  const createTemplateFromPortfolio = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Name - Portfolio</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f4f4f4;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            margin-bottom: 2rem;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #7f8c8d;
            margin-bottom: 1rem;
        }
        
        .contact {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .contact a {
            color: #3498db;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border: 2px solid #3498db;
            border-radius: 5px;
            transition: all 0.3s;
        }
        
        .contact a:hover {
            background: #3498db;
            color: white;
        }
        
        .section {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .section h2 {
            color: #2c3e50;
            margin-bottom: 1rem;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
        }
        
        .projects {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .project {
            border: 1px solid #ddd;
            padding: 1rem;
            border-radius: 5px;
            transition: transform 0.3s;
        }
        
        .project:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
            .contact {
                flex-direction: column;
                align-items: center;
            }
            
            h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{{YOUR_NAME}}</h1>
            <p class="subtitle">{{YOUR_TITLE}}</p>
            <div class="contact">
                <a href="mailto:{{YOUR_EMAIL}}">📧 Email</a>
                <a href="https://github.com/{{YOUR_GITHUB}}" target="_blank">🐙 GitHub</a>
                <a href="https://linkedin.com/in/{{YOUR_LINKEDIN}}" target="_blank">💼 LinkedIn</a>
            </div>
        </header>
        
        <section class="section">
            <h2>About Me</h2>
            <p>{{ABOUT_TEXT}}</p>
        </section>
        
        <section class="section">
            <h2>Skills</h2>
            <p><strong>Frontend:</strong> HTML, CSS, JavaScript, React, Vue.js</p>
            <p><strong>Backend:</strong> Node.js, Python, PHP</p>
            <p><strong>Database:</strong> MySQL, MongoDB, PostgreSQL</p>
            <p><strong>Tools:</strong> Git, Docker, AWS</p>
        </section>
        
        <section class="section">
            <h2>Projects</h2>
            <div class="projects">
                <div class="project">
                    <h3>Project One</h3>
                    <p>Description of your amazing project. What technologies did you use? What problems did it solve?</p>
                </div>
                <div class="project">
                    <h3>Project Two</h3>
                    <p>Another cool project you built. Include links to live demo and source code.</p>
                </div>
                <div class="project">
                    <h3>Project Three</h3>
                    <p>Your third project showcasing different skills and technologies.</p>
                </div>
            </div>
        </section>
        
        <section class="section">
            <h2>Contact</h2>
            <p>Let's connect! Feel free to reach out for collaborations or just to say hi.</p>
        </section>
    </div>
</body>
</html>`;
  };

  const downloadProject = async () => {
    const folderName = projectName || 'my-portfolio';
    
    // Create project files
    const files = {
      'index.html': code,
      'README.md': `# ${folderName}

My personal portfolio website.

## 🚀 Quick Start
1. Open \`index.html\` in your browser
2. Edit the HTML file to customize your information
3. Deploy to GitHub Pages, Netlify, or Vercel

## 📝 Customization
- Update your name, email, and social links
- Add your projects and skills
- Modify colors and styling in the CSS section
- Add more sections as needed

## 🌐 Deployment
### GitHub Pages
1. Create a new repository on GitHub
2. Upload these files
3. Go to Settings > Pages
4. Select source branch
5. Your site will be live at \`https://yourusername.github.io/repository-name\`

### Netlify
1. Drag and drop the project folder to netlify.com
2. Your site will be live instantly

## 📧 Contact
Update the contact information in index.html with your details.
`,
      'package.json': `{
  "name": "${folderName}",
  "version": "1.0.0",
  "description": "Personal portfolio website",
  "main": "index.html",
  "scripts": {
    "start": "open index.html",
    "deploy": "echo 'Upload to GitHub Pages or Netlify'"
  },
  "keywords": ["portfolio", "website", "personal"],
  "author": "Your Name",
  "license": "MIT"
}`,
      '.gitignore': `# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
`,
      'deploy.md': `# Deployment Guide

## Option 1: GitHub Pages (Free)
1. Create a new repository on GitHub
2. Upload all files from this folder
3. Go to repository Settings > Pages
4. Select "Deploy from a branch" > "main"
5. Your site will be live at: https://yourusername.github.io/repository-name

## Option 2: Netlify (Free)
1. Go to netlify.com
2. Drag and drop this entire folder
3. Your site will be live instantly with a random URL
4. You can customize the URL in settings

## Option 3: Vercel (Free)
1. Go to vercel.com
2. Import your GitHub repository
3. Deploy with one click
4. Your site will be live with automatic deployments

## Tips:
- Always test locally by opening index.html in your browser
- Customize the content before deploying
- Update social links and contact information
- Add your own projects and skills
`
    };

    try {
      const zip = new JSZip();
      
      // Add all files to zip
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });
      
      // Generate and download zip
      const content = await zip.generateAsync({type: 'blob'});
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`🎉 ${folderName}.zip downloaded successfully!

📁 Your project includes:
• index.html (your portfolio)
• README.md (setup instructions)
• package.json (project config)
• deploy.md (deployment guide)
• .gitignore (git configuration)

🚀 Next steps:
1. Extract the zip file
2. Open folder in VS Code
3. Customize index.html with your info
4. Follow deploy.md for hosting options`);
      
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('Error creating download. Please try again.');
    }
  };

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/browse-portfolios')}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                ← Back to Browse
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Editing: {portfolio.name}
                </h1>
                <p className="text-sm text-gray-600">by @{portfolio.owner.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const name = prompt('👤 Your Name:');
                  const title = prompt('💼 Your Job Title:');
                  const email = prompt('📧 Your Email:');
                  const github = prompt('🐙 Your GitHub Username:');
                  const linkedin = prompt('💼 Your LinkedIn Username:');
                  
                  if (name) {
                    let updatedCode = code;
                    updatedCode = updatedCode.replace(/{{YOUR_NAME}}/g, name);
                    updatedCode = updatedCode.replace(/{{YOUR_TITLE}}/g, title || 'Developer');
                    updatedCode = updatedCode.replace(/{{YOUR_EMAIL}}/g, email || 'your@email.com');
                    updatedCode = updatedCode.replace(/{{YOUR_GITHUB}}/g, github || 'yourusername');
                    updatedCode = updatedCode.replace(/{{YOUR_LINKEDIN}}/g, linkedin || 'yourusername');
                    updatedCode = updatedCode.replace(/{{ABOUT_TEXT}}/g, `I'm ${name}, a passionate ${title || 'developer'} who loves creating amazing digital experiences.`);
                    
                    // Also replace common placeholder patterns
                    updatedCode = updatedCode.replace(/Your Name/g, name);
                    updatedCode = updatedCode.replace(/John Doe/g, name);
                    updatedCode = updatedCode.replace(/Jane Smith/g, name);
                    updatedCode = updatedCode.replace(/your@email\.com/g, email || 'your@email.com');
                    updatedCode = updatedCode.replace(/yourusername/g, github || 'yourusername');
                    
                    setCode(updatedCode);
                    alert('✨ Your details have been updated in the code!');
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-all"
              >
                ✨ Add My Info
              </button>
              <input
                type="text"
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-32"
              />
              <button
                onClick={downloadProject}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                📁 Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{height: 'calc(100vh - 200px)'}}>
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Code Editor */}
            <div className="border-r border-gray-200">
              <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium">
                📝 index.html
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none border-0"
                style={{height: 'calc(100% - 40px)'}}
                placeholder="Edit your portfolio code here..."
              />
            </div>
            
            {/* Live Preview */}
            <div>
              <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 flex items-center justify-between">
                👁️ Live Preview
                <button
                  onClick={() => {
                    const newWindow = window.open();
                    newWindow.document.write(code);
                    newWindow.document.close();
                  }}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Open in New Tab
                </button>
              </div>
              <iframe
                srcDoc={code}
                className="w-full border-0"
                style={{height: 'calc(100% - 40px)'}}
                title="Portfolio Preview"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          💡 Edit the code on the left and see changes instantly on the right. Download when ready!
        </div>
      </div>
    </div>
  );
}