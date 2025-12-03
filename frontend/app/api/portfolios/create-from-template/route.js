import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { templateId, githubUrl, sessionId, templateName } = await request.json();
    
    // Create portfolio session from template
    const portfolioSession = {
      sessionId,
      templateId,
      templateName,
      githubUrl,
      status: 'initialized',
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Portfolio session created successfully'
    });
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio from template' },
      { status: 500 }
    );
  }
}