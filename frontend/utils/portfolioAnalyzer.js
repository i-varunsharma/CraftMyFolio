export async function analyzePortfolioStructure(portfolioData) {
  const repoUrl = portfolioData.url;
  const apiUrl = repoUrl.replace('github.com', 'api.github.com/repos');
  
  try {
    // Get repository contents
    const contentsResponse = await fetch(`${apiUrl}/contents`);
    const contents = await contentsResponse.json();
    
    // Detect framework
    const framework = detectFramework(contents);
    
    // Find important files
    const files = contents.map(item => item.name);
    const contentFiles = await findContentFiles(apiUrl, contents);
    
    // Analyze structure
    const structure = {
      framework,
      files,
      contentFiles,
      hasComponents: files.some(f => f.includes('component')),
      hasPages: files.some(f => f.includes('page')),
      avatarPath: findAvatarPath(contents),
      configFiles: files.filter(f => f.includes('config') || f.includes('.json')),
      styleFiles: files.filter(f => f.endsWith('.css') || f.endsWith('.scss')),
      buildTool: detectBuildTool(files)
    };
    
    return structure;
  } catch (error) {
    console.error('Portfolio analysis failed:', error);
    return getDefaultStructure();
  }
}

function detectFramework(contents) {
  const files = contents.map(item => item.name);
  
  if (files.includes('package.json')) {
    // Check package.json for dependencies
    return 'react'; // Default assumption for now
  }
  
  if (files.includes('index.html')) {
    return 'vanilla';
  }
  
  return 'unknown';
}

async function findContentFiles(apiUrl, contents) {
  const contentFiles = [];
  
  for (const item of contents) {
    if (item.type === 'file' && isContentFile(item.name)) {
      try {
        const fileResponse = await fetch(item.download_url);
        const content = await fileResponse.text();
        
        contentFiles.push({
          path: item.name,
          content: content.substring(0, 1000), // First 1000 chars for analysis
          hasPersonalInfo: containsPersonalInfo(content),
          type: getFileType(item.name)
        });
      } catch (error) {
        console.error(`Failed to fetch ${item.name}:`, error);
      }
    }
  }
  
  return contentFiles;
}

function isContentFile(filename) {
  const contentExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.md'];
  const excludePatterns = ['node_modules', '.git', 'dist', 'build'];
  
  return contentExtensions.some(ext => filename.endsWith(ext)) &&
         !excludePatterns.some(pattern => filename.includes(pattern));
}

function containsPersonalInfo(content) {
  const personalPatterns = [
    /name\s*[:=]\s*["'].*["']/i,
    /email\s*[:=]\s*["'].*@.*["']/i,
    /github\s*[:=]\s*["'].*["']/i,
    /linkedin\s*[:=]\s*["'].*["']/i,
    /@\w+/g, // Social handles
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g // Email patterns
  ];
  
  return personalPatterns.some(pattern => pattern.test(content));
}

function findAvatarPath(contents) {
  const avatarPatterns = ['avatar', 'profile', 'photo', 'picture', 'me'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  for (const item of contents) {
    if (item.type === 'file') {
      const filename = item.name.toLowerCase();
      if (avatarPatterns.some(pattern => filename.includes(pattern)) &&
          imageExtensions.some(ext => filename.endsWith(ext))) {
        return item.path;
      }
    }
  }
  
  return null;
}

function getFileType(filename) {
  if (filename.endsWith('.md')) return 'markdown';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.vue')) return 'vue';
  return 'other';
}

function detectBuildTool(files) {
  if (files.includes('package.json')) return 'npm';
  if (files.includes('yarn.lock')) return 'yarn';
  if (files.includes('pnpm-lock.yaml')) return 'pnpm';
  return 'none';
}

function getDefaultStructure() {
  return {
    framework: 'vanilla',
    files: ['index.html'],
    contentFiles: [],
    hasComponents: false,
    hasPages: false,
    avatarPath: null,
    configFiles: [],
    styleFiles: [],
    buildTool: 'none'
  };
}