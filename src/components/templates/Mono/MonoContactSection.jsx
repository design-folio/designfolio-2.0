import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { sidebars } from "@/lib/constant";

const itemVariants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Label row: "> email" */
function FieldLabel({ children }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-scaled-13 text-[#463B34] dark:text-[#C4B5A0]">&gt;</span>
      <span className="text-scaled-11 tracking-widest text-[#7A736C] uppercase dark:text-[#9E9893]">
        {children}
      </span>
    </div>
  );
}

/** Copyable field: dashed underline → solid on hover, reveals "copy"/"copied" */
function CopyableField({ value, fieldKey, copiedField, onCopy, size = "lg" }) {
  const textSize = size === "lg" ? "text-scaled-17" : "text-scaled-15";
  return (
    <button
      onClick={() => onCopy(value, fieldKey)}
      className="group ml-4 flex items-center gap-2.5"
    >
      <span
        className={`${textSize} border-b border-dashed border-[#1A1A1A]/15 pb-px leading-snug text-[#1A1A1A]/80 transition-all duration-200 group-hover:border-solid group-hover:border-[#463B34]/50 dark:border-[#F0EDE7]/15 dark:text-[#F0EDE7]/80 dark:group-hover:border-[#C4B5A0]/50`}
      >
        {value}
      </span>
      <span className="text-scaled-10 tracking-widest uppercase opacity-0 transition-all duration-150 group-hover:opacity-100">
        {copiedField === fieldKey ? (
          <span className="text-[#463B34] dark:text-[#C4B5A0]">copied</span>
        ) : (
          <span className="text-[#7A736C] dark:text-[#9E9893]">copy</span>
        )}
      </span>
    </button>
  );
}

/** External link: dashed underline → solid on hover, ↗ nudges right */
function ExternalLink({ href, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group flex w-fit cursor-pointer items-center gap-1.5"
    >
      <span className="text-scaled-15 border-b border-dashed border-[#1A1A1A]/15 pb-px leading-snug text-[#1A1A1A]/80 transition-all duration-200 group-hover:border-solid group-hover:border-[#463B34]/50 group-hover:text-[#1A1A1A] dark:border-[#F0EDE7]/15 dark:text-[#F0EDE7]/80 dark:group-hover:border-[#C4B5A0]/50 dark:group-hover:text-[#F0EDE7]">
        {children}
      </span>
      <span className="text-scaled-12 text-[#7A736C]/60 transition-all duration-200 group-hover:text-[#7A736C] dark:text-[#9E9893]/60 dark:group-hover:text-[#9E9893]">
        ↗
      </span>
    </motion.a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MonoContactSection({ isEditing, hasWallpaper = true }) {
  const { userDetails, openSidebar } = useGlobalContext();

  const email = userDetails?.contact_email || "";
  const phone = userDetails?.phone || "";
  const socials = userDetails?.socials || {};
  const portfolios = userDetails?.portfolios || {};
  const resumeUrl = userDetails?.resume?.url || "";

  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = useCallback((value, field) => {
    if (!value || !navigator?.clipboard) return;
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const openFooter = useCallback(() => openSidebar?.(sidebars.footer), [openSidebar]);

  const hasAnyLink =
    !!email ||
    !!phone ||
    !!socials.linkedin ||
    !!socials.twitter ||
    !!portfolios.dribbble ||
    !!portfolios.medium ||
    !!resumeUrl;

  const allFieldsFilled =
    !!phone &&
    !!socials.linkedin &&
    !!socials.twitter &&
    !!portfolios.dribbble &&
    !!portfolios.medium &&
    !!resumeUrl;

  const showAddButton = isEditing && !allFieldsFilled;

  if (!hasAnyLink && !isEditing) return null;

  const hasLeftColumn = !!email || !!phone;
  const hasRightColumn =
    !!socials.linkedin ||
    !!portfolios.dribbble ||
    !!socials.twitter ||
    !!portfolios.medium ||
    !!resumeUrl;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "group/section relative px-6 py-10 md:px-10",
        hasWallpaper && "bg-white dark:bg-[#1A1A1A]"
      )}
    >
      {isEditing && (
        <div className="absolute top-4 right-4 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover/section:opacity-100">
          <Button
            variant="outline"
            size="sm"
            onClick={openFooter}
            className="h-8 w-8 rounded-full border-black/10 bg-white p-0 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          >
            <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}

      <h2 className="font-dm-mono text-scaled-14 mb-8 font-bold tracking-wider text-[#463B34] uppercase dark:text-[#D4C9BC]">
        Contact
      </h2>

      <div className="font-dm-mono grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
        {/* LEFT: email + phone */}
        {hasLeftColumn && (
          <div className="space-y-5">
            {email && (
              <div className="space-y-1">
                <FieldLabel>email</FieldLabel>
                <CopyableField
                  value={email}
                  fieldKey="email"
                  copiedField={copiedField}
                  onCopy={handleCopy}
                  size="lg"
                />
              </div>
            )}
            {phone && (
              <div className="space-y-1">
                <FieldLabel>phone</FieldLabel>
                <CopyableField
                  value={phone}
                  fieldKey="phone"
                  copiedField={copiedField}
                  onCopy={handleCopy}
                  size="md"
                />
              </div>
            )}
          </div>
        )}

        {/* RIGHT: links */}
        {hasRightColumn && (
          <div className="space-y-1">
            <FieldLabel>links</FieldLabel>
            <div className="mt-2 ml-4 space-y-2">
              {socials.linkedin && <ExternalLink href={socials.linkedin}>LinkedIn</ExternalLink>}
              {portfolios.dribbble && (
                <ExternalLink href={portfolios.dribbble}>Dribbble</ExternalLink>
              )}
              {socials.twitter && <ExternalLink href={socials.twitter}>X</ExternalLink>}
              {portfolios.medium && <ExternalLink href={portfolios.medium}>Medium</ExternalLink>}
              {resumeUrl && <ExternalLink href={resumeUrl}>Resume</ExternalLink>}
            </div>
          </div>
        )}
      </div>

      {showAddButton && (
        <button
          onClick={openFooter}
          className={cn(
            "text-scaled-14 mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3.5 text-[#B5AFA5] transition-colors hover:border-[#1A1A1A]/20 hover:text-[#7A736C] dark:border-white/10 dark:text-[#7A736C] dark:hover:border-white/20 dark:hover:text-[#B5AFA5]",
            !hasWallpaper && "border-[#E5D7C4]",
            hasWallpaper && "border-black/10 bg-white dark:bg-[#1A1A1A]"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      )}
    </motion.div>
  );
}
