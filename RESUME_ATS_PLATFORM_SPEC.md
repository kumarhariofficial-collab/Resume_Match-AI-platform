# ATS Resume Intelligence Platform — Product Requirements & Build Specification

## 1. Project Goal

Build a premium, production-style web application that analyzes a candidate resume against a Job Description (JD), checks ATS-readability, identifies missing or weak requirements, and generates evidence-based improvement suggestions.

The application must **not pretend to simulate a specific employer's ATS**. Different ATS products and employer configurations behave differently. The product should instead provide:
1. A transparent resume parsing/readability audit.
2. A JD-to-resume requirement/keyword comparison.
3. Evidence-based tailoring suggestions.
4. Optional AI-assisted rewriting that never invents qualifications.
5. A polished premium dashboard and export workflow.

Google Antigravity can be used as the agentic development environment. Antigravity supports agents working across editor, terminal, and browser, and supports custom agent instructions/skills through Markdown files such as AGENTS.md/SKILL.md.

---

# 2. Product Positioning

Working name:

**ResumeMatch AI — ATS & Job Description Intelligence**

Target users:
- Job seekers
- Experienced professionals
- Freshers
- Career switchers
- Recruiters/career coaches

Primary use case:

> Upload/paste a resume + paste/upload a JD → parse both → identify requirements → map evidence → calculate transparent match metrics → detect ATS formatting risks → recommend fixes → optionally generate a tailored resume → validate again → export.

---

# 3. Important Product Principles

### 3.1 No fake universal ATS score

Do not claim:

- "This is the exact ATS score."
- "This guarantees an interview."
- "Your resume will definitely pass ATS."
- "ATS systems reject resumes because of one specific formatting rule."

Instead, call the main metric:

**Resume–JD Match Score**

And separately show:

**ATS Readability / Parsing Health**

The score must be explainable.

### 3.2 Never invent experience

AI must not add:
- Skills the candidate does not have.
- Certifications the candidate does not hold.
- Job titles the candidate never held.
- Projects the candidate never performed.
- Metrics that were not supplied.
- Technologies merely because they appear in the JD.

If a JD requirement is missing, the product should say:

> "Not found in resume — add only if you genuinely have this experience."

### 3.3 Evidence-first recommendations

Every recommendation should explain:
- What was detected.
- Why it matters.
- Where it should be improved.
- Suggested wording.
- Whether the candidate must verify it.

---

# 4. Core User Flow

## Step 1 — Landing Page

Display:

- Product name
- Short value proposition
- "Analyze My Resume" CTA
- "See Demo" CTA
- Privacy statement
- Feature comparison

Example:

> Analyze your resume against any job description. Find missing requirements, ATS readability risks, weak evidence, and actionable improvements in minutes.

---

## Step 2 — Resume Input

Support:

- PDF
- DOCX
- TXT
- Copy/paste resume text

Maximum file size should be configurable.

Show:

- Upload status
- File name
- Pages
- Extracted text length
- Parsing status
- Detected sections

Supported sections:

- Contact
- Summary
- Skills
- Experience
- Education
- Certifications
- Projects
- Awards
- Publications
- Languages

---

# 5. Resume Parser

The parser should extract a normalized candidate profile.

Example internal structure:

```json
{
  "candidate": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": [],
  "experience": [
    {
      "company": "",
      "title": "",
      "start_date": "",
      "end_date": "",
      "bullets": []
    }
  ],
  "education": [],
  "certifications": [],
  "projects": [],
  "awards": []
}
```

The parser should preserve:
- Original text
- Extracted structure
- Source page/section where possible

This allows the UI to explain where a finding came from.

---

# 6. ATS Readability Audit

Do NOT present this as a universal ATS compatibility guarantee.

Check:

### File checks
- File type
- Text layer exists
- Text is selectable/searchable
- File is not image-only
- Corrupt/unreadable file detection

### Reading-order checks
- Text extraction follows logical top-to-bottom order
- Multi-column text does not interleave
- Tables do not scramble experience details
- Header/footer content is not hiding essential information

### Contact checks
- Name detected
- Email detected
- Phone detected
- LinkedIn/portfolio detected where present
- Contact information is actual text

### Section checks
Detect standard headings such as:
- Summary
- Professional Summary
- Experience
- Work Experience
- Employment
- Education
- Skills
- Certifications
- Projects

### Formatting-risk checks
Flag where detected:
- Excessive columns
- Complex tables
- Text boxes
- Important information in images
- Unusual symbols
- Decorative graphics
- Progress bars
- Skill charts
- Very small fonts
- Unusual section labels
- Excessive headers/footers

Important:

The product should distinguish:

**Strong parsing controls**
from
**Context-dependent layout risks**

Do not automatically mark every table/column as invalid.

---

# 7. Job Description Analyzer

The JD analyzer must extract:

## 7.1 Job metadata
- Job title
- Company
- Location
- Experience requirement
- Employment type
- Work arrangement

## 7.2 Required qualifications

Examples:
- SQL
- Python
- Power BI
- AWS
- Databricks
- 5+ years experience

## 7.3 Preferred qualifications

Examples:
- Tableau
- Snowflake
- AWS Glue
- PySpark

## 7.4 Responsibilities

Examples:
- Build dashboards
- Analyze business KPIs
- Automate reporting
- Work with stakeholders
- Develop ETL pipelines

## 7.5 Domain keywords

Examples:
- Banking
- E-commerce
- Healthcare
- Supply chain

## 7.6 Soft skills

Examples:
- Communication
- Stakeholder management
- Leadership
- Problem solving

---

# 8. Requirement Classification

Every extracted JD requirement should receive:

```text
Category
Priority
Frequency
Exact phrase
Normalized term
Resume evidence
Evidence strength
Status
```

Possible categories:

- Must-have skill
- Preferred skill
- Responsibility
- Experience
- Education
- Certification
- Domain
- Soft skill
- Job title
- Tool/technology

Possible status:

- Strong Match
- Partial Match
- Weak Evidence
- Missing
- Not Applicable / Needs Review

---

# 9. Resume ↔ JD Matching Engine

Do NOT rely only on exact keyword matching.

Use multiple signals:

### A. Exact match
Example:

JD:
`Power BI`

Resume:
`Power BI`

### B. Acronym expansion

Example:

JD:
`Search Engine Optimization`

Resume:
`SEO`

### C. Skill normalization

Example:

- `MS SQL`
- `Microsoft SQL Server`
- `SQL Server`

should map to a common concept where appropriate.

### D. Phrase matching

Example:

JD:
`stakeholder management`

Resume:
`managed cross-functional stakeholders`

### E. Semantic similarity

Use an embedding/LLM layer where appropriate.

### F. Evidence matching

Example:

JD requirement:

`Build Power BI dashboards`

Resume:

`Developed Power BI dashboards for KPI reporting and business performance tracking.`

This is stronger than merely seeing the words "Power BI".

---

# 10. Match Score

Create a transparent score such as:

```text
Overall Resume–JD Match
= weighted requirement coverage
+ evidence quality
+ experience alignment
+ skills alignment
+ responsibility alignment
- critical gaps
```

Suggested configurable weighting:

```text
Required skills          30%
Experience alignment     20%
Responsibilities         20%
Technical skills         15%
Education/certifications 5%
Domain alignment          5%
Soft skills               5%
```

These weights are product defaults, NOT claims about how a real ATS works.

Allow administrators to change weights.

Display:

- Overall match percentage
- Required skill coverage
- Preferred skill coverage
- Responsibility coverage
- Experience alignment
- Evidence quality

Never hide the calculation.

---

# 11. Critical Requirement / Knockout Detection

Detect requirements such as:

- "Must have"
- "Required"
- "Minimum 5 years"
- "Bachelor's degree required"
- "Certification required"
- "Willingness to relocate"
- "Work authorization required"

Show separately:

## Critical gaps

Example:

```text
Required: 5+ years SQL experience
Resume evidence: 3 years explicitly detected
Status: Review required
```

Do not automatically assume the candidate lacks something simply because it was not found.

Use:

**"Not found in resume"**

rather than:

**"Candidate does not have this."**

---

# 12. Keyword Intelligence

Show:

### Matched keywords

```text
SQL
Python
Power BI
Data Analysis
Stakeholder Management
KPI Reporting
ETL
```

### Missing keywords

Only recommend adding a missing keyword if the candidate genuinely has the skill.

Example:

> Missing: PySpark  
> Action: Add only if you have hands-on PySpark experience.

### Underrepresented keywords

A keyword may exist but have weak evidence.

Example:

> Power BI appears once, but the JD repeatedly requires dashboard development.

Recommendation:

> Strengthen Power BI evidence in the experience/project section if accurate.

---

# 13. Resume Quality Analysis

Analyze:

## Content
- Weak summary
- Generic statements
- Repetitive bullets
- Unsupported claims
- Missing outcomes
- Missing metrics
- Weak action verbs

## Experience bullets

Evaluate whether bullets contain:

**Action + Task + Technology + Outcome**

Example:

Weak:

> Worked on reports.

Better:

> Automated weekly KPI reporting using SQL and Power BI, reducing manual reporting effort by 40%.

The 40% must only be used when verified by the candidate.

---

# 14. Impact / Quantification Detector

Detect:

- Percentages
- Currency
- Time savings
- Volume
- User/customer counts
- Revenue
- Cost reduction
- SLA improvement
- Accuracy improvement
- Productivity improvement

Show:

```text
Quantified bullets: 8 / 18
```

Then suggest where quantified evidence could be added.

Do not fabricate numbers.

---

# 15. Resume Section Analysis

For each section show:

- Status
- Strengths
- Risks
- Suggestions

Example:

```text
Professional Summary
Status: Needs improvement

Detected:
- 5 years experience
- SQL
- Python
- Power BI

Missing/weak:
- Target job title
- Business impact
- Domain keywords
```

---

# 16. Premium Feature: AI Resume Tailoring

Allow user to click:

**Tailor Resume to This Job**

AI should generate a revised version using only verified candidate information.

Modes:

### Conservative
Only reorganize and clarify.

### Balanced
Improve wording and keyword alignment while preserving facts.

### Aggressive
Maximize alignment but still prohibit fabrication.

Every changed section should support:

**Before → After → Reason**

---

# 17. Premium Feature: Evidence Mapping

For every important JD requirement:

```text
Requirement
↓
Resume evidence
↓
Source section
↓
Match strength
↓
Recommended improvement
```

Example:

```text
Requirement:
Build executive dashboards

Evidence:
Experience > Amazon > Bullet 4

Match:
Strong

Recommendation:
Move this bullet higher in the role.
```

---

# 18. Premium Feature: Resume Versions

Allow users to maintain:

- Master Resume
- Data Analyst Resume
- Senior Data Analyst Resume
- BI Analyst Resume
- Business Analyst Resume
- Custom Job Version

Every tailored version should preserve the master resume.

---

# 19. Premium Feature: Version Comparison

Compare two resume versions:

```text
Keywords added
Keywords removed
Bullets changed
Sections changed
Match score before
Match score after
ATS readability before
ATS readability after
```

---

# 20. Premium Feature: Job Tracker

Allow users to save:

- Company
- Job title
- Job URL
- JD
- Resume version
- Application date
- Status
- Recruiter
- Notes

Statuses:

```text
Saved
Applied
Screening
Interview
Assessment
Offer
Rejected
Withdrawn
```

---

# 21. Premium Feature: Application Package

Generate:

- Tailored resume
- Cover letter
- Recruiter message
- LinkedIn message
- Interview preparation
- JD keyword sheet

All outputs must be based on verified resume information.

---

# 22. Premium Feature: Interview Preparation

From the JD + resume, generate:

### Technical questions
Based on actual required skills.

### Behavioral questions
Based on responsibilities.

### Resume-based questions
Based on candidate's own experience.

### Gap questions
Based on missing or weaker requirements.

Example:

```text
JD requires:
AWS Glue

Resume:
AWS mentioned, Glue not found.

Likely interview topic:
Explain an ETL workflow using AWS Glue.
```

Do not claim that an employer will definitely ask a question.

---

# 23. Premium Feature: Job Description Diff

If the same job is updated:

Show:

```text
New requirements
Removed requirements
Changed responsibilities
New keywords
Changed experience requirement
```

---

# 24. Premium Feature: Explainability

Every score must have a "Why?" button.

Example:

```text
Match Score: 78%

Why?

Required skills: 86%
Responsibilities: 74%
Experience: 80%
Education: 100%
Domain: 50%

Main gaps:
1. Databricks
2. PySpark
3. AWS Glue
```

---

# 25. Premium Dashboard

Dashboard layout:

```text
--------------------------------------------------
ResumeMatch AI
--------------------------------------------------

Resume              Target Job
Senior_Data...      Senior Data Analyst

--------------------------------------------------
Resume–JD Match
78%

ATS Readability
92%

Critical Gaps
2

Keywords Matched
31 / 39
--------------------------------------------------

[ Improve Resume ]

--------------------------------------------------
Requirement Coverage
██████████████████░░

Required Skills       86%
Responsibilities      74%
Experience            80%
Domain                50%
--------------------------------------------------

Top Missing Requirements
1. PySpark
2. Databricks
3. AWS Glue

--------------------------------------------------

Quick Actions
[ Tailor Resume ]
[ Fix ATS Risks ]
[ Generate Cover Letter ]
[ Interview Prep ]
[ Export ]
--------------------------------------------------
```

---

# 26. UI/UX Requirements

Design language:

- Premium SaaS
- Clean
- Professional
- Desktop-first but responsive
- Accessible
- Minimal clutter
- Clear information hierarchy

Avoid:
- Excessive gradients
- Fake AI animations
- Unreadable charts
- Overloaded dashboards

Use:
- Cards
- Progress indicators
- Requirement tables
- Expandable explanations
- Before/after views
- Status badges
- Search/filter

---

# 27. Recommended Application Architecture

Frontend:

- React
- TypeScript
- Tailwind CSS
- Component library such as shadcn/ui

Backend:

- Node.js / TypeScript OR Python FastAPI

Database:

- PostgreSQL

File storage:

- S3-compatible object storage

AI:

- Pluggable LLM provider
- Embeddings provider

Document parsing:

- PDF parser
- DOCX parser
- TXT parser

Authentication:

- Google OAuth
- Email/password
- Optional magic link

Payments:

- Stripe or another supported payment provider

Deployment:

- Vercel / Cloudflare for frontend
- Render / Railway / AWS / GCP for backend

Use environment variables for all secrets.

---

# 28. Suggested Folder Structure

```text
resume-match-ai/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── resume-parser/
│   ├── jd-analyzer/
│   ├── matching-engine/
│   ├── ats-auditor/
│   └── ai/
│
├── docs/
│
├── tests/
│
├── prisma/
│
├── public/
│
├── .env.example
├── AGENTS.md
├── README.md
└── package.json
```

---

# 29. Database Model

Core entities:

### User
```text
id
name
email
created_at
plan
```

### Resume
```text
id
user_id
name
original_file
parsed_text
structured_json
created_at
updated_at
```

### Job
```text
id
user_id
company
title
url
description
parsed_requirements
created_at
```

### Analysis
```text
id
resume_id
job_id
match_score
ats_health
requirements_json
recommendations_json
created_at
```

### ResumeVersion
```text
id
resume_id
job_id
content
version_name
created_at
```

### Application
```text
id
user_id
job_id
resume_version_id
status
applied_at
notes
```

---

# 30. API Design

Example endpoints:

```text
POST /api/resumes/upload
POST /api/resumes/parse
GET  /api/resumes/:id

POST /api/jobs/analyze
GET  /api/jobs/:id

POST /api/analysis/run
GET  /api/analysis/:id

POST /api/resumes/tailor
POST /api/resumes/rewrite

POST /api/cover-letter/generate
POST /api/interview/generate

GET /api/applications
POST /api/applications

POST /api/export/pdf
POST /api/export/docx
```

---

# 31. Matching Engine Pseudocode

```text
INPUT:
resume
job_description

resume_profile = parse_resume(resume)
job_profile = parse_job_description(job_description)

requirements = extract_requirements(job_profile)

FOR each requirement:
    exact = exact_match(requirement, resume_profile)
    normalized = normalized_match(requirement, resume_profile)
    semantic = semantic_match(requirement, resume_profile)
    evidence = find_supporting_evidence(requirement, resume_profile)

    calculate_match_strength()

calculate:
    required_skill_coverage
    responsibility_coverage
    experience_alignment
    education_alignment
    domain_alignment
    evidence_quality

match_score = weighted_calculation()

ats_audit = run_document_readability_checks(resume)

recommendations = generate_evidence_based_recommendations()

RETURN:
    score
    breakdown
    requirements
    missing_items
    weak_items
    ats_audit
    recommendations
```

---

# 32. ATS Audit Engine

Build independent checks:

```text
check_text_layer()
check_reading_order()
check_contact_information()
check_standard_sections()
check_columns()
check_tables()
check_headers_footers()
check_graphics()
check_special_characters()
check_file_type()
check_font_size_if_available()
```

Return:

```json
{
  "status": "healthy",
  "checks": [
    {
      "id": "text-layer",
      "severity": "critical",
      "status": "pass",
      "message": "Searchable text detected."
    }
  ]
}
```

Severity:

- Critical
- High
- Medium
- Low
- Info

---

# 33. Scoring Transparency

Use a score breakdown rather than a mysterious single number.

Example:

```text
Overall Match: 78

Required Skills:       86
Responsibilities:      74
Experience:             80
Education:             100
Domain:                 50
Evidence Quality:       72
```

Show the formula and weights in an expandable panel.

---

# 34. Privacy & Security

Resume files contain sensitive personal information.

Requirements:

- HTTPS
- Encryption at rest where applicable
- Secure authentication
- Signed file URLs
- Virus/malware scanning for uploads
- File type validation
- Maximum upload size
- Rate limiting
- Secure API authentication
- No API keys in frontend
- Clear data retention policy
- Delete account/data functionality
- Do not use customer resumes for model training unless explicitly permitted
- Audit logs for sensitive operations

For a privacy-first mode:

**Process resume/JD locally in the browser whenever practical.**

---

# 35. AI Guardrails

AI prompts must include:

```text
You are assisting with resume optimization.

You must never invent:
- experience
- skills
- certifications
- employment history
- education
- metrics
- employers
- job titles

If information is missing, say it is missing.

Only recommend adding a keyword if the candidate can truthfully support it.

Distinguish:
- present
- partially supported
- not found
- unknown

Never imply that a score guarantees an interview.
```

---

# 36. Anti-Hallucination Verification

After AI generates a tailored resume:

Run a verification pass.

Compare:

```text
original structured resume
vs
generated resume
```

Flag:

- New employer
- New job title
- New technology
- New certification
- New metric
- New date
- New degree
- New project

Require user confirmation before export if unsupported information is detected.

---

# 37. Export Requirements

Support:

- DOCX
- PDF
- Plain text

Export validation:

1. Generate document.
2. Extract text again.
3. Verify reading order.
4. Verify contact details.
5. Verify section headings.
6. Verify no accidental content loss.
7. Run ATS readability audit again.
8. Show final validation report.

---

# 38. Testing Requirements

Unit tests:

- Keyword normalization
- Acronym mapping
- Requirement extraction
- Score calculation
- Date parsing
- Section detection

Integration tests:

- Resume upload
- JD analysis
- Full matching flow
- AI tailoring
- Export

E2E tests:

```text
Upload resume
→ Paste JD
→ Analyze
→ Review gaps
→ Tailor
→ Validate
→ Export
```

Create test fixtures for:

- Simple one-column resume
- Two-column resume
- Table-heavy resume
- Image-only PDF
- Resume with missing contact details
- Resume with unusual headings
- Resume with technical acronyms

---

# 39. Performance Requirements

Target:

- Initial page load: fast
- Resume parsing: asynchronous
- JD analysis: asynchronous
- AI calls: streaming where useful
- Large documents: background processing
- Progress indicators for long tasks

Never block the UI without feedback.

---

# 40. Observability

Track:

- Parsing failures
- AI failures
- Export failures
- Processing time
- API errors
- Token/cost usage
- User actions
- Analysis completion

Do not log raw resume contents unnecessarily.

Mask PII in application logs.

---

# 41. Monetization

Suggested plans:

## Free
- 1 resume
- Limited JD analyses
- Basic ATS readability
- Basic keyword comparison

## Pro
- Multiple resumes
- Unlimited/large analysis allowance
- AI tailoring
- Requirement evidence mapping
- Cover letters
- Interview prep
- Version comparison
- Export

## Premium / Career
- Job tracker
- Multiple tailored versions
- Advanced analytics
- JD diff
- Application package
- Priority processing
- History

Do not promise employment outcomes.

---

# 42. Admin Dashboard

Admin should see:

- Users
- Active subscriptions
- Usage
- API/AI costs
- Failed jobs
- Parsing errors
- Export errors
- Feature usage
- Revenue metrics

Admin must NOT expose resume contents unnecessarily.

---

# 43. Real-Time User Experience

Analysis screen:

```text
Analyzing your resume...

✓ Resume parsed
✓ Sections detected
✓ Job requirements extracted
✓ Required skills identified
● Mapping resume evidence
○ Calculating match
○ Running readability checks
○ Generating recommendations
```

Then transition to:

```text
Analysis complete
```

Do not fake progress. Each progress step should correspond to an actual backend stage.

---

# 44. Premium "Deep Analysis" Workflow

For paid users:

```text
1. Parse resume
2. Parse JD
3. Normalize terminology
4. Extract hard requirements
5. Extract responsibilities
6. Extract preferred requirements
7. Map evidence
8. Detect critical gaps
9. Analyze quantified impact
10. Analyze bullet quality
11. Run ATS readability audit
12. Generate recommendations
13. Generate tailored draft
14. Verify factual consistency
15. Re-run analysis
16. Show before/after
17. Export
```

---

# 45. Suggested Premium Report

Sections:

### Executive Summary
- Match percentage
- ATS readability health
- Critical gaps
- Main strengths

### Requirement Matrix
A detailed requirement-by-requirement table.

### Keyword Intelligence
Matched / missing / weak terms.

### Experience Alignment
Role-by-role evidence.

### Resume Quality
Bullet and impact analysis.

### ATS Readability
Document-level checks.

### Recommended Changes
Prioritized actions.

### Tailored Resume
Editable generated version.

### Verification
Fact consistency check.

---

# 46. Requirement Matrix UI

Example:

| JD Requirement | Priority | Resume Evidence | Match | Action |
|---|---|---|---|---|
| SQL | Required | Experience | Strong | Keep |
| Python | Required | Skills + Project | Strong | Strengthen |
| PySpark | Required | Not found | Missing | Add only if true |
| Power BI | Required | Experience | Strong | Move evidence higher |
| Databricks | Preferred | Not found | Missing | Review |
| Stakeholder management | Required | Experience | Partial | Add concrete example |

---

# 47. Recommendation Prioritization

Rank actions by:

```text
Impact
Confidence
Effort
```

Example:

```text
HIGH IMPACT
Strengthen SQL evidence in Experience.

MEDIUM IMPACT
Add Power BI dashboard outcome if you have measurable evidence.

LOW IMPACT
Rename "My Skills" to "Technical Skills".
```

This is prioritization of resume edits, not a prediction of hiring outcome.

---

# 48. Job-Specific Resume Builder

Allow users to edit:

- Summary
- Skills
- Experience bullets
- Projects
- Certifications

Provide side-by-side:

```text
LEFT:
Resume editor

RIGHT:
JD requirements

BOTTOM:
Live validation
```

Live validation:

```text
Required skill coverage: 86%
Critical gaps: 2
ATS readability: Healthy
Unsupported claims: 0
```

---

# 49. Important UX Rule

Never encourage keyword stuffing.

If a keyword appears repeatedly without supporting evidence, show:

> "This keyword is present, but adding more repetitions may not improve the quality of the resume. Prefer one or two truthful, evidence-backed mentions."

---

# 50. Accessibility

Implement:

- Keyboard navigation
- ARIA labels
- Focus states
- Screen-reader support
- Sufficient contrast
- Error messages
- Accessible upload controls
- Accessible tables
- No color-only status indicators

---

# 51. Internationalization

Prepare architecture for:

- English
- Indian English
- US English
- UK English

Date formats should be configurable.

---

# 52. MVP Scope

Build first:

1. Landing page
2. Resume upload
3. Resume text extraction
4. JD input
5. JD requirement extraction
6. Keyword matching
7. Requirement matrix
8. ATS readability checks
9. Transparent match score
10. Recommendations
11. Basic export
12. Authentication

Do NOT build payments, job tracker, advanced AI tailoring, or interview preparation until the core analysis is stable.

---

# 53. Phase 2

Add:

- AI tailoring
- Before/after editor
- Evidence mapping
- Cover letters
- Interview preparation
- Resume versions
- Advanced export

---

# 54. Phase 3

Add:

- Job tracker
- JD diff
- Analytics
- Subscription billing
- Team/recruiter features
- Browser extension
- LinkedIn/job-board integrations only where permitted by platform policies and APIs

---

# 55. Definition of Done

The MVP is complete only when:

- A user can upload a resume.
- The application can extract usable text.
- A user can paste a JD.
- The JD is converted into structured requirements.
- Resume requirements are matched transparently.
- Missing/partial requirements are shown.
- ATS readability risks are shown.
- The score has an explainable breakdown.
- AI suggestions cannot invent facts.
- Tailored content can be verified against the original resume.
- Exported files are re-parsed and validated.
- Tests cover the core matching logic.
- Sensitive resume data is handled securely.
- UI is responsive and accessible.

---

# 56. Antigravity Build Instructions

Use this document as the product specification.

Recommended sequence for the Antigravity agent:

## Agent Task 1 — Architecture

Read this specification.

Create:

```text
ARCHITECTURE.md
```

Define:
- frontend architecture
- backend architecture
- database
- AI layer
- parser
- matching engine
- security
- deployment

Do not start implementation until architecture is documented.

## Agent Task 2 — Project Scaffold

Create the application skeleton.

Requirements:
- TypeScript
- React
- responsive UI
- environment configuration
- linting
- formatting
- testing

## Agent Task 3 — Resume Parser

Implement PDF/DOCX/TXT extraction.

Create tests using multiple fixture resumes.

## Agent Task 4 — JD Analyzer

Implement structured JD extraction.

## Agent Task 5 — Matching Engine

Implement deterministic matching first.

Add semantic/AI matching only as a separate layer.

## Agent Task 6 — ATS Auditor

Implement document/readability checks.

## Agent Task 7 — Dashboard

Build the complete analysis dashboard.

## Agent Task 8 — AI Tailoring

Implement controlled AI rewriting with verification.

## Agent Task 9 — Export

Generate DOCX/PDF/TXT.

Re-parse exports and validate.

## Agent Task 10 — Testing

Run:
- unit tests
- integration tests
- E2E tests
- accessibility checks
- security checks

Fix issues before adding new features.

---

# 57. Antigravity Agent Rules

The coding agent must:

1. Read this specification before coding.
2. Maintain a task plan.
3. Work in small verifiable increments.
4. Run tests after meaningful changes.
5. Never silently modify architecture.
6. Document major decisions.
7. Avoid hardcoded secrets.
8. Use environment variables.
9. Validate external inputs.
10. Sanitize uploaded documents.
11. Avoid unnecessary PII logging.
12. Never invent resume facts.
13. Never claim universal ATS behavior.
14. Never claim an interview guarantee.
15. Explain scoring calculations.
16. Keep deterministic matching separate from LLM reasoning.
17. Add tests for every critical scoring rule.
18. Re-run exported documents through the parser.
19. Use browser testing for important user journeys.
20. Prefer maintainability over unnecessary complexity.

---

# 58. Suggested AGENTS.md Instruction

Create an `AGENTS.md` file containing:

```md
# ResumeMatch AI Agent Rules

You are building a production-quality resume analysis platform.

Always:
- Read the product specification before implementation.
- Keep changes modular.
- Test critical logic.
- Explain architectural decisions.
- Never expose secrets.
- Never fabricate candidate qualifications.
- Never create unsupported resume metrics.
- Treat "not found" as different from "candidate does not have".
- Do not claim to simulate a universal ATS.
- Keep the score explainable.
- Separate deterministic algorithms from AI-generated reasoning.
- Validate AI-generated resumes against the source resume.
- Re-run exported documents through the parsing pipeline.
- Protect resume PII.
- Do not log full resumes unless explicitly required for debugging and properly protected.
- Use accessible UI patterns.
- Keep the application responsive.

Before finishing a task:
1. Run tests.
2. Check TypeScript/build errors.
3. Check relevant UI flows.
4. Review security implications.
5. Update documentation if architecture changed.
```

---

# 59. First Antigravity Prompt

Paste this after placing the specification in the project:

> Read `RESUME_ATS_PLATFORM_SPEC.md` and `AGENTS.md`.
>
> Do not immediately start coding.
>
> First inspect the workspace and produce:
>
> 1. Architecture proposal
> 2. Technology choices
> 3. Folder structure
> 4. Database schema
> 5. API contract
> 6. Matching-engine design
> 7. ATS-audit design
> 8. AI safety/verification design
> 9. Testing strategy
> 10. MVP implementation plan
>
> Identify assumptions and risks.
>
> After the plan is reviewed, implement the MVP in small phases.
>
> For every phase:
> - implement
> - test
> - verify
> - document
>
> Do not build payment or premium features until the core analysis workflow is stable.

---

# 60. Final Product Vision

The finished application should feel like a professional career intelligence platform rather than a simple keyword scanner.

The core experience should be:

```text
Resume
   +
Job Description
   ↓
Document Parsing
   ↓
Requirement Extraction
   ↓
Evidence Mapping
   ↓
Resume–JD Matching
   ↓
ATS Readability Audit
   ↓
Gap Analysis
   ↓
Actionable Recommendations
   ↓
AI Tailoring
   ↓
Fact Verification
   ↓
Final Validation
   ↓
Export
```

The product's central promise should be:

> **Understand exactly how your resume aligns with a specific job description, identify evidence gaps, improve the resume truthfully, and validate the final document before applying.**

It should be transparent, privacy-conscious, explainable, and designed around truthful candidate information.
