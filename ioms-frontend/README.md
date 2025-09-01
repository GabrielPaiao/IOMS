# 🎨 IOMS Frontend

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</div>

<div align="center">
  <h3>⚡ Interface moderna para gerenciamento inteligente de outages</h3>
  <p>Frontend React com design responsivo, comunicação em tempo real e UX intuitiva</p>
</div>

---

## 📋 Índice

- [Recursos](#-recursos)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Desenvolvimento](#-desenvolvimento)
- [Estrutura](#-estrutura)
- [Build](#-build)

---

## ✨ Recursos

### **🎨 Design System**
- **Interface moderna** com paleta amarelo/preto/cinza
- **Componentes reutilizáveis** padronizados
- **Design responsivo** para todos os dispositivos
- **Acessibilidade** seguindo padrões WCAG

### **📱 User Experience**
- **Dashboard interativo** com métricas em tempo real
- **Calendário visual** para visualização de outages
- **Notificações push** não-intrusivas
- **Chat integrado** com indicadores de digitação

### **🔄 Real-time Features**
- **WebSocket connection** para atualizações instantâneas
- **Live notifications** sem necessidade de refresh
- **Chat em tempo real** com histórico
- **Status updates** automáticos

---

## 🛠 Tecnologias

### **Core**
- **React 18** - Library principal
- **TypeScript** - Type safety
- **Vite 5** - Build tool moderna
- **React Router 6** - Roteamento SPA

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Componentes acessíveis
- **Heroicons** - Ícones SVG
- **Custom CSS** - Tema personalizado

---

## 📦 Instalação

### **Setup**
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar as configurações da API

# 3. Iniciar desenvolvimento
npm run dev
```

---

## ⚙️ Configuração

### **Arquivo .env**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3001

# Application
VITE_APP_NAME="IOMS"
VITE_APP_VERSION="1.0.0"
```

---

## 🚀 Desenvolvimento

### **Scripts Disponíveis**
```bash
# Desenvolvimento
npm run dev            # Servidor de desenvolvimento
npm run dev:host       # Servidor com acesso externo

# Build
npm run build          # Build para produção
npm run preview        # Preview do build

# Qualidade de Código
npm run lint           # ESLint check
npm run lint:fix       # ESLint fix
npm run type-check     # TypeScript check
```

---

## 🗂 Estrutura

```
src/
├── main.tsx                   # Entry point
├── App.tsx                    # Componente raiz
├── index.css                  # Estilos globais
├── components/                # Componentes reutilizáveis
│   ├── ui/                    # Componentes base
│   ├── layout/                # Layout components
│   ├── notifications/         # Sistema de notificações
│   └── chat/                  # Componentes de chat
├── pages/                     # Páginas da aplicação
│   ├── auth/                  # Autenticação
│   ├── dashboard/             # Dashboard
│   ├── outages/               # Gestão de outages
│   └── notifications/         # Notificações
├── context/                   # React Context providers
├── hooks/                     # Custom hooks
├── services/                  # Serviços de API
├── types/                     # Definições de tipos
└── utils/                     # Funções utilitárias
```

---

## 🏗 Build

### **Build para Produção**
```bash
# Build otimizado
npm run build

# Verificar build
npm run preview
```

---

<div align="center">
  <p><strong>🎨 Interface moderna e intuitiva para o IOMS</strong></p>
  <p><em>Desenvolvido com React, TypeScript, Tailwind CSS e Vite</em></p>
</div>

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
