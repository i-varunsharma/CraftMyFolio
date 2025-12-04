import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in memory
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    // For now, just log OTP (email service will be added later)
    console.log(`OTP sent to ${email}: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP generated (check console)',
      otp: otp // Show OTP for now
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}