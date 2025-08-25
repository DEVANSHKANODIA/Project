import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeArticle, validateUrl } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Check for API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('⚠️  GEMINI_API_KEY environment variable is not set!');
  console.error('📝 Please create a .env file with your Gemini API key:');
  console.error('   GEMINI_API_KEY=your_api_key_here');
  console.error('🔗 Get your API key from: https://ai.google.dev/');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS headers for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.post('/api/analyze', analyzeArticle);
app.post('/api/validate-url', validateUrl);

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 NewsLens server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view the app`);
});