import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { codeFiles, framework } = await request.json();
    
    console.log('Code files received:', Object.keys(codeFiles));
    
    // Find the main HTML file (prioritize index.html)
    let mainHtmlFile = null;
    let html = '';
    let css = '';
    let js = '';
    
    // Look for HTML files in order of preference
    const htmlPriority = ['index.html', 'home.html', 'main.html'];
    
    for (const priority of htmlPriority) {
      if (codeFiles[priority]) {
        mainHtmlFile = priority;
        break;
      }
    }
    
    // If no priority HTML found, find any HTML file
    if (!mainHtmlFile) {
      mainHtmlFile = Object.keys(codeFiles).find(file => file.endsWith('.html'));
    }
    
    // Extract content from different file types
    Object.keys(codeFiles).forEach(filePath => {
      const file = codeFiles[filePath];
      let content = '';
      
      // Handle different file structures
      if (typeof file === 'string') {
        content = file;
      } else if (file && typeof file === 'object') {
        content = file.content || '';
      }
      
      if (filePath === mainHtmlFile) {
        html = content;
      } else if (filePath.endsWith('.css')) {
        css += content + '\n';
      } else if (filePath.endsWith('.js')) {
        js += content + '\n';
      }
    });
    
    console.log('Found HTML file:', mainHtmlFile);
    console.log('HTML content length:', html.length);
    
    // If we have HTML, process it
    if (html && html.trim()) {
      // Check if HTML already has CSS/JS linked
      const hasExternalCSS = html.includes('<link') && html.includes('.css');
      const hasExternalJS = html.includes('<script') && html.includes('.js');
      
      // Inject CSS if we have it and it's not already linked
      if (css && !hasExternalCSS) {
        if (html.includes('</head>')) {
          html = html.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
        } else {
          html = `<style>\n${css}\n</style>\n${html}`;
        }
      }
      
      // Inject JS if we have it and it's not already linked
      if (js && !hasExternalJS) {
        if (html.includes('</body>')) {
          html = html.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
        } else {
          html = `${html}\n<script>\n${js}\n</script>`;
        }
      }
    } else {
      // Check if it's a React/Next.js project
      const packageJson = codeFiles['package.json'];
      let isReactProject = false;
      
      if (packageJson) {
        const packageContent = typeof packageJson === 'string' ? packageJson : packageJson.content;
        isReactProject = packageContent.includes('react') || packageContent.includes('next');
      }
      
      if (isReactProject) {
        // Generate HTML for React project
        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Preview</title>
    <style>\n${css}\n</style>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>React Portfolio Project</h1>
        <p>This is a React/Next.js project. To see the full preview, please run the development server.</p>
        <p>Files found: ${Object.keys(codeFiles).join(', ')}</p>
        <div style="margin-top: 30px; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto;">
          <h3>Project Structure:</h3>
          <ul>
            ${Object.keys(codeFiles).map(file => `<li>${file}</li>`).join('')}
          </ul>
        </div>
    </div>
    <script>\n${js}\n</script>
</body>
</html>`;
      } else {
        // Create basic HTML structure if no HTML file exists
        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Preview</title>
    <style>\n${css}\n</style>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>Portfolio Files</h1>
        <p>Available files: ${Object.keys(codeFiles).join(', ')}</p>
        <p>This appears to be a ${isReactProject ? 'React' : 'non-HTML'} project. Preview may be limited.</p>
    </div>
    <script>\n${js}\n</script>
</body>
</html>`;
      }
    }

    return NextResponse.json({
      success: true,
      html: html,
      message: mainHtmlFile ? `Preview generated from ${mainHtmlFile}` : 'Preview generated with fallback HTML',
      mainFile: mainHtmlFile,
      filesFound: Object.keys(codeFiles)
    });
  } catch (error) {
    console.error('Error generating live preview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate live preview' },
      { status: 500 }
    );
  }
}