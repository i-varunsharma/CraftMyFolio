import { NextResponse } from 'next/server';
import { getPortfolios, addPortfolio } from '../../../lib/portfolioStore.js';

export async function GET(request) {
  try {
    const portfolios = getPortfolios();
    return NextResponse.json(portfolios);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Create new portfolio
    const newPortfolio = {
      id: Date.now(),
      name: data.name || "New Portfolio",
      template: data.template || "Modern",
      status: "Draft",
      created: new Date().toISOString().split('T')[0],
      views: 0,
      content: data.content || {}
    };
    
    // Add to store
    addPortfolio(newPortfolio);
    
    return NextResponse.json({
      success: true,
      portfolio: newPortfolio,
      message: 'Portfolio created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}