import { NextResponse } from 'next/server';
import { portfolioGenerator } from '../../../../utils/portfolioGenerator.js';
import { savePortfolio } from '../../../../lib/portfolioStore.js';

export async function POST(request) {
  try {
    const { portfolioData, userData } = await request.json();
    
    // Validate required data
    if (!portfolioData?.url || !userData?.name) {
      return NextResponse.json(
        { error: 'Portfolio URL and user name are required' },
        { status: 400 }
      );
    }
    
    // Generate personalized portfolio
    const generatedPortfolio = await portfolioGenerator.generatePersonalizedPortfolio(
      portfolioData,
      userData
    );
    
    // Save to storage
    const savedPortfolio = await savePortfolio(generatedPortfolio);
    
    // Create download package
    const downloadPackage = await createDownloadPackage(generatedPortfolio);
    
    return NextResponse.json({
      success: true,
      portfolio: {
        ...savedPortfolio,
        downloadUrl: downloadPackage.url,
        previewUrl: downloadPackage.previewUrl
      }
    });
    
  } catch (error) {
    console.error('Portfolio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio', details: error.message },
      { status: 500 }
    );
  }
}

async function createDownloadPackage(portfolio) {
  const packageId = `package_${Date.now()}`;
  
  // Use GitHub.dev for preview (web-based VS Code)
  const githubDevUrl = portfolio.originalRepo.replace('github.com', 'github.dev');
  
  return {
    url: `/api/portfolio/download/${packageId}`,
    previewUrl: githubDevUrl,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
}