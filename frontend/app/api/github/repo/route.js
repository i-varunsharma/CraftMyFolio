import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { repoUrl } = await request.json();
    
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid GitHub URL' });
    }
    
    const [, username, repoName] = match;
    
    const headers = {
      'User-Agent': 'CraftMyFolio-App',
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // Add token if available
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    
    // Get repo info
    const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers });
    
    if (!repoResponse.ok) {
      throw new Error(`Repository not found: ${repoResponse.status}`);
    }
    
    const repoInfo = await repoResponse.json();
    
    // Get file tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/git/trees/${repoInfo.default_branch}?recursive=1`,
      { headers }
    );
    
    if (!treeResponse.ok) {
      throw new Error(`Failed to get file tree: ${treeResponse.status}`);
    }
    
    const treeData = await treeResponse.json();
    
    const files = {};
    const fileStructure = [];
    
    // Get all text files
    for (const item of treeData.tree.slice(0, 50)) { // Limit to first 50 files
      if (item.type === 'blob' && item.size < 500000 && isTextFile(item.path)) {
        try {
          const fileResponse = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/contents/${item.path}`,
            { headers }
          );
          
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            
            files[item.path] = {
              content,
              path: item.path,
              size: item.size,
              type: getFileLanguage(item.path)
            };
            
            fileStructure.push({
              path: item.path,
              name: item.path.split('/').pop(),
              type: 'file',
              language: getFileLanguage(item.path)
            });
          }
        } catch (e) {
          console.log(`Failed to fetch ${item.path}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      repository: {
        name: repoInfo.name,
        description: repoInfo.description,
        html_url: repoInfo.html_url,
        homepage: repoInfo.homepage,
        language: repoInfo.language,
        stars: repoInfo.stargazers_count,
        owner: repoInfo.owner.login
      },
      files,
      fileStructure: buildFileTree(fileStructure),
      deployUrl: repoInfo.homepage
    });

  } catch (error) {
    console.error('GitHub API Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

function isTextFile(path) {
  const textExts = ['html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'md', 'txt', 'xml', 'svg', 'yml', 'yaml'];
  const ext = path.split('.').pop().toLowerCase();
  return textExts.includes(ext);
}

function getFileLanguage(path) {
  const ext = path.split('.').pop().toLowerCase();
  const map = {
    'html': 'html', 'htm': 'html', 'css': 'css', 'js': 'javascript', 'jsx': 'javascript',
    'ts': 'typescript', 'tsx': 'typescript', 'json': 'json', 'md': 'markdown'
  };
  return map[ext] || 'text';
}

function buildFileTree(files) {
  const tree = {};
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = { type: 'file', path: file.path, language: file.language };
      } else {
        if (!current[part]) current[part] = { type: 'directory', children: {} };
        current = current[part].children;
      }
    });
  });
  return tree;
}