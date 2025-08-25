import { summarizeArticle, analyzeBias, calculateReadingTime } from './services/gemini.js';
import { extractArticleContent } from './services/scraper.js';

export async function analyzeArticle(req, res) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        message: 'API key not configured. Please add GEMINI_API_KEY to your .env file.' 
      });
    }

    const { content, tone, url } = req.body;
    
    if (!content && !url) {
      return res.status(400).json({ message: 'Content or URL is required' });
    }
    
    if (!['neutral', 'facts', 'simple'].includes(tone)) {
      return res.status(400).json({ message: 'Invalid tone. Must be neutral, facts, or simple' });
    }

    let articleContent = content;
    let title = undefined;

    // If URL is provided, extract content
    if (url) {
      try {
        const extracted = await extractArticleContent(url);
        articleContent = extracted.content;
        title = extracted.title;
      } catch (error) {
        return res.status(400).json({ 
          message: `Failed to extract content from URL: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    }

    // Validate content length
    if (articleContent.length < 100) {
      return res.status(400).json({ 
        message: 'Article content must be at least 100 characters' 
      });
    }

    // Generate summary and bias analysis
    const [summary, biasAnalysis] = await Promise.all([
      summarizeArticle(articleContent, tone),
      analyzeBias(articleContent)
    ]);

    const readingTime = calculateReadingTime(articleContent);

    const result = {
      summary,
      biasAnalysis,
      readingTime,
      title
    };

    res.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to analyze article" 
    });
  }
}

export async function validateUrl(req, res) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Try to fetch and extract basic info
    const extracted = await extractArticleContent(url);
    
    res.json({ 
      valid: true, 
      title: extracted.title,
      contentLength: extracted.content.length
    });
  } catch (error) {
    res.status(400).json({ 
      valid: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}