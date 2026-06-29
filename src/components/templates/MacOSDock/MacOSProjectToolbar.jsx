import React from "react";
import { ChevronLeft, ChevronRight, Lock, Copy, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

const MacOSProjectToolbar = ({ projectUrl, onBack, onRefresh, rightSlot, className = "" }) => {
  const displayUrl =
    projectUrl || (typeof window !== "undefined" ? `${window.location.origin}/project` : "");
  const urlToCopy =
    projectUrl || (typeof window !== "undefined" ? `${window.location.origin}/project` : "");

  const handleCopy = async () => {
    if (!urlToCopy) return;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  return (
    <div
      className={`flex h-10 shrink-0 items-center gap-3 border-b border-[#e0ddd8] bg-[#f4f2ee] px-4 ${className}`}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded p-1.5 text-[#555] hover:bg-black/5 disabled:cursor-default disabled:opacity-40"
          title="Back"
          onClick={onBack}
          disabled={!onBack}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className="cursor-default rounded p-1.5 text-[#555] opacity-40 hover:bg-black/5"
          title="Forward"
          aria-disabled="true"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-md border border-[#c8c8c8] bg-[#e3e3e3]/50 px-3 shadow-inner">
        <Lock size={10} className="shrink-0 text-[#666]" />
        <span className="min-w-0 flex-1 truncate font-sans text-[11px] text-[#444]">
          {displayUrl}
        </span>
        <button
          type="button"
          className="shrink-0 rounded p-1 text-[#666] hover:bg-black/5 hover:text-[#444]"
          title="Copy URL"
          onClick={handleCopy}
        >
          <Copy size={10} className="text-[#888]" />
        </button>
        <button
          type="button"
          className="shrink-0 rounded p-1 text-[#666] hover:bg-black/5 hover:text-[#444]"
          title="Refresh"
          onClick={onRefresh}
          disabled={!onRefresh}
        >
          <RefreshCw size={10} className="text-[#888]" />
        </button>
      </div>

      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
};

export default MacOSProjectToolbar;
