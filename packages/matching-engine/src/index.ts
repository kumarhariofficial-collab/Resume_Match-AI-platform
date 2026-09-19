import {
  CandidateProfile,
  JobProfile,
  EvidenceMapping,
  MatchScoreExplanation,
  CategoryScoreBreakdown,
  KeywordIntelligence,
  MatchStatus,
} from "@resumematch/core-types";
import { areTermsEquivalent } from "./synonyms";

export * from "./synonyms";

const DEFAULT_WEIGHTS: Record<string, number> = {
  MUST_HAVE_SKILL: 35,
  EXPERIENCE: 25,
  RESPONSIBILITY: 20,
  PREFERRED_SKILL: 10,
  EDUCATION: 5,
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
  const candidateFullText = buildCandidateFullText(candidate).toLowerCase();

  let matchedCount = 0;
  let totalRequirements = job.requirements.length;

  const categoryStats: Record<string, { total: number; matched: number; scoreSum: number }> = {};

  for (const req of job.requirements) {
    const category = req.category || "MUST_HAVE_SKILL";
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, matched: 0, scoreSum: 0 };
    }
    categoryStats[category].total += 1;

    // Search for evidence in candidate profile
    const evidence = findEvidenceForRequirement(req.exactPhrase, candidate, candidateFullText);

    let status: MatchStatus = "MISSING";
    let matchScore = 0;
    let evidenceText = "Not found in resume"; // MANDATORY RULE 2
    let sourceSection = "Not found";
    let recommendation = `Missing required skill "${req.exactPhrase}". Add only if you genuinely have this experience.`;

    if (evidence.found) {
      matchScore = evidence.strength;
      evidenceText = evidence.text;
      sourceSection = evidence.source;
      matchedCount++;

      if (evidence.strength >= 80) {
        status = "STRONG_MATCH";
        recommendation = `Strong evidence detected in ${evidence.source}. Maintain clear metrics.`;
      } else if (evidence.strength >= 40) {
        status = "PARTIAL_MATCH";
        recommendation = `Partial evidence found for "${req.exactPhrase}". Strengthen bullet points if accurate.`;
      } else {
        status = "WEAK_EVIDENCE";
        recommendation = `Weak evidence. Elaborate on "${req.exactPhrase}" in your experience section if truthful.`;
      }
    }

    categoryStats[category].matched += evidence.found ? 1 : 0;
    categoryStats[category].scoreSum += matchScore;

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

  // Calculate dynamic category score breakdowns
  const breakdown: CategoryScoreBreakdown[] = [];
  let weightedScoreSum = 0;
  let totalWeightSum = 0;

  const categoryLabels: Record<string, string> = {
    MUST_HAVE_SKILL: "Required Hard Skills",
    EXPERIENCE: "Experience & Role Alignment",
    RESPONSIBILITY: "Responsibilities Alignment",
    PREFERRED_SKILL: "Preferred & Technical Tools",
    EDUCATION: "Education & Certifications",
    SOFT_SKILL: "Soft Skills & Leadership",
  };

  for (const [catKey, weight] of Object.entries(customWeights)) {
    const stats = categoryStats[catKey];
    if (stats && stats.total > 0) {
      const categoryScore = Math.round(stats.scoreSum / stats.total);
      breakdown.push({
        category: catKey,
        label: categoryLabels[catKey] || catKey,
        weightPercentage: weight,
        score: categoryScore,
        matchedCount: stats.matched,
        totalCount: stats.total,
        details: `${stats.matched} of ${stats.total} requirements matched (${categoryScore}%)`,
      });
      weightedScoreSum += (categoryScore * weight) / 100;
      totalWeightSum += weight;
    }
  }

  // Calculate overall match score dynamically (0% to 100%)
  let overallMatchScore = 0;
  if (totalRequirements > 0) {
    if (totalWeightSum > 0) {
      overallMatchScore = Math.round((weightedScoreSum / totalWeightSum) * 100);
    } else {
      overallMatchScore = Math.round((matchedCount / totalRequirements) * 100);
    }
  }
  overallMatchScore = Math.max(0, Math.min(100, overallMatchScore));

  // Identify Critical Gaps
  const criticalGaps = evidenceMatrix
    .filter((e) => (e.category === "MUST_HAVE_SKILL" || e.category === "EXPERIENCE") && e.status === "MISSING")
    .map((e) => ({
      requirement: e.requirementText,
      foundEvidence: "Not found in resume", // MANDATORY RULE 2
      status: "Review required",
      actionableFix: `Add evidence for "${e.requirementText}" only if you genuinely have this experience.`,
    }));

  // Keyword Intelligence
  const matchedKeywords: any[] = [];
  const missingKeywords: any[] = [];

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
      formulaDescription: "Dynamic Weighted Score = Required Skills (35%) + Experience (25%) + Responsibilities (20%) + Technical Tools (10%) + Education (5%) + Soft Skills (5%)",
      breakdown,
      criticalGaps,
      weightings: customWeights,
    },
    evidenceMatrix,
    keywordIntelligence: {
      matchedKeywords,
      missingKeywords,
      underrepresentedKeywords: [],
    },
  };
}

function findEvidenceForRequirement(
  targetTerm: string,
  candidate: CandidateProfile,
  fullTextLower: string
): { found: boolean; text: string; source: string; strength: number } {
  const targetLower = targetTerm.toLowerCase().trim();
  if (!targetLower) return { found: false, text: "Not found in resume", source: "Not found", strength: 0 };

  // 1. Direct match in candidate skills list
  for (const skill of candidate.skills) {
    if (areTermsEquivalent(skill, targetTerm) || skill.toLowerCase().includes(targetLower)) {
      return {
        found: true,
        text: `Skills section lists "${skill}"`,
        source: "Skills Section",
        strength: 95,
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
        strength: 90,
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
        strength: 95,
      };
    }
  }

  // 5. Direct substring match in summary
  if (candidate.summary && candidate.summary.toLowerCase().includes(targetLower)) {
    return {
      found: true,
      text: `Summary mentions "${targetTerm}"`,
      source: "Professional Summary",
      strength: 80,
    };
  }

  // 6. Substring match anywhere in candidate full text
  if (fullTextLower.includes(targetLower)) {
    return {
      found: true,
      text: `Mentioned in candidate profile text`,
      source: "Resume Content",
      strength: 60,
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
    candidate.summary || "",
    ...(candidate.skills || []),
    ...(candidate.experience || []).map((e) => `${e.company} ${e.title} ${(e.bullets || []).join(" ")}`),
    ...(candidate.education || []).map((e) => `${e.degree} ${e.institution}`),
    ...(candidate.certifications || []),
  ];
  return parts.join(" ");
}
