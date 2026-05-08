<div align="center">

# LeadGen CRM

A full-stack Customer Relationship Management system built for small sales teams — manage leads, track pipelines, collaborate on opportunities, and close more deals.

<p align="center">
  <img src="./frontend/public/leadgen.png" alt="LeadGen Logo" width="600">
</p>

![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens)

</div>

---

## Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Features Implemented](#-features-implemented)
- [How to Run Locally](#-how-to-run-locally)
- [Environment Variables](#-environment-variables)
- [Test Login Credentials](#-test-login-credentials)
- [Database Setup](#-database-setup)
- [Known Limitations](#-known-limitations)
- [Reflection](#-reflection)
- [Demo Video](#-demo-video)

---

## Project Overview

LeadGen CRM is a production-ready Customer Relationship Management system built as a full-stack intern assessment. It provides a streamlined interface for sales teams to manage the full lifecycle of a lead — from first contact through to a closed deal.

The system supports two user roles with distinct permissions: **Admins** who oversee the entire pipeline and manage the sales team, and **Salespersons** who manage their own assigned leads. Every status transition is tracked historically, giving managers visibility into pipeline velocity and bottlenecks.

**Live Demo:** [https://leadgen-crm-plum.vercel.app/login](https://leadgen-crm-plum.vercel.app)

> Login with the test credentials below — no account creation needed.

---

## Tech Stack

### Frontend

| Layer                | Technology                             |
| :------------------- | :------------------------------------- |
| **Framework**        | Next.js 14 (App Router)                |
| **State Management** | Zustand (auth state)                   |
| **Styling**          | Tailwind CSS with custom design system |
| **UI Components**    | Shadcn/UI                              |
| **Validation**       | Manual Frontend + Backend validator    |
| **Charts**           | Recharts                               |
| **Drag & Drop**      | @hello-pangea/dnd                      |
| **Icons**            | Lucide React                           |

### Backend

| Layer              | Technology                                |
| :----------------- | :---------------------------------------- |
| **Framework**      | NestJS                                    |
| **ORM**            | Prisma                                    |
| **Authentication** | JWT (Access + Refresh Token flow)         |
| **Security**       | Bcrypt password hashing, HttpOnly cookies |
| **Validation**     | Class-validator + Class-transformer       |

### Database & Infrastructure

| Layer             | Technology                                   |
| :---------------- | :------------------------------------------- |
| **Database**      | PostgreSQL (Local) / **Neon DB** (Production) |
| **Backend Host**  | **AWS EC2 (t3.micro)** + Nginx Proxy         |
| **Frontend Host** | **Vercel**                                   |
| **SSL/TLS**       | Let's Encrypt (Certbot)                      |
| **DNS**           | DuckDNS                                      |

---

## ✨ Features Implemented

### Authentication

- Secure JWT-based login with access token (15 min) and refresh token (7 days)
- Refresh tokens stored in HttpOnly cookies — never exposed to JavaScript
- Automatic silent token refresh via Axios interceptor
- Role-based access control — `ADMIN` and `SALESPERSON` roles with separate permissions

### Lead Management

- Full CRUD — create, view, edit, and delete leads
- Every lead captures: Name, Company, Email, Phone, Source, Assigned Salesperson, Status, Deal Value, Created Date, and Last Updated Date
- Role-aware lead creation — Admins assign leads to any salesperson; Salespersons are auto-assigned their own leads
- Lead status transitions: `NEW → CONTACTED → QUALIFIED → PROPOSAL SENT → WON / LOST`

### Lead Status History

- Every status change is recorded in a dedicated `LeadStatusHistory` table
- Tracks who made the change, when, and what the previous status was
- Visible as a timeline on the lead detail page — full audit trail per lead

### Lead Notes

- Add timestamped notes to any lead (call logs, emails, meeting summaries)
- Each note stores content, author, and creation date
- Notes are immutable — by design, interaction history should not be edited after the fact

### Dashboard

- Total Leads, New Leads, Qualified Leads, Won Leads, Lost Leads
- Total Estimated Deal Value and Total Value of Won Deals
- Bar chart: lead distribution by status
- Bar chart: deal value by salesperson

### Search & Filtering

- Filter leads by Status, Lead Source, and Assigned Salesperson
- Real-time search by lead name, company name, or email

### Admin Features

- Create salesperson accounts
- Bulk import leads from CSV / Excel with automatic round-robin assignment across the sales team

### UI/UX Polish

- Loading skeletons on all data-heavy pages
- Empty states with actionable prompts (not blank tables)
- Toast notifications for every create, update, and delete action
- Confirmation dialog before any destructive action
- Lead aging badge — highlights leads stuck in `NEW` status for over 24 hours
- Kanban pipeline board with drag-and-drop status updates
- Color-coded status badges across all views

---

## How to Run Locally

### Prerequisites

- Node.js v18+
- PostgreSQL installed and running locally
- npm v9+

### Option 1 — View Live Demo (Recommended)

Visit the deployed application — no local setup required.

**URL:** [https://your-crm.vercel.app](https://your-crm.vercel.app)

Use the test credentials listed below to log in immediately.

### Option 2 — Run Locally

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/leadgen-crm.git
cd leadgen-crm
```

**2. Backend setup**

```bash
cd backend
npm install
cp .env.local.example .env
```

Edit `.env` and confirm your local PostgreSQL credentials match (see Environment Variables below).

```bash
createdb leadgen_db
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Backend runs at `http://localhost:3001`

**3. Frontend setup** (new terminal)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend — `backend/.env`

Copy `backend/.env.local.example` and fill in the values:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadgen_db"

# JWT
JWT_ACCESS_SECRET="your_access_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# App
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### Frontend — `frontend/.env.local`

Copy `frontend/.env.local.example` and fill in the values:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

> ⚠️ Never commit `.env` files. Both are listed in `.gitignore`. Use the `.example` files as your reference.

---

## 🔑 Test Login Credentials

| Role            | Email               | Password      |
| :-------------- | :------------------ | :------------ |
| **Admin**       | `admin@example.com` | `password123` |
| **Salesperson** | `sarah@example.com` | `password123` |
| **Salesperson** | `james@example.com` | `password123` |

The Admin account has full access to all leads, team management, and the seed data toggle. The Salesperson accounts demonstrate the restricted role experience — leads auto-assigned, dashboard scoped to their own pipeline only.

---

## 🗄 Database Setup

### Schema Overview

The database follows a relational model with four core tables:

| Table                 | Purpose                                                 |
| :-------------------- | :------------------------------------------------------ |
| `users`               | Authentication, roles, and salesperson profiles         |
| `leads`               | Core entity — contact info, deal value, pipeline status |
| `notes`               | Immutable interaction history per lead                  |
| `lead_status_history` | Full audit log of every status transition               |

### Entity Relationships

- `users` → `leads`: one user can be assigned many leads
- `users` → `notes`: one user can author many notes
- `leads` → `notes`: one lead has many notes
- `leads` → `lead_status_history`: one lead has a full history of status changes

### Running Migrations Locally

```bash
# Apply all existing migrations to your local database
npx prisma migrate deploy

# Seed the database with test users and sample leads
npx prisma db seed
```

The seed script creates 3 users (1 Admin, 2 Salespersons), 10 sample leads across all statuses, notes per lead, and status history records — so the dashboard and charts show meaningful data immediately.

> **Note:** Use `prisma migrate deploy` (not `migrate dev`) when setting up locally from this repo. The migration files are committed and ready to apply — no generation step needed.

### Indexes

The `status`, `assignedToId`, and `source` columns on the `leads` table are indexed for fast filtering queries.

---

## Known Limitations

- **No file attachments:** Lead records do not support PDF or document uploads. File storage (e.g., via S3 or Cloudinary) would be a natural next step.
- **No real-time updates:** The dashboard and lead list use TanStack Query's refetch interval rather than WebSockets. In a live team environment, WebSockets would push updates instantly when a colleague changes a lead status.
- **In-memory token storage:** The access token is stored in Zustand (in-memory), which means it is lost on a hard page refresh. The refresh token in the HttpOnly cookie handles silent re-authentication, so the user experience is seamless, but a more persistent solution (e.g., a server-side session) could be considered for production.
- **No email notifications:** Assigning a lead to a salesperson does not trigger an email alert. A transactional email service (e.g., Resend or SendGrid) would close this gap.
- **Single tenant:** The system is not multi-tenant. All admins share a single organisation view. A tenant isolation layer would be required for a true SaaS deployment.

---

## Reflection

Building LeadGen CRM in a compressed timeline required constant prioritisation — here are the decisions that shaped the outcome.

**1. LeadStatusHistory as a first-class entity**
Most CRM implementations treat status as a single field. I deliberately modelled status history as its own table from the start. This unlocks pipeline velocity reporting (how long does a lead sit in `QUALIFIED`?), bottleneck analysis, and a full audit trail per lead — features a real sales manager would use daily, not just a developer checkbox.

**2. Role-aware lead assignment at the service layer**
Rather than trusting the frontend to send the correct `assignedToId`, the backend service layer enforces the rule: if the authenticated user is a Salesperson, the lead is always assigned to them regardless of the request body. This prevents privilege escalation and keeps the business logic server-side where it belongs.

**3. Two-token auth with HttpOnly cookies**
Storing the refresh token in an HttpOnly cookie (inaccessible to JavaScript) and keeping the access token only in memory (Zustand, never localStorage) follows current security best practice. The Axios interceptor handles silent refresh invisibly, so the user never experiences an unexpected logout mid-session.

**4. Validation at every layer**
Class-validator on DTOs with `whitelist: true` and `forbidNonWhitelisted: true` strips unexpected fields before they reach the service layer. On the frontend, custom validation logic (like the Sri Lankan phone format check) ensures data integrity before submission. This dual-layer approach makes the system predictable and robust.

**5. What I would do differently with more time**
I would add WebSocket support for real-time pipeline updates, a proper email notification system for lead assignments, and end-to-end tests covering the auth flow and lead lifecycle. I would also extract the dashboard aggregations into a dedicated reporting service with caching as the dataset grows.

---

## Demo Video

[Watch the demo on Loom / YouTube](#)

The video covers: running the project locally, login flow, dashboard walkthrough, creating and editing a lead, updating lead status, adding notes, filtering leads, and a brief explanation of the backend architecture and database design.
