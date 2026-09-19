"use client";

import { ATSAuditReport } from "@resumematch/core-types";
import { CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck } from "lucide-react";

interface Props {
  atsAudit: ATSAuditReport;
}

export function ATSChecklist({ atsAudit }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg">ATS Readability / Parsing Health</h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full border border-slate-200">
              {atsAudit.statusSummary}
            </span>
          </div>
          <p className="text-slate-500 text-xs">Evaluates file layout risks, text layer accessibility, and structural formatting.</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold text-slate-900">{atsAudit.atsHealthScore}%</div>
          <div className="text-[10px] text-slate-400 font-medium">Health Score</div>
        </div>
      </div>

      <div className="grid gap-4">
        {atsAudit.checks.map((check) => (
          <div
            key={check.id}
            className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
              check.status === "PASS"
                ? "bg-slate-50/50 border-slate-200"
                : check.status === "WARNING"
                ? "bg-amber-50/50 border-amber-200"
                : "bg-red-50/50 border-red-200"
            }`}
          >
            <div className="mt-0.5">
              {check.status === "PASS" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : check.status === "WARNING" ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">{check.title}</h4>
                <span className="text-[10px] uppercase font-bold text-slate-400">{check.severity}</span>
              </div>
              <p className="text-xs text-slate-700">{check.message}</p>
              <p className="text-xs text-slate-500 font-medium pt-1">
                <strong>Fix Recommendation:</strong> {check.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
