import React from "react";

export default function AnalyzeEmptyState() {
  return (
    <div className="flex flex-col items-start justify-center gap-6">
      <div className="flex items-center justify-center">
        <img src="/assets/svgs/binocular.svg" alt="binocular" className="h-12 w-12" />
      </div>
      <div>
        <h3 className="text-foreground text-base font-semibold">Analyze your case study</h3>
        <p className="text-muted-foreground mt-1 text-sm">Start by adding text to the editor</p>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <img src="/assets/svgs/points.svg" alt="" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-muted-foreground text-sm">
            Paste your case study or import directly from Medium.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <img src="/assets/svgs/points.svg" alt="" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-muted-foreground text-sm">
            We&apos;ll compare it against examples from top designers at Meta and Google.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <img src="/assets/svgs/points.svg" alt="" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-muted-foreground text-sm">
            In just 10 seconds, you&apos;ll get a detailed scorecard with tips to improve.
          </p>
        </div>
      </div>
    </div>
  );
}
