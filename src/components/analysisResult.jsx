import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  UserCircle2,
  Cpu,
  ChevronRight,
} from "lucide-react";

function Gauge({ value, size = 120, strokeWidth = 12 }) {
  const r = (size - strokeWidth) / 2;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - value / 100);
  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg width={size} height={size / 2 + strokeWidth} className="overflow-visible">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF553E" />
            <stop offset="100%" stopColor="#FF553E" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255, 85, 62, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-foreground absolute bottom-2 text-2xl font-bold">
        {Math.round(value)}%
      </span>
    </div>
  );
}

function getSectionIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("experience")) return <TrendingUp className="h-5 w-5 text-orange-600" />;
  if (n.includes("education") || n.includes("certification"))
    return <BookOpen className="h-5 w-5 text-blue-600" />;
  if (n.includes("technical")) return <Cpu className="h-5 w-5 text-purple-600" />;
  return <UserCircle2 className="h-5 w-5 text-slate-600" />;
}

function statusBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "matched") return "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium";
  return "border-orange-200 bg-orange-50 text-orange-700 font-medium";
}

function statusLabel(status) {
  const s = (status || "").toLowerCase();
  if (s === "matched") return "Matched";
  if (s === "missing" || s === "additional") return "Partial";
  return status || "Partial";
}

export default function AnalysisResult({ analysis }) {
  const recommendations = analysis.recommendations || [];
  const recLevel = (rec) => (rec.priority || "medium").toLowerCase();
  const recText = (rec) => [rec.action, rec.impact].filter(Boolean).join(" ");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-5xl items-center space-y-6 pb-12 duration-700">
      {/* Header Score section */}
      <Card className="border-border/40 overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                Overall Match Score
              </h2>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                {analysis.summary}
              </p>
            </div>
            <Gauge value={analysis.matchScore ?? 0} size={120} strokeWidth={12} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[2rem] border-emerald-100 bg-emerald-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg text-emerald-700">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analysis.strengths || []).map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm"
              >
                <h4 className="mb-1 text-sm font-semibold text-emerald-800">{s.category}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{s.details}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-rose-100 bg-rose-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <CardTitle className="text-lg text-rose-700">Gaps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analysis.gaps || []).map((g, i) => (
              <div key={i} className="rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm">
                <h4 className="mb-1 text-sm font-semibold text-rose-800">{g.category}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{g.details}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Skills Analysis */}
      {analysis.metrics?.length > 0 && (
        <Card className="border-border/40 rounded-[2rem] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground text-xl">Skills Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground border-border/40 border-b">
                    <th className="pb-4 pl-2 font-medium">Skill/Keyword</th>
                    <th className="pb-4 font-medium">Resume Coverage</th>
                    <th className="pb-4 font-medium">JD Coverage</th>
                    <th className="pr-2 pb-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-border/40 divide-y">
                  {analysis.metrics.map((skill, i) => (
                    <tr key={i} className="group transition-colors hover:bg-slate-50/50">
                      <td className="text-foreground py-5 pl-2 font-semibold">{skill.skill}</td>
                      <td className="py-5 pr-8">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-[#FF553E] transition-all duration-500"
                              style={{ width: `${skill.resumeCoverage ?? 0}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-8 text-xs font-medium tabular-nums">
                            {skill.resumeCoverage ?? 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-5 pr-8">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${skill.jdCoverage ?? 0}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-8 text-xs font-medium tabular-nums">
                            {skill.jdCoverage ?? 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-5 pr-2">
                        <Badge variant="outline" className={statusBadgeClass(skill.status)}>
                          {statusLabel(skill.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Match Cards */}
      <div className="grid gap-4">
        {(analysis.sections || []).map((section, i) => (
          <Card
            key={i}
            className="border-border/40 rounded-[2rem] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 shadow-sm">
                    {getSectionIcon(section.name)}
                  </div>
                  <h3 className="text-foreground text-lg font-semibold">{section.name}</h3>
                </div>
                {section.matchPercentage != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">
                      {section.matchPercentage}%
                    </span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-[#FF553E]"
                        style={{ width: `${section.matchPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                {section.analysis}
              </p>
              {section.suggestions?.length > 0 && (
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-muted-foreground mb-3 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Suggestions
                  </h4>
                  <div className="space-y-2">
                    {section.suggestions.map((s, si) => (
                      <div
                        key={si}
                        className="text-foreground flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-sm"
                      >
                        <ChevronRight className="h-4 w-4 shrink-0 text-[#FF553E]" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority Recommendations */}
      {recommendations.length > 0 && (
        <Card className="rounded-[2rem] border-orange-100 bg-[#FFFAF5] shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <UserCircle2 className="h-5 w-5 text-[#FF553E]" />
            <CardTitle className="text-foreground text-xl">Priority Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition-transform hover:scale-[1.01]"
              >
                <Badge
                  variant="outline"
                  className={
                    recLevel(rec) === "high"
                      ? "border-rose-100 bg-rose-50 text-rose-700"
                      : recLevel(rec) === "medium"
                        ? "border-orange-100 bg-orange-50 text-orange-700"
                        : "border-blue-100 bg-blue-50 text-blue-700"
                  }
                >
                  {(rec.priority || "Medium").charAt(0).toUpperCase() +
                    (rec.priority || "medium").slice(1)}
                </Badge>
                <p className="text-foreground text-sm font-medium">{recText(rec)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
