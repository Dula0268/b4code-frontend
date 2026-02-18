# 🏨 Hospitality Booking & F&B Platform — Frontend

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-Styling-38bdf8)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-UI%20Kit-111827)
![Zustand](https://img.shields.io/badge/Zustand-State%20Mgmt-orange)

A modern hospitality marketplace frontend built with **Next.js (App Router)** for seamless property booking, guest management, **QR-based F&B ordering**, and enterprise-grade admin controls.  
Built for scalability, performance, and clean UX using **Tailwind CSS + shadcn/ui**.

> ⚠️ This repository contains **only the frontend application**.  
> Backend services are maintained in a separate repository.

---

## ✨ Features

### 👤 User Roles
- 🧳 **Guest** — Browse properties, book rooms, order food via QR  
- 🏠 **Property Owner** — Manage listings, availability, pricing  
- 🧑‍🍳 **Staff** — Handle orders, bookings, service status  
- 🛡️ **Admin** — Platform health, moderation, audit logs, payouts  

### 🧭 Core Capabilities
- 🔎 Property discovery & booking flow  
- ⚡ Fast search → booking → confirmation UX  
- 📱 QR-based F&B ordering  
- 📊 Admin dashboard with platform health metrics  
- 🔐 Role-based access (**RBAC/ABAC ready**)  
- 📜 Audit logs & downloadable activity reports  
- 💸 Payout & payment oversight  

---

## 🧱 Tech Stack (Frontend)

- ⚙️ **Framework:** Next.js (App Router, SSR & SSG)  
- 🧠 **Language:** TypeScript  
- 🗂️ **State Management:** Zustand  
- 🎨 **Styling:** Tailwind CSS + shadcn/ui  
- 🧾 **Forms:** React Hook Form  
- ✅ **Validation:** Zod  
- 📎 **File Handling:** React Dropzone, PDF.js Viewer  

### 🔐 Auth & API
- 🪪 JWT-based authentication  
- 🔌 REST API integration (Spring Boot backend)

---

## 📂 Project Structure

```txt
frontend/
├─ app/                 # Next.js App Router pages
│  ├─ (auth)/           # Login / Register
│  ├─ admin/            # Admin Console
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
```

---

## 🚀 Quick Start

Choose one option:

- 🐳 **Docker (Recommended)**
- 💻 Local Development (Node.js)

---

# 🐳 Option 1 — Run with Docker (Recommended)

## ✅ Prerequisites
- 🐋 Docker Desktop installed
- 🪟 Windows users: **WSL2 enabled**
- 🔧 Backend API running (locally or remotely)

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Dula0268/b4code-frontend.git
cd frontend
```

---

## 2️⃣ Create Environment File

### Mac / Linux
```bash
cp .env.example .env
```

### Windows (PowerShell)
```powershell
Copy-Item .env.example .env
```

Edit `.env` and set at least:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Hospitality Booking Platform
```

> ℹ️ If your backend runs in Docker, `NEXT_PUBLIC_API_URL` may need to point to the backend service name (e.g., `http://backend:8080`) depending on your Docker network.

---

## 3️⃣ Build & Start

```bash
docker compose up --build
```

✅ App runs at: **http://localhost:3000**

---

## 🛑 Stop Containers

```bash
docker compose down
```

---

## 🧾 View Logs

```bash
docker compose logs -f
```

---

## 🌙 Run in Background (Detached)

```bash
docker compose up -d --build
```

---

# 💻 Option 2 — Local Development (No Docker)

## ✅ Prerequisites
- Node.js 18+
- npm or pnpm
- Backend API running (locally or remotely)

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Dula0268/b4code-frontend.git
cd frontend
```

---

## 2️⃣ Create `.env.local`

Create a file named `.env.local` in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Hospitality Booking Platform
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Start Dev Server

```bash
npm run dev
```

✅ App runs at: **http://localhost:3000**

---

## 🔐 Authentication Flow

- 🔑 Login returns JWT access + refresh tokens  
- 🍪 Tokens stored securely (HTTP-only cookie or memory)  
- 🧱 Protected routes via middleware  
- 🧭 Role-based routing (Admin / Owner / Staff / Guest)

---

## 🧪 Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🔄 CI Integration

GitHub Actions pipeline runs on Pull Requests:
- 📦 Dependency install  
- ✅ Lint checks  
- 🏗️ Build validation  

Location:  
```txt
.github/workflows/frontend-ci.yml
```

---

## 🌿 Branch Naming Convention

```txt
feature/<feature-name>-<member>
fix/<issue-name>-<member>
refactor/<scope>-<member>
```

---

## 📝 Commit Example

```bash
git add .
git commit -m "feat: add guest booking flow"
                feat     → new feature
                fix      → bug fix
                style    → UI/design change only
                refactor → code improvement (no feature change)
                perf     → performance improvement
                test     → adding or updating tests
                docs     → documentation only
                chore    → maintenance/config/dependency update
                build    → build system / docker / env changes
                ci       → CI/CD pipeline changes
                remove   → deleting unused code/files
git push origin feature/guest-booking-membername
```

---

## 🆘 Troubleshooting

### Port 3000 already in use
- Stop the process using port 3000, **or** change the host port in `docker-compose.yml` (e.g. `3001:3000`).

### Docker can't find compose file
- Make sure you're inside the `frontend` folder (the one containing `docker-compose.yml`).

---

