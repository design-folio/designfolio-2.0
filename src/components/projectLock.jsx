import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StardustButton } from "./StardustButton";
import { cn } from "@/lib/utils";

export default function ProjectLock({ className }) {
  const { setShowUpgradeModal, setUpgradeModalUnhideProject } = useGlobalContext();

  const handleUpgrade = () => {
    setUpgradeModalUnhideProject(null);
    setShowUpgradeModal(true);
  };

  return (
    <div className={cn("w-full h-full rounded-2xl flex flex-col items-center justify-center p-10 min-h-[400px] gap-4 relative bg-background border border-border shadow-sm", className)}>
      <div className="flex flex-col items-center text-center max-w-xs">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-muted/80">
          <Crown className="w-8 h-8 text-foreground/70" />
        </div>

        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Unlock Unlimited Projects
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          You've reached the 2-projects limit on the free plan. Upgrade to PRO to add unlimited projects and unlock all premium features.
        </p>

        <StardustButton onClick={() => { setUpgradeModalUnhideProject(null); setShowUpgradeModal(true); }}>
          Upgrade to PRO
        </StardustButton>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/80">
          <Lock className="w-3 h-3 shrink-0" />
          <span>Free plan: 2 projects only</span>
        </div>
      </div>
    </div>
  );
}
