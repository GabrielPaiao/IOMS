#!/usr/bin/env bash

echo "🌱 IOMS Database Seeder"
echo "======================="
echo ""
echo "Este script irá:"
echo "1. Resetar o banco de dados"
echo "2. Executar as migrações"
echo "3. Popular com dados de teste"
echo ""

read -p "Deseja continuar? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🔄 Resetando banco de dados..."
    npx prisma migrate reset --force
    
    echo "📦 Executando migrações..."
    npx prisma migrate dev
    
    echo "🌱 Executando seed..."
    npx prisma db seed
    
    echo "✅ Processo concluído!"
    echo ""
    echo "🔐 Credenciais de teste:"
    echo "Email: admin@techsolutions.com | Senha: 123456 (ADMIN)"
    echo "Email: maria.santos@techsolutions.com | Senha: 123456 (KEY_USER)"
else
    echo "❌ Operação cancelada"
fi
