import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { itemVariants } from "@/lib/animationVariants";

import InstagramIcon from "../../../../public/assets/svgs/instagram.svg";
import TwitterIcon from "../../../../public/assets/svgs/twitter.svg";
import LinkedInIcon from "../../../../public/assets/svgs/linkedin.svg";
import DribbbleIcon from "../../../../public/assets/svgs/dribbble.svg";
import BehanceIcon from "../../../../public/assets/svgs/behance.svg";
import NotionIcon from "../../../../public/assets/svgs/noteIcon.svg";
import MediumIcon from "../../../../public/assets/svgs/medium.svg";

const SOCIALS = [
  { key: "instagram", Icon: InstagramIcon, label: "Instagram", from: "socials" },
  { key: "linkedin", Icon: LinkedInIcon, label: "LinkedIn", from: "socials" },
  { key: "twitter", Icon: TwitterIcon, label: "X / Twitter", from: "socials" },
  { key: "behance", Icon: BehanceIcon, label: "Behance", from: "portfolios" },
  { key: "dribbble", Icon: DribbbleIcon, label: "Dribbble", from: "portfolios" },
  { key: "medium", Icon: MediumIcon, label: "Medium", from: "portfolios" },
  { key: "notion", Icon: NotionIcon, label: "Notion", from: "portfolios" },
];

export default function MonoProjectFooter({ ownerUser }) {
  const fullName = [ownerUser?.firstName, ownerUser?.lastName]
    .filter(Boolean)
    .join(" ");

  const activeSocials = SOCIALS.filter(({ key, from }) =>
    from === "socials" ? ownerUser?.socials?.[key] : ownerUser?.portfolios?.[key]
  );

  return (
    <>
      {/* CTA section */}
      <motion.div variants={itemVariants} className="custom-dashed-t" />
      <motion.div
        variants={itemVariants}
        className="px-5 md:px-8 py-10 flex flex-col items-center text-center gap-6"
      >
        {fullName && (
          <span className="text-[22px] text-[#1A1A1A] dark:text-[#F0EDE7] font-cedarville">
            {fullName}
          </span>
        )}
        <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[22px] font-semibold max-w-sm leading-tight">
          Got a project in mind?<br />Let&apos;s talk.
        </p>

        {/* Contact actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {ownerUser?.email && (
            <button
              onClick={() => navigator.clipboard.writeText(ownerUser.email)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Mail size={14} />
              Copy Email
            </button>
          )}
          {ownerUser?.phone && (
            <button
              onClick={() => navigator.clipboard.writeText(ownerUser.phone)}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#C8C4BD] dark:border-[#3A352E] bg-white dark:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7] rounded-full text-sm font-medium hover:bg-[#F5F0EA] dark:hover:bg-[#35302A] transition-colors"
            >
              <Phone size={14} />
              Copy Phone
            </button>
          )}
        </div>

        {/* Social links */}
        {activeSocials.length > 0 && (
          <div className="flex items-center gap-5 text-[#7A736C] dark:text-[#9E9893]">
            {activeSocials.map(({ key, from, Icon, label }) => {
              const href =
                from === "socials"
                  ? ownerUser?.socials?.[key]
                  : ownerUser?.portfolios?.[key];
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors"
                  aria-label={label}
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Copyright bar */}
      <motion.div variants={itemVariants} className="custom-dashed-t" />
      <motion.div
        variants={itemVariants}
        className="px-5 md:px-8 py-4 flex items-center justify-between gap-4"
      >
        <p
          className="text-[11px] text-[#7A736C] dark:text-[#9E9893] uppercase tracking-widest"
          style={{ fontWeight: 450 }}
        >
          © {new Date().getFullYear()} {fullName || "All rights reserved"}
        </p>
        <p
          className="text-[11px] text-[#7A736C] dark:text-[#9E9893] uppercase tracking-widest"
          style={{ fontWeight: 450 }}
        >
          All rights reserved
        </p>
      </motion.div>
    </>
  );
}
