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
  XCircle,
  TrendingUp,
  Check,
} from "lucide-react";
import { ScoreBreakdownModal } from "@/components/analysis/ScoreBreakdownModal";
import { RequirementMatrixTable } from "@/components/analysis/RequirementMatrixTable";
import { ATSChecklist } from "@/components/analysis/ATSChecklist";
import { LoginModal } from "@/components/auth/LoginModal";
import { PaywallModal } from "@/components/auth/PaywallModal";

export default function AnalysisReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<FullAnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState<"verdict" | "matrix" | "ats" | "keywords" | "recs">("verdict");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("Pro Career Intelligence");
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
  const matchScore = scoreExplanation.overallMatchScore;

  const getVerdict = () => {
    if (matchScore >= 80) {
      return {
        label: "EXCELLENT MATCH — Highly Qualified Candidate",
        color: "bg-emerald-500 text-white border-emerald-600",
        bgBanner: "from-emerald-900 via-teal-900 to-slate-900",
        description: `Your resume shows strong ${matchScore}% qualification alignment with ${jobProfile.title}. Key required skills like ${keywordIntelligence.matchedKeywords.slice(0, 3).map(k=>k.term).join(", ")} were explicitly detected in your profile.`,
      };
    } else if (matchScore >= 50) {
      return {
        label: "PARTIAL MATCH — Gaps & Weak Evidence Detected",
        color: "bg-amber-500 text-white border-amber-600",
        bgBanner: "from-amber-900 via-orange-900 to-slate-900",
        description: `Your resume shows moderate ${matchScore}% alignment with ${jobProfile.title}. Some core requirements were missing or weakly supported. Review the steps below to strengthen your evidence.`,
      };
    } else {
      return {
        label: "CRITICAL GAPS — Significant Revision Required",
        color: "bg-red-500 text-white border-red-600",
        bgBanner: "from-red-900 via-rose-900 to-slate-900",
        description: `Your resume shows low ${matchScore}% alignment with ${jobProfile.title}. Multiple required hard skills were marked as "Not found in resume".`,
      };
    }
  };

  const verdict = getVerdict();

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

  const triggerPaywall = (featureName: string) => {
    setPaywallFeature(featureName);
    setIsPaywallOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
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
            onClick={() => triggerPaywall("AI Resume Rewriter & Tailoring")}
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

      {/* Match Verdict Banner */}
      <div className={`bg-gradient-to-r ${verdict.bgBanner} text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 border border-slate-800`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border bg-white/10 backdrop-blur">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Match Verdict Analysis
          </div>
          <span className={`px-4 py-1.5 rounded-full font-extrabold text-xs uppercase tracking-wider shadow-md ${verdict.color}`}>
            {verdict.label}
          </span>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-4xl">
          {verdict.description}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Gaps</span>
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {scoreExplanation.criticalGaps.length}
          </div>
          <p className="text-xs text-slate-700 font-semibold">Must-have requirements missing.</p>
          <p className="text-[11px] text-slate-400 font-medium">Marked as <em>"Not found in resume"</em>.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keywords Matched</span>
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {keywordIntelligence.matchedKeywords.length} / {evidenceMatrix.length}
          </div>
          <p className="text-xs text-slate-700 font-semibold">Verified evidence matches.</p>
          <p className="text-[11px] text-slate-400 font-medium">No keyword stuffing recommended.</p>
        </div>
      </div>

      {/* Step-by-Step Guidance Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Recommended Steps to Optimize Resume for {jobProfile.title}</h3>
            <p className="text-xs text-slate-500">Follow this 5-step roadmap to maximize your interview odds truthfully.</p>
          </div>
          <button
            onClick={() => triggerPaywall("Automated 5-Step Optimization Engine")}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" /> Unlock Pro Auto-Apply
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Step 1: Verify Matched Hard Skills</h4>
              <p className="text-xs text-slate-600">Review your {keywordIntelligence.matchedKeywords.length} matched keywords ({keywordIntelligence.matchedKeywords.map(k=>k.term).slice(0, 4).join(", ")}) in your skills section. Keep these front and center.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Step 2: Address Missing & Weak Keywords</h4>
              <p className="text-xs text-slate-600">Review missing items marked <em>"Not found in resume"</em>. Add keywords like {keywordIntelligence.missingKeywords.map(m=>m.term).slice(0, 3).join(", ")} ONLY if you genuinely possess hands-on experience.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Step 3: Fix ATS Layout & Parsing Health Risks</h4>
              <p className="text-xs text-slate-600">Your ATS Readability score is {atsAudit.atsHealthScore}%. Ensure contact details, email, and section headings use conventional single-column formatting.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Step 4: Tailor Experience Bullet Points</h4>
              <p className="text-xs text-slate-600">Rephrase your work experience bullet points to emphasize action verbs and measurable business outcomes (e.g. "Automated weekly reporting by 40%").</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">5</div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Step 5: Export Re-Validated ATS DOCX / PDF</h4>
              <p className="text-xs text-slate-600">Download the updated, re-validated resume document. The server automatically re-parses exported files to guarantee zero content loss.</p>
              <button
                onClick={handleExportDocx}
                disabled={isExporting}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Updated DOCX
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-bold text-slate-600 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("verdict")}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "verdict" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900"
          }`}
        >
          Match Verdict Analysis
        </button>
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
      {activeTab === "verdict" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <h3 className="font-extrabold text-slate-900 text-xl">Detailed Verdict Breakdown</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your profile was evaluated against {jobProfile.requirements.length} extracted job description criteria across hard skills, technical tools, responsibilities, and experience length.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths ({keywordIntelligence.matchedKeywords.length})
              </div>
              <ul className="text-xs text-slate-700 space-y-1">
                {keywordIntelligence.matchedKeywords.map((k) => (
                  <li key={k.term} className="flex items-center gap-1.5">✓ {k.term}</li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
              <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Evidence Gaps ({keywordIntelligence.missingKeywords.length})
              </div>
              <ul className="text-xs text-slate-700 space-y-1">
                {keywordIntelligence.missingKeywords.map((m) => (
                  <li key={m.term} className="flex items-center gap-1.5">⚠ {m.term} — <em>Not found in resume</em></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        featureTitle={paywallFeature}
      />
    </div>
  );
}
