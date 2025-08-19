@echo off
chcp 65001 >nul
echo 🚀 Instalando PostgreSQL para IOMS...
echo.

echo 📥 Baixando PostgreSQL 15.5...
echo ⚠️  IMPORTANTE: Durante a instalação:
echo    - Use a porta padrão: 5432
echo    - Defina a senha do usuário postgres como: password
echo    - Mantenha as outras opções padrão
echo.

echo 🔗 Abrindo página de download...
start https://www.postgresql.org/download/windows/

echo.
echo 📝 Após baixar e instalar:
echo    1. Execute: npm run db:setup
echo    2. Ou configure manualmente o banco
echo.

echo 🎯 Alternativa: Use o instalador oficial
echo    https://www.postgresql.org/download/windows/
echo.

pause
