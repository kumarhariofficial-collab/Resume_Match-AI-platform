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
} from "lucide-react";
import { ScoreBreakdownModal } from "@/components/analysis/ScoreBreakdownModal";
import { RequirementMatrixTable } from "@/components/analysis/RequirementMatrixTable";
import { ATSChecklist } from "@/components/analysis/ATSChecklist";

export default function AnalysisReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<FullAnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "ats" | "keywords" | "recs">("matrix");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const cached = sessionStorage.getItem(`analysis_${id}`);
    if (cached) {
      try {
        setReport(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached analysis");
      }
    }
  }, [params.id]);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Analysis Report • {new Date(report.createdAt).toLocaleDateString()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {candidateProfile.candidate.name || "Candidate Resume"} vs {jobProfile.title || "Target Role"}
          </h1>
          <p className="text-sm text-slate-500">
            {jobProfile.company} • {jobProfile.experienceLevel} • {jobProfile.requirements.length} Requirements Identified
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/builder/${report.id}`)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Tailor Resume
          </button>
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Validating & Exporting..." : "Export DOCX"}
          </button>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Match Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{scoreExplanation.metricLabel}</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-md"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Why?
            </button>
          </div>
          <div className="text-4xl font-extrabold text-slate-900">{scoreExplanation.overallMatchScore}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${scoreExplanation.overallMatchScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Explainable formula based on requirement weights.</p>
        </div>

        {/* ATS Health Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{atsAudit.metricLabel}</span>
          <div className="text-4xl font-extrabold text-slate-900">{atsAudit.atsHealthScore}%</div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-block ${
            atsAudit.atsHealthScore >= 85 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}>
            {atsAudit.statusSummary}
          </span>
          <p className="text-[11px] text-slate-400">11-point layout & text parsing audit.</p>
        </div>

        {/* Critical Gaps Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Gaps</span>
          <div className="text-4xl font-extrabold text-slate-900">{scoreExplanation.criticalGaps.length}</div>
          <p className="text-xs text-slate-600 font-medium">Must-have requirements missing.</p>
          <p className="text-[11px] text-slate-400">Marked as <em>"Not found in resume"</em>.</p>
        </div>

        {/* Keywords Matched Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keywords Matched</span>
          <div className="text-4xl font-extrabold text-slate-900">
            {keywordIntelligence.matchedKeywords.length} / {evidenceMatrix.length}
          </div>
          <p className="text-xs text-slate-600 font-medium">Verified evidence matches.</p>
          <p className="text-[11px] text-slate-400">No keyword stuffing recommended.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-4 text-sm font-bold text-slate-600">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === "matrix" ? "border-brand-600 text-brand-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          Requirement Matrix ({evidenceMatrix.length})
        </button>
        <button
          onClick={() => setActiveTab("ats")}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === "ats" ? "border-brand-600 text-brand-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          ATS Readability Audit ({atsAudit.checks.length})
        </button>
        <button
          onClick={() => setActiveTab("keywords")}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === "keywords" ? "border-brand-600 text-brand-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          Keyword Intelligence
        </button>
        <button
          onClick={() => setActiveTab("recs")}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === "recs" ? "border-brand-600 text-brand-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          Action Plan ({actionableRecommendations.length})
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "matrix" && <RequirementMatrixTable evidenceMatrix={evidenceMatrix} />}
      {activeTab === "ats" && <ATSChecklist atsAudit={atsAudit} />}

      {activeTab === "keywords" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg">Keyword Evidence & Recommendation Intelligence</h3>
          
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-800">Matched Keywords ({keywordIntelligence.matchedKeywords.length}):</h4>
            <div className="flex flex-wrap gap-2">
              {keywordIntelligence.matchedKeywords.map((k) => (
                <span key={k.term} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                  ✓ {k.term} ({k.evidenceStrength})
                </span>
              ))}
            </div>

            <h4 className="font-bold text-sm text-slate-800 pt-2">Missing Keywords ({keywordIntelligence.missingKeywords.length}):</h4>
            <div className="space-y-2">
              {keywordIntelligence.missingKeywords.map((m) => (
                <div key={m.term} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-900">{m.term} ({m.category.replace(/_/g, " ")})</div>
                  <p className="text-slate-600"><strong>Guidance:</strong> {m.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "recs" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Prioritized Action Plan</h3>
          <div className="space-y-3">
            {actionableRecommendations.map((rec) => (
              <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>{rec.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">{rec.priority}</span>
                </div>
                <p className="text-xs text-slate-600">{rec.description}</p>
                <div className="text-[10px] text-slate-400 font-medium">Target Section: {rec.section}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        scoreExplanation={scoreExplanation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
