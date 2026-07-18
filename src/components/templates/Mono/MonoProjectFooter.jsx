import { motion } from "motion/react";
import { Mail, Phone } from "lucide-react";
import { itemVariants } from "@/lib/animationVariants";

import InstagramIcon from "../../../../public/assets/svgs/instagram.svg";
import TwitterIcon from "../../../../public/assets/svgs/twitter.svg";
import LinkedInIcon from "../../../../public/assets/svgs/linkedin.svg";
import DribbbleIcon from "../../../../public/assets/svgs/dribbble.svg";
import NotionIcon from "../../../../public/assets/svgs/noteIcon.svg";
import MediumIcon from "../../../../public/assets/svgs/medium.svg";

const SOCIALS = [
  { key: "instagram", Icon: InstagramIcon, label: "Instagram", from: "socials" },
  { key: "linkedin", Icon: LinkedInIcon, label: "LinkedIn", from: "socials" },
  { key: "twitter", Icon: TwitterIcon, label: "X / Twitter", from: "socials" },
  { key: "dribbble", Icon: DribbbleIcon, label: "Dribbble", from: "portfolios" },
  { key: "medium", Icon: MediumIcon, label: "Medium", from: "portfolios" },
  { key: "notion", Icon: NotionIcon, label: "Notion", from: "portfolios" },
];

export default function MonoProjectFooter({ ownerUser }) {
  const fullName = [ownerUser?.firstName, ownerUser?.lastName].filter(Boolean).join(" ");

  const activeSocials = SOCIALS.filter(({ key, from }) =>
    from === "socials" ? ownerUser?.socials?.[key] : ownerUser?.portfolios?.[key]
  );

  return (
    <>
      {/* CTA section */}
      <motion.div variants={itemVariants} className="custom-dashed-t" />
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center gap-6 px-5 py-10 text-center md:px-8"
      >
        {fullName && (
          <span className="font-cedarville text-scaled-22 text-[#1A1A1A] dark:text-[#F0EDE7]">
            {fullName}
          </span>
        )}
        <p className="text-scaled-22 max-w-sm leading-tight font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Got a project in mind?
          <br />
          Let&apos;s talk.
        </p>

        {/* Contact actions */}
        <div className="flex flex-wrap justify-center gap-3">
          {ownerUser?.email && (
            <button
              onClick={() => navigator.clipboard.writeText(ownerUser.email)}
              className="text-scaled-14 flex items-center gap-2 rounded-full bg-[#1A1A1A] px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
            >
              <Mail size={14} />
              Copy Email
            </button>
          )}
          {ownerUser?.phone && (
            <button
              onClick={() => navigator.clipboard.writeText(ownerUser.phone)}
              className="text-scaled-14 flex items-center gap-2 rounded-full border border-[#C8C4BD] bg-white px-5 py-2.5 font-medium text-[#1A1A1A] transition-colors hover:bg-[#F5F0EA] dark:border-[#3A352E] dark:bg-[#2A2520] dark:text-[#F0EDE7] dark:hover:bg-[#35302A]"
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
                from === "socials" ? ownerUser?.socials?.[key] : ownerUser?.portfolios?.[key];
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
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
        className="flex items-center justify-between gap-4 px-5 py-4 md:px-8"
      >
        <p
          className="text-scaled-11 tracking-widest text-[#7A736C] uppercase dark:text-[#9E9893]"
          style={{ fontWeight: 450 }}
        >
          © {new Date().getFullYear()} {fullName || "All rights reserved"}
        </p>
        <p
          className="text-scaled-11 tracking-widest text-[#7A736C] uppercase dark:text-[#9E9893]"
          style={{ fontWeight: 450 }}
        >
          All rights reserved
        </p>
      </motion.div>
    </>
  );
}
