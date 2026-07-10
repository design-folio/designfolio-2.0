import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import ProfessionalEmptyStateButton from "./ProfessionalEmptyStateButton";

function ProfessionalContactTab({ isEditing, socialLinks, onEditContact, allFieldsFilled }) {
  console.log(allFieldsFilled);
  return (
    <div className="group/section px-4 pb-20 md:px-6">
      {isEditing && (
        <div className="-mx-4 flex items-center justify-end gap-2 border-b border-[#D5D0C6] px-1 py-2 md:-mx-6 dark:border-[#3A352E]">
          <Button
            variant="outline"
            size="sm"
            className="font-inter flex h-8 items-center gap-1.5 rounded-full border-[#D5D0C6] bg-[#EFECE6] px-3 text-[#1A1A1A] opacity-100 transition-opacity hover:bg-[#E5E0D8] md:opacity-0 md:group-hover/section:opacity-100 dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:text-[#F0EDE7] dark:hover:bg-[#2A2520]"
            onClick={onEditContact}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="text-scaled-12 font-medium">Edit</span>
          </Button>
        </div>
      )}
      <div className="mt-4 flex h-full min-h-[128px] max-w-2xl items-center justify-center">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="group relative">
              <a
                href={link.href}
                target={
                  link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                    ? undefined
                    : "_blank"
                }
                rel={
                  link.href.startsWith("mailto:") || link.href.startsWith("tel:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="flex h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border border-[#D5D0C6] p-5 transition-colors hover:bg-[#DED9CE]/30 dark:border-[#3A352E] dark:hover:bg-white/[0.02]"
              >
                <link.icon className="h-6 w-6 text-[#1A1A1A] opacity-80 transition-opacity group-hover:opacity-100 dark:text-[#F0EDE7]" />
                <span className="font-jetbrains text-scaled-15 text-[#1A1A1A] dark:text-[#F0EDE7]">
                  {link.label}
                </span>
              </a>
            </div>
          ))}
          {isEditing && !allFieldsFilled && (
            <ProfessionalEmptyStateButton
              className="min-h-[128px]"
              label="Add Contact Info"
              onClick={onEditContact}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProfessionalContactTab);
