"use client";
import { useState } from 'react';

const templates = [
  {
    id: 1,
    name: "Clean & Simple",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop",
    html: `<!DOCTYPE html>
<html>
<head>
    <title>NAME - Portfolio</title>
    <style>
        body { font-family: Arial; margin: 0; background: #f5f5f5; }
        .container { max-width: 800px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #333; font-size: 2.5em; margin: 0; }
        .title { color: #666; font-size: 1.2em; margin: 10px 0 30px 0; }
        .contact { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .contact p { margin: 8px 0; }
        .section { margin: 30px 0; }
        .project { background: #fff; border: 1px solid #e9ecef; padding: 20px; margin: 15px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>NAME</h1>
        <p class="title">TITLE</p>
        
        <div class="contact">
            <p><strong>Email:</strong> EMAIL</p>
            <p><strong>GitHub:</strong> github.com/GITHUB</p>
            <p><strong>LinkedIn:</strong> linkedin.com/in/LINKEDIN</p>
        </div>
        
        <div class="section">
            <h2>About</h2>
            <p>I'm NAME, a passionate TITLE who loves creating digital solutions.</p>
        </div>
        
        <div class="section">
            <h2>Projects</h2>
            <div class="project">
                <h3>Project 1</h3>
                <p>Add your project description here</p>
            </div>
            <div class="project">
                <h3>Project 2</h3>
                <p>Add your project description here</p>
            </div>
        </div>
    </div>
</body>
</html>`
  },
  {
    id: 2,
    name: "Dark Theme",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop",
    html: `<!DOCTYPE html>
<html>
<head>
    <title>NAME - Portfolio</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #1a1a1a; color: #00ff00; margin: 0; padding: 20px; }
        .terminal { max-width: 800px; margin: 0 auto; background: #000; padding: 30px; border-radius: 10px; border: 2px solid #333; }
        .prompt { color: #00ff00; margin: 10px 0; }
        .output { color: #cccccc; margin: 5px 0 15px 20px; }
        .link { color: #00aaff; }
        .section { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="terminal">
        <div class="prompt">$ whoami</div>
        <div class="output">NAME</div>
        
        <div class="prompt">$ cat job.txt</div>
        <div class="output">TITLE</div>
        
        <div class="prompt">$ ls contact/</div>
        <div class="output">
            email: <span class="link">EMAIL</span><br>
            github: <span class="link">github.com/GITHUB</span><br>
            linkedin: <span class="link">linkedin.com/in/LINKEDIN</span>
        </div>
        
        <div class="prompt">$ cat about.txt</div>
        <div class="output">Hi! I'm NAME, a TITLE passionate about technology and innovation.</div>
        
        <div class="prompt">$ ls projects/</div>
        <div class="output">
            project1.js<br>
            project2.py<br>
            project3.html
        </div>
        
        <div class="prompt">$ echo "Let's build something amazing together!"</div>
        <div class="output">Let's build something amazing together!</div>
    </div>
</body>
</html>`
  },
  {
    id: 3,
    name: "Modern Card",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop",
    html: `<!DOCTYPE html>
<html>
<head>
    <title>NAME - Portfolio</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .card { max-width: 600px; margin: 50px auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { color: #333; font-size: 2.5em; margin: 0; }
        .subtitle { color: #666; font-size: 1.1em; margin: 10px 0; }
        .info { background: #f8f9fa; padding: 20px; border-radius: 15px; margin: 20px 0; }
        .info-item { margin: 10px 0; padding: 10px; background: white; border-radius: 8px; }
        .section { margin: 25px 0; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #667eea; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>NAME</h1>
            <p class="subtitle">TITLE</p>
        </div>
        
        <div class="info">
            <div class="info-item">📧 EMAIL</div>
            <div class="info-item">🐙 github.com/GITHUB</div>
            <div class="info-item">💼 linkedin.com/in/LINKEDIN</div>
        </div>
        
        <div class="section">
            <h3>About Me</h3>
            <p>Hello! I'm NAME, a dedicated TITLE with a passion for creating innovative solutions.</p>
        </div>
        
        <div class="section">
            <h3>Skills</h3>
            <div class="skills">
                <span class="skill">JavaScript</span>
                <span class="skill">React</span>
                <span class="skill">Node.js</span>
                <span class="skill">Python</span>
            </div>
        </div>
        
        <div class="section">
            <h3>Let's Connect</h3>
            <p>Feel free to reach out for collaborations or just to say hi!</p>
        </div>
    </div>
</body>
</html>`
  }
];

export default function InstantPortfolio() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    title: '',
    email: '',
    github: '',
    linkedin: ''
  });

  const generateAndDownload = (template) => {
    // Check if user filled basic info
    if (!userInfo.name || !userInfo.title) {
      alert('Please fill in your Name and Title first!');
      return;
    }

    // Replace placeholders with user info
    let html = template.html;
    html = html.replace(/NAME/g, userInfo.name);
    html = html.replace(/TITLE/g, userInfo.title);
    html = html.replace(/EMAIL/g, userInfo.email || 'your@email.com');
    html = html.replace(/GITHUB/g, userInfo.github || 'yourusername');
    html = html.replace(/LINKEDIN/g, userInfo.linkedin || 'yourusername');

    // Create and download file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userInfo.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`🎉 Portfolio downloaded!

📁 File: ${userInfo.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html

🚀 Next steps:
1. Open the file in your browser to see your portfolio
2. Upload to GitHub Pages, Netlify, or any web host
3. Share your portfolio link with the world!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ⚡ Instant Portfolio Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Fill your info once → Click any template → Get your portfolio instantly
          </p>
        </div>

        {/* User Info Form */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name *"
              value={userInfo.name}
              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Job Title * (e.g., Full Stack Developer)"
              value={userInfo.title}
              onChange={(e) => setUserInfo({...userInfo, title: e.target.value})}
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={userInfo.email}
              onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="GitHub username (optional)"
              value={userInfo.github}
              onChange={(e) => setUserInfo({...userInfo, github: e.target.value})}
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="LinkedIn username (optional)"
              value={userInfo.linkedin}
              onChange={(e) => setUserInfo({...userInfo, linkedin: e.target.value})}
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none md:col-span-2"
            />
          </div>
        </div>

        {/* Templates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <img 
                src={template.image} 
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{template.name}</h3>
                <button
                  onClick={() => generateAndDownload(template)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
                >
                  📥 Get This Portfolio
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How it works:</h3>
          <div className="text-blue-700">
            <p>1. Fill in your information above</p>
            <p>2. Click "Get This Portfolio" on any template</p>
            <p>3. Your personalized HTML file downloads instantly</p>
            <p>4. Open it in browser or upload to any web host</p>
          </div>
        </div>
      </div>
    </div>
  );
}