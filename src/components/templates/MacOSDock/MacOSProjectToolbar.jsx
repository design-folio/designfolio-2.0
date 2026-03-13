import React from 'react';
import { ChevronLeft, ChevronRight, Lock, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const MacOSProjectToolbar = ({
  projectUrl,
  onBack,
  onRefresh,
  rightSlot,
  className = '',
}) => {
  const displayUrl = projectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/project` : '');
  const urlToCopy = projectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/project` : '');

  const handleCopy = async () => {
    if (!urlToCopy) return;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Could not copy URL');
    }
  };

  return (
    <div
      className={`h-10 bg-[#f4f2ee] border-b border-[#e0ddd8] flex items-center px-4 gap-3 shrink-0 ${className}`}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="p-1.5 hover:bg-black/5 rounded text-[#555] disabled:opacity-40 disabled:cursor-default"
          title="Back"
          onClick={onBack}
          disabled={!onBack}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 hover:bg-black/5 rounded text-[#555] opacity-40 cursor-default"
          title="Forward"
          aria-disabled="true"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1 flex items-center bg-[#e3e3e3]/50 border border-[#c8c8c8] rounded-md h-7 px-3 shadow-inner gap-2 min-w-0">
        <Lock size={10} className="text-[#666] shrink-0" />
        <span className="text-[11px] text-[#444] font-sans truncate flex-1 min-w-0">
          {displayUrl}
        </span>
        <button
          type="button"
          className="p-1 hover:bg-black/5 rounded text-[#666] hover:text-[#444] shrink-0"
          title="Copy URL"
          onClick={handleCopy}
        >
          <Copy size={10} className="text-[#888]" />
        </button>
        <button
          type="button"
          className="p-1 hover:bg-black/5 rounded text-[#666] hover:text-[#444] shrink-0"
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
