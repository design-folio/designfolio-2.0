import React from "react";

export default function AnalyzeEmptyState() {
  return (
    <div className="flex flex-col items-start justify-center gap-6">
      <div className="flex items-center justify-center">
        <img src="/assets/svgs/binocular.svg" alt="binocular" className="w-12 h-12" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Analyze your case study
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start by adding text to the editor
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <img src="/assets/svgs/points.svg" alt="" className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Paste your case study or import directly from Medium.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <img src="/assets/svgs/points.svg" alt="" className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            We'll compare it against examples from top designers at Meta and Google.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <img src="/assets/svgs/points.svg" alt="" className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            In just 10 seconds, you'll get a detailed scorecard with tips to improve.
          </p>
        </div>
      </div>
    </div>
  );
}
