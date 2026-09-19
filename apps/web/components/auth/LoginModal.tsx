"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, Lock, Mail, ArrowRight, UserPlus, LogIn } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"google" | "password" | "register">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    // Google Sign in simulation/trigger
    alert("Redirecting to Google / Gmail Authentication...");
    setIsSubmitted(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border border-slate-100 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to ResumeMatch AI</h2>
          <p className="text-xs text-slate-500">Access Pro & Premium Resume Intelligence Benefits.</p>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-4 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" /> Unlock Premium Career Features:
          </div>
          <ul className="text-[11px] text-slate-700 space-y-1 font-medium">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Unlimited AI Resume Tailoring to any JD</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automated 1-Click DOCX / PDF Export</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fact-Verification & Zero Fabrication Guard</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Job Application Tracker Kanban Board Sync</li>
          </ul>
        </div>

        {/* Auth Method Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab("google")}
            className={`py-1.5 rounded-lg transition-all ${activeTab === "google" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
          >
            Google
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`py-1.5 rounded-lg transition-all ${activeTab === "password" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`py-1.5 rounded-lg transition-all ${activeTab === "register" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
          >
            Register
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="font-bold text-sm text-emerald-950">Successfully Signed In!</div>
            <p>Welcome back! Your Pro & Premium benefits are now active.</p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <>
            {activeTab === "google" && (
              <div className="space-y-4 pt-1">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Gmail / Google Account</span>
                </button>
              </div>
            )}

            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </form>
            )}

            {activeTab === "register" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Create Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Free Account
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
