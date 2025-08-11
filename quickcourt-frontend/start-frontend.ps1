$frontendPath = "C:\Users\ADMIN\Downloads\Odoo\quickcourt-frontend"
Set-Location $frontendPath
Write-Host "Starting QuickCourt Frontend Server..." -ForegroundColor Green
Write-Host "Frontend Path: $frontendPath" -ForegroundColor Yellow
npm start
