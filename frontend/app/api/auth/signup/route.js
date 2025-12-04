import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    if (name && email && password) {
      const user = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        profilePic: null
      };
      
      const token = 'jwt_token_' + Date.now();
      
      return NextResponse.json({
        message: 'Account created successfully',
        token: token,
        user: user
      });
    }
    
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Signup failed' },
      { status: 500 }
    );
  }
}