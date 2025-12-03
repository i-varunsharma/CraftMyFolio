// Advanced AI Portfolio Assistant
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export class AIPortfolioAssistant {
  constructor() {
    this.conversationHistory = [];
  }

  async analyzeUserProfile(userData) {
    const prompt = `
      Analyze this user profile and provide intelligent insights:
      
      Name: ${userData.name || 'Not provided'}
      Title: ${userData.title || 'Not provided'}
      Skills: ${userData.skills?.join(', ') || 'Not provided'}
      Experience: ${userData.experience || 'Not provided'}
      Projects: ${userData.projects?.map(p => p.name).join(', ') || 'Not provided'}
      
      Provide detailed analysis in JSON format:
      {
        "profileScore": 85,
        "strengths": ["Strong technical skills", "Good project variety"],
        "improvements": ["Add more quantifiable achievements", "Include testimonials"],
        "skillGaps": ["Cloud technologies", "DevOps tools"],
        "industryAdvice": "Focus on modern frameworks and best practices",
        "seoKeywords": ["developer", "engineer", "javascript"],
        "nextSteps": ["Add GitHub integration", "Optimize project descriptions"]
      }
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return JSON.parse(response.replace(/```json|```/g, ''));
    } catch (error) {
      return this.getFallbackAnalysis(userData);
    }
  }

  async generateProjectDescription(projectData) {
    const prompt = `
      Create a compelling project description for a portfolio:
      
      Project Name: ${projectData.name}
      Technologies: ${projectData.tech}
      Description: ${projectData.description}
      
      Generate a professional description that:
      1. Highlights technical achievements
      2. Shows business impact
      3. Uses action verbs
      4. Includes specific metrics where possible
      
      Keep it 2-3 sentences, professional and impressive.
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return {
        success: true,
        content: response,
        type: 'project'
      };
    } catch (error) {
      return this.getFallbackProject(projectData);
    }
  }

  async conversationalChat(userMessage, portfolioContext = {}) {
    this.conversationHistory.push({ role: 'user', content: userMessage });
    
    const contextPrompt = `
      You are an expert AI portfolio advisor helping users build professional portfolios.
      
      Current Portfolio Context:
      - Name: ${portfolioContext.name || 'Not set'}
      - Title: ${portfolioContext.title || 'Not set'}
      - Skills: ${portfolioContext.skills?.join(', ') || 'None added'}
      - Projects: ${portfolioContext.projects?.length || 0} projects
      
      Recent conversation:
      ${this.conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\\n')}
      
      User's message: ${userMessage}
      
      Respond as a helpful AI assistant. Provide:
      1. Direct answer to their question
      2. Actionable suggestions
      3. Follow-up questions to gather more info
      
      Be conversational, professional, and encouraging. Keep response under 150 words.
    `;

    try {
      const response = await this.callGeminiAPI(contextPrompt);
      
      this.conversationHistory.push({ role: 'assistant', content: response });
      
      return {
        success: true,
        message: response,
        suggestions: this.generateSmartSuggestions(userMessage, portfolioContext),
        nextSteps: this.getNextSteps(portfolioContext),
        updates: this.extractPortfolioUpdates(userMessage, portfolioContext)
      };
    } catch (error) {
      return this.getFallbackChat(userMessage);
    }
  }

  async optimizeForSEO(portfolioData) {
    const prompt = `
      Optimize this portfolio for SEO:
      
      ${JSON.stringify(portfolioData, null, 2)}
      
      Provide SEO optimization in JSON format:
      {
        "title": "SEO-optimized title",
        "metaDescription": "Compelling meta description under 160 chars",
        "keywords": ["keyword1", "keyword2"],
        "improvements": ["specific improvement 1", "improvement 2"],
        "technicalSEO": ["technical recommendation 1", "recommendation 2"],
        "contentSuggestions": ["content suggestion 1", "suggestion 2"]
      }
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return JSON.parse(response.replace(/```json|```/g, ''));
    } catch (error) {
      return this.getFallbackSEO(portfolioData);
    }
  }

  async generateResumeContent(portfolioData) {
    const prompt = `
      Convert this portfolio data into professional resume content:
      
      ${JSON.stringify(portfolioData, null, 2)}
      
      Generate:
      1. Professional summary (3-4 lines)
      2. Formatted work experience
      3. Skills section
      4. Education recommendations
      5. Achievement highlights
      
      Make it ATS-friendly and professional.
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return { success: true, content: response };
    } catch (error) {
      return { success: false, content: "Professional resume content based on your portfolio data." };
    }
  }

  async callGeminiAPI(prompt) {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  generateSmartSuggestions(userMessage, context) {
    const suggestions = [];
    const message = userMessage.toLowerCase();
    
    if (!context.name) suggestions.push("Let's start with your name and title");
    if (!context.skills?.length) suggestions.push("Add your technical skills");
    if (!context.projects?.length) suggestions.push("Tell me about your projects");
    if (message.includes('improve')) suggestions.push("I can analyze your portfolio");
    if (message.includes('seo')) suggestions.push("Let's optimize for search engines");
    
    return suggestions.slice(0, 3);
  }

  getNextSteps(context) {
    if (!context.name) return "Add your basic information";
    if (!context.skills?.length) return "List your technical skills";
    if (!context.projects?.length) return "Add your best projects";
    return "Let's optimize and deploy your portfolio";
  }

  extractPortfolioUpdates(userMessage, context) {
    const updates = {};
    const message = userMessage.toLowerCase();
    
    // Extract name
    const nameMatch = message.match(/my name is ([a-zA-Z\s]+)/i);
    if (nameMatch) updates.name = nameMatch[1].trim();
    
    // Extract title
    const titleMatch = message.match(/i am a ([a-zA-Z\s]+)/i) || message.match(/i'm a ([a-zA-Z\s]+)/i);
    if (titleMatch) updates.title = titleMatch[1].trim();
    
    // Extract skills
    if (message.includes('skills') || message.includes('technologies')) {
      const skillKeywords = ['javascript', 'react', 'node', 'python', 'java', 'css', 'html', 'aws', 'docker'];
      const foundSkills = skillKeywords.filter(skill => message.includes(skill));
      if (foundSkills.length > 0) {
        updates.skills = [...(context.skills || []), ...foundSkills];
      }
    }
    
    return Object.keys(updates).length > 0 ? updates : null;
  }

  getFallbackAnalysis(userData) {
    return {
      profileScore: 75,
      strengths: ["Good technical foundation", "Clear project focus"],
      improvements: ["Add quantifiable achievements", "Include more project details"],
      skillGaps: ["Consider cloud technologies", "Add testing frameworks"],
      industryAdvice: "Focus on modern development practices",
      seoKeywords: ["developer", "engineer", "portfolio"],
      nextSteps: ["Optimize project descriptions", "Add contact information"]
    };
  }

  getFallbackProject(projectData) {
    return {
      success: false,
      content: `${projectData.name}: A comprehensive project showcasing ${projectData.tech} expertise with focus on scalable solutions and user experience.`,
      type: 'project'
    };
  }

  getFallbackChat(userMessage) {
    return {
      success: false,
      message: "I'm here to help you build an amazing portfolio! Tell me about your background, skills, or projects, and I'll provide personalized guidance.",
      suggestions: ["Tell me about your background", "Add your skills", "Describe your projects"],
      nextSteps: "Share your professional information"
    };
  }

  getFallbackSEO(portfolioData) {
    return {
      title: `${portfolioData.name || 'Professional'} - Portfolio`,
      metaDescription: `Professional portfolio showcasing development skills and projects.`,
      keywords: ['developer', 'portfolio', 'professional'],
      improvements: ['Add more descriptive content', 'Include industry keywords'],
      technicalSEO: ['Add meta tags', 'Optimize images', 'Improve loading speed'],
      contentSuggestions: ['Add more project details', 'Include testimonials']
    };
  }
}

export const aiAssistant = new AIPortfolioAssistant();