import { NextResponse } from 'next/server';
import { getPortfolioById, getPortfolios } from '../../../../../lib/portfolioStore.js';

export async function GET(request, { params }) {
  try {
    const { portfolioId } = await params;
    
    console.log('Fetching portfolio with ID:', portfolioId);
    
    // Convert to number since portfolio IDs are stored as numbers
    const portfolio = getPortfolioById(parseInt(portfolioId));
    
    console.log('Found portfolio:', portfolio ? 'Yes' : 'No');
    console.log('All portfolios:', getPortfolios().map(p => ({ id: p.id, name: p.name, type: p.type })));
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }
    
    if (portfolio.type !== 'code-based') {
      return NextResponse.json(
        { success: false, error: 'Not a code-based portfolio' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      portfolioId: portfolio.id,
      repoInfo: portfolio.repoInfo,
      codeFiles: portfolio.codeFiles,
      analysis: portfolio.analysis,
      framework: portfolio.framework,
      editableFields: portfolio.editableFields,
      githubUrl: portfolio.githubUrl
    });
  } catch (error) {
    console.error('Error fetching portfolio code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio code' },
      { status: 500 }
    );
  }
}