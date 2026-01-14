# CSIR-SERC Project Management Portal

<p align="center">
  <img src="https://www.serc.res.in/assets/image/serc-logo-head.png" alt="CSIR-SERC Logo" width="200"/>
</p>

<p align="center">
  <strong>A comprehensive web-based Project Management System for CSIR-Structural Engineering Research Centre</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-documentation">API</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 🆕 Recent Updates (January 2026)

### New Features
- **Project Edit Modal** - Edit project details directly from project detail page
- **Chart Export** - Export dashboard and report charts as PNG images
- **Project Journal** - New "Journal" tab for project comments and notes
- **Profile Link** - Quick access to user profile from dropdown menu

### Bug Fixes
- Fixed budget request project selector not loading projects
- Fixed TypeScript configuration for Vite imports
- Fixed rate limiter X-Forwarded-For error behind nginx proxy
- Fixed API_BASE fallback URLs for production environment

### Backend Improvements
- Added `ProjectComment` model for project journals
- Added comment API routes (GET/POST/DELETE)
- Added validate:false to rate limiter for proxy compatibility
- Improved trust proxy configuration

---

## 📋 Overview

The **CSIR-SERC Project Management Portal** is a full-stack web application designed to streamline the management of research projects at the Council of Scientific and Industrial Research - Structural Engineering Research Centre, Chennai. It provides end-to-end project lifecycle management with features tailored for research institutions.

## ✨ Features

### 📊 Project Management
- **Multi-Category Support**: Track Grant-in-Aid (GAP), Consultancy (CNP), and Other Lab Projects (OLP)
- **Milestone Tracking**: Define and monitor project milestones with progress indicators
- **Gantt Charts**: Interactive timeline visualization using DHTMLX Gantt
- **Staff Assignment**: Assign project heads and team members with role-based access

### 💰 Financial Management
- **Budget Allocation**: Manage budgets by fiscal year and category
- **Expense Tracking**: Record expenses with receipt uploads and vendor details
- **Multi-Currency Support**: Handle transactions in INR and USD with real-time exchange rates
- **Cash Flow Monitoring**: Track money received and utilized

### 📁 Document Management
- **Secure File Storage**: Upload and manage project documents up to 50MB
- **Version Control**: Track document versions with SHA-256 integrity verification
- **Multiple Document Types**: Support for reports, photos, videos, MoUs, and more
- **Access Control**: Document-level permissions based on user roles

### 📅 Research Council (RC) Meetings
- **Meeting Scheduling**: Plan and organize RC meetings
- **Agenda Management**: Create and manage meeting agendas
- **Minutes Recording**: Record and version meeting minutes
- **Project Reviews**: Track project discussions and action items

### 👥 User & Staff Management
- **Role-Based Access Control**: 6 user roles (Admin, Director, Supervisor, Project Head, Employee, External)
- **Two-Factor Authentication**: Enhanced security with TOTP-based 2FA
- **Audit Logging**: Comprehensive activity tracking for compliance

### 📈 Analytics & Reporting
- **Real-time Dashboard**: Visual overview of project statistics and financials
- **Custom Reports**: Generate project status and financial reports
- **Deadline Alerts**: Automated notifications for approaching deadlines
- **MoU Expiry Warnings**: Proactive alerts for expiring agreements

### 🔔 Real-time Notifications
- **WebSocket Integration**: Instant updates using Socket.IO
- **In-app Notifications**: Alerts for deadlines, budget warnings, and updates
- **Email Notifications**: SMTP-based email delivery for important events

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥22.0.0 | JavaScript runtime |
| Express.js | 4.21.2 | Web framework |
| TypeScript | 5.7.2 | Type-safe development |
| Prisma | 6.1.0 | ORM & database toolkit |
| PostgreSQL | Latest | Relational database |
| Socket.IO | 4.8.1 | Real-time communication |
| Argon2 | 0.41.1 | Password hashing |
| Zod | 3.24.1 | Schema validation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| Vite | 6.0.5 | Build tool |
| TypeScript | 5.6.2 | Type safety |
| Fluent UI | 9.56.5 | Microsoft design system |
| Tailwind CSS | 3.4.17 | Utility-first CSS |
| Zustand | 5.0.2 | State management |
| Chart.js | 4.4.7 | Data visualization |
| DHTMLX Gantt | 8.0.10 | Project timelines |

---

## 🚀 Installation

### Prerequisites
- **Node.js** ≥ 22.0.0
- **PostgreSQL** database
- **npm** or **yarn**

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables in .env
# (Database URL, JWT secrets, SMTP settings, etc.)

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## ⚙️ Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/serc_portal

# JWT Authentication
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=CSIR-SERC Portal <noreply@serc.res.in>

# Currency API (Optional)
CURRENCY_API_KEY=your-api-key
CURRENCY_API_URL=https://api.freecurrencyapi.com/v1/latest

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Two-Factor Authentication
TWO_FA_ISSUER=CSIR-SERC Portal
```

---

## 🔐 Default Credentials

After seeding the database, you can login with the following accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@serc.res.in | Admin@SERC2024 |
| Director | director@serc.res.in | Director@SERC2024 |
| Supervisor | supervisor@serc.res.in | Supervisor@SERC2024 |
| Project Head | pi@serc.res.in | PI@SERC2024 |

> ⚠️ **Important**: Change these passwords immediately in a production environment!

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| GET | `/auth/me` | Get current user |

### Project Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects |
| POST | `/projects` | Create new project |
| GET | `/projects/:id` | Get project details |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| GET | `/projects/:id/milestones` | List milestones |
| POST | `/projects/:id/milestones` | Create milestone |

### Finance Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/finance/budgets` | List budgets |
| POST | `/finance/budgets` | Create budget |
| GET | `/finance/expenses` | List expenses |
| POST | `/finance/expenses` | Create expense |
| GET | `/finance/currency-rate` | Get exchange rate |

### Document Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents` | List documents |
| POST | `/documents/upload` | Upload document |
| GET | `/documents/:id` | Download document |
| DELETE | `/documents/:id` | Delete document |

---

## 🏗 Project Structure

```
csir-serc-portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── index.ts           # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── layouts/           # Page layouts
│   │   ├── pages/             # Route components
│   │   ├── services/          # API services
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx            # Main app component
│   └── package.json
└── README.md
```

---

## 🔒 Security Features

- **JWT Authentication**: Short-lived access tokens (15 min) with refresh token rotation
- **Argon2 Password Hashing**: Industry-standard secure password storage
- **Two-Factor Authentication**: TOTP-based 2FA support
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Restricted to frontend origin
- **Helmet.js**: Secure HTTP headers
- **Input Validation**: Zod schema validation on all inputs
- **Role-Based Access Control**: Granular permission system
- **Audit Logging**: Complete activity tracking

---

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

### Docker (Coming Soon)

Docker support is planned for future releases.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software developed for CSIR-SERC. Unauthorized copying, modification, or distribution is strictly prohibited.

---

## 📞 Support

For technical support or feature requests, please contact:

- **Email**: ictserc@gmail.com
- **Organization**: CSIR-Structural Engineering Research Centre, Chennai

---

<p align="center">
  Made with ❤️ for CSIR-SERC
</p>
