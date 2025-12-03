import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Mock user profile - in production, get from database
    const mockProfile = {
      id: 'user_123',
      name: 'Demo User',
      email: 'demo@example.com',
      profilePic: null,
      bio: 'Full Stack Developer',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      github: 'github.com/demo',
      linkedin: 'linkedin.com/in/demo',
      createdAt: '2024-01-01',
      portfolioCount: 3,
      totalViews: 2140
    };
    
    return NextResponse.json(mockProfile);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    // Mock profile update - in production, update in database
    console.log('Updating profile with:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}