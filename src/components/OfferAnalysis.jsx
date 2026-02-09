import React, { useState } from "react";
import OfferForm from "./OfferForm";
import { analyzeOffer } from "@/lib/gemini";
import { toast } from "react-toastify";
import AnalysisReport from "./AnalysisReport";

export default function OfferAnalysis() {
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRateLimitError = () => {
    console.log("Rate limit exceeded - showing API key input");
    toast.error("Rate limit reached.");
    setAnalysis(
      "⚠️ Rate Limit Reached\n\n" +
      "The demo API key has reached its limit. To continue:\n\n" +
      "1. Get your free API key from https://makersuite.google.com/app/apikey\n" +
      "2. Enter it in the field above\n\n" +
      "Your key will be saved locally for future use."
    );
  };

  const handleRestart = () => {
    console.log("Restarting analysis flow");
    setAnalysis("");
  };

  const handleSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    setIsAnalyzing(true);

    try {
      console.log("Starting analysis with data:", data);
      const result = await analyzeOffer(data);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis error:", error);

      if (error?.status === 429 || error?.message?.includes("429")) {
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
