import React from "react";
import Analytics from "@/components/analytics";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { hasNoWallpaper } from "@/lib/wallpaper";

function AnalyticsPage() {
  const { wallpaper } = useGlobalContext();

  return (
    <div
      className={cn(
        "max-w-[890px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0",
        hasNoWallpaper(wallpaper) ? "bg-df-bg-color" : "bg-transparent"
      )}
    >
      <Analytics />
    </div>
  );
}

export default AnalyticsPage;
