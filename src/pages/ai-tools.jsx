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
import { getAiWorkspaceToolIcon } from "@/components/ui/ai-workspace-icons";
import { getAiToolUsage, getAiToolResult, incrementAiToolUsage, USES_PER_DAY_PER_TOOL } from "@/lib/ai-tools-usage";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = {
  caseStudy: "case-study-generator",
  analyze: "analyze-case-study",
  email: "email-generator",
  salary: "salary-negotiator",
  MockInterview: "mock-interview",
  optimizeResume: "optimize-resume",
};

const navItems = [
  { id: 1, title: "Write Case Study using AI", description: "Write compelling case studies with AI assistance." },
  { id: 2, title: "Case Study Audit", description: "Get critical feedback on your design case studies." },
  { id: 3, title: "Mock Interview", description: "Practice with AI-driven interview questions." },
  { id: 4, title: "Salary Negotiation", description: "Get data-backed negotiation strategies." },
  { id: 5, title: "Email Generator", description: "Draft professional outreach and follow-ups." },
  { id: 6, title: "Resume Fixer", description: "Optimize your resume for ATS and impact." },
];

const typeToIndex = {
  [navigation.caseStudy]: 0,
  [navigation.analyze]: 1,
  [navigation.MockInterview]: 2,
  [navigation.salary]: 3,
  [navigation.email]: 4,
  [navigation.optimizeResume]: 5,
};

const indexToType = [
  navigation.caseStudy,
  navigation.analyze,
  navigation.MockInterview,
  navigation.salary,
  navigation.email,
  navigation.optimizeResume,
];

/** Tools that require login to use (show lock screen when not authenticated) */
const LOCKED_TOOL_TYPES = [navigation.caseStudy, navigation.analyze];

/** Tools that have a per-day usage limit for guests (then prompt login/signup) */
const GUEST_USAGE_TOOL_TYPES = [
  navigation.optimizeResume,
  navigation.MockInterview,
  navigation.email,
  navigation.salary,
];

export default function Index() {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const currentType = router.query?.type;
  const selectedIndex = useMemo(
    () =>
      currentType && typeToIndex[currentType] !== undefined
        ? typeToIndex[currentType]
        : 0,
    [currentType]
  );

  useEffect(() => {
    document.body.style.overflowY = "auto";
  }, []);

  useEffect(() => {
    setSelectedTool(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (router.query?.type !== navigation.optimizeResume) setOptimizeResumeHasResult(false);
    if (router.query?.type !== navigation.salary) setSalaryHasResult(false);
    if (router.query?.type !== navigation.email) setEmailHasResult(false);
    if (router.query?.type !== navigation.MockInterview) setMockInterviewHasResult(false);
    setHasClickedStartNewAnalysis(false);
  }, [router.query?.type]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isLoggedIn = !!Cookies.get("df-token");
  const currentTypeForLock = router.query?.type || navigation.caseStudy;
  const isToolLocked = !isLoggedIn && LOCKED_TOOL_TYPES.includes(currentTypeForLock);

  const [optimizeResumeHasResult, setOptimizeResumeHasResult] = useState(false);
  const [salaryHasResult, setSalaryHasResult] = useState(false);
  const [emailHasResult, setEmailHasResult] = useState(false);
  const [mockInterviewHasResult, setMockInterviewHasResult] = useState(false);
  const [hasClickedStartNewAnalysis, setHasClickedStartNewAnalysis] = useState(false);
  const [usageKey, setUsageKey] = useState(0);

  const defaultUsage = { allowed: true, usedToday: 0, limit: USES_PER_DAY_PER_TOOL };
  const [usageForCurrent, setUsageForCurrent] = useState(defaultUsage);
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof currentTypeForLock === "string" && GUEST_USAGE_TOOL_TYPES.includes(currentTypeForLock)) {
      setUsageForCurrent(getAiToolUsage(currentTypeForLock));
    } else {
      setUsageForCurrent(defaultUsage);
    }
  }, [currentTypeForLock, usageKey, router.isReady]);
  const isUsageLimitReached =
    !isLoggedIn && GUEST_USAGE_TOOL_TYPES.includes(currentTypeForLock) && !usageForCurrent.allowed;

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
  const [hasStoredResult, setHasStoredResult] = useState(false);
  useEffect(() => {
    setHasStoredResult(!!(currentToolStorageKey && getAiToolResult(currentToolStorageKey)));
  }, [currentToolStorageKey, usageKey]);

  const currentToolHasResult =
    (router.query?.type === navigation.optimizeResume && optimizeResumeHasResult) ||
    (router.query?.type === navigation.salary && salaryHasResult) ||
    (router.query?.type === navigation.email && emailHasResult) ||
    (router.query?.type === navigation.MockInterview && mockInterviewHasResult);

  const recordToolUsed = () => {
    if (currentTypeForLock && GUEST_USAGE_TOOL_TYPES.includes(currentTypeForLock)) {
      incrementAiToolUsage(currentTypeForLock);
      setUsageKey((k) => k + 1);
    }
  };

  const content = () => {
    if (isToolLocked) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center justify-center py-12 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-[#FF553E]/10 rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#FF553E]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl text-foreground">Ready to level up?</h3>
            <p className="text-muted-foreground text-sm max-w-[280px]">
              Login to unlock these powerful tools and supercharge your career.
            </p>
          </div>
          <Link href={`/login?redirect=${encodeURIComponent(router.asPath || "/ai-tools")}`}>
            <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8">
              Login to unlock
            </Button>
          </Link>
        </motion.div>
      );
    }
    const loginUrl = `/login?redirect=${encodeURIComponent(router.asPath || "/ai-tools")}`;
    const showLimitBanner =
      isUsageLimitReached ||
      (!isLoggedIn &&
        currentTypeForLock === navigation.optimizeResume &&
        hasStoredResult);

    return (
      <div className="space-y-4">
        {showLimitBanner && (
          <div className="rounded-2xl p-4 sm:p-5 bg-foreground/5 border border-foreground/10">
            <p className="text-sm text-foreground/80 mb-3">
              You&apos;ve already used this tool once on this visit.{" "}
              <Link href={loginUrl} className="text-[#FF553E] hover:underline font-medium">
                Continue to sign up
              </Link>{" "}
              to keep using AI tools.
            </p>
            {hasStoredResult && !currentToolHasResult && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-foreground/20 bg-white/80 hover:bg-white"
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
                    guestUsageLimitReached={router.query?.type === navigation.email && isUsageLimitReached}
                  />
                );
              case navigation.salary:
                return (
                  <OfferTool
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onViewChange={setSalaryHasResult}
                    onStartNewAnalysis={!isLoggedIn ? () => setHasClickedStartNewAnalysis(true) : undefined}
                    skipRestore={hasClickedStartNewAnalysis}
                    guestUsageLimitReached={router.query?.type === navigation.salary && isUsageLimitReached}
                  />
                );
              case navigation.MockInterview:
                return (
                  <MockInterviewTool
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onViewChange={setMockInterviewHasResult}
                    onStartNewAnalysis={!isLoggedIn ? () => setHasClickedStartNewAnalysis(true) : undefined}
                    guestUsageLimitReached={router.query?.type === navigation.MockInterview && isUsageLimitReached}
                    skipRestore={hasClickedStartNewAnalysis}
                  />
                );
              case navigation.optimizeResume:
                return (
                  <CoverLetterGenerator
                    onViewChange={setOptimizeResumeHasResult}
                    onToolUsed={!isLoggedIn ? recordToolUsed : undefined}
                    onStartNewAnalysis={!isLoggedIn ? () => setHasClickedStartNewAnalysis(true) : undefined}
                    guestUsageLimitReached={router.query?.type === navigation.optimizeResume && isUsageLimitReached}
                    skipRestore={hasClickedStartNewAnalysis}
                  />
                );
              default:
                return <CaseStudyGenerator />;
            }
          })()}
        </div>
      </div>
    );
  };

  const goToBuilder = () => {
    const token = Cookies.get("df-token");
    if (token) {
      router.push("/portfolio-builder");
    } else {
      router.push("/claim-link");
    }
  };

  const handleToolSelect = (index) => {
    const type = indexToType[index];
    router.push(`/ai-tools?type=${type}`, undefined, { shallow: true });
  };

  const currentTool = navItems[selectedTool];

  const isWideLayout =
    router.query?.type === navigation.email ||
    router.query?.type === navigation.analyze ||
    (router.query?.type === navigation.optimizeResume && optimizeResumeHasResult) ||
    (router.query?.type === navigation.salary && salaryHasResult);

  const ToolIconComponent = getAiWorkspaceToolIcon(currentTypeForLock);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F1EDE2" }}>
      {/* Breadcrumb Navigation */}
      <header className="p-4 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList className="rounded-lg border border-border bg-background px-3 py-2 shadow-sm shadow-black/5">
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
        <Link href={isLoggedIn ? "/builder" : "/claim-link"}>
          <Button
            className="rounded-full bg-[#FF553E] text-white hover:bg-[#E64935] border-0 shadow-sm hover:shadow transition-all duration-200 px-6 h-10 font-semibold gap-2 group"
          >
            Try Portfolio Builder
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto pb-32 flex justify-center">
        <div
          className={`w-full transition-all duration-500 ease-[0.23,1,0.32,1] ${isWideLayout ? "max-w-6xl" : "max-w-lg"}`}
        >
          <Card className="border border-border/40 rounded-[2rem] bg-[#E5E1D5] shadow-none overflow-hidden p-2">
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
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FF553E]/10">
                        <Lock className="w-5 h-5 text-[#FF553E]" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-foreground">
                        <ToolIconComponent className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-inter text-foreground/90 leading-tight whitespace-nowrap">
                      {currentTool?.title || "Write Case Study using AI"}
                    </h1>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      {currentTool?.description || "Write compelling case studies with AI assistance."}
                    </p>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-[1.75rem] border border-white/40 shadow-sm p-6 min-h-[300px]">
                  <div className="w-full">{content()}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </main>

      {/* Ruler Carousel Navigation */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed bottom-0 inset-x-0 bg-white/10 backdrop-blur-md py-1.5 z-50 border-t border-white/10"
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

Index.theme = "light";
