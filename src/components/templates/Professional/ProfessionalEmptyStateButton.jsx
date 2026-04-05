import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function ProfessionalEmptyStateButton({ label, onClick, className }) {
  return (
    <button onClick={onClick} className={cn(buttonClass, className)} type="button">
      <Plus className="w-4 h-4" />
      <span className="font-jetbrains text-[13px] uppercase tracking-wider font-medium">{label}</span>
    </button>
  );
}


const buttonClass = "w-full flex items-center justify-center gap-2 py-4 border border-dashed border-[#D5D0C6] dark:border-[#3A352E] rounded-xl text-[#7A736C] dark:text-[#9E9893] hover:border-[#1A1A1A] dark:hover:border-[#F0EDE7] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-all bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"