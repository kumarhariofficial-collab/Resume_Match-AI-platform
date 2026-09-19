export interface ParsedSections {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
  projects: string;
  awards: string;
  languages: string;
  detectedHeadings: string[];
}

const SECTION_PATTERNS: Record<keyof Omit<ParsedSections, "detectedHeadings">, RegExp> = {
  summary: /^(professional\s+summary|executive\s+summary|summary|profile|about\s+me|overview)/i,
  experience: /^(work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history|career\s+history)/i,
  education: /^(education|academic\s+background|qualifications|education\s+&\s+training)/i,
  skills: /^(skills|technical\s+skills|core\s+competencies|technologies|areas\s+of\s+expertise)/i,
  certifications: /^(certifications|licenses|professional\s+certifications|accreditations)/i,
  projects: /^(projects|key\s+projects|personal\s+projects|portfolio)/i,
  awards: /^(awards|honors|achievements|recognition)/i,
  languages: /^(languages|language\s+proficiency)/i,
};

export function detectAndSplitSections(rawText: string): ParsedSections {
  const lines = rawText.split(/\r?\n/);
  const sections: Record<string, string[]> = {
    contact: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    awards: [],
    languages: [],
  };

  const detectedHeadings: string[] = [];
  let currentSection = "contact";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line matches a known section heading
    let matchedSection: string | null = null;
    if (trimmed.length < 50) {
      for (const [secKey, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(trimmed)) {
          matchedSection = secKey;
          break;
        }
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      detectedHeadings.push(trimmed);
    } else {
      sections[currentSection].push(line);
    }
  }

  return {
    summary: sections.summary.join("\n").trim(),
    experience: sections.experience.join("\n").trim(),
    education: sections.education.join("\n").trim(),
    skills: sections.skills.join("\n").trim(),
    certifications: sections.certifications.join("\n").trim(),
    projects: sections.projects.join("\n").trim(),
    awards: sections.awards.join("\n").trim(),
    languages: sections.languages.join("\n").trim(),
    detectedHeadings,
  };
}
