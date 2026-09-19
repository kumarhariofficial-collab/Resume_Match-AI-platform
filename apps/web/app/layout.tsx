"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import Link from "next/link";
import { FileCheck, Sparkles, Shield, User, LogOut, Users, FileSpreadsheet } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuthStore } from "@/lib/auth-store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, isAuthenticated, checkSession, logout } = useAuthStore();
  const [stats, setStats] = useState({ totalUsers: 14, totalAnalyses: 52 });

  useEffect(() => {
    checkSession();
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats({ totalUsers: data.totalUsers, totalAnalyses: data.totalAnalyses });
        }
      })
      .catch(() => {});
  }, [checkSession]);

  return (
    <html lang="en">
      <head>
        <title>ResumeMatch AI — ATS & Job Description Intelligence Platform</title>
        <meta name="description" content="Analyze candidate resumes against job descriptions, check ATS readability, identify evidence gaps, and validate tailored resumes truthfully." />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span>ResumeMatch <span className="text-blue-600 font-extrabold">AI</span></span>
              </Link>

              {/* Platform Live Stats Badges */}
              <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
                <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  {stats.totalUsers} Active Members
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                  {stats.totalAnalyses} Resumes Analyzed
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-600">
              <Link href="/analyze" className="hover:text-blue-600 transition-colors">Analyze Resume</Link>
              <Link href="/tracker" className="hover:text-blue-600 transition-colors">Job Tracker</Link>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user.email}</span>
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black uppercase">
                      {user.plan || "PRO"}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Sign In
                  </button>

                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md transition-all font-bold flex items-center gap-1.5 text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Get Pro Benefits
                  </button>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Privacy First: Truthful Candidate Intelligence. Zero Qualification Fabrication.</span>
            </div>
            <p>© {new Date().getFullYear()} ResumeMatch AI. All rights reserved.</p>
          </div>
        </footer>

        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </body>
    </html>
  );
}
