import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { packageId } = params;
    
    // Get portfolio from storage
    const { getPortfolios } = await import('../../../../../lib/portfolioStore.js');
    const portfolios = getPortfolios();
    const portfolio = portfolios.find(p => p.downloadUrl?.includes(packageId));
    
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    
    // Fetch the original GitHub repo as zip
    const githubZipUrl = portfolio.originalRepo + '/archive/refs/heads/main.zip';
    const response = await fetch(githubZipUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch repository');
    }
    
    const zipBuffer = await response.arrayBuffer();
    
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${portfolio.id}-portfolio.zip"`
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Download failed', details: error.message },
      { status: 500 }
    );
  }
}