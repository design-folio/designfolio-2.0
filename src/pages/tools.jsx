import AiTools from "@/components/aiTools";
import LandingHeader from "@/components/landingHeader";
import React from "react";

function ToolsPage() {
  return (
    <div
      className={`max-w-[890px] mx-auto py-[94px] md:py-[135px] px-2 md:px-4 lg:px-0`}
    >
        <LandingHeader mode="tools"></LandingHeader>
      <AiTools />
    </div>
  );
}

export default ToolsPage;
