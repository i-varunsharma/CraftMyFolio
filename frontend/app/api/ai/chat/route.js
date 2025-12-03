import { NextResponse } from 'next/server';
import { aiAssistant } from '../../../utils/advancedAI.js';

export async function POST(request) {
  try {
    const { message, context, portfolioData } = await request.json();
    
    // Use advanced AI assistant
    const aiResponse = await aiAssistant.conversationalChat(message, portfolioData || context);
    
    return NextResponse.json({
      success: aiResponse.success,
      response: aiResponse.message,
      suggestions: aiResponse.suggestions,
      nextSteps: aiResponse.nextSteps,
      updates: aiResponse.updates
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({
      success: false,
      response: "I'm here to help you build an amazing portfolio! Tell me about your background, skills, or projects.",
      suggestions: ["Tell me about yourself", "Add your skills", "Describe your projects"],
      error: 'AI temporarily unavailable'
    }, { status: 200 }); // Return 200 with fallback instead of error
  }
}