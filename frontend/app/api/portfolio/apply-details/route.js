import { NextResponse } from 'next/server';
import { codeAnalyzer } from '../../../../utils/codeAnalyzer.js';
import { updatePortfolio } from '../../../../lib/portfolioStore.js';

export async function POST(request) {
  try {
    const { portfolioId, userDetails, codeFiles } = await request.json();
    
    // Get the portfolio to check its type
    const { getPortfolioById } = await import('../../../../lib/portfolioStore.js');
    const portfolio = getPortfolioById(parseInt(portfolioId));
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }
    
    let updatedContent;
    
    if (portfolio.type === 'template-based') {
      // Update template content directly
      updatedContent = {
        ...portfolio.content,
        name: userDetails.name || portfolio.content.name,
        title: userDetails.title || portfolio.content.title,
        about: userDetails.about || portfolio.content.about,
        contact: {
          ...portfolio.content.contact,
          email: userDetails.contact?.email || portfolio.content.contact?.email,
          github: userDetails.contact?.github || portfolio.content.contact?.github,
          linkedin: userDetails.contact?.linkedin || portfolio.content.contact?.linkedin
        }
      };
      
      // Update portfolio in store
      const updatedPortfolio = updatePortfolio(parseInt(portfolioId), {
        content: updatedContent,
        userDetails: userDetails,
        lastModified: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: true,
        message: 'Portfolio updated successfully',
        updatedContent: updatedContent
      });
    } else {
      // Handle code-based portfolios (existing logic)
      const updatedFiles = {};
      
      Object.keys(codeFiles).forEach(filePath => {
        let content = codeFiles[filePath].content || codeFiles[filePath];
        
        // Replace template variables with user details
        content = content.replace(/{{NAME}}/g, userDetails.name || 'Your Name');
        content = content.replace(/{{TITLE}}/g, userDetails.title || 'Developer');
        content = content.replace(/{{BIO}}/g, userDetails.about || 'About me description');
        content = content.replace(/{{EMAIL}}/g, userDetails.contact?.email || 'your@email.com');
        content = content.replace(/{{GITHUB}}/g, userDetails.contact?.github || 'yourgithub');
        
        updatedFiles[filePath] = {
          content: content,
          type: codeFiles[filePath].type || 'file',
          modified: true
        };
      });
      
      // Update portfolio in store
      const updatedPortfolio = updatePortfolio(parseInt(portfolioId), {
        codeFiles: updatedFiles,
        userDetails: userDetails,
        lastModified: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: true,
        message: 'User details applied to code successfully',
        updatedFiles: updatedFiles
      });
    }

    if (!updatedPortfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User details applied to code successfully',
      updatedFiles: updatedFiles,
      modifiedCount: Object.values(updatedFiles).filter(f => f.modified).length
    });
  } catch (error) {
    console.error('Error applying user details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply user details to code' },
      { status: 500 }
    );
  }
}