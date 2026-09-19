"use client";

import { EvidenceMapping } from "@resumematch/core-types";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, FileText } from "lucide-react";

interface Props {
  evidenceMatrix: EvidenceMapping[];
}

export function RequirementMatrixTable({ evidenceMatrix }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Job Requirement Matrix</h3>
          <p className="text-slate-500 text-xs">Requirement mapping against candidate resume evidence strings.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">JD Requirement</th>
              <th className="p-4">Category</th>
              <th className="p-4">Resume Evidence</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {evidenceMatrix.map((item) => (
              <tr key={item.requirementId} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-semibold text-slate-900">{item.requirementText}</td>
                <td className="p-4">
                  <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
                    {item.category.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-4 max-w-xs">
                  <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 truncate">
                    {item.evidenceText}
                  </div>
                  {item.sourceSection && item.sourceSection !== "Not found" && (
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {item.sourceSection}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="p-4 text-xs text-slate-600">{item.recommendationAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "STRONG_MATCH") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Strong Match
      </span>
    );
  }
  if (status === "PARTIAL_MATCH") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-full border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5" /> Partial Match
      </span>
    );
  }
  if (status === "WEAK_EVIDENCE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 font-semibold text-xs rounded-full border border-orange-200">
        <HelpCircle className="w-3.5 h-3.5" /> Weak Evidence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold text-xs rounded-full border border-slate-200">
      <XCircle className="w-3.5 h-3.5 text-slate-400" /> Missing
    </span>
  );
}
