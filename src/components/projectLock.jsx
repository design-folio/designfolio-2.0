import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import { Crown, Lock } from "lucide-react";
import { StardustButton } from "./StardustButton";
import { cn } from "@/lib/utils";

export default function ProjectLock({ className }) {
  const { setShowUpgradeModal, setUpgradeModalUnhideProject } = useGlobalContext();

  return (
    <div
      className={cn(
        "bg-background border-border relative flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-2xl border p-10 shadow-sm",
        className
      )}
    >
      <div className="flex max-w-xs flex-col items-center text-center">
        <div className="bg-muted/80 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Crown className="text-foreground/70 h-8 w-8" />
        </div>

        <h3 className="text-foreground mb-2 text-xl font-semibold">Unlock Unlimited Projects</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          You&apos;ve reached the 2-projects limit on the free plan. Upgrade to PRO to add unlimited
          projects and unlock all premium features.
        </p>

        <StardustButton
          onClick={() => {
            setUpgradeModalUnhideProject(null);
            setShowUpgradeModal(true);
          }}
        >
          Upgrade to PRO
        </StardustButton>

        <div className="text-muted-foreground/80 mt-6 flex items-center gap-2 text-xs">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Free plan: 2 visible projects</span>
        </div>
      </div>
    </div>
  );
}
