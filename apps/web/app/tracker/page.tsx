"use client";

import { useState } from "react";
import { Plus, Briefcase, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  appliedDate: string;
  matchScore: number;
}

export default function JobTrackerPage() {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      company: "Tech Corp",
      jobTitle: "Senior Data Analyst",
      status: "Applied",
      appliedDate: "2026-09-18",
      matchScore: 84,
    },
    {
      id: "2",
      company: "Analytics Inc",
      jobTitle: "Lead BI Engineer",
      status: "Interview",
      appliedDate: "2026-09-15",
      matchScore: 91,
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Job Application Tracker</h1>
          <p className="text-sm text-slate-500">Track tailored resume versions and application pipeline status.</p>
        </div>
        <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {["Saved", "Applied", "Interview", "Offer"].map((status) => (
          <div key={status} className="bg-slate-100/70 p-4 rounded-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center font-bold text-slate-700 text-sm">
              <span>{status}</span>
              <span className="text-xs px-2 py-0.5 bg-white text-slate-600 rounded-md shadow-sm">
                {applications.filter((a) => a.status === status).length}
              </span>
            </div>

            <div className="space-y-3">
              {applications
                .filter((a) => a.status === status)
                .map((app) => (
                  <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="font-bold text-slate-900 text-sm">{app.company}</div>
                    <div className="text-xs text-slate-600">{app.jobTitle}</div>
                    <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400">
                      <span>Applied: {app.appliedDate}</span>
                      <span className="font-bold text-brand-600">{app.matchScore}% Match</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
