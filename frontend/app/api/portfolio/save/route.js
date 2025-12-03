import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { sessionId, content, metadata } = await request.json();
    
    // Mock save - in production, save to database
    const savedPortfolio = {
      id: 'portfolio_' + Date.now(),
      sessionId,
      content,
      metadata,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Saving portfolio:', savedPortfolio);
    
    return NextResponse.json({
      success: true,
      portfolioId: savedPortfolio.id,
      message: 'Portfolio saved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save portfolio' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { portfolioId, content, metadata } = await request.json();
    
    // Mock update - in production, update in database
    console.log(`Updating portfolio ${portfolioId}:`, { content, metadata });
    
    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}