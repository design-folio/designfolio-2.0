import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { itemVariants } from "@/lib/animationVariants";
import { sidebars } from "@/lib/constant";
import { motion } from "motion/react";
import {
  AtSignIcon,
  DribbbleIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "lucide-animated";
import MediumIcon from "../../../../public/assets/svgs/medium.svg";

import { Pencil } from "lucide-react";
import { useRef } from "react";

const localSocialLinks = [
  { key: "instagram", Icon: InstagramIcon, label: "Instagram", from: "socials", size: 18 },
  { key: "linkedin", Icon: LinkedinIcon, label: "LinkedIn", from: "socials", size: 18 },
  { key: "twitter", Icon: TwitterIcon, label: "X / Twitter", from: "socials", size: 18 },
  { key: "dribbble", Icon: DribbbleIcon, label: "Dribbble", from: "portfolios", size: 18 },
  { key: "medium", Icon: MediumIcon, label: "Medium", from: "portfolios", size: 18 },
];

export const MonoEmailSocialLinksSection = ({ email, socials, portfolios, isEditing }) => {
  const atSignRef = useRef(null);
  const { openSidebar } = useGlobalContext();

  const activeSocials = localSocialLinks.filter(({ key, from }) =>
    from === "socials" ? socials?.[key] : portfolios?.[key]
  );

  return (
    <>
      <motion.div variants={itemVariants} className="custom-dashed-t"></motion.div>

      <motion.div
        variants={itemVariants}
        className="group/section relative flex items-center justify-between gap-4 px-6 py-5 md:px-10"
      >
        {isEditing && (
          <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2 opacity-100 transition-opacity md:opacity-0 md:group-hover/section:opacity-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSidebar?.(sidebars.footer)}
              className="h-8 w-8 rounded-full border-black/10 bg-white p-0 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
            >
              <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          </div>
        )}
        <a
          href={email ? `mailto:${email}` : "#"}
          className="group text-scaled-16 flex min-w-0 cursor-pointer items-center gap-2 text-[#666666] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
          onMouseEnter={() => atSignRef.current?.startAnimation()}
          onMouseLeave={() => atSignRef.current?.stopAnimation()}
          onClick={(e) => {
            if (!email) e.preventDefault();
          }}
        >
          <AtSignIcon ref={atSignRef} size={18} className="shrink-0 transition-colors" />
          <span className="truncate">{email || "No email set"}</span>
        </a>
        {activeSocials.length > 0 && (
          <div className="flex shrink-0 items-center gap-5 text-[#1A1A1A] dark:text-[#F0EDE7]">
            {activeSocials.map(({ key, from, Icon, label, size }) => {
              const href = from === "socials" ? socials?.[key] : portfolios?.[key];
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-70"
                  aria-label={label}
                >
                  <span
                    className="inline-flex shrink-0 overflow-visible [&>svg]:!h-full [&>svg]:!w-full"
                    style={{ width: `${size}px`, height: `${size}px` }}
                  >
                    <Icon
                      size={size}
                      height={size}
                      width={size}
                      className="block overflow-visible"
                    />
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="custom-dashed-t"></motion.div>
    </>
  );
};
