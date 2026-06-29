import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/router";
import { useState } from "react";
import Dock from "@/components/ui/dock";
import { Home, Layers, MessageSquare, FileText, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MemoMadewithdesignfolio from "./icons/Madewithdesignfolio";

export default function BottomNavigation({ userDetails, className = "", watermarkClassName = "" }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  const { projectRef } = useGlobalContext();

  const handleHomeNavigation = () => {
    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectNavigation = () => {
    if (projectRef.current) {
      setActiveTab("projects");
      const elementTop = projectRef.current.getBoundingClientRect().top;
      const offset = 20;
      const scrollTop = window.scrollY || window.pageYOffset;
      const top = elementTop + scrollTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const scrollToId = (id, block = "center") => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });
  };

  const hasReviews = (userDetails?.reviews?.length || 0) > 0;
  const hasResume = !!userDetails?.resume?.url;
  const hasContact =
    hasResume ||
    !!userDetails?.socials?.instagram ||
    !!userDetails?.socials?.twitter ||
    !!userDetails?.socials?.linkedin ||
    !!userDetails?.portfolios?.dribbble ||
    !!userDetails?.portfolios?.notion ||
    !!userDetails?.portfolios?.medium;

  return (
    <>
      {/* Floating Dock (v3-style) */}
      {!router?.asPath?.includes("project") && (
        <div
          className={`pointer-events-none fixed right-0 bottom-1 left-0 z-[100] flex justify-center sm:bottom-4 ${className}`}
        >
          <div className="pointer-events-auto">
            <Dock
              items={[
                {
                  icon: Home,
                  label: "Home",
                  active: activeTab === "home" && !isResumeDialogOpen,
                  onClick: handleHomeNavigation,
                },
                ...(userDetails?.projects?.length
                  ? [
                      {
                        icon: Layers,
                        label: "Works",
                        active: activeTab === "projects" && !isResumeDialogOpen,
                        onClick: () => {
                          handleProjectNavigation();
                        },
                      },
                    ]
                  : []),
                ...(hasReviews
                  ? [
                      {
                        icon: MessageSquare,
                        label: "Testimonials",
                        active: activeTab === "reviews" && !isResumeDialogOpen,
                        onClick: () => {
                          setActiveTab("reviews");
                          scrollToId("section-reviews", "center");
                        },
                      },
                    ]
                  : []),
                ...(hasResume
                  ? [
                      {
                        icon: FileText,
                        label: "Resume",
                        active: isResumeDialogOpen,
                        onClick: () => setIsResumeDialogOpen(true),
                      },
                    ]
                  : []),
                ...(hasContact
                  ? [
                      {
                        icon: Mail,
                        label: "Contact",
                        active: activeTab === "contact" && !isResumeDialogOpen,
                        onClick: () => {
                          setActiveTab("contact");
                          window.scrollTo({
                            top: document.documentElement.scrollHeight,
                            behavior: "smooth",
                          });
                        },
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </div>
      )}

      {!userDetails?.pro && (
        <div
          className={`hidden cursor-pointer justify-center text-center lg:fixed lg:right-[36px] lg:bottom-[24px] lg:flex xl:block ${watermarkClassName}`}
          onClick={() => window.open("https://www.designfolio.me", "_blank")}
        >
          <MemoMadewithdesignfolio />
        </div>
      )}
      {/* Resume Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <div className="border-border border-b p-6">
            <DialogHeader>
              <DialogTitle>Resume Preview</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-4">
            {userDetails?.resume?.url ? (
              <iframe
                title="Resume Preview"
                src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(userDetails.resume.url)}#zoom=page-width&pagemode=none`}
                className="border-border h-[70vh] w-full rounded-xl border"
              />
            ) : (
              <div className="text-muted-foreground p-6 text-sm">No resume uploaded.</div>
            )}
          </div>
          {userDetails?.resume?.url && (
            <div className="border-border flex justify-end gap-2 border-t p-4">
              <a href={userDetails.resume.url} target="_blank" rel="noreferrer">
                <Button variant="outline" className="h-11 rounded-full">
                  Download
                </Button>
              </a>
              <Button
                className="bg-foreground-landing text-background-landing hover:bg-foreground-landing/90 h-11 rounded-full"
                onClick={() => setIsResumeDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
