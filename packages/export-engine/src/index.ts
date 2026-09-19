import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { CandidateProfile, ATSAuditReport } from "@resumematch/core-types";
import { parseResumeBuffer } from "@resumematch/resume-parser";
import { runATSReadabilityAudit } from "@resumematch/ats-auditor";

export interface ExportValidationResult {
  buffer: Buffer;
  fileType: "docx" | "pdf" | "txt";
  reParsedProfile: CandidateProfile;
  reParsedAtsAudit: ATSAuditReport;
  isValid: boolean;
}

export async function generateValidatedDOCX(
  profile: CandidateProfile
): Promise<ExportValidationResult> {
  const children: Paragraph[] = [];

  // Header: Name & Contact
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: profile.candidate.name || "Candidate Name",
          bold: true,
          size: 32, // 16pt
        }),
      ],
    })
  );

  const contactLine = [
    profile.candidate.email,
    profile.candidate.phone,
    profile.candidate.location,
    profile.candidate.linkedin,
  ]
    .filter(Boolean)
    .join(" | ");

  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: contactLine,
            size: 20, // 10pt
            color: "555555",
          }),
        ],
      })
    );
  }

  // Summary
  if (profile.summary) {
    children.push(
      new Paragraph({
        text: "PROFESSIONAL SUMMARY",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: profile.summary, size: 22 })],
      })
    );
  }

  // Skills
  if (profile.skills && profile.skills.length > 0) {
    children.push(
      new Paragraph({
        text: "TECHNICAL SKILLS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: profile.skills.join(", "), size: 22 })],
      })
    );
  }

  // Experience
  if (profile.experience && profile.experience.length > 0) {
    children.push(
      new Paragraph({
        text: "WORK EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200 },
      })
    );

    for (const exp of profile.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.company} — ${exp.title}`, bold: true, size: 22 }),
            new TextRun({ text: ` (${exp.startDate} - ${exp.endDate})`, italics: true, size: 20 }),
          ],
          spacing: { before: 100 },
        })
      );

      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: bullet, size: 22 })],
          })
        );
      }
    }
  }

  // Education
  if (profile.education && profile.education.length > 0) {
    children.push(
      new Paragraph({
        text: "EDUCATION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200 },
      })
    );

    for (const edu of profile.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree} — ${edu.institution}`, bold: true, size: 22 }),
            new TextRun({ text: edu.year ? ` (${edu.year})` : "", size: 20 }),
          ],
        })
      );
    }
  }

  // Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    children.push(
      new Paragraph({
        text: "CERTIFICATIONS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: profile.certifications.join(", "), size: 22 })],
      })
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const buffer = await Packer.toBuffer(doc);

  // MANDATORY EXPORT RE-PARSER VALIDATION LOOP
  const reParsedProfile = await parseResumeBuffer(buffer, "docx");
  const reParsedAtsAudit = runATSReadabilityAudit(reParsedProfile, reParsedProfile.summary, "docx");

  const isValid = reParsedAtsAudit.atsHealthScore >= 70;

  return {
    buffer,
    fileType: "docx",
    reParsedProfile,
    reParsedAtsAudit,
    isValid,
  };
}
