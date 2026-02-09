import React, { useState } from "react";
import OfferForm from "./OfferForm";
import { toast } from "react-toastify";
import AnalysisReport from "./AnalysisReport";

export default function OfferAnalysis() {
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRateLimitError = () => {
    toast.error("Rate limit reached.");
    setAnalysis(
      "⚠️ Rate Limit Reached\n\n" +
      "Please try again in a few moments."
    );
  };

  const handleRestart = () => {
    setAnalysis("");
  };

  const handleSubmit = async (data) => {
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
    <div className="w-full">
      {!analysis ? (
        <OfferForm onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
      ) : (
        <AnalysisReport analysis={analysis} onRestart={handleRestart} />
      )}
    </div>
  );
}
