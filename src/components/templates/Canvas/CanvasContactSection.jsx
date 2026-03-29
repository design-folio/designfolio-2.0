import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Phone, Linkedin, Globe, FileText, Pencil } from "lucide-react";
import { AtSignIcon, DribbbleIcon, TwitterIcon } from "lucide-animated";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";

const btnClass =
  "w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto";

function LinkButton({ label, icon: Icon, iconRotate = 0, onClick, flex1 = false }) {
  return (
    <motion.div whileHover="hover" initial="rest" className={flex1 ? "flex-1" : "w-full"}>
      <Button variant="outline" size="sm" onClick={onClick} className={btnClass}>
        <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
          {label}
        </span>
        <motion.div
          variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.3, rotate: iconRotate } }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
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

function CanvasContactSection({ isEditing }) {
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

  const openExternalLink = useCallback((url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const hasAnyLink =
    !!email || !!phone || !!socials.linkedin || !!socials.twitter ||
    !!portfolios.dribbble || !!portfolios.medium || !!resumeUrl;

  if (!hasAnyLink && !isEditing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 1.05 }}
      className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 w-full relative group/section"
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

      <div className="px-5 md:px-8 py-8">
        <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-6">
          Contact
        </h2>

        {(email || phone) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {email && (
              <LinkButton
                label={copiedField === "email" ? "Copied!" : "Copy mail"}
                icon={AtSignIcon}
                iconRotate={15}
                onClick={() => handleCopy(email, "email")}
              />
            )}
            {phone && (
              <LinkButton
                label={copiedField === "phone" ? "Copied!" : "Copy phone"}
                icon={Phone}
                iconRotate={-15}
                onClick={() => handleCopy(phone, "phone")}
              />
            )}
          </div>
        )}

        {(socials.linkedin || portfolios.dribbble || socials.twitter || portfolios.medium) && (
          <div className="flex gap-3 mb-3">
            {socials.linkedin && (
              <LinkButton
                label="Linkedin"
                icon={Linkedin}
                iconRotate={-10}
                flex1
                onClick={() => openExternalLink(socials.linkedin)}
              />
            )}
            {portfolios.dribbble && (
              <LinkButton
                label="Dribbble"
                icon={DribbbleIcon}
                iconRotate={20}
                flex1
                onClick={() => openExternalLink(portfolios.dribbble)}
              />
            )}
            {socials.twitter && (
              <LinkButton
                label="X"
                icon={TwitterIcon}
                iconRotate={-20}
                flex1
                onClick={() => openExternalLink(socials.twitter)}
              />
            )}
            {portfolios.medium && (
              <LinkButton
                label="Medium"
                icon={Globe}
                iconRotate={15}
                flex1
                onClick={() => openExternalLink(portfolios.medium)}
              />
            )}
          </div>
        )}

        {resumeUrl && (
          <LinkButton
            label="View resume"
            icon={FileText}
            iconRotate={-15}
            onClick={() => openExternalLink(resumeUrl)}
          />
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasContactSection);
