import { CandidateProfile } from "@resumematch/core-types";
import { extractTextFromBuffer } from "./text-extractor.js";
import { extractContactInfo } from "./contact-extractor.js";
import { detectAndSplitSections } from "./section-detector.js";
import { parseWorkExperienceSection } from "./experience-parser.js";

export * from "./text-extractor.js";
export * from "./contact-extractor.js";
export * from "./section-detector.js";
export * from "./experience-parser.js";

export async function parseResumeBuffer(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt"
): Promise<CandidateProfile> {
  const extractedDoc = await extractTextFromBuffer(buffer, fileType);
  return parseResumeText(extractedDoc.text, extractedDoc.pageCount);
}

export function parseResumeText(
  rawText: string,
  pageCount: number = 1
): CandidateProfile {
  const contact = extractContactInfo(rawText);
  const sections = detectAndSplitSections(rawText);
  const experience = parseWorkExperienceSection(sections.experience);

  // Extract skills lines/items
  const skillsList: string[] = [];
  if (sections.skills) {
    const rawSkills = sections.skills
      .split(/[\n,;•|·]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 50);
    skillsList.push(...Array.from(new Set(rawSkills)));
  }

  // Extract education lines
  const educationList: any[] = [];
  if (sections.education) {
    const eduLines = sections.education.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of eduLines) {
      if (line.length > 5) {
        educationList.push({
          id: `edu-${Math.random().toString(36).substring(2, 9)}`,
          institution: line,
          degree: line,
          year: "",
        });
      }
    }
  }

  // Extract certifications
  const certsList: string[] = [];
  if (sections.certifications) {
    const certLines = sections.certifications
      .split(/\r?\n/)
      .map((l) => l.replace(/^[•\-*▪\d+\.]\s*/, "").trim())
      .filter((l) => l.length > 2);
    certsList.push(...certLines);
  }

  return {
    candidate: contact,
    summary: sections.summary,
    skills: skillsList,
    experience,
    education: educationList,
    certifications: certsList,
    projects: [],
    awards: sections.awards ? sections.awards.split(/\r?\n/).filter(Boolean) : [],
    publications: [],
    languages: sections.languages ? sections.languages.split(/[\n,;•]/).map(l => l.trim()).filter(Boolean) : [],
    detectedSections: sections.detectedHeadings,
    rawTextLength: rawText.length,
    pageCount,
  };
}
