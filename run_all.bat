@echo off
title NavaKrishi IoT Launcher
echo ========================================================
echo Launching NavaKrishi IoT Field Intelligence System
echo ========================================================
cd /d "%~dp0"

echo [1/2] Launching Django Backend in a new window...
start "NavaKrishi Backend (Port 8000)" cmd /k "call run_backend.bat"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React Frontend in a new window...
start "NavaKrishi Frontend (Port 5173)" cmd /k "call run_frontend.bat"

echo.
echo ========================================================
echo Both servers are launching!
echo.
echo  * Frontend Dashboard : http://localhost:5173/iot-dashboard
echo  * Backend API URL    : http://127.0.0.1:8000/api/iot/summary/
echo.
echo You can close this launcher window now.
echo ========================================================
pause
