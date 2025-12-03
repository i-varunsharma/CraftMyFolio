import { NextResponse } from 'next/server';
import { githubIntegration } from '../../../utils/github/integration.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'portfolio';
    const sort = searchParams.get('sort') || 'stars';
    const language = searchParams.get('language');
    const page = parseInt(searchParams.get('page')) || 1;
    const per_page = parseInt(searchParams.get('per_page')) || 20;
    
    // Search GitHub repositories
    const searchResults = await githubIntegration.searchPortfolioRepositories(query, {
      sort,
      per_page,
      order: 'desc'
    });
    
    let filteredRepos = searchResults.items;
    
    // Filter by language if specified
    if (language && language !== 'all') {
      filteredRepos = filteredRepos.filter(repo => 
        repo.language && repo.language.toLowerCase() === language.toLowerCase()
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * per_page;
    const paginatedRepos = filteredRepos.slice(startIndex, startIndex + per_page);
    
    return NextResponse.json({
      items: paginatedRepos,
      total_count: searchResults.total_count,
      incomplete_results: false
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    
    // Fallback to mock data if GitHub API fails
    const mockRepos = [
      {
        id: 1,
        name: "portfolio-template",
        full_name: "developer/portfolio-template",
        description: "Modern portfolio template with React and Tailwind CSS",
        html_url: "https://github.com/developer/portfolio-template",
        homepage: "https://portfolio-demo.vercel.app",
        stargazers_count: 1250,
        language: "JavaScript",
        topics: ["react", "portfolio", "tailwind"],
        owner: {
          login: "developer",
          avatar_url: "https://github.com/identicons/developer.png",
          html_url: "https://github.com/developer"
        },
        updated_at: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({
      items: mockRepos,
      total_count: mockRepos.length,
      incomplete_results: true
    });
  }
}