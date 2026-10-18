@echo off
title NavaKrishi React Frontend
echo ========================================================
echo Starting NavaKrishi Vite Frontend on http://localhost:5173
echo ========================================================
cd /d "%~dp0frontend"

npm run dev -- --host 0.0.0.0 --port 5173
pause
