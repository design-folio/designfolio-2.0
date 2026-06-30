"use client";

import AnalyzeTool from "@/components/analyzeTool";
import CaseStudyGenerator from "@/components/caseStudyGenerator";
import CoverLetterGenerator from "@/components/coverLetterGenerator";
import EmailGenerator from "@/components/emailGenerator";
import MockInterviewTool from "@/components/mockInterviewTool";
import OfferTool from "@/components/offerTool";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { RulerCarousel } from "@/components/ui/ruler-carousel";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Home, Lock, ArrowRight } from "lucide-react";
import { AiWorkspaceToolIcon } from "@/components/ui/ai-workspace-icons";
import { getAiToolResult } from "@/lib/ai-tools-usage";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const navigation = {
  caseStudy: "case-study-generator",
  analyze: "analyze-case-study",
  email: "email-generator",
  salary: "salary-negotiator",
  MockInterview: "mock-interview",
  optimizeResume: "optimize-resume",
};

const navItems = [
  { id: 1, title: "Resume Fixer", description: "Optimize your resume for ATS and impact." },
  {
    id: 2,
    title: "Write Case Study using AI",
    description: "Write compelling case studies with AI assistance.",
  },
  {
    id: 3,
    title: "Case Study Audit",
    description: "Get critical feedback on your design case studies.",
  },
  { id: 4, title: "Mock Interview", description: "Practice with AI-driven interview questions." },
  { id: 5, title: "Salary Negotiation", description: "Get data-backed negotiation strategies." },
  { id: 6, title: "Email Generator", description: "Draft professional outreach and follow-ups." },
];

const typeToIndex = {
  [navigation.optimizeResume]: 0,
  [navigation.caseStudy]: 1,
  [navigation.analyze]: 2,
  [navigation.MockInterview]: 3,
  [navigation.salary]: 4,
  [navigation.email]: 5,
};

const indexToType = [
  navigation.optimizeResume,
  navigation.caseStudy,
  navigation.analyze,
  navigation.MockInterview,
  navigation.salary,
  navigation.email,
];

const LOCKED_TOOL_TYPES = [navigation.caseStudy, navigation.analyze];
const GUEST_USAGE_TOOL_TYPES = [
  navigation.optimizeResume,
  navigation.MockInterview,
  navigation.email,
  navigation.salary,
];

/**
 * Shared AI tools workspace. Renders the tool card + ruler carousel.
 * @param {boolean} embedInBuilder - When true, we're inside /builder?view=ai-tools (logged-in). Use builder URL for navigation. When false, we're on /ai-tools (guests).
 */
export default function AiToolsWorkspace({ embedInBuilder = false }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const currentType = router.query?.type;
  const selectedIndex = useMemo(
    () => (currentType && typeToIndex[currentType] !== undefined ? typeToIndex[currentType] : 0),
    [currentType]
  );

  const buildToolUrl = (type) =>
    embedInBuilder ? `/builder?view=ai-tools&type=${type}` : `/ai-tools?type=${type}`;

  const isLoggedIn = !!Cookies.get("df-token");
  const currentTypeForLock = router.query?.type || navigation.optimizeResume;
  const isToolLocked = !isLoggedIn && LOCKED_TOOL_TYPES.includes(currentTypeForLock);

  const [optimizeResumeHasResult, setOptimizeResumeHasResult] = useState(false);
  const [salaryHasResult, setSalaryHasResult] = useState(false);
  const [emailHasResult, setEmailHasResult] = useState(false);
  const [mockInterviewHasResult, setMockInterviewHasResult] = useState(false);
  const [hasClickedStartNewAnalysis, setHasClickedStartNewAnalysis] = useState(false);
  const [toolLimitReached, setToolLimitReached] = useState({});
  const isUsageLimitReached =
    !isLoggedIn &&
    GUEST_USAGE_TOOL_TYPES.includes(currentTypeForLock) &&
    !!toolLimitReached[currentTypeForLock];

  const currentToolStorageKey =
    router.query?.type === navigation.optimizeResume
      ? "optimize-resume"
      : router.query?.type === navigation.salary
        ? "salary-negotiator"
        : router.query?.type === navigation.email
          ? "email-generator"
          : router.query?.type === navigation.MockInterview
            ? "mock-interview"
            : null;

  const hasStoredResult = useMemo(
    () => !!(currentToolStorageKey && getAiToolResult(currentToolStorageKey)),
    [currentToolStorageKey]
  );

  useEffect(() => {
    document.body.style.overflowY = "auto";
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const needsDefault = embedInBuilder
      ? router.query?.view === "ai-tools" && router.query?.type === undefined
      : router.query?.type === undefined;
    if (needsDefault) {
      const url = embedInBuilder
        ? "/builder?view=ai-tools&type=optimize-resume"
        : "/ai-tools?type=optimize-resume";
      router.replace(url, undefined, { shallow: true });
    }
  }, [router, router.isReady, router.query?.view, router.query?.type, embedInBuilder]);

  useEffect(() => {
    startTransition(() => {
      if (router.query?.type !== navigation.optimizeResume) setOptimizeResumeHasResult(false);
      if (router.query?.type !== navigation.salary) setSalaryHasResult(false);
      if (router.query?.type !== navigation.email) setEmailHasResult(false);
      if (router.query?.type !== navigation.MockInterview) setMockInterviewHasResult(false);
      setHasClickedStartNewAnalysis(false);
    });
  }, [router.query?.type]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) setIsVisible(false);
      else setIsVisible(true);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentToolHasResult =
    (router.query?.type === navigation.optimizeResume && optimizeResumeHasResult) ||
    (router.query?.type === navigation.salary && salaryHasResult) ||
    (router.query?.type === navigation.email && emailHasResult) ||
    (router.query?.type === navigation.MockInterview && mockInterviewHasResult);

  const recordToolUsed = () => {
    if (!isLoggedIn && currentTypeForLock && GUEST_USAGE_TOOL_TYPES.includes(currentTypeForLock)) {
      setToolLimitReached((prev) => ({ ...prev, [currentTypeForLock]: true }));
    }
  };

  const loginRedirectPath = embedInBuilder
    ? "/builder?view=ai-tools"
    : router.asPath || "/ai-tools";
  const loginUrl = `/login?redirect=${encodeURIComponent(loginRedirectPath)}`;

  const content = () => {
    if (isToolLocked) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center justify-center space-y-6 py-12 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF553E]/10">
            <Lock className="h-8 w-8 text-[#FF553E]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground text-xl">Ready to level up?</h3>
            <p className="text-muted-foreground max-w-[280px] text-sm">
              Login to unlock these powerful tools and supercharge your career.
            </p>
          </div>
          <Link href={loginUrl}>
            <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8">
              Login to unlock
            </Button>
          </Link>
        </motion.div>
      );
    }
    const showLimitBanner =
      isUsageLimitReached ||
      (!isLoggedIn && currentTypeForLock === navigation.optimizeResume && hasStoredResult);

    return (
      <div className="space-y-4">
        {showLimitBanner && (
          <div className="bg-foreground/5 border-foreground/10 rounded-2xl border p-4 sm:p-5">
            <p className="text-foreground/80 mb-3 text-sm">
              You&apos;ve already used this tool once on this visit.{" "}
              <Link href={loginUrl} className="font-medium text-[#FF553E] hover:underline">
                Continue to sign up
              </Link>{" "}
              to keep using AI tools.
            </p>
            {hasStoredResult && !currentToolHasResult && (
              <Button
                variant="outline"
                size="sm"
                className="border-foreground/20 rounded-full bg-white/80 hover:bg-white"
                onClick={() => setHasClickedStartNewAnalysis(false)}
              >
                View generated report
              </Button>
            )}
          </div>
        )}
        <div key={`${currentToolStorageKey ?? "tool"}-${hasClickedStartNewAnalysis}`}>
          {(() => {
            switch (router.query?.type) {
              case navigation.caseStudy:
                return <CaseStudyGenerator />;
              case navigation.analyze:
                return <AnalyzeTool />;
              case navigation.email:
                return (
                  <EmailGenerator
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onViewChange={setEmailHasResult}
                    guestUsageLimitReached={
                      router.query?.type === navigation.email && isUsageLimitReached
                    }
                  />
                );
              case navigation.salary:
                return (
                  <OfferTool
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onViewChange={setSalaryHasResult}
                    onStartNewAnalysis={
                      !isLoggedIn ? () => setHasClickedStartNewAnalysis(true) : undefined
                    }
                    skipRestore={hasClickedStartNewAnalysis}
                    guestUsageLimitReached={
                      router.query?.type === navigation.salary && isUsageLimitReached
                    }
                  />
                );
              case navigation.MockInterview:
                return (
                  <MockInterviewTool
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onViewChange={setMockInterviewHasResult}
                    onStartNewAnalysis={
                      !isLoggedIn ? () => setHasClickedStartNewAnalysis(true) : undefined
                    }
                    guestUsageLimitReached={
                      router.query?.type === navigation.MockInterview && isUsageLimitReached
                    }
                    skipRestore={hasClickedStartNewAnalysis}
                  />
                );
              case navigation.optimizeResume:
                return (
                  <CoverLetterGenerator
                    onViewChange={setOptimizeResumeHasResult}
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onStartNewAnalysis={
                      !isLoggedIn ? () => setHasClickedStartNewAnalysis(true) : undefined
                    }
                    guestUsageLimitReached={
                      router.query?.type === navigation.optimizeResume && isUsageLimitReached
                    }
                    skipRestore={hasClickedStartNewAnalysis}
                  />
                );
              default:
                return (
                  <CoverLetterGenerator
                    onViewChange={setOptimizeResumeHasResult}
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onStartNewAnalysis={
                      !isLoggedIn ? () => setHasClickedStartNewAnalysis(true) : undefined
                    }
                    guestUsageLimitReached={
                      currentTypeForLock === navigation.optimizeResume && isUsageLimitReached
                    }
                    skipRestore={hasClickedStartNewAnalysis}
                  />
                );
            }
          })()}
        </div>
      </div>
    );
  };

  const handleToolSelect = (index) => {
    const type = indexToType[index];
    router.push(buildToolUrl(type), undefined, { shallow: true });
  };

  const currentTool = navItems[selectedIndex];
  const isWideLayout =
    router.query?.type === navigation.email ||
    router.query?.type === navigation.analyze ||
    (router.query?.type === navigation.optimizeResume && optimizeResumeHasResult) ||
    (router.query?.type === navigation.salary && salaryHasResult);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F1EDE2" }}>
      {!embedInBuilder && !isLoggedIn && (
        <header className="flex items-center justify-between p-4">
          <Breadcrumb>
            <BreadcrumbList className="border-border bg-background rounded-lg border px-3 py-2 shadow-sm shadow-black/5">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">
                    <Home size={16} strokeWidth={2} aria-hidden="true" />
                    <span className="sr-only">Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Career Workspace</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href="/claim-link">
            <Button className="group h-10 gap-2 rounded-full border-0 bg-[#FF553E] px-6 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#E64935] hover:shadow">
              Try Portfolio Builder
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </header>
      )}

      <main
        className={cn(
          "flex flex-1 justify-center overflow-y-auto p-6 pb-32",
          (embedInBuilder || isLoggedIn) && "pt-[94px]"
        )}
      >
        <div
          className={`w-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] ${isWideLayout ? "max-w-6xl" : "max-w-lg"}`}
        >
          <Card className="border-border/40 overflow-hidden rounded-[2rem] border bg-[#E5E1D5] p-2 shadow-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={router.query?.type || "default"}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{
                  duration: 0.4,
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.3 },
                  filter: { duration: 0.3 },
                }}
              >
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="flex items-center justify-center pr-1">
                    {isToolLocked ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF553E]/10">
                        <Lock className="h-5 w-5 text-[#FF553E]" />
                      </div>
                    ) : (
                      <div className="text-foreground flex items-center justify-center">
                        <AiWorkspaceToolIcon type={currentTypeForLock} className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h1 className="font-inter text-foreground/90 text-xl leading-tight whitespace-nowrap">
                      {currentTool?.title || "Write Case Study using AI"}
                    </h1>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      {currentTool?.description ||
                        "Write compelling case studies with AI assistance."}
                    </p>
                  </div>
                </div>

                <div className="min-h-[300px] rounded-[1.75rem] border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl">
                  <div className="w-full">{content()}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </main>

      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-white/10 py-1.5 backdrop-blur-md"
      >
        <RulerCarousel
          originalItems={navItems}
          onItemSelect={handleToolSelect}
          selectedIndex={selectedIndex}
        />
      </motion.div>
    </div>
  );
}
