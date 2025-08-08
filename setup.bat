@echo off
echo ====================================
echo AI Playground Setup Script
echo ====================================
echo.

echo Setting up Frontend...
echo ---------------------
cd frontend
echo Installing Node dependencies...
npm install

echo.
echo Frontend setup complete!
echo.

echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo IMPORTANT: Before running the application:
echo 1. Get your Gemini API key from: https://makersuite.google.com/app/apikey
echo 2. Edit backend/.env and add your GEMINI_API_KEY
echo.
echo To run the application:
echo - Backend: cd backend && venv\Scripts\activate && python app.py
echo - Frontend: cd frontend && npm start
echo.
pause
