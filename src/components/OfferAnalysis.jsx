import React, { useState, useEffect } from "react";
import OfferForm from "./OfferForm";
import { toast } from "react-toastify";
import AnalysisReport from "./AnalysisReport";
import TetrisLoading from "./ui/tetris-loader";
import { getAiToolResult, setAiToolResult } from "@/lib/ai-tools-usage";

const RESULT_STORAGE_KEY = "salary-negotiator";

export default function OfferAnalysis({ onToolUsed, onViewChange, onStartNewAnalysis, skipRestore = false, guestUsageLimitReached = false }) {
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    if (skipRestore) return;
    const stored = getAiToolResult(RESULT_STORAGE_KEY);
    if (typeof stored === "string" && stored.length > 0) {
      setAnalysis(stored);
      onViewChange?.(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipRestore]);

  const handleRateLimitError = () => {
    toast.error("Rate limit reached.");
    setAnalysis(
      "⚠️ Rate Limit Reached\n\n" +
      "Please try again in a few moments."
    );
  };

  const handleRestart = () => {
    if (isRestarting) return;
    setIsRestarting(true);
    setAnalysis("");
    onViewChange?.(false);
    onStartNewAnalysis?.();
    setIsRestarting(false);
  };

  const handleSubmit = async (data) => {
    if (guestUsageLimitReached) {
      toast.error("You've already used this tool once. Sign up to analyze again.");
      return;
    }
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to analyze offer");
      }
      setAnalysis(result.analysis);
      setAiToolResult(RESULT_STORAGE_KEY, result.analysis);
      onViewChange?.(true);
      onToolUsed?.();
    } catch (error) {
      console.error("Analysis error:", error);

      if (error?.message?.includes("Rate limit")) {
        handleRateLimitError();
      } else if (error?.message?.includes("network")) {
        toast.error("Please check your internet connection and try again.");
        setAnalysis(
          "🌐 Network Error: Unable to reach our AI service. Please check your internet connection and try again."
        );
      } else {
        toast.error(
          "An unexpected error occurred. Please try again in a few moments."
        );
        setAnalysis(
          "❌ Unexpected error occurred. If this persists:\n\n1. Try refreshing the page\n2. Check if you're using a valid API key\n3. Contact support if the issue continues"
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full relative">
      {!analysis ? (
        <OfferForm onSubmit={handleSubmit} isAnalyzing={isAnalyzing} guestUsageLimitReached={guestUsageLimitReached} />
      ) : (
        <AnalysisReport analysis={analysis} onRestart={handleRestart} isRestarting={isRestarting} />
      )}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 border border-border/40">
            <TetrisLoading loadingText="Analyzing your offer..." />
          </div>
        </div>
      )}
    </div>
  );
}
