import Link from "next/link";
import { User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, startTransition } from "react";

const STEPS = [
  {
    messages: [
      { from: "viewer", text: "I don't have a portfolio. Just a bunch of random work." },
      {
        from: "shai",
        text: "You've already done the hard part. Pick a template and turn it into a portfolio in minutes.",
      },
    ],
    darkVideo: "/landing-video/video1dark.mp4",
    lightVideo: "/landing-video/video1light.mp4",
  },
  {
    messages: [
      {
        from: "viewer",
        text: "Okay, my portfolio looks great now. But getting a job is still going to be hard.",
      },
      {
        from: "shai",
        text: "That's covered too. Build your portfolio, choose your target role and location, and AI will find and rank jobs based on your experience.",
      },
    ],
    darkVideo: "/landing-video/video3dark.mp4",
    lightVideo: "/landing-video/video3light.mp4",
  },
  {
    messages: [
      { from: "viewer", text: "That sounds great. Let me go fix my resume first." },
      {
        from: "shai",
        text: "Good news. Click Tailor Resume on any job, and AI will customize it for you.",
      },
    ],
    darkVideo: "/landing-video/video2dark.mp4",
    lightVideo: "/landing-video/video2light.mp4",
  },
  {
    messages: [
      { from: "viewer", text: "Damn. That's crazy." },
      { from: "shai", text: "We're not done yet. Keep scrolling. 👇" },
    ],
    cards: [
      {
        label: "Fix your resume",
        icon: "/assets/svgs/fixResume.svg",
        href: "/ai-tools?type=optimize-resume",
      },
      {
        label: "Salary Negotiation",
        icon: "/assets/svgs/salary-negotiate.svg",
        href: "/ai-tools?type=salary-negotiator",
      },
      { label: "Case study generator", icon: "/assets/svgs/caseStudyGen.svg", href: "/login" },
      {
        label: "AI mock interview",
        icon: "/assets/svgs/aiMock.svg",
        href: "/ai-tools?type=mock-interview",
      },
      {
        label: "AI email generator",
        icon: "/assets/svgs/emailGen.svg",
        href: "/ai-tools?type=email-generator",
      },
      { label: "Analyze Case study", icon: "/assets/svgs/analyzeCaseStudyGen.svg", href: "/login" },
    ],
  },
];

export default function LandingHowSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);
  const isDark = mounted && theme === "dark";

  return (
    <section
      id="how"
      className="mt-6 mb-16 w-full scroll-mt-24 px-6"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="flex w-full flex-col gap-12">
        {STEPS.map((item, i) => (
          <div key={i} className="flex flex-col gap-4">
            {/* Chat header */}
            <div className="flex flex-col gap-2.5">
              {i === 0 && (
                <div className="text-center">
                  <span className="text-lp-text/25 text-[11px] font-semibold tracking-widest uppercase">
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
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-(--lp-chat-avatar-bg)">
                      <User className="h-[14px] w-[14px] text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div
                      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #FF553E 0%, #FF8C42 100%)" }}
                    >
                      D
                    </div>
                  )}
                  <div
                    className={`max-w-[72%] px-[14px] py-[10px] text-[17px] leading-snug font-medium ${
                      msg.from === "shai"
                        ? "rounded-[20px] rounded-br-[5px] bg-[#007AFF] text-white"
                        : "rounded-[20px] rounded-bl-[5px] bg-(--lp-chat-viewer-bg) text-(--lp-text)"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pr-[42px]">
                <span className="text-lp-text/25 text-[11px] font-medium">Delivered</span>
              </div>
            </div>

            {/* Content: video or AI tool card grid */}
            {item.cards ? (
              <div className="grid grid-cols-2 gap-3">
                {item.cards.map((card) => (
                  <Link
                    key={card.label}
                    href={card.href}
                    className="group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-(--lp-video-border) bg-(--lp-bg) p-5 no-underline transition-colors duration-150 hover:bg-(--lp-card)"
                  >
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-(--lp-card)">
                      <img
                        src={card.icon}
                        alt={card.label}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-center text-[13px] leading-snug font-semibold text-(--lp-text)">
                      {card.label}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="w-full overflow-hidden rounded-[12px] border border-(--lp-video-border) bg-[#141414] shadow-sm">
                <div className="relative w-full overflow-hidden" style={{ paddingTop: "78.75%" }}>
                  <video
                    key={isDark ? "dark" : "light"}
                    src={isDark ? item.darkVideo : item.lightVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
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
