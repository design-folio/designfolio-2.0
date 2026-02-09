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
import Cookies from "js-cookie";
import { Home } from "lucide-react";
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
  { id: 1, title: "Case Study Generator", description: "Generate structured case studies for your portfolio." },
  { id: 2, title: "Analyze Case Study", description: "Get AI feedback on your case study content." },
  { id: 3, title: "Mock Interview", description: "Practice with AI-driven interview questions." },
  { id: 4, title: "Salary Negotiator", description: "Get data-backed negotiation strategies." },
  { id: 5, title: "Email Generator", description: "Draft professional outreach and follow-ups." },
  { id: 6, title: "Optimize Resume", description: "Optimize your resume for ATS and impact." },
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
    if (router.query?.type !== navigation.optimizeResume) {
      setOptimizeResumeHasResult(false);
    }
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

  const content = () => {
    switch (router.query?.type) {
      case navigation.caseStudy:
        return <CaseStudyGenerator />;
      case navigation.analyze:
        return <AnalyzeTool />;
      case navigation.email:
        return <EmailGenerator />;
      case navigation.salary:
        return <OfferTool />;
      case navigation.MockInterview:
        return <MockInterviewTool />;
      case navigation.optimizeResume:
        return <CoverLetterGenerator onViewChange={setOptimizeResumeHasResult} />;
      default:
        return <CaseStudyGenerator />;
    }
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
  const [optimizeResumeHasResult, setOptimizeResumeHasResult] = useState(false);

  const isWideLayout =
    router.query?.type === navigation.email ||
    router.query?.type === navigation.analyze ||
    (router.query?.type === navigation.optimizeResume && optimizeResumeHasResult);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F1EDE2" }}>
      {/* Breadcrumb Navigation */}
      <header className="p-4 flex items-center">
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
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto pb-32 flex justify-center">
        <div
          className={`w-full transition-all duration-500 ease-[0.23,1,0.32,1] ${
            isWideLayout ? "max-w-6xl" : "max-w-lg"
          }`}
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
                    <img
                      src={
                        router.query?.type === navigation.caseStudy
                          ? "/assets/svgs/caseStudyToolIcon.svg"
                          : router.query?.type === navigation.analyze
                          ? "/assets/svgs/startTool.svg"
                          : router.query?.type === navigation.MockInterview
                          ? "/assets/svgs/mockTool.svg"
                          : router.query?.type === navigation.salary
                          ? "/assets/svgs/walletTool.svg"
                          : router.query?.type === navigation.email
                          ? "/assets/svgs/email.svg"
                          : router.query?.type === navigation.optimizeResume
                          ? "/assets/svgs/optimize-resume.svg"
                          : "/assets/svgs/caseStudyToolIcon.svg"
                      }
                      alt=""
                      className="w-10 h-10 text-foreground"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-serif text-foreground/90 leading-tight whitespace-nowrap">
                      {currentTool?.title || "Case Study Generator"}
                    </h1>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      {currentTool?.description || "AI-powered tools to elevate your career"}
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
