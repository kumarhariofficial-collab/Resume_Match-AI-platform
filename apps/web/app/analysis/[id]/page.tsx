"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FullAnalysisReport } from "@resumematch/core-types";
import {
  FileCheck,
  HelpCircle,
  Download,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ListFilter,
  BarChart3,
  ShieldCheck,
  FileText,
  Briefcase,
  Layers,
  ArrowRight,
  Lock,
} from "lucide-react";
import { ScoreBreakdownModal } from "@/components/analysis/ScoreBreakdownModal";
import { RequirementMatrixTable } from "@/components/analysis/RequirementMatrixTable";
import { ATSChecklist } from "@/components/analysis/ATSChecklist";
import { LoginModal } from "@/components/auth/LoginModal";

export default function AnalysisReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<FullAnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "ats" | "keywords" | "recs">("matrix");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const cached = sessionStorage.getItem(`analysis_${id}`);
    if (cached) {
      try {
        setReport(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached analysis report");
      }
    }
  }, [params.id]);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Loading Intelligence Analysis Report...</h2>
        <p className="text-xs text-slate-500">Retrieving transparent match breakdown and ATS readability health checks.</p>
      </div>
    );
  }

  const { candidateProfile, jobProfile, scoreExplanation, atsAudit, evidenceMatrix, keywordIntelligence, actionableRecommendations } = report;

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: candidateProfile }),
      });

      if (!res.ok) throw new Error("Export failed.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${candidateProfile.candidate.name || "Resume"}_Tailored.docx`;
      a.click();
    } catch (err: any) {
      alert("Failed to export validated document.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full">
              Verified Intelligence Report
            </span>
            <span>• {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {candidateProfile.candidate.name || "Candidate Profile"} vs {jobProfile.title || "Target Job"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400" /> {jobProfile.company}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-400" /> {jobProfile.experienceLevel}</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{jobProfile.requirements.length} Requirements Identified</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.push(`/builder/${report.id}`)}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Tailor Resume to JD
          </button>
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-2xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Validating & Exporting..." : "Download Updated DOCX"}
          </button>
        </div>
      </div>

      {/* Recommended Action Callout Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Recommended Action
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Tailor Your Resume Specifically to {jobProfile.title}</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Align bullet point wording and move required skills higher without inventing experience. Re-validate through the ATS auditor and export the updated DOCX file before applying.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => router.push(`/builder/${report.id}`)}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
          >
            Open Side-by-Side Builder
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Match Score Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{scoreExplanation.metricLabel}</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Why?
            </button>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {scoreExplanation.overallMatchScore}%
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${scoreExplanation.overallMatchScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Explainable formula based on requirement weights.</p>
        </div>

        {/* ATS Health Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{atsAudit.metricLabel}</span>
          <div className="flex items-baseline justify-between">
            <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {atsAudit.atsHealthScore}%
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
              atsAudit.atsHealthScore >= 85
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {atsAudit.statusSummary}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                atsAudit.atsHealthScore >= 85 ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${atsAudit.atsHealthScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">11-point layout & text parsing audit.</p>
        </div>

        {/* Critical Gaps Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Gaps</span>
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {scoreExplanation.criticalGaps.length}
          </div>
          <p className="text-xs text-slate-700 font-semibold">Must-have requirements missing.</p>
          <p className="text-[11px] text-slate-400 font-medium">Marked as <em>"Not found in resume"</em>.</p>
        </div>

        {/* Keywords Matched Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keywords Matched</span>
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {keywordIntelligence.matchedKeywords.length} / {evidenceMatrix.length}
          </div>
          <p className="text-xs text-slate-700 font-semibold">Verified evidence matches.</p>
          <p className="text-[11px] text-slate-400 font-medium">No keyword stuffing recommended.</p>
        </div>
      </div>

      {/* Premium Perks Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Sign in to unlock Pro Career Features</h3>
            <p className="text-xs text-slate-500">Save versions to Job Tracker, generate Cover Letters, and access technical interview prep.</p>
          </div>
        </div>
        <button
          onClick={() => setIsLoginOpen(true)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Sign In / Upgrade
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-bold text-slate-600 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "matrix" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          Requirement Matrix ({evidenceMatrix.length})
        </button>
        <button
          onClick={() => setActiveTab("ats")}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "ats" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          ATS Readability Audit ({atsAudit.checks.length})
        </button>
        <button
          onClick={() => setActiveTab("keywords")}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "keywords" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          Keyword Intelligence
        </button>
        <button
          onClick={() => setActiveTab("recs")}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "recs" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          Action Plan ({actionableRecommendations.length})
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "matrix" && <RequirementMatrixTable evidenceMatrix={evidenceMatrix} />}
      {activeTab === "ats" && <ATSChecklist atsAudit={atsAudit} />}

      {activeTab === "keywords" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <h3 className="font-bold text-slate-900 text-xl">Keyword Evidence & Recommendation Intelligence</h3>
          
          <div className="space-y-5">
            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-3">Matched Keywords ({keywordIntelligence.matchedKeywords.length}):</h4>
              <div className="flex flex-wrap gap-2.5">
                {keywordIntelligence.matchedKeywords.map((k) => (
                  <span key={k.term} className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-sm">
                    ✓ {k.term} ({k.evidenceStrength})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-3">Missing Keywords ({keywordIntelligence.missingKeywords.length}):</h4>
              <div className="space-y-3">
                {keywordIntelligence.missingKeywords.map((m) => (
                  <div key={m.term} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{m.term} <span className="text-slate-400 font-normal">({m.category.replace(/_/g, " ")})</span></div>
                    <p className="text-slate-600"><strong>Guidance:</strong> {m.guidance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "recs" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-xl">Prioritized Action Plan</h3>
            <button
              onClick={handleExportDocx}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Updated Resume (DOCX)
            </button>
          </div>

          <div className="space-y-4">
            {actionableRecommendations.map((rec) => (
              <div key={rec.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-base">
                  <span>{rec.title}</span>
                  <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold">{rec.priority}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                <div className="text-[11px] text-slate-400 font-semibold">Target Section: {rec.section}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ScoreBreakdownModal
        scoreExplanation={scoreExplanation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}
