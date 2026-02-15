import React from "react";
import AnalyzeEmptyState from "./analyzeEmptyState";
import dynamic from "next/dynamic";

const AnalyzeEditor = dynamic(() => import("./analyzeEditor"), {
  ssr: false,
});

export default function AnalyzeTool() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start h-full">
      <AnalyzeEditor />
      <AnalyzeEmptyState />
    </div>
  );
}
