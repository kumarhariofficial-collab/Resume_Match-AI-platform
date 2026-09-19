"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, Lock, Mail, UserPlus, LogIn, Loader2 } from "lucide-react";
import { useAuthStore } from "../../lib/auth-store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export function LoginModal({ isOpen, onClose, onSuccess, message }: Props) {
  const [activeTab, setActiveTab] = useState<"google" | "password" | "register">("google");
  const [email, setEmail] = useState("kumarhari.official@gmail.com");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Harikumar P");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");

  const { setUser } = useAuthStore();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const targetEmail = email || "kumarhari.official@gmail.com";
      const targetName = name || targetEmail.split("@")[0];

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, name: targetName }),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSignedInEmail(data.user.email);
        setIsSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(data.error || "Failed to authenticate with Google");
      }
    } catch (error) {
      setErrorMessage("Network error occurred during Gmail sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const endpoint = activeTab === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSignedInEmail(data.user.email);
        setIsSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(data.error || "Failed to authenticate");
      }
    } catch (error) {
      setErrorMessage("Network error during sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
          <p className="text-xs text-slate-500">
            {message || "Access Pro Resume Intelligence & Track your ATS Resumes."}
          </p>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-4 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" /> Member Benefits:
          </div>
          <ul className="text-[11px] text-slate-700 space-y-1 font-medium">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mandatory login to process & save your ATS report</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automatic verification email sent to your inbox</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Track resume scans & application history in DB</li>
          </ul>
        </div>

        {/* Auth Method Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => { setActiveTab("google"); setErrorMessage(""); }}
            className={`py-1.5 rounded-lg transition-all ${activeTab === "google" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
          >
            Gmail / Google
          </button>
          <button
            onClick={() => { setActiveTab("password"); setErrorMessage(""); }}
            className={`py-1.5 rounded-lg transition-all ${activeTab === "password" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab("register"); setErrorMessage(""); }}
            className={`py-1.5 rounded-lg transition-all ${activeTab === "register" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"}`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {isSubmitted ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="font-extrabold text-base text-emerald-950">Signed In & Verified!</div>
            <p className="text-slate-700 text-xs">
              Welcome! Account authenticated for <strong className="text-emerald-800">{signedInEmail}</strong>.
            </p>
            <p className="text-[11px] text-slate-500">
              A confirmation email has been dispatched to <strong>{signedInEmail}</strong>. Your ATS Resume analyses are now tracked under your account.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onSuccess) onSuccess();
              }}
              className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Continue to ATS Analyzer →
            </button>
          </div>
        ) : (
          <>
            {activeTab === "google" && (
              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Gmail / Google Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kumarhari.official@gmail.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Sign in & Verify with Gmail ({email})</span>
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
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
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
                    placeholder="Harikumar P"
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
                    placeholder="kumarhari.official@gmail.com"
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
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create Account & Send Email
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
