import React from "react";
import MatchScore from "./MatchScore";
import StrengthsSection from "./StrengthsSection";
import GapsSection from "./GapsSection";
import KeywordChart from "./KeywordChart";
import MetricsTable from "./MetricsTable";
import { Card2 } from "./card2";
import RecommendationsSection from "./RecommendationsSection";
import ProgressBar from "./ProgressBar";

export default function AnalysisResult({ analysis }) {
  return (
    <>
      <MatchScore score={analysis.matchScore} summary={analysis.summary} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrengthsSection strengths={analysis.strengths} />
        <GapsSection gaps={analysis.gaps} />
      </div>

      <KeywordChart data={analysis.keywordAnalysis} />

      <Card2 className="p-6">
        <h3 className="text-lg font-semibold mb-6">Skills Analysis</h3>
        <MetricsTable metrics={analysis.metrics} />
      </Card2>

      {analysis.sections.map((section, index) => (
        <Card2 key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{section.name}</h3>
            {section.matchPercentage && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {section.matchPercentage}%
                </span>
                <ProgressBar
                  progress={section.matchPercentage}
                  className="w-32 h-2"
                />
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-4">{section.analysis}</p>
          <div className="space-y-2">
            <h4 className="font-medium">Suggestions:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {section.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-gray-600">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </Card2>
      ))}

      <RecommendationsSection recommendations={analysis.recommendations} />
    </>
  );
}
