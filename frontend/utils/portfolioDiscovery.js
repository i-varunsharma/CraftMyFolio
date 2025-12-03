class PortfolioDiscovery {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.mockPortfolios = [
      {
        id: 1,
        name: "developer-portfolio",
        fullName: "bchiang7/v4",
        description: "Fourth iteration of my personal website built with Gatsby",
        url: "https://github.com/bchiang7/v4",
        stars: 6800,
        language: "JavaScript",
        topics: ["portfolio", "gatsby", "react"],
        lastUpdated: "2024-01-15T10:30:00Z",
        owner: {
          username: "bchiang7",
          avatar: "https://avatars.githubusercontent.com/u/12711404?v=4",
          url: "https://github.com/bchiang7"
        },
        hasPages: true,
        liveUrl: "https://brittanychiang.com"
      },
      {
        id: 2,
        name: "portfolio-website",
        fullName: "ashutosh1919/masterPortfolio",
        description: "🔥 The Complete Customizable Software Developer Portfolio Template",
        url: "https://github.com/ashutosh1919/masterPortfolio",
        stars: 3200,
        language: "JavaScript",
        topics: ["portfolio", "react", "developer"],
        lastUpdated: "2024-01-10T14:20:00Z",
        owner: {
          username: "ashutosh1919",
          avatar: "https://avatars.githubusercontent.com/u/20843596?v=4",
          url: "https://github.com/ashutosh1919"
        },
        hasPages: true,
        liveUrl: "https://ashutosh1919.github.io"
      },
      {
        id: 3,
        name: "react-portfolio",
        fullName: "soumyajit4419/Portfolio",
        description: "My personal portfolio website built with React.js",
        url: "https://github.com/soumyajit4419/Portfolio",
        stars: 2800,
        language: "JavaScript",
        topics: ["portfolio", "react", "personal-website"],
        lastUpdated: "2024-01-08T09:15:00Z",
        owner: {
          username: "soumyajit4419",
          avatar: "https://avatars.githubusercontent.com/u/53649201?v=4",
          url: "https://github.com/soumyajit4419"
        },
        hasPages: true,
        liveUrl: "https://soumyajit.vercel.app"
      },
      {
        id: 4,
        name: "minimal-portfolio",
        fullName: "rammcodes/Dopefolio",
        description: "Dopefolio 🔥 - Portfolio Template for Developers",
        url: "https://github.com/rammcodes/Dopefolio",
        stars: 2100,
        language: "HTML",
        topics: ["portfolio", "html", "css", "minimal"],
        lastUpdated: "2024-01-12T16:45:00Z",
        owner: {
          username: "rammcodes",
          avatar: "https://avatars.githubusercontent.com/u/59678435?v=4",
          url: "https://github.com/rammcodes"
        },
        hasPages: true,
        liveUrl: "https://dopefolio.netlify.app"
      },
      {
        id: 5,
        name: "creative-portfolio",
        fullName: "cobidev/simplefolio",
        description: "⚡️ A minimal portfolio template for Developers",
        url: "https://github.com/cobidev/simplefolio",
        stars: 1900,
        language: "JavaScript",
        topics: ["portfolio", "template", "creative"],
        lastUpdated: "2024-01-05T11:30:00Z",
        owner: {
          username: "cobidev",
          avatar: "https://avatars.githubusercontent.com/u/38764504?v=4",
          url: "https://github.com/cobidev"
        },
        hasPages: true,
        liveUrl: "https://simplfolio.netlify.app"
      },
      {
        id: 6,
        name: "vue-portfolio",
        fullName: "Renovamen/playground-macos",
        description: "My portfolio website simulating macOS's GUI",
        url: "https://github.com/Renovamen/playground-macos",
        stars: 1600,
        language: "Vue",
        topics: ["portfolio", "vue", "macos", "creative"],
        lastUpdated: "2024-01-14T13:20:00Z",
        owner: {
          username: "Renovamen",
          avatar: "https://avatars.githubusercontent.com/u/25452307?v=4",
          url: "https://github.com/Renovamen"
        },
        hasPages: true,
        liveUrl: "https://portfolio.zxh.io"
      }
    ];
  }

  // Discover portfolios using multiple strategies
  async discoverPortfolios(category = 'all', limit = 20) {
    try {
      if (!this.githubToken) {
        console.warn('No GitHub token found, using mock data');
        return this.filterAndRank(this.mockPortfolios, category, limit);
      }

      const strategies = [
        this.searchByTopics,
        this.searchByStars,
        this.searchByLanguage,
        this.searchTrending
      ];

      const allPortfolios = [];
      
      for (const strategy of strategies) {
        try {
          const portfolios = await strategy.call(this, limit / 4);
          allPortfolios.push(...portfolios);
        } catch (error) {
          console.warn(`Discovery strategy failed:`, error.message);
        }
      }

      const result = this.filterAndRank(allPortfolios, category, limit);
      return result.length > 0 ? result : this.filterAndRank(this.mockPortfolios, category, limit);
    } catch (error) {
      console.warn('GitHub API failed, using mock data:', error.message);
      return this.filterAndRank(this.mockPortfolios, category, limit);
    }
  }

  // Search by portfolio-related topics
  async searchByTopics(limit = 5) {
    const topics = ['portfolio', 'personal-website', 'developer-portfolio', 'portfolio-website'];
    const portfolios = [];

    for (const topic of topics) {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=topic:${topic}+language:html+language:javascript+stars:>10&sort=stars&per_page=${limit}`,
        { headers: { Authorization: `token ${this.githubToken}` } }
      );
      
      const data = await response.json();
      portfolios.push(...(data.items || []));
    }

    return this.processRepos(portfolios);
  }

  // Search by star count and recent activity
  async searchByStars(limit = 5) {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=portfolio+in:name+in:description+language:html+stars:>20+pushed:>2023-01-01&sort=stars&per_page=${limit}`,
      { headers: { Authorization: `token ${this.githubToken}` } }
    );
    
    const data = await response.json();
    return this.processRepos(data.items || []);
  }

  // Search by programming language
  async searchByLanguage(limit = 5) {
    const languages = ['javascript', 'typescript', 'react', 'vue'];
    const portfolios = [];

    for (const lang of languages) {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=portfolio+language:${lang}+stars:>5&sort=updated&per_page=${Math.ceil(limit/languages.length)}`,
        { headers: { Authorization: `token ${this.githubToken}` } }
      );
      
      const data = await response.json();
      portfolios.push(...(data.items || []));
    }

    return this.processRepos(portfolios);
  }

  // Search trending repositories
  async searchTrending(limit = 5) {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=portfolio+created:>2024-01-01+stars:>1&sort=updated&per_page=${limit}`,
      { headers: { Authorization: `token ${this.githubToken}` } }
    );
    
    const data = await response.json();
    return this.processRepos(data.items || []);
  }

  // Process raw GitHub repos into portfolio objects
  processRepos(repos) {
    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      topics: repo.topics || [],
      lastUpdated: repo.updated_at,
      owner: {
        username: repo.owner.login,
        avatar: repo.owner.avatar_url,
        url: repo.owner.html_url
      },
      hasPages: repo.has_pages,
      liveUrl: repo.has_pages ? `https://${repo.owner.login}.github.io/${repo.name}` : null
    }));
  }

  // Filter and rank portfolios by quality
  filterAndRank(portfolios, category, limit) {
    // Remove duplicates
    const unique = portfolios.filter((portfolio, index, self) => 
      index === self.findIndex(p => p.id === portfolio.id)
    );

    // Filter by category
    let filtered = unique;
    if (category !== 'all') {
      filtered = unique.filter(p => {
        const categoryLower = category.toLowerCase();
        return (
          p.language?.toLowerCase().includes(categoryLower) ||
          p.topics.some(topic => topic.toLowerCase().includes(categoryLower)) ||
          p.name.toLowerCase().includes(categoryLower) ||
          p.description?.toLowerCase().includes(categoryLower)
        );
      });
    }

    // Quality scoring
    const scored = filtered.map(portfolio => ({
      ...portfolio,
      score: this.calculateQualityScore(portfolio)
    }));

    // Sort by score and return top results
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Calculate quality score for ranking
  calculateQualityScore(portfolio) {
    let score = 0;
    
    // Star count (max 50 points)
    score += Math.min(portfolio.stars * 2, 50);
    
    // Has live demo (20 points)
    if (portfolio.hasPages) score += 20;
    
    // Recent activity (max 20 points)
    const daysSinceUpdate = (Date.now() - new Date(portfolio.lastUpdated)) / (1000 * 60 * 60 * 24);
    score += Math.max(20 - daysSinceUpdate / 30, 0);
    
    // Description quality (10 points)
    if (portfolio.description && portfolio.description.length > 20) score += 10;
    
    // Portfolio-related topics (5 points each, max 15)
    const portfolioTopics = portfolio.topics.filter(topic => 
      ['portfolio', 'website', 'personal', 'developer'].some(keyword => topic.includes(keyword))
    );
    score += Math.min(portfolioTopics.length * 5, 15);
    
    return score;
  }

  // Get curated collections
  async getCuratedCollections() {
    try {
      return {
        trending: await this.discoverPortfolios('all', 10),
        react: await this.discoverPortfolios('react', 8),
        javascript: await this.discoverPortfolios('javascript', 8),
        creative: await this.discoverPortfolios('creative', 6),
        minimal: await this.discoverPortfolios('minimal', 6)
      };
    } catch (error) {
      console.warn('Collections failed, using mock data');
      return {
        trending: this.filterAndRank(this.mockPortfolios, 'all', 10),
        react: this.filterAndRank(this.mockPortfolios, 'react', 8),
        javascript: this.filterAndRank(this.mockPortfolios, 'javascript', 8),
        creative: this.filterAndRank(this.mockPortfolios, 'creative', 6),
        minimal: this.filterAndRank(this.mockPortfolios, 'minimal', 6)
      };
    }
  }
}

export default PortfolioDiscovery;