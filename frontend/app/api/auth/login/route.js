import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Mock login - in production, verify credentials
    if (email && password) {
      const mockUser = {
        id: 'user_123',
        name: 'Demo User',
        email: email,
        profilePic: null
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      return NextResponse.json({
        success: true,
        token: mockToken,
        user: mockUser
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}