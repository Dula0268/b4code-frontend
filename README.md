🏨 Hospitality Booking & F&B Platform — Frontend

A modern hospitality marketplace frontend built with Next.js for seamless property booking, guest management, QR-based F&B ordering, and enterprise-grade admin controls.
Designed for scalability, performance, and clean UX using Tailwind CSS + shadcn/ui.

This repository contains only the frontend application. Backend services are maintained in a separate repository.

✨ Features
👤 User Roles

    Guest: Browse properties, book rooms, order food via QR
    Property Owner: Manage listings, availability, pricing
    Staff: Handle orders, bookings, service status
    Admin: Platform health, moderation, audit logs, payouts

🧭 Core Capabilities

    🔎 Property discovery & booking flow
    ⏱️ Fast search → booking → confirmation UX
    📱 QR-based F&B ordering
    📊 Admin dashboard with platform health metrics
    🛡️ Role-based access (RBAC/ABAC ready)
    📜 Audit logs & downloadable activity reports
    💸 Payout & payment oversight

🧱 Tech Stack - Frontend

    Framework: Next.js (App Router, SSR & SSG)
    Language: TypeScript
    State Management: Zustand
    Styling: Tailwind CSS + shadcn/ui
    Forms: React Hook Form
    Validation: Zod
    File Handling: React Dropzone, PDF.js Viewer

Auth & API

    JWT-based authentication
    REST API integration (Spring Boot backend)

🧭 Project Structure
    frontend/
    ├─ app/                 # Next.js App Router pages
    │  ├─ (auth)/           # Login / Register
    │  ├─ admin/            # Admin Console (Student 5)
    │  ├─ owner/            # Owner dashboards
    │  ├─ staff/            # Staff panels
    │  └─ guest/            # Guest-facing pages
    ├─ components/          # Shared UI components
    ├─ store/               # Zustand stores
    ├─ lib/                 # API clients, helpers
    ├─ hooks/               # Custom React hooks
    ├─ styles/              # Global styles
    ├─ public/              # Static assets
    └─ .github/workflows/   # CI pipelines

🚀 Quick Start (Local Development)
Prerequisites

    Node.js 18+
    npm or pnpm
    Backend API running locally or remotely

1️⃣ Clone Repository
    git clone https://github.com/Dula0268/b4code-frontend.git
    cd frontend

2️⃣ Environment Setup
Create a .env.local file in the root:

NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Hospitality Booking Platform

3️⃣ Install Dependencies
    npm install

4️⃣ Run Development Server
    npm run dev


App runs at:
👉 http://localhost:3000

🔐 Authentication Flow

    Login returns JWT access + refresh tokens
    Tokens stored securely (HTTP-only cookie or memory)
    Protected routes via middleware
    Role-based routing (Admin / Owner / Staff / Guest)

🧪 Scripts
    npm run dev      # Start dev server
    npm run build    # Production build
    npm run start    # Start production server
    npm run lint     # Run ESLint

🔄 CI Integration
GitHub Actions pipeline runs on Pull Requests:

    Dependency install
    Lint checks
    Build validation

Location: .github/workflows/frontend-ci.yml

✨Branch Naming Convention

    feature/<feature-name>-<member>
    fix/<issue-name>-<member>
    refactor/<scope>-<member>

✨commit syntaxs 

    git add .
    git commit -m "Commit massage"
    git push origin feature/frontend-readme-buddhika