// Advanced Code Analysis and Portfolio Scraping System
import { aiAssistant } from './advancedAI.js';

export class CodeAnalyzer {
  constructor() {
    this.supportedFrameworks = ['react', 'vue', 'angular', 'vanilla', 'next', 'gatsby'];
  }

  async scrapePortfolioCode(githubUrl) {
    try {
      // Extract owner and repo from GitHub URL
      const urlParts = githubUrl.replace('https://github.com/', '').split('/');
      const [owner, repo] = urlParts;

      // Get repository structure
      const repoData = await this.getRepositoryStructure(owner, repo);
      
      // Download and analyze key files
      const codeFiles = await this.downloadPortfolioFiles(owner, repo, repoData);
      
      // AI analysis of code structure
      const analysis = await this.analyzeCodeStructure(codeFiles);
      
      return {
        success: true,
        repoInfo: repoData,
        codeFiles: codeFiles,
        analysis: analysis,
        editableFields: analysis.editableFields,
        framework: analysis.framework
      };
    } catch (error) {
      console.error('Error scraping portfolio code:', error);
      return { success: false, error: error.message };
    }
  }

  async getRepositoryStructure(owner, repo) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!response.ok) throw new Error('Repository not found');
    
    const repoData = await response.json();
    
    // Get file tree
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`);
    const treeData = await treeResponse.json();
    
    return {
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      language: repoData.language,
      homepage: repoData.homepage,
      files: treeData.tree || []
    };
  }

  async downloadPortfolioFiles(owner, repo, repoData) {
    const importantFiles = this.identifyImportantFiles(repoData.files);
    const codeFiles = {};

    for (const file of importantFiles) {
      try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`);
        const fileData = await response.json();
        
        if (fileData.content) {
          codeFiles[file.path] = {
            content: atob(fileData.content.replace(/\n/g, '')),
            type: this.getFileType(file.path),
            size: fileData.size,
            url: fileData.html_url
          };
        }
      } catch (error) {
        console.warn(`Failed to download ${file.path}:`, error);
      }
    }

    return codeFiles;
  }

  identifyImportantFiles(files) {
    const important = [];
    
    // Priority files for portfolio analysis
    const patterns = [
      /^index\.(html|js|jsx|ts|tsx)$/,
      /^src\/.*\.(js|jsx|ts|tsx|vue)$/,
      /^components\/.*\.(js|jsx|ts|tsx|vue)$/,
      /^pages\/.*\.(js|jsx|ts|tsx)$/,
      /^app\/.*\.(js|jsx|ts|tsx)$/,
      /package\.json$/,
      /^styles?\/.*\.(css|scss|sass)$/,
      /^public\/.*\.(html|css)$/,
      /README\.md$/
    ];

    files.forEach(file => {
      if (file.type === 'blob' && patterns.some(pattern => pattern.test(file.path))) {
        important.push(file);
      }
    });

    return important.slice(0, 20); // Limit to prevent API overload
  }

  async analyzeCodeStructure(codeFiles) {
    const prompt = `
      Analyze this portfolio code structure and identify editable fields:
      
      Files: ${Object.keys(codeFiles).join(', ')}
      
      Code samples:
      ${Object.entries(codeFiles).slice(0, 3).map(([path, file]) => 
        `${path}:\n${file.content.substring(0, 500)}...`
      ).join('\n\n')}
      
      Identify:
      1. Framework used (React, Vue, Angular, Vanilla JS, etc.)
      2. Editable fields (name, title, bio, skills, projects, contact)
      3. File locations where each field is defined
      4. CSS/styling approach
      5. Deployment method
      
      Return JSON format:
      {
        "framework": "react",
        "editableFields": [
          {
            "field": "name",
            "location": "src/components/Header.jsx",
            "lineNumber": 15,
            "currentValue": "John Doe",
            "selector": "const name = 'John Doe'"
          }
        ],
        "structure": {
          "components": ["Header", "About", "Projects"],
          "styling": "tailwind",
          "deployment": "vercel"
        }
      }
    `;

    try {
      const analysis = await aiAssistant.callGeminiAPI(prompt);
      return JSON.parse(analysis.replace(/```json|```/g, ''));
    } catch (error) {
      return this.getFallbackAnalysis(codeFiles);
    }
  }

  getFileType(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    const typeMap = {
      'js': 'javascript',
      'jsx': 'react',
      'ts': 'typescript',
      'tsx': 'react-typescript',
      'vue': 'vue',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown'
    };
    return typeMap[extension] || 'text';
  }

  async generateEditableVersion(codeFiles, userDetails) {
    const editedFiles = {};
    
    for (const [filePath, fileData] of Object.entries(codeFiles)) {
      let content = fileData.content;
      
      // Replace common portfolio fields
      content = this.replacePortfolioFields(content, userDetails);
      
      editedFiles[filePath] = {
        ...fileData,
        content: content,
        modified: true
      };
    }

    return editedFiles;
  }

  replacePortfolioFields(content, userDetails) {
    const replacements = [
      // Name replacements
      { pattern: /(['"`])([A-Z][a-z]+ [A-Z][a-z]+)\1/g, value: userDetails.name },
      { pattern: /name:\s*['"`]([^'"`]+)['"`]/g, value: `name: "${userDetails.name}"` },
      
      // Title replacements
      { pattern: /title:\s*['"`]([^'"`]+)['"`]/g, value: `title: "${userDetails.title}"` },
      { pattern: /(['"`])(Full Stack Developer|Software Engineer|Web Developer)\1/g, value: `"${userDetails.title}"` },
      
      // Bio/About replacements
      { pattern: /bio:\s*['"`]([^'"`]+)['"`]/g, value: `bio: "${userDetails.about}"` },
      { pattern: /about:\s*['"`]([^'"`]+)['"`]/g, value: `about: "${userDetails.about}"` },
      
      // Email replacements
      { pattern: /email:\s*['"`]([^'"`]+)['"`]/g, value: `email: "${userDetails.contact?.email}"` },
      { pattern: /(['"`])[\w.-]+@[\w.-]+\.\w+\1/g, value: `"${userDetails.contact?.email}"` },
      
      // GitHub replacements
      { pattern: /github:\s*['"`]([^'"`]+)['"`]/g, value: `github: "${userDetails.contact?.github}"` },
      
      // LinkedIn replacements
      { pattern: /linkedin:\s*['"`]([^'"`]+)['"`]/g, value: `linkedin: "${userDetails.contact?.linkedin}"` }
    ];

    let modifiedContent = content;
    
    replacements.forEach(({ pattern, value }) => {
      if (value && value !== 'undefined') {
        modifiedContent = modifiedContent.replace(pattern, value);
      }
    });

    return modifiedContent;
  }

  async createDeployablePackage(editedFiles, repoInfo) {
    // Create a deployable package with all modified files
    const packageStructure = {
      name: `${repoInfo.name}-customized`,
      files: editedFiles,
      deploymentInstructions: this.generateDeploymentInstructions(repoInfo),
      framework: this.detectFramework(editedFiles)
    };

    return packageStructure;
  }

  generateDeploymentInstructions(repoInfo) {
    return [
      "1. Download all files to your local machine",
      "2. Install dependencies: npm install",
      "3. Test locally: npm start or npm run dev",
      "4. Deploy to Vercel: vercel --prod",
      "5. Or deploy to Netlify: drag & drop build folder",
      `6. Your portfolio will be live at your chosen domain`
    ];
  }

  detectFramework(codeFiles) {
    const files = Object.keys(codeFiles);
    
    if (files.some(f => f.includes('package.json'))) {
      const packageJson = codeFiles['package.json']?.content;
      if (packageJson?.includes('react')) return 'react';
      if (packageJson?.includes('vue')) return 'vue';
      if (packageJson?.includes('angular')) return 'angular';
      if (packageJson?.includes('next')) return 'nextjs';
    }
    
    if (files.some(f => f.endsWith('.jsx') || f.endsWith('.tsx'))) return 'react';
    if (files.some(f => f.endsWith('.vue'))) return 'vue';
    if (files.some(f => f.includes('index.html'))) return 'vanilla';
    
    return 'unknown';
  }

  getFallbackAnalysis(codeFiles) {
    return {
      framework: this.detectFramework(codeFiles),
      editableFields: [
        {
          field: "name",
          location: "Multiple files",
          currentValue: "Portfolio Owner",
          selector: "Name fields"
        },
        {
          field: "title",
          location: "Header/Hero section",
          currentValue: "Developer",
          selector: "Title fields"
        }
      ],
      structure: {
        components: ["Header", "About", "Projects", "Contact"],
        styling: "css",
        deployment: "static"
      }
    };
  }
}

export const codeAnalyzer = new CodeAnalyzer();