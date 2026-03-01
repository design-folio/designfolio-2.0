import { useEffect, useRef, useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import MacOSMenuBar from "@/components/ui/MacOSMenuBar";
import MacOSDock from "@/components/ui/MacOSDock";
import { DivOrigami } from "@/components/ui/animated-logo-rolodex";
import { TextRotate } from "@/components/ui/text-rotate";
import { useGlobalContext } from "@/context/globalContext";

// Rotating testimonial widget — pulls from userDetails.reviews if available
const TestimonialWidget = ({ reviews }) => {
  const defaultTestimonials = [
    { text: "Exceptional design skills and great attention to detail!", author: "Client" },
    { text: "Professional, creative, and delivered on time.", author: "Collaborator" },
    { text: "Transformed our vision into an elegant solution.", author: "Product Manager" },
  ];

  const testimonials = reviews?.length > 0
    ? reviews.map((r) => ({ text: r.review || r.text || r.message || '', author: r.name || r.author || 'Client' }))
    : defaultTestimonials;

  const validTestimonials = testimonials.filter((t) => t.text);

  if (validTestimonials.length === 0) return null;

  return (
    <div className="w-80 h-auto min-h-[160px] bg-[#F5C75D] rounded-2xl p-1 shadow-lg font-sans overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center text-[#4A3708] font-medium text-[13px]">
        <span>Testimonials</span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
          </div>
          <span>Done</span>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 relative">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-xl"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        <LayoutGroup>
          <div className="relative z-10">
            <div className="flex flex-col justify-center overflow-hidden">
              <TextRotate
                texts={validTestimonials.map((t) => t.text)}
                staggerFrom="first"
                staggerDuration={0.01}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={4000}
                splitBy="words"
                mainClassName="text-[14px] font-medium text-black/90 leading-relaxed italic"
              />
              <div className="h-px w-full bg-black/5 my-4" />
              <TextRotate
                texts={validTestimonials.map((t) => t.author)}
                staggerFrom="first"
                staggerDuration={0.025}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={4000}
                splitBy="characters"
                mainClassName="text-[11px] text-black/50 font-bold uppercase tracking-wider"
              />
            </div>
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
};

/**
 * MacOSTemplate
 *
 * Full macOS desktop experience:
 * - Fixed MacOS menu bar at top
 * - Desktop widgets layer (Testimonials + DivOrigami on left side)
 * - MacOS Dock at bottom with app windows (Home, Works, Work Experience, About, Resume, Contact)
 * - All content wired to userDetails
 *
 * @param {Object}  userDetails       - The portfolio user data object
 * @param {boolean} edit              - Whether the template is in builder/edit mode
 * @param {boolean} showHeaderInside  - When true, top padding accounts for LoggedInHeader height inside the chrome
 */
const MacOSTemplate = ({ userDetails, edit = false, showHeaderInside = false }) => {
  const { setCursor } = useGlobalContext();

  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails.cursor : 0);
  }, []);

  const appName =
    [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") + "'s Portfolio" ||
    "Portfolio";

  const contentTopOffset = showHeaderInside ? "mt-[152px]" : "mt-7";

  const [activeTab, setActiveTab] = useState("home");
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  const dockApps = [
    { id: "home", name: "Home", icon: "/macosicons/header.svg" },
    { id: "works", name: "Works", icon: "/macosicons/projects.svg" },
    { id: "work_experience", name: "Work Experience", icon: "/macosicons/work-experience.svg" },
    { id: "about", name: "About Me", icon: "/macosicons/aboutme.svg" },
    { id: "resume", name: "Resume", icon: "/macosicons/resume.svg" },
    { id: "contact", name: "Contact", icon: "/macosicons/contact.svg" },
  ];

  const handleAppClick = (appId) => {
    if (appId === "resume") {
      setIsResumeDialogOpen(true);
      return;
    }
    setActiveTab(appId);
    const sectionMap = {
      home: "home",
      works: "section-works",
      about: "section-about",
      work_experience: "section-work-experience",
      contact: "footer",
    };
    const targetId = sectionMap[appId];
    if (targetId) {
      if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* MacOS Menu Bar — fixed at the very top */}
      <MacOSMenuBar appName={appName} />

      {/* Desktop area — starts below the 28px menu bar */}
      <div className={`min-h-screen ${contentTopOffset} relative overflow-hidden`}>
        {/* Desktop Widgets Layer — fixed, pointer-events only on widgets */}
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" style={{ top: '28px' }}>
          {/* Left side widgets */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute left-8 top-16 flex flex-col gap-6 pointer-events-auto"
          >
            <TestimonialWidget reviews={userDetails?.reviews} />
            <div className="w-80 h-64 bg-transparent p-0 flex items-center justify-center">
              <DivOrigami />
            </div>
          </motion.div>
        </div>

        {/* Empty desktop surface — the windows float above via MacOSDock's fixed positioning */}
        <div className="min-h-[calc(100vh-100px)]" />

        {/* MacOS Dock — fixed at bottom */}
        <div className="fixed bottom-0 sm:bottom-2 left-0 right-0 z-[100] flex justify-center pointer-events-none" style={{ zIndex: 200 }}>
          <div className="pointer-events-auto w-full h-full" style={{ position: 'relative' }}>
            <MacOSDock
              apps={dockApps}
              openApps={[activeTab, isResumeDialogOpen ? "resume" : ""].filter(Boolean)}
              onAppClick={handleAppClick}
              userDetails={userDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacOSTemplate;
