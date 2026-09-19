import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { FileCheck, Sparkles, Shield, User } from "lucide-react";

export const metadata: Metadata = {
  title: "ResumeMatch AI — ATS & Job Description Intelligence Platform",
  description: "Analyze candidate resumes against job descriptions, check ATS readability, identify evidence gaps, and validate tailored resumes truthfully.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <div className="p-2 bg-brand-600 text-white rounded-lg">
                <FileCheck className="w-5 h-5" />
              </div>
              <span>ResumeMatch <span className="text-brand-600 font-extrabold">AI</span></span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/analyze" className="hover:text-brand-600 transition-colors">Analyze Resume</Link>
              <Link href="/tracker" className="hover:text-brand-600 transition-colors">Job Tracker</Link>
              <Link href="/analyze" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-all font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Analyze Free
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Privacy First: Truthful Candidate Intelligence. No Universal ATS Fake Guarantees.</span>
            </div>
            <p>© {new Date().getFullYear()} ResumeMatch AI. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
