import Link from "next/link";
import { User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const STEPS = [
  {
    messages: [
      { from: "viewer", text: "I don't have a portfolio. Just a bunch of work." },
      { from: "shai",   text: "That's where most people start." },
    ],
    darkVideo: "/landing-video/video1dark.mp4",
    lightVideo: "/landing-video/video1light.mp4",
  },
  {
    messages: [
      { from: "viewer", text: "I've applied to too many jobs to hear nothing back." },
      { from: "shai",   text: "Let's start with your resume." },
    ],
    darkVideo: "/landing-video/video2dark.mp4",
    lightVideo: "/landing-video/video2light.mp4",
  },
  {
    messages: [
      { from: "viewer", text: "Finding jobs feels like a full-time job." },
      { from: "shai",   text: "It doesn't have to be." },
    ],
    darkVideo: "/landing-video/video3dark.mp4",
    lightVideo: "/landing-video/video3light.mp4",
  },
  {
    messages: [
      { from: "viewer", text: "I wish someone would just tell me what to do next." },
      { from: "shai",   text: "Start with these free tools." },
    ],
    cards: [
      { label: "Fix your resume",      icon: "/assets/svgs/fixResume.svg",           href: "/ai-tools?type=optimize-resume" },
      { label: "Salary Negotiation",   icon: "/assets/svgs/salary-negotiate.svg",    href: "/ai-tools?type=salary-negotiator" },
      { label: "Case study generator", icon: "/assets/svgs/caseStudyGen.svg",         href: "/login" },
      { label: "AI mock interview",    icon: "/assets/svgs/aiMock.svg",              href: "/ai-tools?type=mock-interview" },
      { label: "AI email generator",   icon: "/assets/svgs/emailGen.svg",            href: "/ai-tools?type=email-generator" },
      { label: "Analyze Case study",   icon: "/assets/svgs/analyzeCaseStudyGen.svg", href: "/login" },
    ],
  },
];

export default function LandingHowSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  return (
    <section
      id="how"
      className="w-full px-6 mb-16 mt-6 scroll-mt-24"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="w-full flex flex-col gap-12">
        {STEPS.map((item, i) => (
          <div key={i} className="flex flex-col gap-4">
            {/* Chat header */}
            <div className="flex flex-col gap-2.5">
              {i === 0 && (
                <div className="text-center">
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-lp-text/25">
                    Today
                  </span>
                </div>
              )}

              {item.messages.map((msg, mi) => (
                <div
                  key={mi}
                  className={`flex items-end gap-2 ${msg.from === "shai" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.from === "viewer" ? (
                    <div className="shrink-0 w-[30px] h-[30px] rounded-full bg-[--lp-chat-avatar-bg] flex items-center justify-center">
                      <User className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div
                      className="shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                      style={{ background: "linear-gradient(135deg, #FF553E 0%, #FF8C42 100%)" }}
                    >
                      S
                    </div>
                  )}
                  <div
                    className={`max-w-[72%] px-[14px] py-[10px] text-[17px] font-medium leading-snug ${
                      msg.from === "shai"
                        ? "bg-[#007AFF] text-white rounded-[20px] rounded-br-[5px]"
                        : "bg-[--lp-chat-viewer-bg] text-[--lp-text] rounded-[20px] rounded-bl-[5px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pr-[42px]">
                <span className="text-[11px] font-medium text-lp-text/25">Delivered</span>
              </div>
            </div>

            {/* Content: video or AI tool card grid */}
            {item.cards ? (
              <div className="grid grid-cols-2 gap-3">
                {item.cards.map((card) => (
                  <Link
                    key={card.label}
                    href={card.href}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-[--lp-video-border] bg-[--lp-bg] p-5 hover:bg-[--lp-card] transition-colors duration-150 no-underline"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-[--lp-card]">
                      <img src={card.icon} alt={card.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[13px] font-semibold text-[--lp-text] text-center leading-snug">
                      {card.label}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="w-full rounded-[12px] overflow-hidden border border-[--lp-video-border] shadow-sm bg-[#141414]">
                <div className="relative w-full overflow-hidden" style={{ paddingTop: "65%" }}>
                  <video
                    key={isDark ? "dark" : "light"}
                    src={isDark ? item.darkVideo : item.lightVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
