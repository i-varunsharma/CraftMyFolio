export async function generatePersonalizedContent(userData, portfolioStructure) {
  try {
    // Generate AI-powered content based on user data
    const content = {
      bio: await generateBio(userData),
      projects: await generateProjects(userData),
      skills: organizeSkills(userData.skills || []),
      experience: formatExperience(userData.experience || []),
      achievements: generateAchievements(userData)
    };
    
    return content;
  } catch (error) {
    console.error('Content generation failed:', error);
    return getDefaultContent(userData);
  }
}

async function generateBio(userData) {
  const templates = [
    `Hi, I'm ${userData.name}, a passionate ${userData.title} with expertise in ${userData.primarySkills?.join(', ') || 'modern web technologies'}. I love creating innovative solutions and bringing ideas to life through code.`,
    
    `${userData.name} here! As a ${userData.title}, I specialize in building scalable applications using ${userData.primarySkills?.join(', ') || 'cutting-edge technologies'}. I'm driven by the challenge of solving complex problems with elegant code.`,
    
    `Welcome! I'm ${userData.name}, a ${userData.title} who transforms ideas into digital experiences. With a focus on ${userData.primarySkills?.join(' and ') || 'full-stack development'}, I create applications that make a difference.`
  ];
  
  // Select template based on user preference or randomly
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Add location and interests if available
  let bio = selectedTemplate;
  if (userData.location) {
    bio += ` Based in ${userData.location}.`;
  }
  if (userData.interests?.length > 0) {
    bio += ` When I'm not coding, I enjoy ${userData.interests.slice(0, 2).join(' and ')}.`;
  }
  
  return bio;
}

async function generateProjects(userData) {
  const projects = [];
  
  // If user has GitHub repos, fetch and enhance them
  if (userData.github) {
    try {
      const reposResponse = await fetch(`https://api.github.com/users/${userData.github}/repos?sort=updated&per_page=6`);
      const repos = await reposResponse.json();
      
      for (const repo of repos.slice(0, 4)) {
        if (!repo.fork && repo.description) {
          projects.push({
            name: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: enhanceDescription(repo.description),
            tech: detectTechStack(repo.language, repo.topics || []),
            github: repo.html_url,
            live: repo.homepage || null,
            featured: repo.stargazers_count > 5
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch GitHub repos:', error);
    }
  }
  
  // Add sample projects if not enough real ones
  if (projects.length < 3) {
    projects.push(...getSampleProjects(userData));
  }
  
  return projects.slice(0, 6);
}

function enhanceDescription(description) {
  const enhancements = {
    'todo': 'A feature-rich task management application',
    'portfolio': 'A responsive portfolio website showcasing my work',
    'blog': 'A modern blogging platform with dynamic content',
    'ecommerce': 'A full-stack e-commerce solution',
    'chat': 'A real-time messaging application',
    'dashboard': 'An interactive data visualization dashboard'
  };
  
  const lowercaseDesc = description.toLowerCase();
  for (const [key, enhancement] of Object.entries(enhancements)) {
    if (lowercaseDesc.includes(key)) {
      return enhancement;
    }
  }
  
  return description;
}

function detectTechStack(language, topics) {
  const techMap = {
    'JavaScript': ['JavaScript', 'Node.js'],
    'TypeScript': ['TypeScript', 'Node.js'],
    'Python': ['Python', 'Flask'],
    'Java': ['Java', 'Spring'],
    'C++': ['C++'],
    'Go': ['Go'],
    'Rust': ['Rust']
  };
  
  let tech = techMap[language] || [language];
  
  // Add framework based on topics
  const frameworkMap = {
    'react': 'React',
    'vue': 'Vue.js',
    'angular': 'Angular',
    'nextjs': 'Next.js',
    'express': 'Express.js',
    'django': 'Django',
    'flask': 'Flask'
  };
  
  topics.forEach(topic => {
    if (frameworkMap[topic]) {
      tech.push(frameworkMap[topic]);
    }
  });
  
  return [...new Set(tech)]; // Remove duplicates
}

function organizeSkills(skills) {
  const categories = {
    frontend: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind'],
    backend: ['Node.js', 'Python', 'Java', 'Go', 'Express', 'Django', 'Spring'],
    database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
    tools: ['Git', 'Docker', 'AWS', 'Vercel', 'Figma']
  };
  
  const organized = {};
  
  Object.keys(categories).forEach(category => {
    organized[category] = skills.filter(skill => 
      categories[category].some(cat => 
        skill.toLowerCase().includes(cat.toLowerCase())
      )
    );
  });
  
  return organized;
}

function formatExperience(experience) {
  return experience.map(exp => ({
    ...exp,
    duration: calculateDuration(exp.startDate, exp.endDate),
    highlights: exp.achievements?.slice(0, 3) || []
  }));
}

function generateAchievements(userData) {
  const achievements = [];
  
  if (userData.github) {
    achievements.push(`Active open source contributor on GitHub (@${userData.github})`);
  }
  
  if (userData.experience?.length > 2) {
    achievements.push(`${userData.experience.length}+ years of professional experience`);
  }
  
  if (userData.skills?.length > 10) {
    achievements.push(`Proficient in ${userData.skills.length}+ technologies`);
  }
  
  return achievements;
}

function getSampleProjects(userData) {
  return [
    {
      name: 'Personal Portfolio',
      description: 'A responsive portfolio website built with modern web technologies',
      tech: userData.primarySkills?.slice(0, 3) || ['React', 'CSS', 'JavaScript'],
      github: `https://github.com/${userData.github}/portfolio`,
      featured: true
    },
    {
      name: 'Task Manager App',
      description: 'A full-stack task management application with real-time updates',
      tech: ['React', 'Node.js', 'MongoDB'],
      github: `https://github.com/${userData.github}/task-manager`,
      featured: false
    }
  ];
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
  }
}

function getDefaultContent(userData) {
  return {
    bio: `Hi, I'm ${userData.name}, a passionate developer creating amazing digital experiences.`,
    projects: getSampleProjects(userData),
    skills: { frontend: ['HTML', 'CSS', 'JavaScript'], backend: ['Node.js'], tools: ['Git'] },
    experience: [],
    achievements: ['Passionate about clean code and user experience']
  };
}