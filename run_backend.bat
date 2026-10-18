@echo off
title NavaKrishi Django Backend
echo ========================================================
echo Starting NavaKrishi IoT Django Backend on 0.0.0.0:8000
echo ========================================================
cd /d "%~dp0"

if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe backend\manage.py runserver 0.0.0.0:8000
) else if exist "..\NavaKrishi\venv\Scripts\python.exe" (
    ..\NavaKrishi\venv\Scripts\python.exe backend\manage.py runserver 0.0.0.0:8000
) else (
    python backend\manage.py runserver 0.0.0.0:8000
)
pause
