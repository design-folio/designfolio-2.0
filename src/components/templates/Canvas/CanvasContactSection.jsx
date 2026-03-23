import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Linkedin,
  Globe,
  FileText,
  Pencil,
  Trash2,
  Check,
  Instagram,
} from "lucide-react";
import { AtSignIcon, DribbbleIcon, TwitterIcon } from "lucide-animated";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";

const contactBtnClass =
  "w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 dark:shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto";

const editBtnBase =
  "h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 dark:shadow-sm";

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: (rotate) => ({ scale: 1.3, rotate }),
};

const iconTransition = { type: "spring", stiffness: 400, damping: 10 };

function ContactLinkButton({ label, icon: Icon, iconRotate = 0, isEditing, onClick, href }) {
  const handleClick = () => {
    if (onClick) onClick();
    else if (href) window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div whileHover="hover" initial="rest" className="w-full relative group/link">
      {isEditing && (
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className={cn(editBtnBase, "hover:bg-gray-50 dark:hover:bg-[#35302A]")}
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              editBtnBase,
              "hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={contactBtnClass}
      >
        <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
          {label}
        </span>
        <motion.div
          variants={{ rest: iconVariants.rest, hover: { scale: 1.3, rotate: iconRotate } }}
          transition={iconTransition}
          className={isEditing ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity" : ""}
        >
          <Icon
            size={14}
            className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
          />
        </motion.div>
      </Button>
    </motion.div>
  );
}

const MemoizedContactLinkButton = React.memo(ContactLinkButton);

function CanvasContactSection({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();

  const email = userDetails?.contact_email || userDetails?.email;
  const phone = userDetails?.phone;
  const socials = userDetails?.socials || {};
  const portfolios = userDetails?.portfolios || {};
  const resume = userDetails?.resume;

  const [copiedField, setCopiedField] = React.useState(null);

  const handleCopy = useCallback((value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const primaryLinks = useMemo(() => {
    const links = [];
    if (email)
      links.push({
        label: copiedField === "email" ? "Copied!" : "Copy mail",
        icon: copiedField === "email" ? Check : AtSignIcon,
        iconRotate: 15,
        onClick: () => handleCopy(email, "email"),
      });
    if (phone)
      links.push({
        label: copiedField === "phone" ? "Copied!" : "Copy phone",
        icon: copiedField === "phone" ? Check : Phone,
        iconRotate: -15,
        onClick: () => handleCopy(phone, "phone"),
      });
    return links;
  }, [email, phone, copiedField, handleCopy]);

  const socialLinks = useMemo(() => {
    const links = [];
    if (socials.linkedin) links.push({ label: "LinkedIn", icon: Linkedin, iconRotate: -10, href: socials.linkedin });
    if (socials.twitter) links.push({ label: "X", icon: TwitterIcon, iconRotate: -20, href: socials.twitter });
    if (socials.instagram) links.push({ label: "Instagram", icon: Instagram, iconRotate: 10, href: socials.instagram });
    if (portfolios.dribbble) links.push({ label: "Dribbble", icon: DribbbleIcon, iconRotate: 20, href: portfolios.dribbble });
    if (portfolios.behance) links.push({ label: "Behance", icon: Globe, iconRotate: 15, href: portfolios.behance });
    if (portfolios.notion) links.push({ label: "Notion", icon: Globe, iconRotate: -10, href: portfolios.notion });
    if (portfolios.medium) links.push({ label: "Medium", icon: Globe, iconRotate: 15, href: portfolios.medium });
    return links;
  }, [socials, portfolios]);

  const hasResume = !!resume?.url;
  const hasAnyLink = primaryLinks.length > 0 || socialLinks.length > 0 || hasResume;

  if (!hasAnyLink && !isEditing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 1.05 }}
      className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[24px] border border-[#E5D7C4] dark:border-white/10 p-6 w-full relative group/section"
    >
      {isEditing && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Pencil className="w-3.5 h-3.5" />}
            label="Edit Contact"
            onClick={() => openSidebar?.(sidebars.footer)}
          />
        </CanvasSectionControls>
      )}

      <h2
        className="text-[#7A736C] dark:text-[#B5AFA5] font-dm-mono font-medium text-[14px] mb-6"
      >
        CONTACT
      </h2>

      {primaryLinks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {primaryLinks.map((link) => (
            <MemoizedContactLinkButton key={link.label} {...link} isEditing={isEditing} />
          ))}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {socialLinks.map((link) => (
            <MemoizedContactLinkButton key={link.label} {...link} isEditing={isEditing} />
          ))}
        </div>
      )}

      {hasResume && (
        <MemoizedContactLinkButton
          label="View resume"
          icon={FileText}
          iconRotate={-15}
          href={resume.url}
          isEditing={isEditing}
        />
      )}

      {!hasAnyLink && isEditing && (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10">
          <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893]">
            No contact links yet. Click &quot;Edit Contact&quot; to add your links.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default React.memo(CanvasContactSection);
