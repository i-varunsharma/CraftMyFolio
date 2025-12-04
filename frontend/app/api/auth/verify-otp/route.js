import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const stored = global.otpStore?.[email];
    if (!stored || stored.expires < Date.now()) {
      return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
    }
    
    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
    
    // OTP verified, remove from store
    delete global.otpStore[email];
    
    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}