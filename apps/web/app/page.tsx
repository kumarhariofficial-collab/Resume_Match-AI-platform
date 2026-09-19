import Link from "next/link";
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="pt-16 pb-12 text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Transparent & Evidence-Based Resume Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Analyze Your Resume Against Any Job Description Truthfully
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Find missing requirements, ATS readability health risks, and evidence-backed tailoring recommendations without fake scores or invented candidate experience.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/analyze"
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Analyze My Resume Now
          </Link>
          <Link
            href="/analyze"
            className="px-6 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            See Demo Analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs text-slate-400 pt-2">
          Supports PDF, DOCX, TXT. No credit card required. Private & secure.
        </p>
      </section>

      {/* Product Rules Guarantee Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Transparent Match Metrics</span>
            </div>
            <p className="text-sm text-slate-300">
              We separate <strong>Resume–JD Match Score</strong> from <strong>ATS Readability Health</strong>. We never make fake claims like "Guaranteed ATS Score".
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>Zero Fabrication Guarantee</span>
            </div>
            <p className="text-sm text-slate-300">
              Our AI never invents skills, projects, metrics, or degrees. Missing requirements are clearly marked <em>"Not found in resume"</em>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <BarChart3 className="w-5 h-5" />
              <span>Explainable Formulas</span>
            </div>
            <p className="text-sm text-slate-300">
              Every score displays its explicit formula, weightings, category breakdowns, and underlying resume evidence strings.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-900">How ResumeMatch AI Works</h2>
          <p className="text-slate-600">Built around evidence-backed, transparent candidate intelligence.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xl">1</div>
            <h3 className="text-xl font-bold text-slate-900">Resume & JD Parsing</h3>
            <p className="text-slate-600 text-sm">
              Upload your PDF/DOCX resume and paste the job description. Our engine extracts structured candidate profiles and JD qualifications.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xl">2</div>
            <h3 className="text-xl font-bold text-slate-900">Requirement Mapping & Audit</h3>
            <p className="text-slate-600 text-sm">
              Evaluates multi-layer keyword evidence, acronyms, and 11 ATS document layout risk factors with explainable sub-scores.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xl">3</div>
            <h3 className="text-xl font-bold text-slate-900">Fact-Verified Export</h3>
            <p className="text-slate-600 text-sm">
              Optionally tailor your resume with AI guardrails, verify factual consistency against your master profile, and export re-validated DOCX files.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
