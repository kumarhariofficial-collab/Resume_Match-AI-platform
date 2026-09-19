import { NextResponse } from "next/server";
import { parseResumeText } from "@resumematch/resume-parser";
import { analyzeJobDescription } from "@resumematch/jd-analyzer";
import { runMatchingEngine } from "@resumematch/matching-engine";
import { runATSReadabilityAudit } from "@resumematch/ats-auditor";
import { FullAnalysisReport } from "@resumematch/core-types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription, fileName } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Both resumeText and jobDescription are required." },
        { status: 400 }
      );
    }

    // 1. Parse Candidate Profile
    const candidateProfile = parseResumeText(resumeText);

    // 2. Parse Job Description Requirements
    const jobProfile = analyzeJobDescription(jobDescription);

    // 3. Run Deterministic Multi-Layer Matching Engine
    const matchResult = runMatchingEngine(candidateProfile, jobProfile);

    // 4. Run ATS Readability Audit
    const fileType = fileName?.endsWith(".docx") ? "docx" : fileName?.endsWith(".pdf") ? "pdf" : "txt";
    const atsAudit = runATSReadabilityAudit(candidateProfile, resumeText, fileType);

    // 5. Generate Evidence-Based Recommendations
    const actionableRecommendations = matchResult.evidenceMatrix
      .filter((e) => e.status === "MISSING" || e.status === "WEAK_EVIDENCE")
      .slice(0, 5)
      .map((e, idx) => ({
        id: `rec-${idx + 1}`,
        priority: e.category === "MUST_HAVE_SKILL" ? "HIGH_IMPACT" as const : "MEDIUM_IMPACT" as const,
        title: `Requirement: ${e.requirementText}`,
        description: e.recommendationAction,
        section: e.sourceSection || "Work Experience",
        effort: "EASY" as const,
      }));

    const analysisReport: FullAnalysisReport = {
      id: `analysis-${Date.now()}`,
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

    return NextResponse.json(analysisReport);
  } catch (err: any) {
    console.error("Analysis route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during analysis." },
      { status: 500 }
    );
  }
}
