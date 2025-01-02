import React from "react";
import AnalyzeEmptyState from "./analyzeEmptyState";
import dynamic from "next/dynamic";
import Button from "./button";
import Text from "./text";
const AnalyzeEditor = dynamic(() => import("./analyzeEditor"), {
  ssr: false,
});

export default function AnalyzeTool() {
  return (
    <div className="grid grid-cols-2 gap-[120px] max-w-[1440px] mx-auto items-center h-full">
      <AnalyzeEditor />
      <AnalyzeEmptyState />
    </div>
  );
}
