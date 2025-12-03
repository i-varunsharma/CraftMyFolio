import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { context, userInput } = await request.json();
    
    // Mock AI suggestions - in production, use Gemini API
    const suggestions = generateSuggestions(context, userInput);
    
    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

function generateSuggestions(context, userInput) {
  const baseSuggestions = [
    "Tell me about your background and experience",
    "What technologies do you work with?",
    "Describe your most impressive project",
    "What's your professional goal?"
  ];
  
  if (context === 'skills') {
    return [
      "Add React and Node.js to your skills",
      "Include cloud platforms like AWS or Azure",
      "Mention any certifications you have",
      "Add soft skills like leadership or communication"
    ];
  }
  
  if (context === 'projects') {
    return [
      "Describe the problem your project solved",
      "Mention the technologies you used",
      "Include metrics or results if available",
      "Add links to live demos or GitHub repos"
    ];
  }
  
  if (context === 'design') {
    return [
      "Try a modern gradient background",
      "Use a minimal layout for better focus",
      "Add animations for better engagement",
      "Consider a dark theme for developer portfolios"
    ];
  }
  
  return baseSuggestions;
}