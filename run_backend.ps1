# NavaKrishi Django Backend Runner
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "========================================================" -ForegroundColor Green
Write-Host "Starting NavaKrishi IoT Django Backend on 0.0.0.0:8000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

if (Test-Path "$ScriptDir\venv\Scripts\python.exe") {
    & "$ScriptDir\venv\Scripts\python.exe" "$ScriptDir\backend\manage.py" runserver 0.0.0.0:8000
} elseif (Test-Path "c:\Users\pro\OneDrive\Desktop\NavaKrishi\venv\Scripts\python.exe") {
    & "c:\Users\pro\OneDrive\Desktop\NavaKrishi\venv\Scripts\python.exe" "$ScriptDir\backend\manage.py" runserver 0.0.0.0:8000
} else {
    python "$ScriptDir\backend\manage.py" runserver 0.0.0.0:8000
}
