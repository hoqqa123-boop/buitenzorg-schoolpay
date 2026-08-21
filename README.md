# Buitenzorg International School — School Payment Management System

School payment web application built with Next.js, TypeScript, Supabase PostgreSQL/Auth, GitHub, and Vercel.

## Current milestone
Phase 4C — backend/auth integration foundation.

Implemented:
- Next.js App Router foundation and responsive UI
- Supabase SSR browser/server clients using publishable API keys
- Session refresh proxy and protected Admin/Parent route layouts
- Password login and server-side sign-out flow
- Role model: ADMIN, MANAGEMENT, PARENT
- PostgreSQL schema for students, classes, billing, payments, receipts, and audit logs
- Row Level Security on exposed application tables
- Private security helper for role checks to avoid recursive RLS
- Auth profile trigger with PARENT as the safe default role
- Live school data: academic year, classes, fee types, students, invoices, payments, and receipts
- Admin dashboard reads live data from Supabase

## Current database verification
- 72 active student records seeded
- 72 invoice records
- 36 payment records
- 36 receipt records
- Invoice item total mismatches: 0
- Payment allocation mismatches: 0
- Supabase Security Advisor: 0 findings after Phase 4C security changes

## Environment
Create `.env.local` from `.env.example`.

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never commit secret/service-role keys or `.env.local`.

## Authentication note
The application login flow is connected to Supabase Auth. Auth users are intentionally not inserted directly into Supabase-managed `auth.users` through SQL. Staff and parent accounts must be provisioned through a supported Supabase Auth administrative flow before end-to-end login testing.

## Build verification
Database, RLS, and backend connectivity have been verified against the connected Supabase project. Local dependency installation is currently blocked by registry timeout in the execution environment, so application build verification remains pending and must be completed through the repository/deployment pipeline before release.

## Next development work
- Provision controlled application users
- Convert Student, Invoice, Payment, Report, and Parent pages from foundation/static content to live Supabase data
- Implement transactional write flows
- Add receipt rendering/printing
- Add automated regression tests
- Run repository build and deployment verification
