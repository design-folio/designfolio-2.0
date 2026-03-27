import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

function ProfessionalContactTab({ isEditing, socialLinks, onEditContact }) {
  return (
    <div className="p-4 md:p-6 pb-12 relative group/section">
      {isEditing && (
        <div className="absolute -top-3 right-4 md:right-6 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-inter h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
            onClick={onEditContact}
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              Edit
            </span>
          </Button>
        </div>
      )}
      <div className="max-w-2xl h-full flex items-center justify-center min-h-[300px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {socialLinks.map((link, index) => (
            <div key={index} className="relative group">
              <a
                href={link.href}
                target={
                  link.href.startsWith("mailto:") ||
                  link.href.startsWith("tel:")
                    ? undefined
                    : "_blank"
                }
                rel={
                  link.href.startsWith("mailto:") ||
                  link.href.startsWith("tel:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="p-5 border border-[#D5D0C6] dark:border-[#3A352E] flex flex-col items-center justify-center gap-3 hover:bg-[#DED9CE]/30 dark:hover:bg-white/[0.02] transition-colors rounded-sm h-32 w-full"
              >
                <link.icon className="w-6 h-6 text-[#1A1A1A] dark:text-[#F0EDE7] opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px]">
                  {link.label}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(ProfessionalContactTab);
