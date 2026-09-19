"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FullAnalysisReport, CandidateProfile, AntiHallucinationReport } from "@resumematch/core-types";
import { verifyAntiHallucination } from "@resumematch/ai";
import { runMatchingEngine } from "@resumematch/matching-engine";
import { Sparkles, ShieldCheck, Download, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function ResumeBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<FullAnalysisReport | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [liveMatchScore, setLiveMatchScore] = useState<number>(0);
  const [verificationReport, setVerificationReport] = useState<AntiHallucinationReport | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const cached = sessionStorage.getItem(`analysis_${id}`);
    if (cached) {
      try {
        const data: FullAnalysisReport = JSON.parse(cached);
        setReport(data);
        setProfile(data.candidateProfile);
        setLiveMatchScore(data.scoreExplanation.overallMatchScore);
      } catch (e) {
        console.error("Failed to load analysis for builder");
      }
    }
  }, [params.id]);

  if (!report || !profile) {
    return <div className="p-12 text-center text-slate-500">Loading Resume Builder...</div>;
  }

  const handleUpdateSummary = (val: string) => {
    const updated = { ...profile, summary: val };
    setProfile(updated);
    recalculate(updated);
  };

  const handleUpdateSkills = (val: string) => {
    const skillsArr = val.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = { ...profile, skills: skillsArr };
    setProfile(updated);
    recalculate(updated);
  };

  const recalculate = (updatedProfile: CandidateProfile) => {
    // Recalculate live match score
    const res = runMatchingEngine(updatedProfile, report.jobProfile);
    setLiveMatchScore(res.scoreExplanation.overallMatchScore);

    // Verify anti-hallucination
    const antiResult = verifyAntiHallucination(report.candidateProfile, updatedProfile);
    setVerificationReport(antiResult);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => router.push(`/analysis/${report.id}`)}
          className="text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analysis Report
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-semibold">Live Resume–JD Match Score</div>
            <div className="text-2xl font-extrabold text-brand-600">{liveMatchScore}%</div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Editor & Requirements Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Pane: Interactive Resume Editor */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Resume Content Editor
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Professional Summary</label>
            <textarea
              value={profile.summary}
              onChange={(e) => handleUpdateSummary(e.target.value)}
              className="w-full h-32 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Technical Skills (Comma Separated)</label>
            <textarea
              value={profile.skills.join(", ")}
              onChange={(e) => handleUpdateSkills(e.target.value)}
              className="w-full h-24 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Pane: Target Job Description Requirements Checklist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-lg">Target JD Requirements</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {report.evidenceMatrix.map((item) => (
              <div key={item.requirementId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{item.requirementText}</span>
                  <span className="text-[10px] text-slate-500">{item.status}</span>
                </div>
                <div className="text-slate-600">Evidence: <strong>{item.evidenceText}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Bar */}
      {verificationReport && verificationReport.userVerificationRequired && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="text-xs text-amber-900">
              <strong>Anti-Hallucination Alert:</strong> {verificationReport.flagsCount} items require verification. (No fake metrics allowed).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
