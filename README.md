# ResumeMatch AI — ATS & Job Description Intelligence Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?logo=vitest)](https://vitest.dev/)
[![Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://vercel.com/)

**ResumeMatch AI** is an enterprise-grade ATS (Applicant Tracking System) and Job Description Intelligence SaaS platform. It combines **deterministic multi-layer parsing algorithms** with **LLM reasoning** to analyze candidate resumes against target job descriptions, evaluate ATS layout readability, verify candidate qualifications with zero fabrication, and generate tailored resume exports.

---

## 🌟 Executive Overview & Key Features

* **🎯 Dynamic Resume–JD Match Scoring**: Transparent 100-point matching score based on Must-have skills, Preferred skills, Responsibilities, Education, Certifications, and Domain terminology.
* **🔍 11-Point ATS Readability Auditor**: Inspects native PDF/DOCX text layer accessibility, font fragmentation, section heading compliance, reading order continuity, and table scramble risks.
* **🛡️ Zero Qualification Fabrication Guarantee**: Anti-hallucination engine that strictly flags unverified job requirements as `"Not found in resume"`. The AI engine **never** invents experience, metrics, or technologies.
* **🔑 Mandatory Gmail / Email Authentication**: Secure user authentication featuring Google/Gmail instant sign-in, account creation, and Nodemailer email dispatch.
* **📊 Database User & Application Tracker**: Full persistence of user accounts, analyzed resume reports, and Kanban job application pipelines powered by Prisma PostgreSQL/SQLite.
* **📄 Pro DOCX & PDF Export Engine**: 1-Click tailored resume export featuring a mandatory **Re-Parser Validation Loop** that verifies generated files through the ATS auditor before user download.

---

## 📐 Mandatory Product Rules

1. **Rule 1 — Truthful ATS Terminology**:
   - The platform never claims "Guaranteed ATS Pass". Metrics are strictly labeled **"Resume–JD Match Score"** and **"ATS Readability / Parsing Health"**.
2. **Rule 2 — Never Fabricate Qualifications**:
   - The platform never invents skills, companies, job titles, or metrics. Unverified requirements are explicitly marked **"Not found in resume"**.
3. **Rule 3 — Discourage Keyword Stuffing**:
   - Recommends evidence-backed, contextual placement of keywords rather than repetitive keyword stuffing.
4. **Rule 4 — Explainable Mathematical Scores**:
   - Every score features a transparent formula, weight breakdown, and supporting evidence snippets.

---

## 🏗️ Architecture & Monorepo Packages

ResumeMatch AI is structured as a decoupled monorepo containing standalone engine packages and a modern Next.js 15 App Router web application:

```
Resume ATS/
├── apps/
│   └── web/                   # Next.js 15 App Router (Dashboard, Builder, Auth, APIs)
├── packages/
│   ├── core-types/            # Strict Zod schemas & TypeScript models
│   ├── resume-parser/         # Multi-format extractor (pdf-parse, mammoth, txt)
│   ├── jd-analyzer/           # Requirement classifier (Must-haves, Preferred, Domain)
│   ├── ats-auditor/           # 11-point layout & text layer auditor
│   ├── matching-engine/       # Deterministic multi-layer matching algorithm
│   ├── ai/                    # LLM reasoning & anti-hallucination verification
│   └── export-engine/         # DOCX exporter with Re-Parser validation loop
└── prisma/
    └── schema.prisma          # Database schema (User, Resume, Job, Analysis, Application)
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 App Router (React 19, Server Actions, API Routes)
- **Language**: TypeScript 5.7 (Strict Mode)
- **Database**: Prisma ORM with PostgreSQL (Neon DB) / SQLite fallback
- **State Management**: Zustand & React Hooks
- **Styling**: Tailwind CSS & Lucide Icons
- **Parsing**: `pdf-parse` (PDF text extraction), `mammoth` (DOCX extraction)
- **Email Dispatch**: Nodemailer (Gmail SMTP & Ethereal dynamic transport)
- **Testing**: Vitest (`npm test`)

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js 18+ or Node.js 20+
- npm 9+

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/kumarhariofficial-collab/Resume_Match-AI-platform.git
cd Resume_Match-AI-platform
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-12345"
NEXTAUTH_URL="http://localhost:3000"

# Optional Email & AI Keys
OPENAI_API_KEY=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
```

### 4. Database Setup & Prisma Generation
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Building

### Run Unit Tests
```bash
npm test
```

### Run Production Build
```bash
npm run build
```

---

## 🌐 Deployment

ResumeMatch AI is configured for seamless one-click deployment on **Vercel**:

1. Import the repository into your Vercel Dashboard.
2. Set the `DATABASE_URL` environment variable.
3. Deploy! Vercel will execute `npm run build` which automatically runs Prisma code generation, package compilation, and Next.js static page collection.

---

## 📄 License

Copyright © 2026 ResumeMatch AI. All rights reserved.
