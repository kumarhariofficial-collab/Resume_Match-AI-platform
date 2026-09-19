# ResumeMatch AI — Implementation Plan & Architecture Specification

**Product Name**: ResumeMatch AI — ATS & Job Description Intelligence Platform  
**Architectural Goal**: Build a production-quality, privacy-first SaaS platform for resume parsing, Job Description (JD) requirement extraction, explainable matching, ATS readability auditing, and fact-verified AI resume tailoring.

---

## 1. Project Architecture

ResumeMatch AI is designed as a modern, decoupled modular web application. The core philosophy separates **deterministic analysis** (parsing, exact/synonym keyword matching, rule-based ATS audit, scoring formulas) from **non-deterministic AI synthesis** (LLM requirement extraction enrichment, semantic similarity embeddings, and anti-hallucination tailors).

```
                      +-----------------------------------+
                      |      Next.js App Router (Web)     |
                      |  React 19 + Tailwind + shadcn/ui  |
                      +-----------------+-----------------+
                                        |
                                        v
                      +-----------------+-----------------+
                      |    API Layer (Next.js Route)     |
                      |  Authentication & Rate Limiting  |
                      +--------+----------------+---------+
                               |                |
             +-----------------+                +------------------+
             |                                                     |
             v                                                     v
+------------+------------+                              +---------+----------+
|    Core Engine Stack    |                              |   AI / LLM Service |
| - Resume Parser         |                              | - OpenAI / Gemini  |
| - JD Requirement Extraction|                           | - Embedding Model |
| - ATS Readability Audit |                              | - Anti-Hallucination|
| - Deterministic Matcher |                              |   Verifier         |
+------------+------------+                              +---------+----------+
             |                                                     |
             +-----------------+-----------------------------------+
                               |
                               v
                     +---------+----------+
                     | Database & Storage |
                     | PostgreSQL + S3/R2 |
                     +--------------------+
```

---

## 2. Technology Stack

* **Frontend**: Next.js 14+ (App Router), React 18/19, TypeScript, Tailwind CSS, shadcn/ui component primitives, Lucide React icons, Framer Motion for smooth transitions, TanStack Query (React Query) for server state.
* **Backend**: Node.js / Next.js API Routes (Route Handlers) using TypeScript with modular service architecture.
* **Database & ORM**: PostgreSQL via Prisma ORM (hosted on Neon / Supabase).
* **Document Parsing**: `pdf-parse` / `pdfjs-dist` (PDF text layer & coordinate layout inspection), `mammoth` (DOCX extraction), native plain-text parser.
* **AI & LLMs**: OpenAI API (`gpt-4o`, `gpt-4o-mini`, `text-embedding-3-small`) or Google Gemini API (`gemini-1.5-pro`, `gemini-1.5-flash`), wrapped with Zod for strict JSON schema output.
* **File Storage**: S3-compatible Object Storage (AWS S3 / Cloudflare R2 / Supabase Storage) with pre-signed upload URLs and server-side encryption.
* **Auth**: Auth.js (NextAuth.js v5) or Supabase Auth with Google OAuth 2.0 & Email Magic Link / Password providers.
* **Export Engine**: `docx` library for Word document creation, `puppeteer` / `pdfkit` for high-fidelity ATS-friendly PDF generation.
* **Testing Stack**: Vitest / Jest (Unit & Integration tests), Playwright (End-to-End user workflows).

---

## 3. Folder Structure

```
resume-match-ai/
├── apps/
│   └── web/                         # Main Next.js App Router Application
│       ├── app/                     # App Router Pages & API Routes
│       │   ├── (auth)/              # Auth routes (login, register)
│       │   ├── (dashboard)/         # Protected user app routes
│       │   │   ├── dashboard/       # Main overview dashboard
│       │   │   ├── analyze/         # Upload resume & paste JD wizard
│       │   │   ├── analysis/[id]/   # Deep Analysis report & match breakdown
│       │   │   ├── builder/[id]/    # Live side-by-side resume editor
│       │   │   ├── tracker/         # Job application tracker
│       │   │   └── settings/        # Account & privacy settings
│       │   ├── api/                 # RESTful backend API routes
│       │   └── page.tsx             # Marketing landing page
│       ├── components/              # React UI Components
│       │   ├── ui/                  # Component library primitives (shadcn)
│       │   ├── analysis/            # Score cards, Requirement Matrix, ATS checklist
│       │   ├── builder/             # Live side-by-side editor, live validator
│       │   └── layout/              # Navbar, Sidebar, Footer
│       └── lib/                     # Frontend client utilities & hooks
├── packages/                        # Decoupled Core Logic Modules
│   ├── core-types/                  # Shared TypeScript interfaces & Zod schemas
│   ├── resume-parser/               # PDF/DOCX/TXT section & profile parser
│   ├── jd-analyzer/                 # Requirement classifier & metadata extractor
│   ├── matching-engine/             # Multi-layer score calculation & evidence matcher
│   ├── ats-auditor/                 # Layout, text-layer, formatting risk checker
│   ├── ai/                          # Prompt templates, guardrails, anti-hallucination verifier
│   └── export-engine/               # DOCX/PDF generators & export re-parser validator
├── prisma/                          # Prisma database schema, seeds, migrations
├── tests/                           # Fixtures, unit, integration, and E2E specs
├── public/                          # Static assets, branding, sample fixture resumes
├── .env.example                     # Environment template
├── AGENTS.md                        # Agent rules & coding guidelines
├── IMPLEMENTATION_PLAN.md           # Master technical plan
└── package.json                     # Monorepo root config
```

---

## 4. Frontend Architecture

### 4.1 Page Layout & Navigation
1. **Landing Page (`/`)**: Product positioning, "Analyze My Resume" CTA, "See Demo", transparent non-fake ATS explanation, feature matrix.
2. **Analysis Entry (`/analyze`)**: File dropzone (PDF/DOCX/TXT), JD text input / URL parser, instant validation preview.
3. **Analysis Dashboard (`/analysis/[id]`)**:
   - Executive Summary Header (Overall Match %, ATS Health Score, Critical Gaps count).
   - Expandable "Why?" score calculation breakdown with exact formulas.
   - Requirement Matrix tab (Filterable table: Must-have, Preferred, Responsibilities, Status).
   - ATS Readability Checklist tab (11 checks categorized by severity).
   - Keyword Intelligence tab (Matched, Missing, Underrepresented with evidence recommendations).
   - Evidence Map tab (Requirement $\rightarrow$ Resume section source $\rightarrow$ strength).
4. **Interactive Tailoring & Builder (`/builder/[id]`)**:
   - Left Pane: Interactive section-by-section resume editor.
   - Right Pane: Target JD requirement checklist.
   - Bottom Dock: Live Match Score & Anti-Hallucination verification bar.

### 4.2 State & UI Logic
- **Server State**: Managed via TanStack Query (`useQuery`, `useMutation`) for caching analysis results and optimistic updates.
- **Client State**: Zustand store for live session state in the builder tool (live diff calculation, unsaved edits, instant match updates).

---

## 5. Backend Architecture

* **Next.js API Routes (Route Handlers)**: Lightweight RESTful endpoints.
* **Modular Service Pattern**:
  - `ParsingService`: Handles document extraction and structure normalization.
  - `AnalysisService`: Coordinates JD requirement extraction, matching engine, and ATS auditor.
  - `TailoringService`: Handles LLM prompt execution and anti-hallucination verification.
  - `ExportService`: Generates document binaries and re-parses them for verification.

---

## 6. Database Architecture

Prisma PostgreSQL Schema Entities:

```prisma
enum Role {
  USER
  ADMIN
}

enum Plan {
  FREE
  PRO
  CAREER
}

enum RequirementCategory {
  MUST_HAVE_SKILL
  PREFERRED_SKILL
  RESPONSIBILITY
  EXPERIENCE
  EDUCATION
  CERTIFICATION
  DOMAIN
  SOFT_SKILL
}

enum MatchStatus {
  STRONG_MATCH
  PARTIAL_MATCH
  WEAK_EVIDENCE
  MISSING
  NEEDS_REVIEW
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  role          Role           @default(USER)
  plan          Plan           @default(FREE)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  resumes       Resume[]
  jobs          Job[]
  analyses      Analysis[]
  applications  Application[]
}

model Resume {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  title           String
  originalFileUrl String?
  fileType        String          // pdf, docx, txt
  parsedText      String
  structuredJson  Json            // Parsed CandidateProfile object
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  analyses        Analysis[]
  versions        ResumeVersion[]
}

model Job {
  id                 String     @id @default(cuid())
  userId             String
  user               User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  company            String
  title              String
  url                String?
  description        String
  parsedRequirements Json       // Array of extracted JobRequirements
  createdAt          DateTime   @default(now())
  analyses           Analysis[]
}

model Analysis {
  id                  String     @id @default(cuid())
  userId              String
  user                User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  resumeId            String
  resume              Resume     @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  jobId               String
  job                 Job        @relation(fields: [jobId], references: [id], onDelete: Cascade)
  overallMatchScore   Float
  atsHealthScore      Float
  scoreBreakdownJson  Json
  requirementsMatrix  Json
  atsAuditJson        Json
  recommendationsJson Json
  createdAt           DateTime   @default(now())
}

model ResumeVersion {
  id            String        @id @default(cuid())
  resumeId      String
  resume        Resume        @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  versionName   String
  contentJson   Json
  createdAt     DateTime      @default(now())
  applications  Application[]
}

model Application {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobId           String
  resumeVersionId String?
  resumeVersion   ResumeVersion? @relation(fields: [resumeVersionId], references: [id])
  company         String
  jobTitle        String
  status          String        // Saved, Applied, Interview, Offer, Rejected, etc.
  appliedAt       DateTime?
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

---

## 7. Resume Parsing Architecture

The parser ingests raw files (PDF/DOCX/TXT) and outputs a normalized `CandidateProfile` JSON structure:

```json
{
  "candidate": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555-0199",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/janedoe",
    "portfolio": "janedoe.dev"
  },
  "summary": "Experienced Data Analyst with 5+ years building SQL pipelines...",
  "skills": ["SQL", "Python", "Power BI", "Tableau", "ETL"],
  "experience": [
    {
      "company": "Tech Corp",
      "title": "Senior Data Analyst",
      "startDate": "2021-03",
      "endDate": "Present",
      "bullets": [
        "Automated weekly KPI reporting using SQL and Power BI, reducing manual reporting effort by 40%."
      ]
    }
  ],
  "education": [
    {
      "institution": "University of California",
      "degree": "B.S. Computer Science",
      "year": "2020"
    }
  ],
  "certifications": ["AWS Certified Data Analytics"],
  "projects": []
}
```

### Processing Pipeline:
1. **Raw Text & Line Extraction**:
   - PDF: Ingest buffer via `pdf-parse`, extract text lines along with vertical/horizontal position coordinates.
   - DOCX: Extract clean XML paragraphs via `mammoth`.
   - TXT: Direct UTF-8 text decoding.
2. **Section Heading Identification**:
   - Regex matcher against standard section headers (Summary, Experience, Work History, Education, Skills, Certifications, Projects, Awards).
3. **Entity Extraction**:
   - Contact Info: Deterministic Regex for Email (`[\w.-]+@[\w.-]+\.\w+`), Phone numbers, LinkedIn/Portfolio URLs.
   - Experience Bullets: Identification of active verbs (`Automated`, `Developed`, `Led`), date ranges (`2021 - Present`), and bullet delimiters.
4. **Quantified Impact Detection**:
   - Identification of metrics (e.g. `40%`, `$1.2M`, `500+ users`, `15 hours/week`).

---

## 8. Job Description Analysis Architecture

Extracts structured requirements from raw JD text into `JobProfile`:

1. **Job Metadata Extraction**: Job Title, Company, Location, Work arrangement (Remote/Hybrid/Onsite).
2. **Requirement Categorization**:
   - `Must-have skills`: Core tools/languages explicitly marked as required (e.g., "5+ years SQL required").
   - `Preferred skills`: Nice-to-have capabilities ("Plus: PySpark, Snowflake").
   - `Responsibilities`: Key duties ("Build executive dashboards", "Optimize ETL pipelines").
   - `Education & Certifications`: Minimum degree requirements or mandatory certs.
   - `Soft Skills & Domain`: Domain context (Healthcare, FinTech) and interpersonal requirements.
3. **Requirement Structuring**:
   Each requirement receives: Category, Priority, Frequency in JD, Normalized Term, Exact Phrase.

---

## 9. Matching-Engine Architecture

Calculates transparent, non-mysterious alignment using multi-layer signal evaluation:

### Multi-Layer Alignment:
1. **Exact String Match**: Direct match of normalized lowercased terms (e.g. `Power BI` $\leftrightarrow$ `Power BI`).
2. **Acronym & Synonym Normalization**: Pre-built technical dictionary mapping aliases (e.g. `Search Engine Optimization` $\leftrightarrow$ `SEO`, `MS SQL` $\leftrightarrow$ `SQL Server`).
3. **Phrase & Substring Evidence Match**: Searching for target phrases within work experience bullet points.
4. **Semantic Embedding Match**: Using vector embeddings (`text-embedding-3-small` / cosine distance) for nuanced requirement descriptions.

### Explainable Match Score Formula:
$$
\text{Overall Match Score} = \sum_{c} \left( W_c \times S_c \right) - P_{\text{critical}}
$$

Default Weightings ($W_c$):
* Required Skills ($30\%$)
* Experience Alignment ($20\%$)
* Responsibilities ($20\%$)
* Technical Skills ($15\%$)
* Education & Certifications ($5\%$)
* Domain Alignment ($5\%$)
* Soft Skills ($5\%$)

Sub-score calculation ($S_c$): Weighted average of requirement statuses (Strong Match = 100%, Partial Match = 60%, Weak Evidence = 30%, Missing = 0%).  
Critical Gaps ($P_{\text{critical}}$): Deductions applied for unsatisfied explicit "must-have" knockout criteria.

---

## 10. ATS Readability Engine

Independent 11-point inspection verifying file health and layout parsing compatibility:

1. **Text Layer Check**: Ensures PDF contains selectable text (flags image-only/scanned PDFs).
2. **Reading Order Check**: Verifies top-to-bottom extraction logical flow.
3. **Column Scramble Detection**: Identifies multi-column layouts that interleave text upon extraction.
4. **Table Scramble Risk**: Detects tabular formats that fragment experience text.
5. **Contact Info Accessibility**: Ensures email, phone, and name are in selectable main body text (not hidden in header/footer streams).
6. **Standard Section Headings**: Flags non-standard heading labels (e.g., "What I've Done" instead of "Work Experience").
7. **Formatting Risk Elements**: Identifies text boxes, progress bars, graphic skill meters, and decorative symbols.
8. **Font Size & Visibility**: Flags unusually small text (<8pt) or white text hiding tricks.
9. **Special Character Audit**: Detects non-standard bullet symbols that render as corrupt characters.
10. **File Corruption & Format Check**: Validates MIME type and structural integrity.
11. **Header/Footer Separation**: Ensures key candidate details are not isolated in unparsed header zones.

*Outputs*: `ATS Health Score` (0-100%) and a categorized checklist (Critical, High, Medium, Low, Info).

---

## 11. AI Architecture

* **LLM Engine**: OpenAI / Gemini provider interface with strict fallback mechanisms.
* **Structured Prompts**: System prompts enforcing JSON outputs via schema declaration.
* **Tailoring Modes**:
  - **Conservative**: Reorganizes bullets and improves grammatical flow without changing keyword composition.
  - **Balanced**: Rephrases existing bullets to emphasize matching keywords without adding unverified tools.
  - **Aggressive**: Restructures summary and experience for maximum JD alignment while maintaining strict zero-fabrication boundaries.

---

## 12. AI Verification & Anti-Hallucination Strategy

To enforce **Mandatory Rule 2 (Never fabricate candidate information)**:

```
+---------------------+      +---------------------+
| Original Structured |      |  AI-Tailored Draft  |
|   Resume Profile    |      |   Resume Profile    |
+----------+----------+      +----------+----------+
           |                            |
           +--------------+-------------+
                          |
                          v
           +--------------+-------------+
           | Anti-Hallucination Verifier|
           +--------------+-------------+
                          |
             +------------+------------+
             |                         |
             v                         v
     [ Pure Alignment ]        [ Unsupported Additions ]
     Passes verification       Flagged: New skill, tool,
                               metric, date, or company
                                       |
                                       v
                               User Interstitial:
                               "Not found in resume.
                               Please verify."
```

### Verifier Checks:
1. **Entity Extraction Comparison**: Extracts all tools, skills, dates, job titles, institutions, degrees, and companies from the generated draft.
2. **Set Difference Audit**: Ensures every entity in the generated draft exists within the original `CandidateProfile`.
3. **Metric Validation**: Flags any new percentage, dollar figure, or quantitative metric not present in the source resume.
4. **Status Enforcement**: Unverified additions trigger a "Not found in resume — verify accuracy before applying" modal block prior to document export.

---

## 13. Authentication Strategy

* **Auth Provider**: Auth.js / Supabase Auth.
* **Methods**: Google OAuth 2.0, Email Magic Links, Email + Password.
* **Session Security**: HTTP-only, SameSite=Lax, Secure JWT tokens.
* **Access Control**: Role-Based Access Control (RBAC) separating `USER` and `ADMIN` roles.

---

## 14. File Storage Strategy

* **Provider**: AWS S3 / Cloudflare R2 / Supabase Storage.
* **Security**: Files stored in private buckets; direct public access disabled.
* **Upload Pipeline**: Client requests short-lived Pre-Signed Upload URL (5-minute TTL) after validating MIME type and payload size ($\le 10\text{ MB}$).
* **Download Pipeline**: Delivered via temporary Pre-Signed Download URLs (15-minute TTL).
* **Encryption**: Server-side AES-256 encryption at rest.

---

## 15. Export Architecture

1. **Document Builders**:
   - `DOCX`: Built using `docx` node library with clean, ATS-compliant single-column formatting.
   - `PDF`: Built using clean HTML-to-PDF rendering or direct `pdfkit` layout engine.
2. **Export Re-Parser Verification Loop**:
   - Before delivering the final binary to the user, the server **re-parses the generated PDF/DOCX file through the `ats-auditor` and `resume-parser`**.
   - If the generated document fails reading-order or text-layer checks, the export is flagged and regenerated.

---

## 16. API Architecture

RESTful endpoints with standard JSON responses:

* `POST /api/resumes/upload` — Ingest resume file, return parsed JSON profile ID.
* `POST /api/jobs/analyze` — Submit JD text/URL, return extracted requirements JSON.
* `POST /api/analysis/run` — Run match engine and ATS audit for a (ResumeID, JobID) pair.
* `GET  /api/analysis/:id` — Fetch complete analysis report, breakdown, and recommendations.
* `POST /api/resumes/tailor` — Request AI-assisted resume rephrase with selected tailoring mode.
* `POST /api/resumes/verify` — Run anti-hallucination verifier on a candidate draft.
* `POST /api/export/docx` — Export validated Word document.
* `POST /api/export/pdf` — Export validated PDF document.
* `GET  /api/applications` — Fetch job tracker entries.
* `POST /api/applications` — Create/update job tracker status.

---

## 17. Security Architecture

* **Data Protection**: Encryption in transit (TLS 1.3) and at rest (AES-256).
* **Privacy Controls**: Zero raw text logging in telemetry; PII masking in system logs; explicit account & data deletion functionality.
* **App Security**: Content Security Policy (CSP), OWASP header compliance, CORS origin restriction, rate limiting via Upstash Redis (100 requests/min per IP).
* **File Safety**: MIME-type validation + Magic Bytes header verification to prevent executable file uploads.

---

## 18. Testing Architecture

* **Unit Tests (Vitest)**:
  - Exact/Synonym match resolution logic.
  - Transparent score formula calculations.
  - Anti-hallucination diff detector.
  - Section heading regex matcher.
* **Integration Tests**:
  - Full upload-parse-match workflow.
  - API endpoint request/response validation.
* **Fixture Test Suite**:
  - Test suite with 10+ standard resume fixtures (1-column clean, 2-column, table heavy, image-only scanned PDF, missing email, acronym heavy).
* **End-to-End Tests (Playwright)**:
  - User journeys: Upload resume $\rightarrow$ paste JD $\rightarrow$ view transparent score breakdown $\rightarrow$ tailor resume $\rightarrow$ verify facts $\rightarrow$ export document.

---

## 19. Deployment Architecture

* **Web App**: Hosted on Vercel / Cloudflare Pages / Railway.
* **Database**: Managed PostgreSQL on Neon / Supabase.
* **Storage**: Cloudflare R2 or AWS S3.
* **CI/CD Pipeline**: GitHub Actions running linting, type-checking, unit tests, build checks, and Playwright tests on every PR.

---

## 20. MVP Roadmap

1. **Stage 1: Foundation & Scaffold**
   - Initialize Monorepo / Next.js app with Tailwind, TypeScript, shadcn/ui.
   - Set up Prisma PostgreSQL database models and migrations.
   - Build AGENTS.md and technical docs.
2. **Stage 2: Resume Parser & ATS Auditor**
   - Implement PDF, DOCX, TXT text extractors.
   - Build Section & Contact info regex parser.
   - Build 11-point ATS Readability audit engine.
3. **Stage 3: JD Analyzer & Requirement Classifier**
   - Implement JD text parsing & metadata extraction.
   - Categorize requirements into Must-have, Preferred, Responsibilities, Education, Domain.
4. **Stage 4: Matching Engine & Transparent Scoring**
   - Implement Exact, Acronym, Phrase, and Synonym match layers.
   - Build transparent weighted scoring formula with explainable breakdown.
5. **Stage 5: Dashboard UI & Analysis Report**
   - Implement Landing Page, Upload Wizard, and Analysis Dashboard (`/analysis/[id]`).
   - Create Requirement Matrix table, ATS Health checklist, Keyword Intelligence cards.
6. **Stage 6: Export & Final Verification**
   - Implement DOCX/PDF export with automated re-parser validation loop.
   - Execute test suite across all resume fixtures.

---

## 21. Phase 2 Roadmap

1. Controlled AI Resume Tailoring (Conservative, Balanced, Aggressive modes).
2. Anti-Hallucination Structural Verifier & User Verification Interstitial.
3. Live Side-by-Side Resume Builder (`/builder/[id]`) with real-time match recalculation.
4. Cover Letter & Recruiter Outreach Message generator.
5. Technical & Behavioral Interview Preparation module based on JD gaps.
6. Resume Version Control system (Master resume vs. Job-tailored versions).

---

## 22. Phase 3 Roadmap

1. Job Application Tracker Kanban Board (`/tracker`).
2. Job Description Diff tool for updated job listings.
3. Full Application Package bundler (Tailored Resume + Cover Letter + Recruiter Message).
4. Subscription Billing integration (Stripe Free / Pro / Career tiers).
5. Admin Management Dashboard (usage analytics, LLM token costs, system health).
6. Browser Extension for one-click JD import from job boards.

---

## 23. Risks & Technical Limitations

1. **PDF Text Extraction Ambiguities**: Image-only or non-standard encoded PDFs will not yield text.  
   *Mitigation*: Implement immediate fallback detection that alerts the user to upload a searchable PDF/DOCX or use text paste.
2. **LLM Hallucination Risk**: AI models may rephrase bullets into unsupported claims.  
   *Mitigation*: Mandatory Anti-Hallucination Verifier pass that compares generated output against original candidate JSON before download.
3. **Varied Employer ATS Behaviors**: Real ATS platforms behave differently.  
   *Mitigation*: Adhere strictly to **Rule 1** — never claim universal ATS simulation or interview guarantees; label scores as "Resume–JD Match Score" and "ATS Readability / Parsing Health".

---

## 24. Required Third-Party Services

* **OpenAI / Google Gemini API**: LLM intelligence & text embeddings.
* **Neon / Supabase**: Managed PostgreSQL database.
* **Cloudflare R2 / AWS S3**: Object storage for resumes and exports.
* **Resend / SendGrid**: Transactional email delivery.
* **Stripe** (Phase 3): Subscription payment processing.

---

## 25. Environment Variables Required

```env
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resumematch?schema=public"

# Authentication
NEXTAUTH_SECRET="super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI Providers
OPENAI_API_KEY=""
GEMINI_API_KEY=""
DEFAULT_LLM_PROVIDER="openai" # openai | gemini

# Storage
S3_ENDPOINT=""
S3_BUCKET_NAME="resumematch-storage"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_REGION="us-east-1"

# Email
RESEND_API_KEY=""
EMAIL_FROM="noreply@resumematch.ai"

# Rate Limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```
