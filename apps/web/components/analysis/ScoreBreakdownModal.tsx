"use client";

import { MatchScoreExplanation } from "@resumematch/core-types";
import { HelpCircle, X, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

interface Props {
  scoreExplanation: MatchScoreExplanation;
  isOpen: boolean;
  onClose: () => void;
}

export function ScoreBreakdownModal({ scoreExplanation, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
            <HelpCircle className="w-6 h-6 text-brand-600" />
            <span>Score Calculation & Weight Breakdown</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl space-y-2">
            <div className="font-bold text-brand-900 text-base">
              Metric Name: {scoreExplanation.metricLabel} ({scoreExplanation.overallMatchScore}%)
            </div>
            <p className="text-xs text-brand-800">{scoreExplanation.formulaDescription}</p>
          </div>

          <h3 className="font-bold text-slate-900">Category Weightings & Sub-scores:</h3>
          <div className="space-y-3">
            {scoreExplanation.breakdown.map((item) => (
              <div key={item.category} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{item.label} (Weight: {item.weightPercentage}%)</span>
                  <span className="font-bold text-brand-600">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-600 h-full rounded-full" style={{ width: `${item.score}%` }} />
                </div>
                <div className="text-xs text-slate-500">{item.details}</div>
              </div>
            ))}
          </div>

          {scoreExplanation.criticalGaps.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Critical Gaps Identified:
              </h3>
              <div className="space-y-2">
                {scoreExplanation.criticalGaps.map((gap, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-red-900">{gap.requirement}</div>
                    <div className="text-slate-600">Resume Evidence: <strong>{gap.foundEvidence}</strong></div>
                    <div className="text-red-700">{gap.actionableFix}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-500 space-y-1 border border-slate-200">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Transparent AI Policy:
            </div>
            <p>
              This score is calculated deterministically from requirement category weightings. We do not pretend to simulate any specific employer ATS software.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
