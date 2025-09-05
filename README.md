# 🚀 IOMS - Intelligent Outage Management for Software

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/TypeScript-100%25-blue.svg" alt="TypeScript">
</div>

<div align="center">
  <h3>🎯 Intelligent system for software outage management</h3>
  <p>A comprehensive solution to coordinate, approve, and monitor planned software outages</p>
</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About the Project

**IOMS** (Intelligent Outage Management for Software) is a modern and intuitive platform developed for companies that need to manage software outages efficiently and in a coordinated manner.

### 🔍 **Problem Solved**
- **Chaotic coordination** of system downtimes
- **Lack of visibility** on impacts and dependencies  
- **Manual and disorganized** approval processes
- **Poor communication** between teams
- **Undetected schedule conflicts**

### ✅ **Solution Offered**
A unified platform that centralizes the entire outage management process, from planning to execution, with intelligent workflows, real-time notifications, and analytical dashboards.

---

## 🚀 Features

### 📅 **Outage Management**
- **Create and edit** outage requests
- **Visual calendar** with monthly/weekly views
- **Automatic detection** of schedule conflicts
- **Customizable templates** for different outage types
- **Complete history** of changes and approvals

### 👥 **Approval System**
- **Customizable workflows** per application
- **Multiple approval levels**
- **Batch approval** for efficiency
- **Responsibility delegation**
- **Automatic notifications** via email and system

### 💬 **Integrated Communication**
- **Real-time chat** per outage/application
- **Instant push notifications**
- **Contextual comments**
- **Mentions** and targeted alerts
- **Conversation history**

### 📊 **Analytics and Dashboards**
- **Real-time outage metrics**
- **Performance reports** per application
- **SLA and compliance indicators**
- **Trend and pattern analysis**
- **Data export**

### 🏢 **Multi-tenant**
- **Complete isolation** per company
- **User and permission management**
- **Workflow customization**
- **Organization-specific configurations**

### 🔐 **Security**
- **Robust JWT authentication**
- **Role-based authorization**
- **Sensitive data encryption**
- **Complete action auditing**
- **Rate limiting and protections**

---

## 🛠 Technologies

### **Backend**
<div align="left">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.IO">
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT">
</div>

### **Frontend**
<div align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router">
</div>

### **DevOps & Tools**
<div align="left">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint">
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git">
</div>

---

## 🏗 Architecture

```mermaid
graph TB
    subgraph "Frontend (React)"
        A[React App] --> B[Context Providers]
        B --> C[Pages & Components]
        C --> D[Services Layer]
        D --> E[WebSocket Client]
    end
    
    subgraph "Backend (NestJS)"
        F[API Gateway] --> G[Auth Module]
        F --> H[Outages Module]
        F --> I[Chat Module]
        F --> J[Notifications Module]
        G --> K[JWT Strategy]
        H --> L[Outages Service]
        I --> M[WebSocket Gateway]
        J --> N[Mail Service]
    end
    
    subgraph "Database"
        O[PostgreSQL] --> P[Prisma ORM]
    end
    
    subgraph "External Services"
        Q[Email Provider]
        R[File Storage]
    end
    
    E --> M
    D --> F
    L --> P
    N --> Q
    
    classDef frontend fill:#61DAFB,stroke:#333,stroke-width:2px,color:white
    classDef backend fill:#E0234E,stroke:#333,stroke-width:2px,color:white
    classDef database fill:#336791,stroke:#333,stroke-width:2px,color:white
    classDef external fill:#FFA500,stroke:#333,stroke-width:2px,color:white
    
    class A,B,C,D,E frontend
    class F,G,H,I,J,K,L,M,N backend
    class O,P database
    class Q,R external
```

---

## 📦 Installation

### **Prerequisites**
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- **PostgreSQL** >= 14.0.0
- **Git** for version control

### **Repository Clone**
```bash
# Clone the project
git clone https://github.com/GabrielPaiao/IOMS.git

# Enter the directory
cd IOMS
```

### **Backend Setup**
```bash
# Enter the backend directory
cd ioms-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Configure database connection in .env file
# DATABASE_URL="postgresql://username:password@localhost:5432/ioms"

# Run database migrations
npx prisma migrate dev

# Generate initial data seeds
npx prisma db seed
```

### **Frontend Setup**
```bash
# Enter the frontend directory (in another terminal)
cd ioms-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Configure API URL in .env file
# VITE_API_BASE_URL=http://localhost:3000/api
```

---

## ⚙️ Configuration

### **Environment Variables - Backend**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ioms"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"

# Email
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"

# Application
NODE_ENV="development"
PORT=3000
```

### **Environment Variables - Frontend**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3000

# Application
VITE_APP_NAME="IOMS"
VITE_APP_VERSION="1.0.0"
```

---

## 🚀 Usage

### **Development**
```bash
# Terminal 1 - Backend
cd ioms-backend
npm run start:dev

# Terminal 2 - Frontend
cd ioms-frontend
npm run dev
```

### **Application Access**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **WebSocket**: ws://localhost:3000/chat

### **First Run**
1. **Admin Registration**: Go to `/register` to create the first administrator user
2. **Initial Setup**: Configure your company and applications
3. **User Invitation**: Invite team members through the interface
4. **First Outage**: Create your first outage request

### **Typical Workflow**
1. **Dev/Key User** creates an outage request
2. **System** automatically detects conflicts
3. **Approvers** receive notifications
4. **Chat** enables real-time discussion
5. **Dashboard** monitors status and metrics

---

## 📚 API Documentation

### **Main Endpoints**

#### **Authentication**
```http
POST /api/auth/login
POST /api/auth/register/admin
POST /api/auth/refresh-token
GET  /api/auth/me
```

#### **Outages**
```http
GET    /api/outages              # List outages
POST   /api/outages              # Create outage
GET    /api/outages/:id          # Outage details
PATCH  /api/outages/:id          # Update outage
DELETE /api/outages/:id          # Delete outage
PATCH  /api/outages/:id/approve  # Approve outage
PATCH  /api/outages/:id/reject   # Reject outage
```

#### **Applications**
```http
GET    /api/applications         # List applications
POST   /api/applications         # Create application
GET    /api/applications/:id     # Application details
PATCH  /api/applications/:id     # Update application
```

#### **Chat**
```http
GET    /api/chat/conversations   # List conversations
POST   /api/chat/conversations   # Create conversation
POST   /api/chat/messages        # Send message
```

#### **WebSocket Events**
```javascript
// Connect to WebSocket
const socket = io('ws://localhost:3000/chat');

// Available events
socket.emit('conversation:join', { conversationId });
socket.emit('message:send', { conversationId, content });
socket.on('message:received', (message) => {});
socket.on('user:typing', (data) => {});
```

### **API Authentication**
```javascript
// Required headers
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

---

## 🤝 Contributing

### **How to Contribute**

1. **Fork** the project
2. **Clone** your fork: `git clone https://github.com/your-username/IOMS.git`
3. **Create** a branch: `git checkout -b feature/new-feature`
4. **Commit** your changes: `git commit -m 'feat: add new feature'`
5. **Push** to branch: `git push origin feature/new-feature`
6. **Open** a Pull Request

### **Commit Standards**
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: refactoring
test: tests
chore: build/config tasks
```

### **Project Structure**
```
IOMS/
├── ioms-backend/           # NestJS API
│   ├── src/
│   │   ├── auth/          # Authentication
│   │   ├── outages/       # Outage management
│   │   ├── chat/          # Real-time chat
│   │   ├── applications/  # Application management
│   │   └── shared/        # Shared modules
│   └── prisma/            # Database schema
├── ioms-frontend/         # React App
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API services
│   │   └── context/       # Context Providers
└── docs/                  # Documentation
```

---

## 🗺 Roadmap

### **Version 1.1**
- [ ] **Mobile App** (React Native)
- [ ] **API v2** with GraphQL
- [ ] **Slack/Teams Integration**
- [ ] **Advanced Reports**

### **Version 1.2**
- [ ] **Multi-language** (i18n)
- [ ] **Customizable Themes**
- [ ] **LDAP/SSO Integration**
- [ ] **Webhooks** for integrations

### **Version 2.0**
- [ ] **Microservices** architecture
- [ ] **Kubernetes** deployment
- [ ] **Machine Learning** for predictions
- [ ] **Advanced API Gateway**

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## 👨‍💻 Contact

<div align="center">

**Gabriel Pereira Paião**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)]([https://linkedin.com/in/gabrielpaiao](https://www.linkedin.com/in/gabriel-paiao-analise-desenvolvimento-sistemas/))
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GabrielPaiao)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:bielpaiao8@email.com)

**São Paulo, Brazil • 2025**

</div>

---

<div align="center">
  <p><strong>🚀 Developed with ❤️ to optimize software outage management</strong></p>
  <p><em>If this project was useful to you, consider giving it a ⭐!</em></p>
</div>
