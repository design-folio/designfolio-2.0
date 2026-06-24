import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
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
      <span className="text-[#463B34] dark:text-[#C4B5A0] text-[13px]">&gt;</span>
      <span className="text-[11px] uppercase tracking-widest text-[#7A736C] dark:text-[#9E9893]">
        {children}
      </span>
    </div>
  );
}

/** Copyable field: dashed underline → solid on hover, reveals "copy"/"copied" */
function CopyableField({ value, fieldKey, copiedField, onCopy, size = "lg" }) {
  const textSize = size === "lg" ? "text-[17px]" : "text-[15px]";
  return (
    <button
      onClick={() => onCopy(value, fieldKey)}
      className="group flex items-center gap-2.5 ml-4"
    >
      <span
        className={`${textSize} text-[#1A1A1A]/80 dark:text-[#F0EDE7]/80 border-b border-dashed border-[#1A1A1A]/15 dark:border-[#F0EDE7]/15 group-hover:border-solid group-hover:border-[#463B34]/50 dark:group-hover:border-[#C4B5A0]/50 transition-all duration-200 pb-px leading-snug`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest transition-all duration-150 opacity-0 group-hover:opacity-100">
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
      className="group flex items-center gap-1.5 w-fit cursor-pointer"
    >
      <span className="text-[15px] text-[#1A1A1A]/80 dark:text-[#F0EDE7]/80 border-b border-dashed border-[#1A1A1A]/15 dark:border-[#F0EDE7]/15 group-hover:border-solid group-hover:border-[#463B34]/50 dark:group-hover:border-[#C4B5A0]/50 group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] transition-all duration-200 pb-px leading-snug">
        {children}
      </span>
      <span className="text-[12px] text-[#7A736C]/60 dark:text-[#9E9893]/60 group-hover:text-[#7A736C] dark:group-hover:text-[#9E9893] transition-all duration-200">
        ↗
      </span>
    </motion.a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MonoContactSection({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();

  const email = userDetails?.contact_email || userDetails?.email || "";
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
    <motion.div variants={itemVariants} className="px-6 md:px-10 py-10 relative group/section">
      {isEditing && (
        <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
          <Button
            variant="outline"
            size="sm"
            onClick={openFooter}
            className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}

      <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-wider mb-8">
        Contact
      </h2>

      <div className="font-dm-mono grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
            <div className="ml-4 mt-2 space-y-2">
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
          className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-[#E5D7C4] dark:border-white/10 text-sm text-[#B5AFA5] dark:text-[#7A736C] hover:border-[#1A1A1A]/20 dark:hover:border-white/20 hover:text-[#7A736C] dark:hover:text-[#B5AFA5] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      )}
    </motion.div>
  );
}
