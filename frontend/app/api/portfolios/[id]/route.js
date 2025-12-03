import { NextResponse } from 'next/server';
import { getPortfolioById, deletePortfolio, updatePortfolio } from '../../../../lib/portfolioStore.js';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const deleted = deletePortfolio(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const portfolio = getPortfolioById(id);
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updated = updatePortfolio(id, data);
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      portfolio: updated,
      message: 'Portfolio updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}