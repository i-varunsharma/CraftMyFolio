import { analyzePortfolioStructure } from './portfolioAnalyzer.js';
import { generatePersonalizedContent } from './aiContentGenerator.js';

export class PortfolioGenerator {
  constructor() {
    this.supportedFrameworks = ['react', 'vue', 'angular', 'vanilla', 'next', 'gatsby'];
  }

  async generatePersonalizedPortfolio(portfolioData, userData) {
    try {
      // 1. Analyze the portfolio structure
      const structure = await analyzePortfolioStructure(portfolioData);
      
      // 2. Generate personalized content
      const personalizedContent = await generatePersonalizedContent(userData, structure);
      
      // 3. Create file modifications
      const modifications = await this.createFileModifications(structure, personalizedContent, userData);
      
      // 4. Generate deployment config
      const deploymentConfig = this.generateDeploymentConfig(structure.framework, userData);
      
      return {
        id: `portfolio_${Date.now()}`,
        originalRepo: portfolioData.url,
        framework: structure.framework,
        modifications,
        deploymentConfig,
        personalizedContent,
        previewUrl: null,
        status: 'ready'
      };
    } catch (error) {
      throw new Error(`Portfolio generation failed: ${error.message}`);
    }
  }

  async createFileModifications(structure, content, userData) {
    const modifications = [];

    // Modify package.json
    if (structure.files.includes('package.json')) {
      modifications.push({
        file: 'package.json',
        type: 'update',
        changes: {
          name: userData.name.toLowerCase().replace(/\s+/g, '-') + '-portfolio',
          description: `${userData.name}'s Portfolio - ${userData.title}`,
          author: userData.name,
          homepage: userData.website || `https://${userData.github}.github.io`
        }
      });
    }

    // Update main content files
    structure.contentFiles.forEach(file => {
      modifications.push({
        file: file.path,
        type: 'replace',
        patterns: this.getReplacementPatterns(content, userData)
      });
    });

    // Update images
    if (userData.avatar) {
      modifications.push({
        file: structure.avatarPath || 'src/assets/avatar.jpg',
        type: 'replace_image',
        source: userData.avatar
      });
    }

    // Add resume/CV
    if (userData.resume) {
      modifications.push({
        file: 'public/resume.pdf',
        type: 'add_file',
        source: userData.resume
      });
    }

    return modifications;
  }

  getReplacementPatterns(content, userData) {
    return [
      // Name replacements
      { pattern: /John Doe|Jane Smith|Your Name|Portfolio Owner/gi, replacement: userData.name },
      { pattern: /johndoe|janesmith|yourname/gi, replacement: userData.name.toLowerCase().replace(/\s+/g, '') },
      
      // Title/Role replacements
      { pattern: /Full Stack Developer|Software Engineer|Web Developer/gi, replacement: userData.title },
      
      // Contact info
      { pattern: /john@example\.com|contact@example\.com/gi, replacement: userData.email },
      { pattern: /github\.com\/johndoe/gi, replacement: `github.com/${userData.github}` },
      { pattern: /linkedin\.com\/in\/johndoe/gi, replacement: `linkedin.com/in/${userData.linkedin}` },
      
      // Bio/About section
      { pattern: /I am a passionate developer.*/gi, replacement: content.bio },
      
      // Skills section
      { pattern: /\[.*skills.*\]/gi, replacement: JSON.stringify(userData.skills) },
      
      // Projects section - replace with user's projects
      { pattern: /projects:\s*\[[\s\S]*?\]/gi, replacement: `projects: ${JSON.stringify(content.projects)}` }
    ];
  }

  generateDeploymentConfig(framework, userData) {
    const configs = {
      react: {
        platform: 'vercel',
        buildCommand: 'npm run build',
        outputDirectory: 'build',
        envVars: {
          REACT_APP_GITHUB_USERNAME: userData.github,
          REACT_APP_EMAIL: userData.email
        }
      },
      next: {
        platform: 'vercel',
        buildCommand: 'npm run build',
        outputDirectory: '.next',
        envVars: {
          NEXT_PUBLIC_GITHUB_USERNAME: userData.github
        }
      },
      vue: {
        platform: 'netlify',
        buildCommand: 'npm run build',
        outputDirectory: 'dist'
      },
      vanilla: {
        platform: 'github-pages',
        buildCommand: null,
        outputDirectory: '.'
      }
    };

    return configs[framework] || configs.vanilla;
  }

  async generateLivePreview(modifications, originalRepo) {
    // Create a temporary deployment for preview
    const previewId = `preview_${Date.now()}`;
    
    return {
      previewId,
      url: `https://preview.craftmyfolio.com/${previewId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }
}

export const portfolioGenerator = new PortfolioGenerator();