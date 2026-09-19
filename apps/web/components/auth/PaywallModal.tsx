"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, Lock, Zap, ShieldCheck, ArrowRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
}

export function PaywallModal({ isOpen, onClose, featureTitle = "Pro Career Intelligence" }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border border-slate-100 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-blue-600" />
            Premium Feature Locked
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Unlock {featureTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Upgrade to Pro to automatically tailor your resume, export re-validated DOCX/PDF files, and bypass keyword rejection algorithms.
          </p>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {/* Free Tier */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="font-bold text-slate-700 text-sm">Free Analyst</div>
            <div className="text-2xl font-extrabold text-slate-900">$0 <span className="text-xs text-slate-400 font-normal">forever</span></div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1 Resume Analysis per month</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Basic Resume–JD Match Score</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Basic ATS Readability Audit</li>
              <li className="flex items-center gap-1.5 text-slate-400 line-through">AI Resume Rewriting & Tailoring</li>
              <li className="flex items-center gap-1.5 text-slate-400 line-through">DOCX / PDF Re-validated Export</li>
            </ul>
            <button
              onClick={onClose}
              className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-5 rounded-2xl border-2 border-blue-600 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 space-y-3 relative shadow-lg">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase rounded-full tracking-wider shadow">
              Recommended
            </div>
            <div className="font-extrabold text-blue-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Pro Career Pass
            </div>
            <div className="text-2xl font-extrabold text-slate-900">$19 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
            <ul className="text-xs text-slate-700 space-y-2 font-medium">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited Resume & JD Analyses</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited AI Tailoring & Re-Parser Verification</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-Click Validated DOCX & PDF Exports</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cover Letter & Interview Prep Generator</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Job Application Tracker Kanban Board</li>
            </ul>
            <button
              onClick={() => {
                alert("Redirecting to Secure Payment Checkout...");
                onClose();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Unlock Pro Access Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>30-Day Money-Back Guarantee • Cancel Anytime • Secure Encrypted Payment</span>
        </div>
      </div>
    </div>
  );
}
