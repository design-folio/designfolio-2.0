import Editor from "@/components/editor";
import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";

export default function Index() {
  const { userDetails } = useGlobalContext();

  return (
    <main className={cn(
      "min-h-screen",
      userDetails?.wallpaper && userDetails?.wallpaper?.value != 0
        ? "bg-transparent"
        : "bg-df-bg-color"
    )}>
      <div
        className={`max-w-[890px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0`}
      >
        <Editor edit />
      </div>
    </main>
  );
}
