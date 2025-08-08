# Vercel Deployment Guide

This guide will help you deploy the AI Playground application to Vercel.

## Prerequisites

1. GitHub account
2. Vercel account (linked to GitHub)
3. Required API keys:
   - Gemini API Key (from Google AI Studio)
   - LemonFox API Key
   - JWT Secret Key (generate a random string)

## Deployment Steps

### 1. Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/yourusername/ai-playground.git
   git branch -M main
   git push -u origin main
   ```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration from `vercel.json`

### 3. Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `LEMONFOX_API_KEY`: Your LemonFox API key  
- `JWT_SECRET_KEY`: A secure random string for JWT tokens

### 4. Deploy

Click "Deploy" and Vercel will:
- Build the React frontend
- Deploy the Python serverless functions
- Provide you with a live URL

## Project Structure for Vercel

```
plivo/
├── api/                    # Serverless functions
│   ├── auth.py            # Authentication endpoints
│   ├── conversation.py    # Audio analysis
│   ├── image.py          # Image analysis
│   └── summarize.py      # Document summarization
├── backend/               # Original backend (for local development)
├── frontend/              # React application
├── vercel.json           # Vercel configuration
└── requirements.txt      # Python dependencies
```

## API Endpoints (Production)

- Authentication: `/api/auth/login`, `/api/auth/register`
- Conversation Analysis: `/api/conversation`
- Image Analysis: `/api/image`
- Document Summarization: `/api/summarize`

## Local Development

For local development, use the original structure:
```bash
# Backend
cd backend
python app.py

# Frontend  
cd frontend
npm start
```

The frontend automatically detects the environment and uses the appropriate API URLs.

## Troubleshooting

1. **Build Errors**: Check that all dependencies are listed in `requirements.txt`
2. **API Errors**: Verify environment variables are set correctly in Vercel
3. **CORS Issues**: The serverless functions handle CORS automatically
4. **Memory Issues**: Large audio files may hit Vercel's limits (consider file size restrictions)

## Features Deployed

✅ User Authentication (JWT-based)
✅ Audio Transcription (LemonFox AI API)
✅ Speaker Diarization (Gemini LLM)
✅ Conversation Memory (last 5 chats)
✅ Image Analysis (Gemini Vision)
✅ Document/URL Summarization (Gemini)
✅ Responsive React UI with Material-UI
