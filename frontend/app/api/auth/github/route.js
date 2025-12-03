import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Mock GitHub OAuth - in production, redirect to GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=mock_client_id&redirect_uri=${encodeURIComponent('http://localhost:3000/dashboard')}&scope=user:email`;
    
    return NextResponse.redirect(githubAuthUrl);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to initiate GitHub OAuth' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { code } = await request.json();
    
    // Mock token exchange - in production, exchange code for token
    const mockUser = {
      id: 'github_123',
      name: 'GitHub User',
      email: 'user@github.com',
      profilePic: 'https://github.com/identicons/user.png',
      provider: 'github'
    };
    
    const mockToken = 'mock_jwt_token_' + Date.now();
    
    return NextResponse.json({
      success: true,
      token: mockToken,
      user: mockUser
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to authenticate with GitHub' },
      { status: 500 }
    );
  }
}