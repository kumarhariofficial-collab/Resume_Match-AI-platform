import {
  CandidateProfile,
  WorkExperience,
  AntiHallucinationReport,
  AntiHallucinationFlag,
} from "@resumematch/core-types";

export function verifyAntiHallucination(
  original: CandidateProfile,
  generated: CandidateProfile
): AntiHallucinationReport {
  const flags: AntiHallucinationFlag[] = [];

  // 1. Verify Skills Set
  const originalSkillsLower = new Set(original.skills.map((s: string) => s.toLowerCase()));
  for (const genSkill of generated.skills) {
    if (!originalSkillsLower.has(genSkill.toLowerCase())) {
      flags.push({
        type: "UNSUPPORTED_SKILL",
        flaggedValue: genSkill,
        location: "Skills Section",
        message: `Skill '${genSkill}' was not found in the candidate's original resume.`,
      });
    }
  }

  // 2. Verify Work Experience Companies & Titles
  const originalCompanies = new Set(original.experience.map((e: WorkExperience) => e.company.toLowerCase()));
  const originalTitles = new Set(original.experience.map((e: WorkExperience) => e.title.toLowerCase()));

  for (const genExp of generated.experience) {
    if (genExp.company && !originalCompanies.has(genExp.company.toLowerCase())) {
      flags.push({
        type: "UNSUPPORTED_COMPANY",
        flaggedValue: genExp.company,
        location: "Work Experience",
        message: `Company '${genExp.company}' was not present in original work history.`,
      });
    }

    if (genExp.title && !originalTitles.has(genExp.title.toLowerCase())) {
      flags.push({
        type: "UNSUPPORTED_JOB_TITLE",
        flaggedValue: genExp.title,
        location: `Work Experience > ${genExp.company}`,
        message: `Job title '${genExp.title}' was not found in original profile.`,
      });
    }

    // Check for newly introduced metrics (percentages, currency, user counts)
    const genMetrics = extractMetricsFromBullets(genExp.bullets);
    const origMetrics = extractMetricsFromBullets(
      original.experience.flatMap((e: WorkExperience) => e.bullets)
    );

    for (const metric of genMetrics) {
      if (!origMetrics.has(metric)) {
        flags.push({
          type: "UNSUPPORTED_METRIC",
          flaggedValue: metric,
          location: `Work Experience > ${genExp.company}`,
          message: `Quantified metric '${metric}' was not present in original resume. Candidate must verify accuracy.`,
        });
      }
    }
  }

  // 3. Verify Certifications
  const originalCerts = new Set(original.certifications.map((c: string) => c.toLowerCase()));
  for (const genCert of generated.certifications) {
    if (!originalCerts.has(genCert.toLowerCase())) {
      flags.push({
        type: "UNSUPPORTED_CERTIFICATION",
        flaggedValue: genCert,
        location: "Certifications Section",
        message: `Certification '${genCert}' was not found in original profile.`,
      });
    }
  }

  return {
    passed: flags.length === 0,
    flagsCount: flags.length,
    flags,
    userVerificationRequired: flags.length > 0,
  };
}

function extractMetricsFromBullets(bullets: string[]): Set<string> {
  const metrics = new Set<string>();
  const regex = /\b(\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?[kKMbB]?|\d+\s*(?:hrs|hours|days|users|clients|projects|million|billion|k))\b/gi;

  for (const bullet of bullets) {
    const matches = bullet.match(regex);
    if (matches) {
      for (const m of matches) {
        metrics.add(m.toLowerCase());
      }
    }
  }
  return metrics;
}
