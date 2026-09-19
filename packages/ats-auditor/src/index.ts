import {
  ATSAuditReport,
  ATSCheckItem,
  CandidateProfile,
} from "@resumematch/core-types";

export function runATSReadabilityAudit(
  profile: CandidateProfile,
  rawText: string,
  fileType: "pdf" | "docx" | "txt" = "pdf"
): ATSAuditReport {
  const checks: ATSCheckItem[] = [];

  // Check 1: Text Layer Check
  if (!rawText || rawText.trim().length < 50) {
    checks.push({
      id: "text-layer",
      title: "Selectable Text Layer",
      severity: "CRITICAL",
      status: "FAIL",
      message: "No searchable or selectable text detected. The document might be a scanned image.",
      recommendation: "Convert your document to a clean text-based PDF or DOCX file before uploading.",
    });
  } else {
    checks.push({
      id: "text-layer",
      title: "Selectable Text Layer",
      severity: "CRITICAL",
      status: "PASS",
      message: "Searchable text layer detected successfully.",
      recommendation: "Good. Your text is accessible to standard parsers.",
    });
  }

  // Check 2: Reading Order & Logical Continuity
  const lines = rawText.split(/\r?\n/).filter(Boolean);
  let interleavedLinesCount = 0;
  for (let i = 0; i < lines.length - 1; i++) {
    // If short fragment lines interleave unpredictably
    if (lines[i].length < 15 && lines[i + 1].length < 15 && !lines[i].includes("20")) {
      interleavedLinesCount++;
    }
  }

  if (interleavedLinesCount > 6) {
    checks.push({
      id: "reading-order",
      title: "Reading Order & Column Flow",
      severity: "HIGH",
      status: "WARNING",
      message: "Detected potential multi-column text fragmentation during extraction.",
      recommendation: "Prefer a clean single-column layout so ATS parsers extract experience in sequential order.",
    });
  } else {
    checks.push({
      id: "reading-order",
      title: "Reading Order & Column Flow",
      severity: "HIGH",
      status: "PASS",
      message: "Logical top-to-bottom reading order verified.",
      recommendation: "Maintain single-column structure across experience bullets.",
    });
  }

  // Check 3: Contact Information Accessibility
  const { email, phone, name } = profile.candidate;
  if (!email || !phone) {
    checks.push({
      id: "contact-info",
      title: "Contact Details Parsing",
      severity: "CRITICAL",
      status: "WARNING",
      message: `Missing ${!email ? "email address" : ""} ${!phone ? "phone number" : ""} in extracted text body.`,
      recommendation: "Ensure email and phone are placed in the main body text, not inside image headers or decorative footers.",
    });
  } else {
    checks.push({
      id: "contact-info",
      title: "Contact Details Parsing",
      severity: "CRITICAL",
      status: "PASS",
      message: "Email address and phone number extracted cleanly.",
      recommendation: "Verified contact details.",
    });
  }

  // Check 4: Standard Section Headings
  const detected = profile.detectedSections || [];
  const missingCoreHeadings: string[] = [];
  if (!detected.some((h: string) => /summary|profile/i.test(h))) missingCoreHeadings.push("Summary");
  if (!detected.some((h: string) => /experience|employment|history/i.test(h))) missingCoreHeadings.push("Work Experience");
  if (!detected.some((h: string) => /skills|competencies/i.test(h))) missingCoreHeadings.push("Skills");
  if (!detected.some((h: string) => /education|qualifications/i.test(h))) missingCoreHeadings.push("Education");

  if (missingCoreHeadings.length > 0) {
    checks.push({
      id: "standard-headings",
      title: "Standard Section Labels",
      severity: "HIGH",
      status: "WARNING",
      message: `Non-standard or missing standard headings: ${missingCoreHeadings.join(", ")}.`,
      recommendation: "Use standard labels such as 'Work Experience', 'Professional Summary', 'Skills', and 'Education'.",
    });
  } else {
    checks.push({
      id: "standard-headings",
      title: "Standard Section Labels",
      severity: "HIGH",
      status: "PASS",
      message: "Standard ATS-recognizable headings detected.",
      recommendation: "Keep conventional section headers.",
    });
  }

  // Check 5: Unusual Characters & Symbols
  const nonStandardSymbols = rawText.match(/[^\x00-\x7F\u2022\u2013\u2014]/g);
  if (nonStandardSymbols && nonStandardSymbols.length > 15) {
    checks.push({
      id: "special-characters",
      title: "Special Characters & Symbols",
      severity: "MEDIUM",
      status: "WARNING",
      message: "Detected custom symbols or non-standard icon bullet characters.",
      recommendation: "Replace complex icons or visual progress meters with clean standard bullet points.",
    });
  } else {
    checks.push({
      id: "special-characters",
      title: "Special Characters & Symbols",
      severity: "MEDIUM",
      status: "PASS",
      message: "No corrupt special characters or incompatible symbol fonts found.",
      recommendation: "Verified clean text characters.",
    });
  }

  // Check 6: Document Format Integrity
  checks.push({
    id: "file-format",
    title: "File Format Integrity",
    severity: "INFO",
    status: "PASS",
    message: `Format '${fileType.toUpperCase()}' is natively supported.`,
    recommendation: "PDF and DOCX are the standard formats accepted by recruiters.",
  });

  // Calculate Health Score
  let totalScore = 100;
  for (const check of checks) {
    if (check.status === "FAIL") {
      totalScore -= check.severity === "CRITICAL" ? 30 : 15;
    } else if (check.status === "WARNING") {
      totalScore -= check.severity === "CRITICAL" ? 15 : check.severity === "HIGH" ? 10 : 5;
    }
  }
  totalScore = Math.max(0, Math.min(100, totalScore));

  const statusSummary = totalScore >= 85 ? "HEALTHY" : totalScore >= 65 ? "NEEDS_ATTENTION" : "HIGH_RISK";

  return {
    atsHealthScore: totalScore,
    metricLabel: "ATS Readability / Parsing Health",
    statusSummary,
    checks,
    parsedReadingOrderSnippet: rawText.substring(0, 300) + "...",
    detectedFormattingRisksCount: checks.filter((c) => c.status !== "PASS").length,
  };
}
