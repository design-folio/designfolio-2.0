import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import { Crown, Lock } from "lucide-react";
import { StardustButton } from "./StardustButton";
export default function ProjectLock() {
  const { setShowUpgradeModal } = useGlobalContext();

  return (
    <div
      className="w-full h-full border rounded-2xl flex flex-col items-center justify-center p-10 min-h-[400px] gap-4 relative bg-df-add-card-bg-color border-df-add-card-border-color"
      style={{
        boxShadow:
          "inset 0 3px 8px 0 rgb(0 0 0 / 0.03), inset 0 -3px 8px 0 rgb(0 0 0 / 0.02)",
      }}
    >
      <div className="flex flex-col items-center text-center max-w-xs">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-df-section-card-bg-color"
          style={{
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
          }}
        >
          <Crown className="w-8 h-8 text-df-icon-color opacity-70" />
        </div>

        <h3 className="text-xl font-semibold mb-2 text-df-add-card-heading-color">
          Upgrade to PRO
        </h3>
        <p className="text-sm text-df-add-card-description-color mb-4">
          You've reached the 2-project limit on the free plan. Get lifetime
          access to add unlimited projects and unlock all premium features.
        </p>

        <StardustButton onClick={() => setShowUpgradeModal(true)}>
          Get Lifetime Access
        </StardustButton>

        <div className="mt-6 flex items-center gap-2 text-xs text-df-add-card-description-color opacity-70">
          <Lock className="w-3 h-3" />
          <span>Free plan: 2 project only</span>
        </div>
      </div>
    </div>
  );
}
