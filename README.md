# Hostel Management App

A Nuxt 4 application for managing hostel operations, built with TypeScript, Drizzle ORM, and Nuxt UI.

## Setup

Install dependencies with PNPM:

```bash
pnpm install
```

Set up environment variables in `.env` (copy from `.env.example` if available):
- Database URL (Neon PostgreSQL)
- Session secrets
- Email configuration (Nodemailer)

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

- User authentication (signup, login, email verification)
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

## Scripts

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
