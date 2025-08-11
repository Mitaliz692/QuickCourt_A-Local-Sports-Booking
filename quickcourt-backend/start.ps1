$backendPath = "C:\Users\ADMIN\Downloads\Odoo\quickcourt-backend"
Set-Location $backendPath
Write-Host "Starting QuickCourt Backend Server..." -ForegroundColor Green
Write-Host "Backend Path: $backendPath" -ForegroundColor Yellow
node src/app.js
