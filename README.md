# Pancka Creations ERP System

A robust, SRS-compliant Enterprise Resource Planning (ERP) system designed for T-shirt e-commerce operations. This application features a secure, scalable architecture with a React frontend, Node.js/Express backend, and PostgreSQL database.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success) ![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue)

---

## 🚀 Key Features

### 🏢 Core ERP Modules
*   **Dashboard**: Real-time business intelligence with revenue charts, order tracking, and lead conversion metrics.
*   **Lead Management**: Comprehensive CRM flow tracking (New -> Contacted -> Qualified -> Won).
    *   *SRS Compliance*: Leads contain detailed attributes (Company, Contact Person, Lead Type for discounts).
    *   *Validation*: Strict 6-digit PIN validation and Indian mobile number format checks.
*   **Sales & Orders**: 
    *   **Quotations**: Generate PDF quotations with tax and discount logic.
    *   **Orders**: Convert won leads into orders; tracks payments and shipping status.
    *   **Invoices**: Professional invoice generation with authorized signatures.
*   **Inventory Management**:
    *   **Stock Tracking**: Real-time stock visibility with Low Stock alerts.
    *   **Transaction History**: Complete audit trail of every stock movement (Initial Stock, Sales Deduction, Manual Adjustment).
    *   **Adjustment**: Manual stock correction interface with explanatory notes.

### 🛡️ Security & Administration
*   **Role-Based Access Control (RBAC)**: secure access for `Super Admin`, `Admin`, and `Employee` roles.
*   **Audit Logs**: (Super Admin Only) Detailed immutable logs of all critical system actions (Who, What, When, IP Address).
*   **Authentication**: Secure JWT-based session management.

---

## 🛠️ Technology Stack

### Client (Frontend)
*   **Framework**: React (Vite)
*   **Styling**: Custom CSS (Glassmorphism design system)
*   **State Management**: Context API (`CRMContext.tsx`, `AuthContext.tsx`)
*   **Routing**: React Router DOM
*   **PDF Generation**: `jspdf` & `jspdf-autotable`

### Server (Backend)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **ORM**: Drizzle ORM
*   **Validation**: Zod (via Drizzle schemas)
*   **Security**: `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`

### Database
*   **Database**: PostgreSQL
*   **Migration Tool**: Drizzle Kit

---

## 🏗️ Project Structure

```bash
pancka-crm/
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Global State (Auth, CRM Data)
│   │   ├── pages/          # Application Routes (Leads, Products, etc.)
│   │   ├── utils/          # Helpers (PDF, Date Formatting)
│   │   └── styles/         # Global CSS Themes
│   └── vite.config.js
│
├── server/                 # Backend API
│   ├── controllers/        # Business Logic Modules
│   ├── db/                 # Database Config, Schema, Migrations
│   ├── middlewares/        # Auth & Error Handling
│   ├── routes/             # API Endpoint Definitions
│   └── server.js           # Entry Point
```

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database

### 1. Database Setup
Ensure PostgreSQL is running and create a database (e.g., `pancka_crm`).

### 2. Backend Configuration
Navigate to the server directory and install dependencies:
```bash
cd pancka-crm/server
npm install
```

Create a `.env` file in `pancka-crm/server`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/pancka_crm
JWT_SECRET=your_secure_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```

Run Database Migrations & Seed Data:
```bash
# Push schema to database
npx drizzle-kit push

# Seed initial Super Admin account
npm run seed
```

Start the Server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the client directory and install dependencies:
```bash
cd pancka-crm/client
npm install
```

Start the Client:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📖 API Documentation (Key Endpoints)

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/login` | User login & token generation |
| **Leads** | GET | `/api/leads` | Fetch all leads |
| **Products** | POST | `/api/products` | Create product (auto-initializes inventory) |
| **Inventory** | GET | `/api/inventory` | Fetch transaction logs |
| **Audit** | GET | `/api/audit` | Fetch system audit logs (Super Admin) |

---

## 🔐 Default Credentials (Seed)

*   **Email**: `admin@panckacreations.com`
*   **Password**: [As configured in seed script]

---

**© 2024 Pancka Creations**
