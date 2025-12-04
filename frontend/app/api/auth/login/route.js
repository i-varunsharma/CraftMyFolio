import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (email && password) {
      // Extract name from email (part before @)
      const name = email.split('@')[0];
      
      const user = {
        id: 'user_' + Date.now(),
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        email: email,
        profilePic: null
      };
      
      const token = 'jwt_token_' + Date.now();
      
      return NextResponse.json({
        message: 'Login successful',
        token: token,
        user: user
      });
    }
    
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}