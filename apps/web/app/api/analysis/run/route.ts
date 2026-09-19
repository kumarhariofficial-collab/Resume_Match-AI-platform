import { NextResponse } from "next/server";
import { parseResumeBuffer, parseResumeText } from "@resumematch/resume-parser";
import { analyzeJobDescription } from "@resumematch/jd-analyzer";
import { runMatchingEngine } from "@resumematch/matching-engine";
import { runATSReadabilityAudit } from "@resumematch/ats-auditor";
import { FullAnalysisReport, CandidateProfile } from "@resumematch/core-types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, resumeFileBase64, fileType, jobDescription, fileName } = body;

    if (!resumeText && !resumeFileBase64) {
      return NextResponse.json(
        { error: "Resume text or uploaded file buffer is required." },
        { status: 400 }
      );
    }
    if (!jobDescription) {
      return NextResponse.json(
        { error: "Target Job Description is required." },
        { status: 400 }
      );
    }

    let candidateProfile: CandidateProfile;
    let extractedRawText = resumeText || "";

    // Parse PDF/DOCX buffer if base64 file is provided
    if (resumeFileBase64 && (fileType === "pdf" || fileType === "docx")) {
      const buffer = Buffer.from(resumeFileBase64, "base64");
      candidateProfile = await parseResumeBuffer(buffer, fileType);
      extractedRawText = candidateProfile.summary + "\n" + candidateProfile.skills.join(", ");
    } else {
      candidateProfile = parseResumeText(extractedRawText);
    }

    // Parse Job Description Requirements
    const jobProfile = analyzeJobDescription(jobDescription);

    // Run Deterministic Multi-Layer Matching Engine
    const matchResult = runMatchingEngine(candidateProfile, jobProfile);

    // Run ATS Readability Audit
    const docType = fileType || (fileName?.endsWith(".docx") ? "docx" : fileName?.endsWith(".pdf") ? "pdf" : "txt");
    const atsAudit = runATSReadabilityAudit(candidateProfile, extractedRawText || "Resume Text", docType);

    // Generate Actionable Recommendations
    const actionableRecommendations = matchResult.evidenceMatrix
      .filter((e) => e.status === "MISSING" || e.status === "WEAK_EVIDENCE")
      .slice(0, 6)
      .map((e, idx) => ({
        id: `rec-${idx + 1}`,
        priority: e.category === "MUST_HAVE_SKILL" ? "HIGH_IMPACT" as const : "MEDIUM_IMPACT" as const,
        title: `Requirement: ${e.requirementText}`,
        description: e.recommendationAction,
        section: e.sourceSection || "Work Experience",
        effort: "EASY" as const,
      }));

    const reportId = `analysis-${Date.now()}`;
    const analysisReport: FullAnalysisReport = {
      id: reportId,
      resumeId: `res-${Date.now()}`,
      jobId: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      candidateProfile,
      jobProfile,
      scoreExplanation: matchResult.scoreExplanation,
      atsAudit,
      evidenceMatrix: matchResult.evidenceMatrix,
      keywordIntelligence: matchResult.keywordIntelligence,
      actionableRecommendations,
    };

    // Save Record to PostgreSQL Database if DATABASE_URL is configured
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dev.db")) {
        const user = await prisma.user.upsert({
          where: { email: candidateProfile.candidate.email || "guest@resumematch.ai" },
          update: {},
          create: {
            email: candidateProfile.candidate.email || "guest@resumematch.ai",
            name: candidateProfile.candidate.name || "Guest User",
          },
        });

        const dbResume = await prisma.resume.create({
          data: {
            userId: user.id,
            title: fileName || "Uploaded Resume",
            fileType: docType,
            parsedText: extractedRawText,
            structuredJson: JSON.stringify(candidateProfile),
          },
        });

        const dbJob = await prisma.job.create({
          data: {
            userId: user.id,
            company: jobProfile.company || "Target Company",
            title: jobProfile.title || "Target Job",
            description: jobDescription,
            parsedRequirements: JSON.stringify(jobProfile.requirements),
          },
        });

        await prisma.analysis.create({
          data: {
            id: reportId,
            userId: user.id,
            resumeId: dbResume.id,
            jobId: dbJob.id,
            overallMatchScore: matchResult.scoreExplanation.overallMatchScore,
            atsHealthScore: atsAudit.atsHealthScore,
            scoreBreakdownJson: JSON.stringify(matchResult.scoreExplanation.breakdown),
            requirementsMatrix: JSON.stringify(matchResult.evidenceMatrix),
            atsAuditJson: JSON.stringify(atsAudit),
            recommendationsJson: JSON.stringify(actionableRecommendations),
          },
        });
      }
    } catch (dbErr) {
      console.warn("Database storage skipped or non-fatal:", dbErr);
    }

    return NextResponse.json(analysisReport);
  } catch (err: any) {
    console.error("Analysis API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze document." },
      { status: 500 }
    );
  }
}
