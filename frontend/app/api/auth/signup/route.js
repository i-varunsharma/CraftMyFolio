import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    // Mock signup - in production, create user in database
    if (name && email && password) {
      const mockUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        profilePic: null
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      return NextResponse.json({
        success: true,
        token: mockToken,
        user: mockUser,
        message: 'Account created successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Signup failed' },
      { status: 500 }
    );
  }
}