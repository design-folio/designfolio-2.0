import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
    <div className="relative flex items-center justify-center shrink-0">
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
      <span className="absolute bottom-2 text-2xl font-bold font-serif text-foreground">
        {Math.round(value)}%
      </span>
    </div>
  );
}

function getSectionIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("experience")) return <TrendingUp className="w-5 h-5 text-orange-600" />;
  if (n.includes("education") || n.includes("certification")) return <BookOpen className="w-5 h-5 text-blue-600" />;
  if (n.includes("technical")) return <Cpu className="w-5 h-5 text-purple-600" />;
  return <UserCircle2 className="w-5 h-5 text-slate-600" />;
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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Score section */}
      <Card className="border-border/40 bg-white shadow-sm overflow-hidden rounded-[2rem]">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
                Overall Match Score
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                {analysis.summary}
              </p>
            </div>
            <Gauge value={analysis.matchScore ?? 0} size={120} strokeWidth={12} />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm rounded-[2rem]">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-emerald-700 text-lg font-serif">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analysis.strengths || []).map((s, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/80 border border-emerald-100 shadow-sm">
                <h4 className="font-semibold text-emerald-800 mb-1 text-sm">{s.category}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{s.details}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/30 shadow-sm rounded-[2rem]">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <CardTitle className="text-rose-700 text-lg font-serif">Gaps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analysis.gaps || []).map((g, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-sm">
                <h4 className="font-semibold text-rose-800 mb-1 text-sm">{g.category}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{g.details}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Skills Analysis */}
      {(analysis.metrics?.length > 0) && (
        <Card className="border-border/40 bg-white shadow-sm rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-xl text-foreground font-serif">Skills Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/40">
                    <th className="pb-4 font-medium pl-2">Skill/Keyword</th>
                    <th className="pb-4 font-medium">Resume Coverage</th>
                    <th className="pb-4 font-medium">JD Coverage</th>
                    <th className="pb-4 font-medium pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {analysis.metrics.map((skill, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 font-semibold text-foreground pl-2">{skill.skill}</td>
                      <td className="py-5 pr-8">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FF553E] transition-all duration-500"
                              style={{ width: `${skill.resumeCoverage ?? 0}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground tabular-nums w-8 text-xs font-medium">
                            {skill.resumeCoverage ?? 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-5 pr-8">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${skill.jdCoverage ?? 0}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground tabular-nums w-8 text-xs font-medium">
                            {skill.jdCoverage ?? 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-5 pr-2">
                        <Badge
                          variant="outline"
                          className={statusBadgeClass(skill.status)}
                        >
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
            className="border-border/40 bg-white shadow-sm rounded-[2rem] hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    {getSectionIcon(section.name)}
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-foreground">{section.name}</h3>
                </div>
                {section.matchPercentage != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {section.matchPercentage}%
                    </span>
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF553E]"
                        style={{ width: `${section.matchPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{section.analysis}</p>
              {section.suggestions?.length > 0 && (
                <div className="pt-5 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">
                    Suggestions
                  </h4>
                  <div className="space-y-2">
                    {section.suggestions.map((s, si) => (
                      <div
                        key={si}
                        className="text-sm text-foreground flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100"
                      >
                        <ChevronRight className="w-4 h-4 text-[#FF553E] shrink-0" />
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
        <Card className="border-orange-100 bg-[#FFFAF5] shadow-sm rounded-[2rem]">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <UserCircle2 className="w-5 h-5 text-[#FF553E]" />
            <CardTitle className="text-foreground text-xl font-serif">
              Priority Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-orange-100 shadow-sm transition-transform hover:scale-[1.01]"
              >
                <Badge
                  variant="outline"
                  className={
                    recLevel(rec) === "high"
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : recLevel(rec) === "medium"
                        ? "bg-orange-50 text-orange-700 border-orange-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                  }
                >
                  {(rec.priority || "Medium").charAt(0).toUpperCase() + (rec.priority || "medium").slice(1)}
                </Badge>
                <p className="text-sm text-foreground font-medium">{recText(rec)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
