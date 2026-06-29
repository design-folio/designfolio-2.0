import React from "react";
import AnalyzeEmptyState from "./analyzeEmptyState";
import dynamic from "next/dynamic";

const AnalyzeEditor = dynamic(() => import("./analyzeEditor"), {
  ssr: false,
});

export default function AnalyzeTool() {
  return (
    <div className="grid h-full grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
      <AnalyzeEditor />
      <AnalyzeEmptyState />
    </div>
  );
}
