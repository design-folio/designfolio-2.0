import React from "react";
import OfferAnalysis from "./OfferAnalysis";

export default function OfferTool({
  onToolUsed,
  onViewChange,
  onStartNewAnalysis,
  skipRestore = false,
  guestUsageLimitReached = false,
}) {
  return (
    <div className="w-full">
      <OfferAnalysis
        onToolUsed={onToolUsed}
        onViewChange={onViewChange}
        onStartNewAnalysis={onStartNewAnalysis}
        skipRestore={skipRestore}
        guestUsageLimitReached={guestUsageLimitReached}
      />
    </div>
  );
}
