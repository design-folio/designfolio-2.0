import React, { memo } from "react";
import { cn } from "@/lib/utils";

function ProfessionalNavTabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto bg-[#DED9CE] px-3 py-2 dark:bg-[#2A2520]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            "group font-jetbrains relative min-w-max px-6 py-2.5 text-[12px] tracking-wider uppercase transition-all duration-200",
            activeTab === tab.key
              ? "bg-[#EFECE6] font-semibold text-[#1A1A1A] shadow-sm [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)] dark:bg-[#1A1A1A] dark:text-[#F0EDE7]"
              : "bg-transparent font-medium text-[#7A736C] hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
          )}
        >
          <span className="relative z-10 transition-colors duration-200">{tab.label}</span>
          {activeTab !== tab.key && (
            <span className="absolute bottom-2 left-[50%] z-10 h-[1px] w-0 -translate-x-1/2 bg-[#1A1A1A] opacity-0 transition-all duration-300 ease-out group-hover:w-[60%] group-hover:opacity-100 dark:bg-[#F0EDE7]" />
          )}
        </button>
      ))}
    </div>
  );
}

export default memo(ProfessionalNavTabs);
