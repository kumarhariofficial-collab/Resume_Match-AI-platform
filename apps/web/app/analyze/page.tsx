"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [resumeFileBase64, setResumeFileBase64] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "docx" | "txt">("txt");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") setFileType("pdf");
    else if (ext === "docx") setFileType("docx");
    else setFileType("txt");

    const reader = new FileReader();
    if (ext === "pdf" || ext === "docx") {
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        setResumeFileBase64(base64);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text || "");
        setResumeFileBase64(null);
      };
      reader.readAsText(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!resumeText.trim() && !resumeFileBase64) {
      alert("Please upload a resume file (PDF, DOCX, TXT) or paste your resume text.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste the target Job Description.");
      return;
    }

    setIsAnalyzing(true);
    setProgressStage("Extracting text layer & analyzing requirements...");

    try {
      const res = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          resumeFileBase64,
          fileType,
          jobDescription,
          fileName: resumeFileName || "Resume",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analysis failed.");
      }

      const data = await res.json();
      sessionStorage.setItem(`analysis_${data.id}`, JSON.stringify(data));
      router.push(`/analysis/${data.id}`);
    } catch (err: any) {
      alert(`Analysis Error: ${err.message || "Failed to analyze document"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          AI & Deterministic ATS Audit Pipeline
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Analyze Resume vs Job Description
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Upload your PDF, DOCX, or TXT resume and paste the job description to run transparent matching, layout health checks, and evidence mapping.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resume Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              1. Candidate Resume
            </h2>
            {resumeFileName && (
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                ✓ {resumeFileName}
              </span>
            )}
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-brand-500 transition-all bg-slate-50/60 hover:bg-brand-50/20">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-file-input"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer space-y-3 block">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Upload PDF, DOCX, or TXT</div>
                <div className="text-xs text-slate-500 mt-1">Native text extraction via pdf-parse & mammoth</div>
              </div>
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or paste raw text</span>
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste raw resume text here if not uploading a file..."
            className="w-full h-36 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>

        {/* JD Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            2. Target Job Description
          </h2>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste complete Job Description here (Job title, company, required skills, responsibilities)..."
            className="w-full h-80 p-4 text-xs border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || (!resumeText.trim() && !resumeFileBase64) || !jobDescription.trim()}
          className="px-10 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 text-white font-extrabold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{progressStage}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Run Intelligence Analysis</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 mt-3 font-medium">
          Truthful Intelligence: Explainable match formulas. Zero qualification fabrication.
        </p>
      </div>
    </div>
  );
}
