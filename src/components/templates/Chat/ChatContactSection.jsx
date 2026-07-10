import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Copy, Check, Phone, ArrowUp, FileText, Globe } from "lucide-react";
import {
  FaLinkedin as Linkedin,
  FaXTwitter as Twitter,
  FaDribbble as Dribbble,
  FaInstagram as Instagram,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

export default function ChatContactSection({ chatRevealStep, s, sectionSteps, canEdit, preview }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { socials = {}, portfolios = {}, resume, phone } = userDetails || {};
  const email = userDetails?.contact_email || "";
  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);

  const [copiedField, setCopiedField] = useState(null);
  const handleCopy = useCallback((value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  return (
    <div className="flex flex-col gap-3" style={{ order: sectionSteps._contact - 3 }}>
      {/* You: Contact prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(19) && !(preview && !email && !phone) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex justify-end"
          >
            <YouPrompt>Where can I reach you?</YouPrompt>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact options */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(20) && !(preview && !email && !phone) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex max-w-[85%] gap-3"
          >
            {canEdit && chatRevealStep >= s(21) && (
              <div className="absolute top-1/2 -left-0 z-40 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.footer);
                  }}
                >
                  <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
              <ChatAvatar avatarSrc={avatarSrc} show={chatRevealStep < s(21)} />
            </div>
            <div className="w-full rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-4 transition-colors duration-700 dark:border-white/5 dark:bg-[#2A2520]">
              {chatRevealStep === s(20) ? (
                <TypingIndicator />
              ) : email || phone ? (
                <div className="space-y-3">
                  <p className="text-scaled-15 text-[#1A1A1A] dark:text-[#F0EDE7]">
                    You can primarily reach me on{email ? " mail" : ""}
                    {email && phone ? " or" : ""}
                    {phone ? " phone" : ""}
                  </p>
                  <div className="space-y-2">
                    {email && (
                      <button
                        onClick={() => handleCopy(email, "email")}
                        className="group text-scaled-14 flex w-full items-center justify-center gap-2 rounded-xl border border-black/5 bg-[#F5F3EF] px-4 py-2.5 font-medium text-[#1A1A1A] shadow-sm transition-all hover:bg-white dark:border-white/5 dark:bg-[#35302A] dark:text-[#F0EDE7] dark:hover:bg-[#403B35]"
                      >
                        {copiedField === "email" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-[#7A736C] transition-colors group-hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:group-hover:text-white" />
                        )}
                        {copiedField === "email" ? "Copied!" : "Copy mail"}
                      </button>
                    )}
                    {phone && (
                      <button
                        onClick={() => handleCopy(phone, "phone")}
                        className="group text-scaled-14 flex w-full items-center justify-center gap-2 rounded-xl border border-black/5 bg-[#F5F3EF] px-4 py-2.5 font-medium text-[#1A1A1A] shadow-sm transition-all hover:bg-white dark:border-white/5 dark:bg-[#35302A] dark:text-[#F0EDE7] dark:hover:bg-[#403B35]"
                      >
                        {copiedField === "phone" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Phone className="h-4 w-4 text-[#7A736C] transition-colors group-hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:group-hover:text-white" />
                        )}
                        {copiedField === "phone" ? "Copied!" : "Copy phone"}
                      </button>
                    )}
                  </div>
                </div>
              ) : canEdit ? (
                <button
                  onClick={() => openSidebar?.(sidebars.footer)}
                  className="text-scaled-13 flex items-center gap-2 text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add contact info
                </button>
              ) : (
                <p className="text-scaled-15 text-[#1A1A1A] dark:text-[#F0EDE7]">
                  Feel free to reach out!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social links */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(21) &&
          (() => {
            const socialLinks = [
              socials?.linkedin && {
                label: "Connect on LinkedIn",
                icon: Linkedin,
                href: socials.linkedin,
              },
              socials?.twitter && {
                label: "Connect on X",
                icon: Twitter,
                href: socials.twitter,
              },
              socials?.instagram && {
                label: "Follow on Instagram",
                icon: Instagram,
                href: socials.instagram,
              },
              portfolios?.dribbble && {
                label: "View my Dribbble",
                icon: Dribbble,
                href: portfolios.dribbble,
              },
              portfolios?.notion && {
                label: "View my Notion",
                icon: Globe,
                href: portfolios.notion,
              },
              portfolios?.medium && {
                label: "View my Medium",
                icon: Globe,
                href: portfolios.medium,
              },
            ].filter(Boolean);
            const hasResume = resume?.url;
            const hasLinks = socialLinks.length > 0 || hasResume;

            if (!hasLinks && (!canEdit || preview)) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group/msg relative flex max-w-[85%] gap-3"
              >
                {canEdit && (
                  <div className="absolute top-1/2 -left-0 z-40 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSidebar?.(sidebars.footer);
                      }}
                    >
                      <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    </Button>
                  </div>
                )}
                <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
                  <ChatAvatar avatarSrc={avatarSrc} />
                </div>
                <div className="w-full rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-4 transition-colors duration-100 dark:border-white/5 dark:bg-[#2A2520]">
                  {hasLinks ? (
                    <div className="space-y-3">
                      <p className="text-scaled-15 text-[#1A1A1A] dark:text-[#F0EDE7]">
                        You can also
                      </p>
                      <div className="space-y-2">
                        {hasResume && (
                          <button
                            onClick={() => window.open(resume.url, "_blank", "noopener,noreferrer")}
                            className="group text-scaled-14 flex w-full items-center justify-between rounded-xl border border-black/5 bg-[#F5F3EF] px-4 py-2.5 font-medium text-[#1A1A1A] shadow-sm transition-all hover:bg-white dark:border-white/5 dark:bg-[#35302A] dark:text-[#F0EDE7] dark:hover:bg-[#403B35]"
                          >
                            <span>View my Resume</span>
                            <FileText className="h-4 w-4 text-[#7A736C] transition-colors group-hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:group-hover:text-white" />
                          </button>
                        )}
                        {socialLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <button
                              key={link.label}
                              onClick={() =>
                                window.open(link.href, "_blank", "noopener,noreferrer")
                              }
                              className="group text-scaled-14 flex w-full items-center justify-between rounded-xl border border-black/5 bg-[#F5F3EF] px-4 py-2.5 font-medium text-[#1A1A1A] shadow-sm transition-all hover:bg-white dark:border-white/5 dark:bg-[#35302A] dark:text-[#F0EDE7] dark:hover:bg-[#403B35]"
                            >
                              <span>{link.label}</span>
                              <Icon className="h-4 w-4 text-[#7A736C] transition-colors group-hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:group-hover:text-white" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : canEdit ? (
                    <button
                      onClick={() => openSidebar?.(sidebars.footer)}
                      className="text-scaled-13 flex items-center gap-2 text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add social links
                    </button>
                  ) : null}
                </div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {chatRevealStep >= s(21) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="flex w-full justify-center pt-4 pb-8"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E2DB] text-[#7A736C] transition-all duration-300 hover:bg-[#D5D0C6] hover:text-[#1A1A1A] dark:bg-[#2A2520] dark:text-[#B5AFA5] dark:hover:bg-[#35302A] dark:hover:text-[#F0EDE7]"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {chatRevealStep >= s(21) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex w-full justify-center pb-12"
        >
          <p className="text-scaled-13 font-medium text-[#7A736C] dark:text-[#B5AFA5]">
            © ALL RIGHTS RESERVED.
          </p>
        </motion.div>
      )}
    </div>
  );
}
