@echo off
echo ====================================
echo Starting AI Playground Application
echo ====================================
echo.

echo Starting Backend Server...
start cmd /k "cd backend && venv\Scripts\activate && python app.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Application...
start cmd /k "cd frontend && npm start"

echo.
echo ====================================
echo Application Starting...
echo ====================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo The browser should open automatically.
echo If not, navigate to http://localhost:3000
echo.
pause
