import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/router";
import MadeWithDesignfolio from "../../public/assets/svgs/madewithdesignfolio.svg";
import { useState } from "react";
import Dock from "@/components/ui/dock";
import { Home, Layers, MessageSquare, FileText, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function BottomNavigation({
  userDetails,
  className = "",
  watermarkClassName = "",
}) {
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
    !!userDetails?.portfolios?.behance ||
    !!userDetails?.portfolios?.medium;

  return (
    <>
      {/* Floating Dock (v3-style) */}
      {!router?.asPath?.includes("project") && (
        <div
          className={`fixed bottom-1 sm:bottom-4 left-0 right-0 z-[100] flex justify-center pointer-events-none ${className}`}
        >
          <div className="pointer-events-auto">
            <Dock
              items={[
                {
                  icon: Home,
                  label: "Home",
                  active: activeTab === "home",
                  onClick: handleHomeNavigation,
                },
                ...(userDetails?.projects?.length
                  ? [
                    {
                      icon: Layers,
                      label: "Works",
                      active: activeTab === "projects",
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
                      active: activeTab === "reviews",
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
                      active: activeTab === "contact",
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
          className={`hidden text-center lg:flex justify-center lg:fixed lg:right-[36px] lg:bottom-[36px] xl:block cursor-pointer ${watermarkClassName}`}
          onClick={() => window.open("https://www.designfolio.me", "_blank")}
        >
          <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
            <MadeWithDesignfolio className="text-df-icon-color" />
          </div>
        </div>
      )}
      {/* Resume Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle>Resume Preview</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-4">
            {userDetails?.resume?.url ? (
              <iframe
                title="Resume Preview"
                src={userDetails.resume.url}
                className="w-full h-[70vh] rounded-xl border border-border"
              />
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                No resume uploaded.
              </div>
            )}
          </div>
          {userDetails?.resume?.url && (
            <div className="p-4 border-t border-border flex gap-2 justify-end">
              <a href={userDetails.resume.url} target="_blank" rel="noreferrer">
                <Button variant="outline" className="rounded-full h-11">
                  Download
                </Button>
              </a>
              <Button
                className="rounded-full h-11 bg-foreground-landing text-background-landing hover:bg-foreground-landing/90"
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
