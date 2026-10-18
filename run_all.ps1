# NavaKrishi All-In-One Launcher
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "Launching NavaKrishi IoT Field Intelligence System" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

# Launch backend in separate window
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$ScriptDir\run_backend.ps1"

Start-Sleep -Seconds 2

# Launch frontend in separate window
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$ScriptDir\run_frontend.ps1"

Write-Host ""
Write-Host "Both servers launched successfully!" -ForegroundColor Green
Write-Host "Dashboard URL : http://localhost:5173/iot-dashboard" -ForegroundColor Cyan
Write-Host "Backend API   : http://127.0.0.1:8000/api/iot/summary/" -ForegroundColor Cyan
