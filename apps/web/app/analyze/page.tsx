"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text || "");
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert("Please provide both a Resume and a Job Description.");
      return;
    }

    setIsAnalyzing(true);
    setProgressStage("Parsing Resume & Detecting Sections...");

    try {
      // Send data to API endpoint
      const res = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          fileName: resumeFileName || "Resume.txt",
        }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed.");
      }

      const data = await res.json();
      // Save data locally or redirect to report page
      sessionStorage.setItem(`analysis_${data.id}`, JSON.stringify(data));
      router.push(`/analysis/${data.id}`);
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to analyze document"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Analyze Resume vs Job Description</h1>
        <p className="text-slate-600 text-sm">
          Upload your resume and paste the job description to run transparent matching & ATS readability audit.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resume Input Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              Candidate Resume
            </h2>
            {resumeFileName && (
              <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-md border border-emerald-200">
                {resumeFileName}
              </span>
            )}
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-brand-400 transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer space-y-2 block">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-brand-600">Upload PDF, DOCX, or TXT</div>
              <div className="text-xs text-slate-400">or paste text directly below</div>
            </label>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Or paste full resume text here..."
            className="w-full h-48 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>

        {/* JD Input Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Target Job Description
          </h2>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste complete Job Description here (Job title, required skills, responsibilities)..."
            className="w-full h-64 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
          className="px-8 py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-lg transition-all flex items-center gap-3 mx-auto"
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

        <p className="text-xs text-slate-400 mt-3">
          100% Truthful: No fake universal ATS claims. All match calculations are transparent and explainable.
        </p>
      </div>
    </div>
  );
}
