import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Phone, Linkedin, Globe, FileText, Pencil } from "lucide-react";
import { AtSignIcon, DribbbleIcon, TwitterIcon } from "lucide-animated";
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

const btnClass =
  "w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto";

function LinkButton({ label, icon: Icon, iconRotate = 0, onClick }) {
  return (
    <motion.div whileHover="hover" initial="rest" className="w-full">
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

  const openExternalLink = useCallback((url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <motion.div
      variants={itemVariants}
      className="px-5 md:px-8 py-8 relative group/section"
    >
      {isEditing && (
        <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSidebar?.(sidebars.footer)}
            className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {socials.linkedin && (
            <LinkButton
              label="Linkedin"
              icon={Linkedin}
              iconRotate={-10}
              onClick={() => openExternalLink(socials.linkedin)}
            />
          )}
          {portfolios.dribbble && (
            <LinkButton
              label="Dribbble"
              icon={DribbbleIcon}
              iconRotate={20}
              onClick={() => openExternalLink(portfolios.dribbble)}
            />
          )}
          {socials.twitter && (
            <LinkButton
              label="X"
              icon={TwitterIcon}
              iconRotate={-20}
              onClick={() => openExternalLink(socials.twitter)}
            />
          )}
          {portfolios.medium && (
            <LinkButton
              label="Medium"
              icon={Globe}
              iconRotate={15}
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
    </motion.div>
  );
}
