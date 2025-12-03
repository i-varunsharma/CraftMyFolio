"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { generatePortfolioContent, generatePortfolioStructure } from "../../utils/gemini";

export default function AIAgent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your AI Portfolio Assistant. I'll help you create an amazing portfolio. Let's start by telling me about yourself - your profession, skills, and what you'd like to showcase.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Call Gemini API
      const aiContent = await generatePortfolioContent(inputMessage);
      const aiResponse = {
        id: Date.now() + 1,
        type: "ai",
        content: aiContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "I'm having trouble connecting right now. Let me give you some general guidance based on what you've shared.";
      
      // Provide more specific error messages
      if (error.message.includes('API key')) {
        errorMessage = "There seems to be an API configuration issue. Let me help you with some general portfolio guidance instead.";
      } else if (error.message.includes('Empty response')) {
        errorMessage = "I'm experiencing some connectivity issues, but I can still help you plan your portfolio structure.";
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        type: "ai",
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput) => {
    const responses = [
      "That's great! Based on what you've told me, I can help you create a portfolio that highlights your unique strengths. What specific projects would you like to showcase?",
      "Excellent! I'm analyzing your requirements. Would you like me to suggest some design themes that would work well for your profession?",
      "Perfect! I can see you have impressive experience. Let me help you organize this into compelling portfolio sections. Should we start with your hero section?",
      "Wonderful! I'm processing your information to create a personalized portfolio structure. What's your preferred color scheme or style preference?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleCreatePortfolio = async () => {
    setIsLoading(true);
    try {
      const portfolioStructure = await generatePortfolioStructure(messages);
      localStorage.setItem('generatedPortfolio', JSON.stringify(portfolioStructure));
      
      const successMessage = {
        id: Date.now(),
        type: "ai",
        content: "🎉 Perfect! I've generated your portfolio structure. You can now preview and customize it!",
        timestamp: new Date(),
        isSuccess: true
      };
      setMessages(prev => [...prev, successMessage]);
      setIsLoading(false);
      
      // Redirect to portfolio preview
      setTimeout(() => {
        router.push('/portfolio-preview');
      }, 2000);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      const errorMessage = {
        id: Date.now(),
        type: "ai",
        content: "I encountered an issue generating your portfolio. Let's continue our conversation to gather more details.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "I'm a software developer",
    "I'm a designer", 
    "I'm a data scientist",
    "I'm a marketing professional"
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100 font-sans relative overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="200" cy="200" r="2" fill="#3b82f6" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="800" cy="300" r="2" fill="#6366f1" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-4 flex justify-between items-center px-6 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI Portfolio Assistant</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">AI Online</span>
          </div>
          {user.profilePic ? (
            <img 
              src={user.profilePic} 
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                  {message.type === 'user' ? (
                    <span className="text-white text-sm font-bold">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-6 py-4 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isSuccess
                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-gray-100'
                    : 'bg-gray-800/60 border border-gray-700/50 text-gray-100'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl px-6 py-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt)}
                  className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-full text-sm text-gray-300 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-6 border-t border-gray-800/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Tell me about your profession, skills, projects..."
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-2xl px-6 py-4 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 resize-none min-h-[60px] max-h-32"
                  rows="1"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={handleCreatePortfolio}
                  disabled={messages.length < 3}
                  className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Create Portfolio
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}