import PortfolioDiscovery from '@/utils/portfolioDiscovery';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit')) || 20;
    const collection = searchParams.get('collection');

    const discovery = new PortfolioDiscovery();
    
    let portfolios;
    if (collection) {
      const collections = await discovery.getCuratedCollections();
      portfolios = collections[collection] || [];
    } else {
      portfolios = await discovery.discoverPortfolios(category, limit);
    }

    return Response.json({
      success: true,
      portfolios,
      total: portfolios.length
    });

  } catch (error) {
    console.error('Portfolio discovery error:', error);
    return Response.json({
      success: false,
      error: 'Failed to discover portfolios'
    }, { status: 500 });
  }
}