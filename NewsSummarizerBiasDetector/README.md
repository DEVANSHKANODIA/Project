# NewsLens - Simple HTML/CSS/JS Version

A clean, simple news analysis tool built with HTML, CSS, vanilla JavaScript, and Node.js. Perfect for college projects or learning web development fundamentals.

## Features

- **Smart Summarization**: Get article summaries in different tones
- **Bias Detection**: AI-powered analysis of potential bias
- **Clean Interface**: Simple, responsive design
- **No Build Tools**: Pure HTML, CSS, and JavaScript

## Quick Start

1. **Setup**
   ```bash
   cd newslens
   npm install
   ```

2. **Environment**
   ```bash
   add ur api key with variable named GEMINI_API_KEY in system variables 
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Run**
   ```bash
   npm run dev
   ```

4. **Open** http://localhost:5000

## Get Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with Google account
3. Create new API key
4. Add to `.env` file

## Project Structure

```
newslens/
├── public/           # Frontend files
│   ├── index.html   # Main HTML page
│   ├── style.css    # All styles
│   └── script.js    # Frontend JavaScript
├── server/          # Backend
│   ├── index.js     # Express server
│   ├── routes.js    # API endpoints
│   └── services/    # AI & scraping
└── package.json     # Dependencies
```

## How It Works

1. **Frontend**: Pure HTML/CSS/JavaScript handles the user interface
2. **Backend**: Node.js/Express serves the API and handles AI requests
3. **AI**: Google Gemini API provides summarization and bias analysis
4. **Scraping**: Cheerio extracts content from news URLs

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **AI**: Google Gemini API
- **Web Scraping**: Cheerio

## College Project Ready ✓

- No complex build tools
- Easy to understand code
- Well-commented
- Responsive design
- Modern features
