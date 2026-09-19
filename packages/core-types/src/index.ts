import { z } from "zod";

// ==========================================
// 1. CANDIDATE & RESUME SCHEMAS
// ==========================================

export const CandidateContactSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().default(""),
  portfolio: z.string().default(""),
});
export type CandidateContact = z.infer<typeof CandidateContactSchema>;

export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().default(""),
  title: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  location: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  quantifiedBulletsCount: z.number().default(0),
});
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;

export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().default(""),
  degree: z.string().default(""),
  fieldOfStudy: z.string().optional(),
  year: z.string().default(""),
  gpa: z.string().optional(),
});
export type Education = z.infer<typeof EducationSchema>;

export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().default(""),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  link: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CandidateProfileSchema = z.object({
  candidate: CandidateContactSchema,
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(z.string()).default([]),
  projects: z.array(ProjectSchema).default([]),
  awards: z.array(z.string()).default([]),
  publications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  detectedSections: z.array(z.string()).default([]),
  rawTextLength: z.number().default(0),
  pageCount: z.number().default(1),
});
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

// ==========================================
// 2. JOB DESCRIPTION & REQUIREMENT SCHEMAS
// ==========================================

export const RequirementCategoryEnum = z.enum([
  "MUST_HAVE_SKILL",
  "PREFERRED_SKILL",
  "RESPONSIBILITY",
  "EXPERIENCE",
  "EDUCATION",
  "CERTIFICATION",
  "DOMAIN",
  "SOFT_SKILL",
  "JOB_TITLE",
  "TOOL_TECHNOLOGY",
]);
export type RequirementCategory = z.infer<typeof RequirementCategoryEnum>;

export const MatchStatusEnum = z.enum([
  "STRONG_MATCH",
  "PARTIAL_MATCH",
  "WEAK_EVIDENCE",
  "MISSING",
  "NEEDS_REVIEW",
]);
export type MatchStatus = z.infer<typeof MatchStatusEnum>;

export const PriorityLevelEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
export type PriorityLevel = z.infer<typeof PriorityLevelEnum>;

export const JobRequirementSchema = z.object({
  id: z.string(),
  category: RequirementCategoryEnum,
  priority: PriorityLevelEnum,
  frequency: z.number().default(1),
  exactPhrase: z.string(),
  normalizedTerm: z.string(),
  description: z.string().optional(),
  minYears: z.number().optional(),
});
export type JobRequirement = z.infer<typeof JobRequirementSchema>;

export const JobProfileSchema = z.object({
  title: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  experienceLevel: z.string().default(""),
  employmentType: z.string().default(""),
  workArrangement: z.string().default(""),
  requirements: z.array(JobRequirementSchema).default([]),
  rawDescription: z.string().default(""),
});
export type JobProfile = z.infer<typeof JobProfileSchema>;

// ==========================================
// 3. MATCHING ENGINE & EXPLAINABILITY SCHEMAS
// ==========================================

export const EvidenceMappingSchema = z.object({
  requirementId: z.string(),
  requirementText: z.string(),
  category: RequirementCategoryEnum,
  status: MatchStatusEnum,
  evidenceText: z.string(), // "Not found in resume" if missing
  sourceSection: z.string(), // e.g. "Experience > Tech Corp > Bullet 2"
  matchStrengthScore: z.number().min(0).max(100),
  recommendationAction: z.string(),
});
export type EvidenceMapping = z.infer<typeof EvidenceMappingSchema>;

export const CategoryScoreBreakdownSchema = z.object({
  category: z.string(),
  label: z.string(),
  weightPercentage: z.number(),
  score: z.number().min(0).max(100),
  matchedCount: z.number(),
  totalCount: z.number(),
  details: z.string(),
});
export type CategoryScoreBreakdown = z.infer<typeof CategoryScoreBreakdownSchema>;

export const MatchScoreExplanationSchema = z.object({
  overallMatchScore: z.number().min(0).max(100),
  metricLabel: z.literal("Resume–JD Match Score"),
  formulaDescription: z.string(),
  breakdown: z.array(CategoryScoreBreakdownSchema),
  criticalGaps: z.array(z.object({
    requirement: z.string(),
    foundEvidence: z.string(), // "Not found in resume"
    status: z.string(),
    actionableFix: z.string(),
  })),
  weightings: z.record(z.string(), z.number()),
});
export type MatchScoreExplanation = z.infer<typeof MatchScoreExplanationSchema>;

// ==========================================
// 4. ATS READABILITY AUDIT SCHEMAS
// ==========================================

export const CheckSeverityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]);
export type CheckSeverity = z.infer<typeof CheckSeverityEnum>;

export const ATSCheckItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: CheckSeverityEnum,
  status: z.enum(["PASS", "WARNING", "FAIL", "INFO"]),
  message: z.string(),
  recommendation: z.string(),
  sectionAffected: z.string().optional(),
});
export type ATSCheckItem = z.infer<typeof ATSCheckItemSchema>;

export const ATSAuditReportSchema = z.object({
  atsHealthScore: z.number().min(0).max(100),
  metricLabel: z.literal("ATS Readability / Parsing Health"),
  statusSummary: z.enum(["HEALTHY", "NEEDS_ATTENTION", "HIGH_RISK"]),
  checks: z.array(ATSCheckItemSchema),
  parsedReadingOrderSnippet: z.string().optional(),
  detectedFormattingRisksCount: z.number(),
});
export type ATSAuditReport = z.infer<typeof ATSAuditReportSchema>;

// ==========================================
// 5. KEYWORD INTELLIGENCE SCHEMAS
// ==========================================

export const KeywordIntelligenceSchema = z.object({
  matchedKeywords: z.array(z.object({
    term: z.string(),
    countInJD: z.number(),
    countInResume: z.number(),
    evidenceStrength: z.enum(["STRONG", "MODERATE", "WEAK"]),
  })),
  missingKeywords: z.array(z.object({
    term: z.string(),
    category: RequirementCategoryEnum,
    guidance: z.string(), // "Not found in resume — add only if you genuinely have this experience."
  })),
  underrepresentedKeywords: z.array(z.object({
    term: z.string(),
    currentMentions: z.number(),
    targetFrequency: z.number(),
    recommendation: z.string(),
  })),
});
export type KeywordIntelligence = z.infer<typeof KeywordIntelligenceSchema>;

// ==========================================
// 6. AI TAILORING & ANTI-HALLUCINATION SCHEMAS
// ==========================================

export const TailoringModeEnum = z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]);
export type TailoringMode = z.infer<typeof TailoringModeEnum>;

export const TailoringChangeItemSchema = z.object({
  id: z.string(),
  section: z.string(),
  beforeText: z.string(),
  afterText: z.string(),
  reason: z.string(),
  targetRequirement: z.string().optional(),
});
export type TailoringChangeItem = z.infer<typeof TailoringChangeItemSchema>;

export const AntiHallucinationFlagSchema = z.object({
  type: z.enum([
    "UNSUPPORTED_SKILL",
    "UNSUPPORTED_COMPANY",
    "UNSUPPORTED_JOB_TITLE",
    "UNSUPPORTED_METRIC",
    "UNSUPPORTED_DATE",
    "UNSUPPORTED_CERTIFICATION",
    "UNSUPPORTED_DEGREE",
  ]),
  flaggedValue: z.string(),
  location: z.string(),
  message: z.string(), // "Not found in resume"
});
export type AntiHallucinationFlag = z.infer<typeof AntiHallucinationFlagSchema>;

export const AntiHallucinationReportSchema = z.object({
  passed: z.boolean(),
  flagsCount: z.number(),
  flags: z.array(AntiHallucinationFlagSchema),
  userVerificationRequired: z.boolean(),
});
export type AntiHallucinationReport = z.infer<typeof AntiHallucinationReportSchema>;

export const TailoredResumeResultSchema = z.object({
  mode: TailoringModeEnum,
  tailoredProfile: CandidateProfileSchema,
  changes: z.array(TailoringChangeItemSchema),
  antiHallucinationReport: AntiHallucinationReportSchema,
});
export type TailoredResumeResult = z.infer<typeof TailoredResumeResultSchema>;

// ==========================================
// 7. COMPLETE ANALYSIS REPORT SCHEMA
// ==========================================

export const FullAnalysisReportSchema = z.object({
  id: z.string(),
  resumeId: z.string(),
  jobId: z.string(),
  createdAt: z.string(),
  candidateProfile: CandidateProfileSchema,
  jobProfile: JobProfileSchema,
  scoreExplanation: MatchScoreExplanationSchema,
  atsAudit: ATSAuditReportSchema,
  evidenceMatrix: z.array(EvidenceMappingSchema),
  keywordIntelligence: KeywordIntelligenceSchema,
  actionableRecommendations: z.array(z.object({
    id: z.string(),
    priority: z.enum(["HIGH_IMPACT", "MEDIUM_IMPACT", "LOW_IMPACT"]),
    title: z.string(),
    description: z.string(),
    section: z.string(),
    effort: z.enum(["EASY", "MEDIUM", "HARD"]),
  })),
});
export type FullAnalysisReport = z.infer<typeof FullAnalysisReportSchema>;
