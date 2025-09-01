# IOMS Database Seeder for Windows
Write-Host "🌱 IOMS Database Seeder" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""
Write-Host "Este script irá:" -ForegroundColor Yellow
Write-Host "1. Resetar o banco de dados" -ForegroundColor Yellow
Write-Host "2. Executar as migrações" -ForegroundColor Yellow
Write-Host "3. Popular com dados de teste" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Deseja continuar? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "🔄 Resetando banco de dados..." -ForegroundColor Blue
    npx prisma migrate reset --force
    
    Write-Host "📦 Executando migrações..." -ForegroundColor Blue
    npx prisma migrate dev
    
    Write-Host "🌱 Executando seed..." -ForegroundColor Blue
    npx prisma db seed
    
    Write-Host "✅ Processo concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔐 Credenciais de teste:" -ForegroundColor Cyan
    Write-Host "Email: admin@techsolutions.com | Senha: 123456 (ADMIN)" -ForegroundColor White
    Write-Host "Email: maria.santos@techsolutions.com | Senha: 123456 (KEY_USER)" -ForegroundColor White
}
else {
    Write-Host "❌ Operação cancelada" -ForegroundColor Red
}
