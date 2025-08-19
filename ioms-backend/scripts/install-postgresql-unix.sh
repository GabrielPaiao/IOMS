#!/bin/bash

echo "🚀 Instalando PostgreSQL para IOMS..."
echo ""

# Detectar sistema operacional
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📦 Sistema Linux detectado"
    
    # Verificar se já está instalado
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL já está instalado!"
        psql --version
        exit 0
    fi
    
    # Instalar no Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        echo "📥 Instalando PostgreSQL via apt..."
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
        
        # Iniciar serviço
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
        # Configurar usuário postgres
        sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
        
    # Instalar no CentOS/RHEL
    elif command -v yum &> /dev/null; then
        echo "📥 Instalando PostgreSQL via yum..."
        sudo yum install -y postgresql postgresql-server postgresql-contrib
        
        # Inicializar banco
        sudo postgresql-setup initdb
        
        # Iniciar serviço
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
        # Configurar usuário postgres
        sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Sistema macOS detectado"
    
    # Verificar se já está instalado
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL já está instalado!"
        psql --version
        exit 0
    fi
    
    # Verificar se Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew não está instalado. Instalando..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    echo "📥 Instalando PostgreSQL via Homebrew..."
    brew install postgresql
    
    # Iniciar serviço
    brew services start postgresql
    
    # Configurar usuário postgres
    psql postgres -c "ALTER USER postgres PASSWORD 'password';"
    
else
    echo "❌ Sistema operacional não suportado: $OSTYPE"
    echo "📝 Instale manualmente o PostgreSQL"
    exit 1
fi

echo ""
echo "🎉 Instalação do PostgreSQL concluída!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Execute: npm run db:setup"
echo "   2. Ou configure manualmente o banco"
echo ""

# Verificar se está funcionando
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL está funcionando!"
    psql --version
else
    echo "❌ Erro na instalação do PostgreSQL"
    exit 1
fi
