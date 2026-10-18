# NavaKrishi React Frontend Runner
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\frontend"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting NavaKrishi React Frontend on http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

npm run dev -- --host 0.0.0.0 --port 5173
