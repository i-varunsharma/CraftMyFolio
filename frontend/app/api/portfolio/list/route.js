import { NextResponse } from 'next/server';
import { getPortfolios } from '../../../../lib/portfolioStore.js';

export async function GET() {
  try {
    const portfolios = getPortfolios();
    
    return NextResponse.json({
      success: true,
      portfolios
    });
    
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios', details: error.message },
      { status: 500 }
    );
  }
}