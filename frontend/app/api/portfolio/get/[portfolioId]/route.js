import { NextResponse } from 'next/server';
import { getPortfolioById } from '../../../../../lib/portfolioStore.js';

export async function GET(request, { params }) {
  try {
    const { portfolioId } = await params;
    
    const portfolio = getPortfolioById(parseInt(portfolioId));
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}