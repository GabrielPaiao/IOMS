# Script de instalação do PostgreSQL para Windows
# Execute como Administrador

Write-Host "🚀 Instalando PostgreSQL para IOMS..." -ForegroundColor Green
Write-Host ""

# Verificar se já está instalado
try {
    $psqlPath = Get-Command psql -ErrorAction Stop
    Write-Host "✅ PostgreSQL já está instalado em: $($psqlPath.Source)" -ForegroundColor Green
    Write-Host "Versão: $($psqlPath.Version)" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "📦 PostgreSQL não encontrado. Iniciando instalação..." -ForegroundColor Yellow
}

# URL de download do PostgreSQL
$postgresUrl = "https://get.enterprisedb.com/postgresql/postgresql-15.5-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"

Write-Host "📥 Baixando PostgreSQL 15.5..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $postgresUrl -OutFile $installerPath
    Write-Host "✅ Download concluído!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no download: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📝 Baixe manualmente de: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Instalando PostgreSQL..." -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANTE: Durante a instalação:" -ForegroundColor Yellow
Write-Host "   - Use a porta padrão: 5432" -ForegroundColor White
Write-Host "   - Defina a senha do usuário postgres como: password" -ForegroundColor White
Write-Host "   - Mantenha as outras opções padrão" -ForegroundColor White
Write-Host ""

# Iniciar instalação
try {
    Start-Process -FilePath $installerPath -Wait
    Write-Host "✅ Instalação concluída!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na instalação: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Limpar arquivo temporário
Remove-Item $installerPath -Force

Write-Host ""
Write-Host "🔄 Aguardando serviços iniciarem..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Verificar se o PostgreSQL está rodando
Write-Host "🔍 Verificando se o PostgreSQL está rodando..." -ForegroundColor Cyan
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction Stop
    if ($pgService.Status -eq "Running") {
        Write-Host "✅ Serviço PostgreSQL está rodando!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Serviço PostgreSQL não está rodando. Iniciando..." -ForegroundColor Yellow
        Start-Service $pgService
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "❌ Serviço PostgreSQL não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Instalação do PostgreSQL concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Execute: npm run db:setup" -ForegroundColor White
Write-Host "   2. Ou configure manualmente o banco" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Se precisar de ajuda:" -ForegroundColor Cyan
Write-Host "   - Verifique o arquivo DATABASE_SETUP.md" -ForegroundColor White
Write-Host "   - Ou execute: npm run db:setup" -ForegroundColor White
