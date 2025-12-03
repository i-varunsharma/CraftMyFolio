import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { content, style } = await request.json();
    
    // Generate HTML preview based on content and style
    const htmlPreview = generateHTMLPreview(content, style);
    
    return NextResponse.json({ 
      success: true, 
      html: htmlPreview 
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

function generateHTMLPreview(content, style = 'modern') {
  const { name, title, about, skills, projects, contact } = content;
  
  const styles = {
    modern: {
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      textColor: '#ffffff',
      accentColor: '#4f46e5'
    },
    minimal: {
      bg: '#ffffff',
      cardBg: '#f8fafc',
      textColor: '#1f2937',
      accentColor: '#3b82f6'
    },
    dark: {
      bg: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      cardBg: 'rgba(55, 65, 81, 0.5)',
      textColor: '#f9fafb',
      accentColor: '#10b981'
    }
  };
  
  const currentStyle = styles[style] || styles.modern;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${name || 'Portfolio'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: ${currentStyle.bg};
          color: ${currentStyle.textColor};
          line-height: 1.6;
          min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; }
        .name { font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem; }
        .title { font-size: 1.5rem; opacity: 0.8; margin-bottom: 1rem; }
        .section { 
          background: ${currentStyle.cardBg}; 
          backdrop-filter: blur(10px);
          border-radius: 1rem; 
          padding: 2rem; 
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .section h2 { 
          color: ${currentStyle.accentColor}; 
          margin-bottom: 1rem; 
          font-size: 1.5rem;
        }
        .skills { display: flex; flex-wrap: gap; gap: 0.5rem; }
        .skill { 
          background: ${currentStyle.accentColor}; 
          color: white; 
          padding: 0.5rem 1rem; 
          border-radius: 2rem; 
          font-size: 0.9rem;
        }
        .projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .project { 
          background: rgba(255, 255, 255, 0.05); 
          padding: 1.5rem; 
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .project h3 { color: ${currentStyle.accentColor}; margin-bottom: 0.5rem; }
        @media (max-width: 768px) {
          .name { font-size: 2rem; }
          .container { padding: 1rem; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1 class="name">${name || 'Your Name'}</h1>
          <p class="title">${title || 'Your Professional Title'}</p>
        </header>
        
        ${about ? `
        <section class="section">
          <h2>About Me</h2>
          <p>${about}</p>
        </section>
        ` : ''}
        
        ${skills && skills.length > 0 ? `
        <section class="section">
          <h2>Skills</h2>
          <div class="skills">
            ${skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </section>
        ` : ''}
        
        ${projects && projects.length > 0 ? `
        <section class="section">
          <h2>Projects</h2>
          <div class="projects">
            ${projects.map(project => `
              <div class="project">
                <h3>${project.name || 'Project Name'}</h3>
                <p>${project.description || 'Project description'}</p>
                ${project.tech ? `<p><strong>Tech:</strong> ${project.tech}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}
        
        ${contact ? `
        <section class="section">
          <h2>Contact</h2>
          <p>Email: ${contact.email || 'your.email@example.com'}</p>
          ${contact.phone ? `<p>Phone: ${contact.phone}</p>` : ''}
          ${contact.linkedin ? `<p>LinkedIn: ${contact.linkedin}</p>` : ''}
          ${contact.github ? `<p>GitHub: ${contact.github}</p>` : ''}
        </section>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}