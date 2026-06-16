@echo off
echo ============================================
echo  Lost In Frame Production - AI Marketing OS
echo ============================================
echo.

echo [1/3] Starting Backend (FastAPI)...
cd backend
start "LIF Backend" cmd /k "pip install -r requirements.txt -q && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..

echo [2/3] Starting Frontend (Vite)...
cd frontend
start "LIF Frontend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo [3/3] System starting...
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Ensure Ollama is running: ollama serve
echo Models needed: ollama pull qwen3:8b
echo               ollama pull llama3.2:3b
echo.
pause
