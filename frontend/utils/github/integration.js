// GitHub API Integration
const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubIntegration {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
  }

  async authenticateUser() {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email,repo,read:user`;
    
    window.location.href = authUrl;
  }

  async getUserProfile(username) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch user profile');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub profile:', error);
      return null;
    }
  }

  async getUserRepositories(username, options = {}) {
    try {
      const { sort = 'updated', per_page = 30, type = 'owner' } = options;
      
      const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/repos?sort=${sort}&per_page=${per_page}&type=${type}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) throw new Error('Failed to fetch repositories');
      
      const repos = await response.json();
      
      // Filter and enhance repositories
      return repos
        .filter(repo => !repo.fork && !repo.archived)
        .map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          homepage: repo.homepage,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          topics: repo.topics || [],
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          size: repo.size,
          default_branch: repo.default_branch
        }));
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  async getRepositoryReadme(username, repoName) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${username}/${repoName}/readme`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // Decode base64 content
      const content = atob(data.content.replace(/\n/g, ''));
      
      return {
        content,
        download_url: data.download_url,
        html_url: data.html_url
      };
    } catch (error) {
      console.error('Error fetching README:', error);
      return null;
    }
  }

  async getRepositoryLanguages(username, repoName) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${username}/${repoName}/languages`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) return {};
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      return {};
    }
  }

  async searchPortfolioRepositories(query = 'portfolio', options = {}) {
    try {
      const { sort = 'stars', order = 'desc', per_page = 20 } = options;
      
      const searchQuery = `${query} in:name,description,readme language:javascript,typescript,html stars:>10`;
      
      const response = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=${sort}&order=${order}&per_page=${per_page}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) throw new Error('Failed to search repositories');
      
      const data = await response.json();
      
      return {
        total_count: data.total_count,
        items: data.items.map(repo => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          homepage: repo.homepage,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          topics: repo.topics || [],
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url,
            html_url: repo.owner.html_url
          },
          created_at: repo.created_at,
          updated_at: repo.updated_at
        }))
      };
    } catch (error) {
      console.error('Error searching repositories:', error);
      return { total_count: 0, items: [] };
    }
  }

  async generateProjectFromRepo(username, repoName) {
    try {
      // Get repository details
      const repoResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${username}/${repoName}`,
        { headers: this.getHeaders() }
      );
      
      if (!repoResponse.ok) throw new Error('Repository not found');
      
      const repo = await repoResponse.json();
      
      // Get README content
      const readme = await this.getRepositoryReadme(username, repoName);
      
      // Get languages
      const languages = await this.getRepositoryLanguages(username, repoName);
      
      // Generate project description using AI
      const projectData = {
        name: repo.name,
        description: repo.description || 'No description provided',
        technologies: Object.keys(languages).slice(0, 5),
        github_url: repo.html_url,
        demo_url: repo.homepage,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        readme_content: readme?.content?.substring(0, 500) || '',
        topics: repo.topics || []
      };
      
      return projectData;
    } catch (error) {
      console.error('Error generating project from repo:', error);
      return null;
    }
  }

  async createGitHubPagesDeployment(username, repoName, portfolioHTML) {
    try {
      // This would require GitHub API token with repo permissions
      // For now, return instructions for manual deployment
      
      return {
        success: true,
        instructions: [
          '1. Create a new repository on GitHub',
          '2. Upload the downloaded HTML file as index.html',
          '3. Go to Settings > Pages',
          '4. Select source branch (main/master)',
          '5. Your portfolio will be live at username.github.io/repo-name'
        ],
        estimated_url: `https://${username}.github.io/${repoName}`
      };
    } catch (error) {
      console.error('Error creating GitHub Pages deployment:', error);
      return { success: false, error: error.message };
    }
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CraftMyFolio-App'
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `token ${this.accessToken}`;
    }
    
    return headers;
  }

  // Extract skills from repositories
  extractSkillsFromRepos(repositories) {
    const skillsMap = {};
    
    repositories.forEach(repo => {
      // Count languages
      if (repo.language) {
        skillsMap[repo.language] = (skillsMap[repo.language] || 0) + 1;
      }
      
      // Extract from topics
      repo.topics?.forEach(topic => {
        const skill = this.normalizeSkill(topic);
        if (skill) {
          skillsMap[skill] = (skillsMap[skill] || 0) + 1;
        }
      });
    });
    
    // Return top skills
    return Object.entries(skillsMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([skill]) => skill);
  }

  normalizeSkill(skill) {
    const skillMap = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'react': 'React',
      'nodejs': 'Node.js',
      'python': 'Python',
      'java': 'Java',
      'html': 'HTML',
      'css': 'CSS',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'aws': 'AWS',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'redis': 'Redis',
      'graphql': 'GraphQL',
      'rest-api': 'REST API',
      'microservices': 'Microservices'
    };
    
    return skillMap[skill.toLowerCase()] || (skill.length > 2 ? skill : null);
  }
}

export const githubIntegration = new GitHubIntegration();