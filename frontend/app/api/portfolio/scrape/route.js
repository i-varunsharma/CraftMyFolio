import { NextResponse } from 'next/server';
import { addPortfolio } from '../../../../lib/portfolioStore.js';

export async function POST(request) {
  try {
    const { githubUrl, portfolioName, userId } = await request.json();
    
    if (!githubUrl) {
      return NextResponse.json(
        { success: false, error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    // Extract owner and repo from GitHub URL
    const urlParts = githubUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];
    
    // Create portfolio entry with download info
    const portfolio = {
      id: Date.now(),
      name: `${repo}`,
      template: 'GitHub Clone',
      templateId: 'github-clone',
      status: 'Ready to Download',
      created: new Date().toISOString().split('T')[0],
      views: 0,
      githubUrl: githubUrl,
      owner: owner,
      repo: repo,
      downloadUrl: `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`,
      backupDownloadUrl: `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`,
      type: 'github-clone'
    };

    // Store in portfolio database
    addPortfolio(portfolio);
    
    console.log('Created portfolio with ID:', portfolio.id);

    return NextResponse.json({
      success: true,
      portfolioId: portfolio.id,
      message: 'Portfolio ready for download',
      data: {
        repoInfo: { name: repo, owner: owner },
        downloadUrl: portfolio.downloadUrl,
        backupDownloadUrl: portfolio.backupDownloadUrl
      }
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}