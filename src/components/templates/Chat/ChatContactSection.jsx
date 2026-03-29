import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Plus,
  Copy,
  Check,
  Phone,
  ArrowUp,
  FileText,
  Linkedin,
  Twitter,
  Dribbble,
  Globe,
  Instagram,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

export default function ChatContactSection({
  chatRevealStep,
  s,
  sectionSteps,
  canEdit,
  preview,
}) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { socials = {}, portfolios = {}, resume, phone } = userDetails || {};
  const email = userDetails?.contact_email || userDetails?.email;
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );

  const [copiedField, setCopiedField] = useState(null);
  const handleCopy = useCallback((value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  return (
    <div
      className="flex flex-col gap-3"
      style={{ order: sectionSteps._contact - 3 }}
    >
      {/* You: Contact prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(19) && !(preview && !email && !phone) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end relative group/msg"
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
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && chatRevealStep >= s(21) && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.footer);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              <ChatAvatar
                avatarSrc={avatarSrc}
                show={chatRevealStep < s(21)}
              />
            </div>
            <div className="bg-white dark:bg-[#2A2520] p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-400 border border-black/5 dark:border-white/5 w-full">
              {chatRevealStep === s(20) ? (
                <TypingIndicator />
              ) : email || phone ? (
                <div className="space-y-3">
                  <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px]">
                    You can primarily reach me on{email ? " mail" : ""}
                    {email && phone ? " or" : ""}
                    {phone ? " phone" : ""}
                  </p>
                  <div className="space-y-2">
                    {email && (
                      <button
                        onClick={() => handleCopy(email, "email")}
                        className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                        )}
                        {copiedField === "email" ? "Copied!" : "Copy mail"}
                      </button>
                    )}
                    {phone && (
                      <button
                        onClick={() => handleCopy(phone, "phone")}
                        className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                      >
                        {copiedField === "phone" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Phone className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                        )}
                        {copiedField === "phone" ? "Copied!" : "Copy phone"}
                      </button>
                    )}
                  </div>
                </div>
              ) : canEdit ? (
                <button
                  onClick={() => openSidebar?.(sidebars.footer)}
                  className="flex items-center gap-2 text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add contact info
                </button>
              ) : (
                <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px]">
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
              portfolios?.behance && {
                label: "View my Behance",
                icon: Globe,
                href: portfolios.behance,
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
                className="flex gap-3 max-w-[85%] relative group/msg"
              >
                {canEdit && (
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSidebar?.(sidebars.footer);
                      }}
                    >
                      <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    </Button>
                  </div>
                )}
                <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                  <ChatAvatar avatarSrc={avatarSrc} />
                </div>
                <div className="bg-white dark:bg-[#2A2520] p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-400 border border-black/5 dark:border-white/5 w-full">
                  {hasLinks ? (
                    <div className="space-y-3">
                      <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px]">
                        You can also
                      </p>
                      <div className="space-y-2">
                        {hasResume && (
                          <button
                            onClick={() =>
                              window.open(
                                resume.url,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-between text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                          >
                            <span>View my Resume</span>
                            <FileText className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                          </button>
                        )}
                        {socialLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <button
                              key={link.label}
                              onClick={() =>
                                window.open(
                                  link.href,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-between text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                            >
                              <span>{link.label}</span>
                              <Icon className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : canEdit ? (
                    <button
                      onClick={() => openSidebar?.(sidebars.footer)}
                      className="flex items-center gap-2 text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
            className="flex justify-center pb-8 pt-4 w-full"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 rounded-full bg-[#E5E2DB] dark:bg-[#2A2520] hover:bg-[#D5D0C6] dark:hover:bg-[#35302A] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] flex items-center justify-center transition-all duration-300"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {chatRevealStep >= s(21) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-center pb-12 w-full"
        >
          <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5] font-medium">
            © ALL RIGHTS RESERVED.
          </p>
        </motion.div>
      )}
    </div>
  );
}
