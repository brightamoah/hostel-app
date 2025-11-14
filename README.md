# Hostel Management App

A Nuxt 4 application for managing hostel operations, built with TypeScript, Drizzle ORM, and Nuxt UI.

## Setup

Install dependencies with PNPM:

```bash
pnpm install
```

### Environment Setup

Create a `.env` file in the root of the project.

Get your database connection string from **Neon** (make sure to get the “Pooled” string).
Add it to your `.env` file:

```bash
# Neon Database URL
NUXT_DATABASE_URL="postgres://user:password@host/dbname?sslmode=require"

# Add other environment variables for auth, email, etc.
NUXT_SESSION_PASSWORD="your-32-character-long-session-password"

# Email Configuration (for Nodemailer)
NUXT_NODEMAILER_FROM='<your app name> <'senders email address'>'
NUXT_NODEMAILER_HOST=smtp.gmail.com
NUXT_NODEMAILER_PORT=465
NUXT_NODEMAILER_AUTH_USER=<'senders email address'>
NUXT_NODEMAILER_AUTH_PASS=your-email-app-password
```

## Development

Start the development server:

```bash
pnpm dev
```

The app runs on `http://localhost:3000`.

## Database

This app uses PostgreSQL with Drizzle ORM.

Generate and run migrations:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Features

- User authentication (sign up, login, email verification)
- Password reset via email
- Student onboarding with profile details
- Role-based access (students and admins)
- Dashboards for students and admins
- Complaint, maintenance, and visitor management
- Announcements and billing

## Build

Build for production:

```bash
pnpm build
```

Preview locally:

```bash
pnpm preview
```

---

## Scripts

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm db:g` - Generate SQL equivalent of the schema
- `pnpm db:m` - Migrate the changes to the database

---

## 🛠️ Tech Stack

This project uses a modern, type-safe, full-stack architecture:

| Category   | Technology      | Purpose                                                          |
| ---------- | --------------- | ---------------------------------------------------------------- |
| Framework  | **Nuxt 4**      | Full-stack framework (Vue 3, Nitro server, file-based routing)   |
| Database   | **Neon**        | Serverless Postgres database                                     |
| ORM        | **Drizzle ORM** | Type-safe SQL query builder and schema management                |
| UI Library | **Nuxt UI**     | Pre-built Vue components (tables, modals, forms)                 |
| State Mgt  | **Pinia**       | Centralized state management for the frontend                    |
| Validation | **Zod**         | Schema validation for both frontend forms and backend API routes |

---

# 📁 Folder Structure

```
├── app/
│   ├── assets/         # CSS, fonts, and images
│   ├── components/     # Reusable Vue components (modals, nav, etc.)
│   ├── composables/    # Reusable Vue logic (e.g., userRowColumn.ts)
│   ├── layouts/        # Page layouts (adminDashboard.vue, auth.vue)
│   ├── middleware/     # Route guards (admin.ts)
│   ├── pages/          # File-based routing (admin/users.vue)
│   ├── stores/         # Pinia stores (userStore.ts, authStore.ts)
│   └── utils/          # Helper functions and schemas (schema.ts)
├── server/
│   ├── api/            # Backend API endpoints (auth/, user/, room/)
│   │   └── user/
│   │       └── promoteDemote.patch.ts
│   ├── db/
│   │   ├── migrations/ # Drizzle migration files
│   │   ├── queries/    # Database query logic
│   │   └── schema/     # Schema definitions
│   └── utils/          # Backend helpers (db.ts, errorHandler.ts)
├── drizzle.config.ts    # Drizzle configuration
└── nuxt.config.ts       # Nuxt configuration
```

## 💡 Developed By

**Bright Amoah**
[GitHub](https://github.com/brightamoah)

---
