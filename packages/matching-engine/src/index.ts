import {
  CandidateProfile,
  JobProfile,
  EvidenceMapping,
  MatchScoreExplanation,
  CategoryScoreBreakdown,
  KeywordIntelligence,
  MatchStatus,
} from "@resumematch/core-types";
import { areTermsEquivalent } from "./synonyms.js";

export * from "./synonyms.js";

// Configurable category weights (defaults sum to 100%)
const DEFAULT_WEIGHTS: Record<string, number> = {
  MUST_HAVE_SKILL: 30,
  EXPERIENCE: 20,
  RESPONSIBILITY: 20,
  PREFERRED_SKILL: 15,
  EDUCATION: 5,
  DOMAIN: 5,
  SOFT_SKILL: 5,
};

export interface MatchEngineResult {
  scoreExplanation: MatchScoreExplanation;
  evidenceMatrix: EvidenceMapping[];
  keywordIntelligence: KeywordIntelligence;
}

export function runMatchingEngine(
  candidate: CandidateProfile,
  job: JobProfile,
  customWeights: Record<string, number> = DEFAULT_WEIGHTS
): MatchEngineResult {
  const evidenceMatrix: EvidenceMapping[] = [];
  const candidateText = buildCandidateFullText(candidate).toLowerCase();

  const categoryMatches: Record<string, { total: number; matched: number; scoreSum: number }> = {};

  // Process each JD requirement
  for (const req of job.requirements) {
    const category = req.category;
    if (!categoryMatches[category]) {
      categoryMatches[category] = { total: 0, matched: 0, scoreSum: 0 };
    }
    categoryMatches[category].total += 1;

    // Search for evidence in candidate profile
    const evidence = findEvidenceForRequirement(req.exactPhrase, candidate);

    let status: MatchStatus = "MISSING";
    let matchScore = 0;
    let evidenceText = "Not found in resume"; // MANDATORY RULE 2
    let sourceSection = "Not found";
    let recommendation = `Missing required skill/term "${req.exactPhrase}". Add only if you genuinely have this experience.`;

    if (evidence.found) {
      matchScore = evidence.strength;
      evidenceText = evidence.text;
      sourceSection = evidence.source;

      if (evidence.strength >= 85) {
        status = "STRONG_MATCH";
        recommendation = `Strong match found in ${evidence.source}. Maintain evidence clarity.`;
      } else if (evidence.strength >= 50) {
        status = "PARTIAL_MATCH";
        recommendation = `Partial evidence found. Consider elaborating on ${req.exactPhrase} in experience bullets.`;
      } else {
        status = "WEAK_EVIDENCE";
        recommendation = `Weak evidence. Strengthen evidence with measurable metrics if true.`;
      }
    }

    categoryMatches[category].matched += evidence.found ? 1 : 0;
    categoryMatches[category].scoreSum += matchScore;

    evidenceMatrix.push({
      requirementId: req.id,
      requirementText: req.exactPhrase,
      category: req.category,
      status,
      evidenceText,
      sourceSection,
      matchStrengthScore: matchScore,
      recommendationAction: recommendation,
    });
  }

  // Build category score breakdowns
  const breakdown: CategoryScoreBreakdown[] = [];
  let weightedScoreSum = 0;
  let totalWeight = 0;

  const categoryLabels: Record<string, string> = {
    MUST_HAVE_SKILL: "Required Skills",
    EXPERIENCE: "Experience Alignment",
    RESPONSIBILITY: "Responsibilities Alignment",
    PREFERRED_SKILL: "Technical & Preferred Skills",
    EDUCATION: "Education & Certifications",
    DOMAIN: "Domain Alignment",
    SOFT_SKILL: "Soft Skills",
  };

  for (const [catKey, weight] of Object.entries(customWeights)) {
    const stats = categoryMatches[catKey] || { total: 0, matched: 0, scoreSum: 0 };
    const score = stats.total > 0 ? Math.round(stats.scoreSum / stats.total) : 100;
    
    breakdown.push({
      category: catKey,
      label: categoryLabels[catKey] || catKey,
      weightPercentage: weight,
      score,
      matchedCount: stats.matched,
      totalCount: stats.total,
      details: `${stats.matched} of ${stats.total} requirements matched (${score}% score)`,
    });

    weightedScoreSum += (score * weight) / 100;
    totalWeight += weight;
  }

  const overallMatchScore = Math.min(100, Math.max(0, Math.round((weightedScoreSum / (totalWeight || 100)) * 100)));

  // Critical Gaps
  const criticalGaps = evidenceMatrix
    .filter((e) => e.category === "MUST_HAVE_SKILL" && e.status === "MISSING")
    .map((e) => ({
      requirement: e.requirementText,
      foundEvidence: "Not found in resume", // MANDATORY RULE 2
      status: "Review required",
      actionableFix: `Add ${e.requirementText} evidence only if you genuinely possess this qualification.`,
    }));

  // Keyword Intelligence
  const matchedKeywords: any[] = [];
  const missingKeywords: any[] = [];
  const underrepresentedKeywords: any[] = [];

  for (const item of evidenceMatrix) {
    if (item.status === "STRONG_MATCH" || item.status === "PARTIAL_MATCH") {
      matchedKeywords.push({
        term: item.requirementText,
        countInJD: 1,
        countInResume: 1,
        evidenceStrength: item.status === "STRONG_MATCH" ? "STRONG" : "MODERATE",
      });
    } else if (item.status === "MISSING") {
      missingKeywords.push({
        term: item.requirementText,
        category: item.category,
        guidance: "Not found in resume — add only if you genuinely have this experience.", // MANDATORY RULE 2
      });
    }
  }

  return {
    scoreExplanation: {
      overallMatchScore,
      metricLabel: "Resume–JD Match Score", // MANDATORY RULE 1
      formulaDescription: "Weighted score = Required Skills (30%) + Experience (20%) + Responsibilities (20%) + Technical Skills (15%) + Education (5%) + Domain (5%) + Soft Skills (5%)",
      breakdown,
      criticalGaps,
      weightings: customWeights,
    },
    evidenceMatrix,
    keywordIntelligence: {
      matchedKeywords,
      missingKeywords,
      underrepresentedKeywords,
    },
  };
}

function findEvidenceForRequirement(
  targetTerm: string,
  candidate: CandidateProfile
): { found: boolean; text: string; source: string; strength: number } {
  const targetLower = targetTerm.toLowerCase();

  // 1. Direct match in candidate skills list
  for (const skill of candidate.skills) {
    if (areTermsEquivalent(skill, targetTerm)) {
      return {
        found: true,
        text: `Skills section contains "${skill}"`,
        source: "Skills Section",
        strength: 90,
      };
    }
  }

  // 2. Direct/Phrase match in Work Experience bullets
  for (const exp of candidate.experience) {
    for (let i = 0; i < exp.bullets.length; i++) {
      const bullet = exp.bullets[i];
      if (bullet.toLowerCase().includes(targetLower) || areTermsEquivalent(targetTerm, bullet)) {
        return {
          found: true,
          text: `"${bullet}"`,
          source: `Experience > ${exp.company} > Bullet ${i + 1}`,
          strength: 100,
        };
      }
    }
  }

  // 3. Match in Education
  for (const edu of candidate.education) {
    if (edu.institution.toLowerCase().includes(targetLower) || edu.degree.toLowerCase().includes(targetLower)) {
      return {
        found: true,
        text: `Education: ${edu.degree} at ${edu.institution}`,
        source: "Education Section",
        strength: 100,
      };
    }
  }

  // 4. Match in Certifications
  for (const cert of candidate.certifications) {
    if (cert.toLowerCase().includes(targetLower) || areTermsEquivalent(cert, targetTerm)) {
      return {
        found: true,
        text: `Certification: "${cert}"`,
        source: "Certifications Section",
        strength: 100,
      };
    }
  }

  // 5. Match in Summary
  if (candidate.summary.toLowerCase().includes(targetLower)) {
    return {
      found: true,
      text: `Summary mentions "${targetTerm}"`,
      source: "Professional Summary",
      strength: 75,
    };
  }

  return {
    found: false,
    text: "Not found in resume",
    source: "Not found",
    strength: 0,
  };
}

function buildCandidateFullText(candidate: CandidateProfile): string {
  const parts = [
    candidate.summary,
    ...candidate.skills,
    ...candidate.experience.map((e) => `${e.company} ${e.title} ${e.bullets.join(" ")}`),
    ...candidate.education.map((e) => `${e.degree} ${e.institution}`),
    ...candidate.certifications,
  ];
  return parts.join(" ");
}
