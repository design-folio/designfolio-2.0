"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function AIThinkingBlock() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [timer, setTimer] = useState(0);
  const contentRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const ThinkingContent = `Analyzing resume structure...
Identifying key professional experience...
Extracting technical skill set...
Mapping project achievements...
Structuring educational background...
Optimizing content for professional portfolio...
Applying warm aesthetic design principles...
Generating personalized "About Me" section...
Formatting work history chronologically...
Refining skill categorization...
Polishing project descriptions...
Finalizing layout architecture...
Double-checking serif typography consistency...
Reviewing color contrast for accessibility...
Preparing final portfolio website preview...`;

  useEffect(() => {
    const timerInterval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);

    scrollIntervalRef.current = setInterval(() => {
      setScrollPosition((prev) => {
        const newPosition = prev + 0.5;
        return newPosition >= maxScroll ? 0 : newPosition;
      });
    }, 30);

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (el) el.scrollTop = scrollPosition;
  }, [scrollPosition]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col p-3">
      <div className="mb-4 flex items-center justify-start gap-2">
        <Loader2 className="text-primary h-4 w-4 animate-spin" />
        <p className="animate-shimmer bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] bg-[length:200%_100%] bg-clip-text text-base text-transparent">
          Designfolio AI is thinking
        </p>
        <span className="text-muted-foreground ml-auto text-sm">{timer}s</span>
      </div>
      <Card className="bg-secondary/50 relative h-[150px] overflow-hidden rounded-xl border-dashed p-4">
        {/* Top fade overlay */}
        <div className="from-secondary pointer-events-none absolute top-0 right-0 left-0 z-10 h-12 bg-gradient-to-b to-transparent" />

        {/* Bottom fade overlay */}
        <div className="from-secondary pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-12 bg-gradient-to-t to-transparent" />

        {/* Scrolling content */}
        <div
          ref={contentRef}
          className="text-muted-foreground/80 h-full [scrollbar-width:none] overflow-x-hidden overflow-y-auto font-mono text-sm leading-relaxed [&::-webkit-scrollbar]:hidden"
        >
          {ThinkingContent.split("\n").map((line, i) => (
            <div key={i} className="py-1">
              <span className="text-primary/40 mr-2">›</span>
              {line}
            </div>
          ))}
        </div>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 5s linear infinite;
        }
      `}</style>
    </div>
  );
}
