import React, { memo } from "react";
import { cn } from "@/lib/utils";

function ProfessionalNavTabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="bg-[#DED9CE] dark:bg-[#2A2520] px-3 py-2 flex items-center gap-1 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            "group px-6 py-2.5 font-jetbrains text-[12px] uppercase tracking-wider transition-all duration-200 min-w-max relative",
            activeTab === tab.key
              ? "bg-[#EFECE6] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#F0EDE7] font-semibold shadow-sm [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)]"
              : "text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] font-medium bg-transparent",
          )}
        >
          <span className="relative z-10 transition-colors duration-200">
            {tab.label}
          </span>
          {activeTab !== tab.key && (
            <span className="absolute bottom-2 left-[50%] -translate-x-1/2 w-0 h-[1px] bg-[#1A1A1A] dark:bg-[#F0EDE7] opacity-0 group-hover:opacity-100 group-hover:w-[60%] transition-all duration-300 ease-out z-10" />
          )}
        </button>
      ))}
    </div>
  );
}

export default memo(ProfessionalNavTabs);
