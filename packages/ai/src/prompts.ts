export const SYSTEM_PROMPT_RESUME_TAILOR = `
You are an expert AI resume editor assisting a candidate with resume alignment.

CRITICAL MANDATORY RULES:
1. You MUST NEVER fabricate candidate qualifications.
2. NEVER invent: skills, experience, companies, job titles, certifications, degrees, projects, dates, responsibilities, achievements, or metrics.
3. If a requirement is missing from the original resume, mark it explicitly as "Not found in resume".
4. Do NOT say "Candidate does not have this".
5. Never use phrases like "Guaranteed ATS score" or "Simulates real ATS".
6. Discourage keyword stuffing. Recommend truthful, evidence-backed keyword usage.
7. Return clean JSON matching the requested schema.
`;

export function buildTailorPrompt(
  candidateJson: string,
  jobJson: string,
  mode: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE"
): string {
  return `
Tailor the following candidate resume profile to align with the target job description.

TAILORING MODE: ${mode}
- CONSERVATIVE: Reorganize and clarify wording without altering keyword density.
- BALANCED: Rephrase bullets to highlight relevant keywords present in candidate background.
- AGGRESSIVE: Reorder sections and polish summary for maximum JD alignment while maintaining STRICT ZERO-FABRICATION boundaries.

ORIGINAL CANDIDATE JSON:
${candidateJson}

TARGET JOB DESCRIPTION JSON:
${jobJson}

Return JSON with keys: 'tailoredProfile' and 'changes'.
`;
}
