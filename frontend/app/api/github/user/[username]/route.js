import { NextResponse } from 'next/server';

const GITHUB_API_BASE = 'https://api.github.com';

export async function GET(request, { params }) {
  try {
    const { username } = params;
    
    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' });
    }

    // Fetch user profile
    const profileResponse = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CraftMyFolio-App'
      }
    });

    if (!profileResponse.ok) {
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    const profile = await profileResponse.json();

    // Fetch repositories
    const reposResponse = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=30&type=owner`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CraftMyFolio-App'
      }
    });

    const allRepos = await reposResponse.json();
    
    // Filter and process repositories
    const repos = allRepos
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
        size: repo.size
      }));

    // Extract skills from repositories
    const skillsMap = {};
    repos.forEach(repo => {
      if (repo.language) {
        skillsMap[repo.language] = (skillsMap[repo.language] || 0) + 1;
      }
      repo.topics?.forEach(topic => {
        const skill = normalizeSkill(topic);
        if (skill) {
          skillsMap[skill] = (skillsMap[skill] || 0) + 1;
        }
      });
    });

    const skills = Object.entries(skillsMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([skill]) => skill);

    // Process projects with deploy detection
    const projects = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 12)
      .map(repo => ({
        name: repo.name,
        description: repo.description || 'No description available',
        technologies: [repo.language, ...repo.topics.slice(0, 3)].filter(Boolean),
        github_url: repo.html_url,
        demo_url: detectDeployUrl(repo),
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics
      }));

    const responseData = {
      success: true,
      profile: {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        html_url: profile.html_url,
        blog: profile.blog,
        location: profile.location,
        email: profile.email,
        followers: profile.followers,
        following: profile.following,
        public_repos: profile.public_repos,
        created_at: profile.created_at
      },
      projects,
      skills,
      stats: {
        totalRepos: repos.length,
        totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
        totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
        languages: [...new Set(repos.map(r => r.language).filter(Boolean))]
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('GitHub API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch GitHub data. Please check the username and try again.' 
    });
  }
}

function detectDeployUrl(repo) {
  // Check homepage first
  if (repo.homepage && repo.homepage.includes('http')) {
    return repo.homepage;
  }
  
  // Common deploy patterns
  const name = repo.name.toLowerCase();
  const owner = repo.html_url.split('/')[3];
  
  // GitHub Pages detection
  if (name.includes('github.io') || name === `${owner}.github.io`) {
    return `https://${owner}.github.io/${repo.name}`;
  }
  
  // Vercel detection
  if (repo.topics?.includes('vercel') || name.includes('vercel')) {
    return `https://${name}.vercel.app`;
  }
  
  // Netlify detection
  if (repo.topics?.includes('netlify') || name.includes('netlify')) {
    return `https://${name}.netlify.app`;
  }
  
  return null;
}

function normalizeSkill(skill) {
  const skillMap = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'react': 'React',
    'nextjs': 'Next.js',
    'nodejs': 'Node.js',
    'python': 'Python',
    'java': 'Java',
    'html': 'HTML',
    'css': 'CSS',
    'vue': 'Vue.js',
    'angular': 'Angular',
    'docker': 'Docker',
    'aws': 'AWS',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'graphql': 'GraphQL'
  };
  
  return skillMap[skill.toLowerCase()] || (skill.length > 2 ? skill : null);
}