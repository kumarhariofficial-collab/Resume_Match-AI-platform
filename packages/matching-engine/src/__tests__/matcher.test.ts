import { describe, it, expect } from "vitest";
import { runMatchingEngine } from "../index.js";
import { CandidateProfile, JobProfile } from "@resumematch/core-types";

describe("Matching Engine", () => {
  it("computes transparent explainable score and adheres to Rule 1 and Rule 2", () => {
    const candidate: CandidateProfile = {
      candidate: { name: "Jane Doe", email: "jane@example.com", phone: "555-0100", location: "NY", linkedin: "", portfolio: "" },
      summary: "Experienced Senior Data Analyst with 5+ years building SQL pipelines.",
      skills: ["SQL", "Python", "Power BI"],
      experience: [
        {
          id: "1",
          company: "Tech Solutions",
          title: "Senior Data Analyst",
          startDate: "2021",
          endDate: "Present",
          bullets: [
            "Automated weekly KPI reporting using SQL and Power BI, reducing manual reporting effort by 40%.",
          ],
          quantifiedBulletsCount: 1,
        },
      ],
      education: [],
      certifications: [],
      projects: [],
      awards: [],
      publications: [],
      languages: [],
      detectedSections: ["Summary", "Experience", "Skills"],
      rawTextLength: 300,
      pageCount: 1,
    };

    const job: JobProfile = {
      title: "Senior Data Analyst",
      company: "Data Corp",
      location: "NY",
      experienceLevel: "Senior",
      employmentType: "Full-Time",
      workArrangement: "Hybrid",
      requirements: [
        { id: "1", category: "MUST_HAVE_SKILL", priority: "CRITICAL", exactPhrase: "SQL", normalizedTerm: "sql", frequency: 3 },
        { id: "2", category: "MUST_HAVE_SKILL", priority: "CRITICAL", exactPhrase: "PySpark", normalizedTerm: "pyspark", frequency: 1 },
      ],
      rawDescription: "Looking for Senior Data Analyst skilled in SQL and PySpark.",
    };

    const result = runMatchingEngine(candidate, job);

    // Rule 1 Verification: Label must be "Resume–JD Match Score"
    expect(result.scoreExplanation.metricLabel).toBe("Resume–JD Match Score");

    // Rule 2 Verification: Missing requirement must say "Not found in resume"
    const missingReq = result.evidenceMatrix.find((e) => e.requirementText === "PySpark");
    expect(missingReq).toBeDefined();
    expect(missingReq?.status).toBe("MISSING");
    expect(missingReq?.evidenceText).toBe("Not found in resume");
    expect(missingReq?.recommendationAction).toContain("Add only if you genuinely have this experience.");

    // Rule 4 Verification: Score breakdown is present
    expect(result.scoreExplanation.breakdown.length).toBeGreaterThan(0);
    expect(result.scoreExplanation.overallMatchScore).toBeGreaterThan(0);
  });
});
