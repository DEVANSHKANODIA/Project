import * as cheerio from 'cheerio';

export async function extractArticleContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try multiple selectors for title
    let title = $('h1').first().text().trim() ||
                $('title').text().trim() ||
                $('[property="og:title"]').attr('content') ||
                'Untitled Article';

    // Remove site name from title if present
    title = title.split(' - ')[0].split(' | ')[0].trim();

    // Try multiple selectors for content
    let content = '';
    
    // Common article content selectors
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.article-body',
      'main',
      '.content'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Remove unwanted elements
        element.find('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share').remove();
        
        const text = element.text().trim();
        if (text.length > content.length) {
          content = text;
        }
      }
    }

    // Fallback: get all paragraph text
    if (!content || content.length < 200) {
      content = $('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (!content || content.length < 100) {
      throw new Error('Could not extract sufficient article content from the provided URL');
    }

    return { title, content };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Could not extract')) {
      throw error;
    }
    throw new Error(`Failed to extract article content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
