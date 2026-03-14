import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import MacOSMenuBar from "@/components/ui/MacOSMenuBar";
import MacOSDock from "@/components/MacOSDock";
import { DivOrigami } from "@/components/ui/animated-logo-rolodex";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { getSidebarShiftWidth, isSidebarThatShifts, modals, sidebars } from "@/lib/constant";
import SortableModal from "@/components/SortableModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { _updateUser } from "@/network/post-request";
import {
  TestimonialWidget,
  SortableTestimonialItem,
} from "@/components/MacOSDock/TestimonialWidget";
import { SortableWorkExperienceItem } from "@/components/MacOSDock/WorkExperienceWindow";



const MacOSTemplate = ({ userDetails, edit = false, preview = false, showHeaderInside = false, noTopNavbar = false }) => {
  const { setCursor, openSidebar, openModal, setSelectedReview, setSelectedWork, setUserDetails, updateCache, activeSidebar, showModal, template } = useGlobalContext();
  const isProWarningVisible = template !== 0;
  const isOnboardingOpen = showModal === modals.onboarding || showModal === modals.onBoardingNewUser;
  const isMobile = useIsMobile();

  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails.cursor : 0);
  }, []);

  // Hide body scrollbar on MacOS desktop so the desktop doesn’t show unnecessary scroll
  useEffect(() => {
    document.body.classList.add("macos-desktop");
    return () => document.body.classList.remove("macos-desktop");
  }, []);

  const appName =
    [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") + "'s Portfolio" ||
    "Portfolio";

  const loggedInHeaderOffset = (edit && !noTopNavbar) ? 62 : 0;
  const macOSMenuBarTop = loggedInHeaderOffset;
  const desktopTopMargin = (edit && !noTopNavbar) ? loggedInHeaderOffset + 28 : (showHeaderInside ? 152 : 28);

  // Sidebar shift: when a sidebar opens, shift the fixed-position elements to the left
  const sidebarShiftWidth = edit && !isMobile && isSidebarThatShifts(activeSidebar)
    ? getSidebarShiftWidth(activeSidebar)
    : "0px";
  const sidebarTransition = "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

  const [activeTab, setActiveTab] = useState("home");
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  // Dynamic z-index: dock wrapper goes to 260 when a dock window is active (beats project portal at 250),
  // and drops to 200 when a project window is active (project portal at 250 wins).
  const dockWrapperRef = useRef(null);
  const bringDockToFront = useCallback(() => {
    if (dockWrapperRef.current) dockWrapperRef.current.style.zIndex = '400';
  }, []);
  const bringProjectToFront = useCallback(() => {
    if (dockWrapperRef.current) dockWrapperRef.current.style.zIndex = '200';
  }, []);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showWorkSortModal, setShowWorkSortModal] = useState(false);

  const reviews = userDetails?.reviews || [];
  const experiences = userDetails?.experiences || [];

  const sortSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSortEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = reviews.findIndex((r) => r._id === active.id);
    const newIndex = reviews.findIndex((r) => r._id === over.id);
    const sortedReviews = arrayMove(reviews, oldIndex, newIndex);

    setUserDetails((prev) => ({ ...prev, reviews: sortedReviews }));
    _updateUser({ reviews: sortedReviews }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    openSidebar(sidebars.review);
    setShowSortModal(false);
  };

  const handleAddReview = () => {
    setSelectedReview(null);
    openSidebar(sidebars.review);
  };

  const handleWidgetEditClick = () => {
    setShowSortModal(true);
  };

  const handleWorkSortEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = experiences.findIndex((e) => e._id === active.id);
    const newIndex = experiences.findIndex((e) => e._id === over.id);
    const sorted = arrayMove(experiences, oldIndex, newIndex);

    setUserDetails((prev) => ({ ...prev, experiences: sorted }));
    _updateUser({ experiences: sorted }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

  const handleEditWork = (exp) => {
    setSelectedWork(exp);
    openSidebar(sidebars.work);
    setShowWorkSortModal(false);
  };

  const handleAddWork = () => {
    setSelectedWork(null);
    openSidebar(sidebars.work);
    setShowWorkSortModal(false);
  };

  const dockApps = [
    { id: "home", name: "Home", icon: "/macosicons/header.svg" },
    { id: "works", name: "Works", icon: "/macosicons/projects.svg" },
    { id: "work_experience", name: "Work Experience", icon: "/macosicons/work-experience.svg" },
    { id: "about", name: "About Me", icon: "/macosicons/aboutme.svg" },
    { id: "resume", name: "Resume", icon: "/macosicons/resume.svg" },
    { id: "contact", name: "Contact", icon: "/macosicons/contact.svg" },
  ];

  // In non-edit mode, hide Resume from dock if user has no resume
  const visibleDockApps = (edit || userDetails?.resume?.url) ? dockApps : dockApps.filter((a) => a.id !== "resume");

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

      {!isOnboardingOpen && (
        <MacOSMenuBar
          appName={appName}
          style={{
            top: `${macOSMenuBarTop}px`,
            right: sidebarShiftWidth,
            transition: sidebarTransition,
          }}
        />
      )}

      {/* Desktop area — starts below the menu bar (and LoggedInHeader in edit mode) */}
      <div className="min-h-screen relative overflow-hidden" style={{ marginTop: `${desktopTopMargin}px` }}>
        {/* Desktop Widgets Layer — fixed, pointer-events only on widgets, shifts with sidebar */}
        <div
          className="fixed left-0 bottom-0 pointer-events-none z-10 overflow-hidden"
          style={{
            top: `${macOSMenuBarTop}px`,
            right: sidebarShiftWidth,
            transition: sidebarTransition,
          }}
        >
          {/* Left side widgets */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "absolute left-0 right-0 top-0 bottom-0 md:right-auto md:left-8 md:bottom-auto flex flex-col gap-6 pointer-events-auto items-center justify-center md:items-stretch md:justify-start min-w-0 max-w-full md:max-w-none px-4 md:px-0",
              isProWarningVisible ? "md:top-24" : "md:top-16"
            )}
          >
            <TestimonialWidget
              reviews={userDetails?.reviews}
              edit={edit}
              onEditClick={handleWidgetEditClick}
              onAddReview={handleAddReview}
            />
            <div className="w-80 bg-transparent p-0 flex items-center justify-center">
              <DivOrigami userDetails={userDetails} />
            </div>
          </motion.div>

        </div>

        {/* Empty desktop surface — the windows float above via MacOSDock's fixed positioning */}
        <div className="min-h-[calc(100vh-100px)]" />

        {/* MacOS Dock — fixed at bottom, shifts with sidebar */}
        <div
          ref={dockWrapperRef}
          className="fixed bottom-0 sm:bottom-2 left-0 flex justify-center pointer-events-none"
          style={{
            zIndex: 200,
            right: sidebarShiftWidth,
            transition: sidebarTransition,
          }}
        >
          <div className="pointer-events-auto w-full h-full" style={{ position: "relative" }}>
            <MacOSDock
              apps={visibleDockApps}
              openApps={[activeTab, isResumeDialogOpen ? "resume" : ""].filter(Boolean)}
              onAppClick={handleAppClick}
              userDetails={userDetails}
              edit={edit}
              preview={preview}
              sidebarOffsetPx={parseInt(sidebarShiftWidth, 10) || 0}
              topOffsetPx={desktopTopMargin}
              onDockWindowFocus={bringDockToFront}
              onProjectWindowFocus={bringProjectToFront}
              onEditHome={() => openModal(modals.onboarding)}
              onEditBio={() => openSidebar(sidebars.about)}
              onEditContact={() => openSidebar(sidebars.footer)}
              onEditWorkExperience={() => setShowWorkSortModal(true)}
              onAddWorkExperience={handleAddWork}
              onAddProject={() => openModal(modals.project)}
              onEditTools={() => openModal(modals.tools)}
              onEditSkills={() => openModal(modals.onboarding)}
              onEditResume={() => openModal(modals.resume)}
            />
          </div>
        </div>
      </div>

      {/* Testimonial sort/rearrange modal */}
      {edit && (
        <SortableModal
          show={showSortModal}
          onClose={() => setShowSortModal(false)}
          items={reviews.map((r) => r._id)}
          onSortEnd={handleSortEnd}
          sensors={sortSensors}
          title="Rearrange Testimonials"
          useButton2={true}
        >
          {reviews.map((review) => (
            <SortableTestimonialItem
              key={review._id}
              review={review}
              edit={edit}
              onEdit={handleEditReview}
            />
          ))}
        </SortableModal>
      )}

      {/* Work Experience sort/rearrange modal */}
      {edit && (
        <SortableModal
          show={showWorkSortModal}
          onClose={() => setShowWorkSortModal(false)}
          items={experiences.map((e) => e._id)}
          onSortEnd={handleWorkSortEnd}
          sensors={sortSensors}
          title="Rearrange Work Experience"
          useButton2={true}
        >
          {experiences.map((exp) => (
            <SortableWorkExperienceItem
              key={exp._id}
              exp={exp}
              edit={edit}
              onEdit={handleEditWork}
            />
          ))}
        </SortableModal>
      )}
    </div>
  );
};

export default MacOSTemplate;
