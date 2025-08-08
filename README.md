# AI Playground - Multi-Modal AI Application

A comprehensive playground application featuring multi-modal AI capabilities including conversation analysis with speaker diarization, image analysis, and document/URL summarization.

## Features

- **🔐 User Authentication**: Secure login system for accessing AI capabilities
- **🎙️ Conversation Analysis**: Upload audio files for speech-to-text conversion with speaker diarization (up to 2 speakers)
- **🖼️ Image Analysis**: Upload images and receive detailed AI-generated descriptions
- **📄 Document/URL Summarization**: Upload PDFs/DOCs or provide URLs for concise content summaries

## Tech Stack

- **Frontend**: React with Material-UI
- **Backend**: Flask (Python)
- **AI Services**: Google Gemini API
- **Authentication**: JWT-based authentication
- **Speech Processing**: Google Speech-to-Text API + Custom Diarization

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Google Cloud account with Gemini API access

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your API keys:
```
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_KEY=your_google_cloud_key
JWT_SECRET_KEY=your_jwt_secret_key
```

5. Run the Flask server:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Usage

1. Open http://localhost:3000 in your browser
2. Register or login with your credentials
3. Select a skill from the dashboard:
   - **Conversation Analysis**: Upload audio files (WAV, MP3, M4A)
   - **Image Analysis**: Upload images (JPG, PNG, GIF)
   - **Document Summarization**: Upload PDFs/DOCs or paste URLs

## Project Structure

```
ai-playground/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── auth.py             # Authentication handlers
│   ├── skills/             # AI skill implementations
│   │   ├── conversation.py # Speech-to-text & diarization
│   │   ├── image.py        # Image analysis
│   │   └── summarization.py # Document/URL summarization
│   ├── utils/              # Utility functions
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js          # Main application
│   └── package.json        # Node dependencies
└── README.md
```

## License

MIT
