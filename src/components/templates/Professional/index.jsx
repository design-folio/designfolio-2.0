import React, { useState, useMemo, useCallback, useEffect } from "react";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import {
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
  FileText,
  Phone,
} from "lucide-react";
import { _updateProject } from "@/network/post-request";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { useRouter } from "next/router";
import { modals, sidebars, normalizeSectionOrder } from "@/lib/constant";
import { PROFESSIONAL_DEFAULT_ORDER, PROFESSIONAL_TAB_MAP } from "./professional-utils";
import ProfessionalProfileHeader from "./ProfessionalProfileHeader";
import ProfessionalNavTabs from "./ProfessionalNavTabs";
import ProfessionalProjectsTab from "./ProfessionalProjectsTab";
import ProfessionalExperienceTab from "./ProfessionalExperienceTab";
import ProfessionalAboutTab from "./ProfessionalAboutTab";
import ProfessionalContactTab from "./ProfessionalContactTab";
import ProfessionalTestimonialsTab from "./ProfessionalTestimonialsTab";

export default function Professional({
  isEditing,
  preview = false,
  publicView = false,
}) {
  const {
    userDetails,
    setUserDetails,
    openModal,
    openSidebar,
    openNewWork,
    openNewReview,
    setSelectedProject,
    setSelectedReview,
    setSelectedWork,
    updateCache,
    setShowUpgradeModal,
    setUpgradeModalUnhideProject,
  } = useGlobalContext();
  const router = useRouter();

  const {
    introduction,
    bio,
    skills = [],
    tools = [],
    projects = [],
    experiences = [],
    reviews = [],
    about,
    socials = {},
    portfolios = {},
    resume,
  } = userDetails || {};

  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );
  const email = userDetails?.contact_email || userDetails?.email;
  const phone = userDetails?.phone;
  const fullName = (
    [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") ||
    introduction ||
    "Your Name"
  ).toUpperCase();
  const displayName = `HEY I'M ${fullName}`;
  const userRole = userDetails?.persona?.label !== "Others" ? userDetails?.persona?.label : userDetails?.persona?.custom;

  const visibleProjects = useMemo(() => {
    if (!isEditing && projects) {
      return projects.filter((project) => !project.hidden);
    }
    return projects || [];
  }, [projects, isEditing]);

  const handleProjectClick = useCallback(
    (project) => {
      if (isEditing) {
        router.push(`/project/${project._id}/editor`);
      } else if (preview) {
        router.push(`/project/${project._id}/preview`);
      } else {
        router.push(`/project/${project._id}`);
      }
    },
    [isEditing, preview, router],
  );

  const onDeleteProject = useCallback(
    (e, project) => {
      e.stopPropagation();
      openModal(modals.deleteProject);
      setSelectedProject(project);
    },
    [openModal, setSelectedProject],
  );

  const handleEditProject = useCallback(
    (project) => {
      router.push(`/project/${project._id}/editor`);
    },
    [router],
  );

  const handleToggleProjectVisibility = useCallback(
    (projectId) => {
      const project = (projects || []).find((p) => p._id === projectId);
      const visibleCount = (projects || []).filter((p) => !p.hidden).length;
      const isUnhiding = project?.hidden === true;

      if (!userDetails?.pro && isUnhiding && visibleCount >= 2) {
        setUpgradeModalUnhideProject({ projectId, title: project?.title || "Project" });
        setShowUpgradeModal(true);
        return;
      }

      const updatedProjects = (projects || []).map((p) =>
        p._id === projectId ? { ...p, hidden: !p.hidden } : p
      );
      _updateProject(projectId, { hidden: !project.hidden });
      setUserDetails((prev) => ({ ...prev, projects: updatedProjects }));
      updateCache("userDetails", (prev) => ({ ...prev, projects: updatedProjects }));
    },
    [projects, userDetails, setUserDetails, updateCache, setShowUpgradeModal, setUpgradeModalUnhideProject],
  );

  const socialLinks = useMemo(() => {
    const links = [];
    if (email)
      links.push({ label: "Email Me", icon: Mail, href: `mailto:${email}` });
    if (socials.twitter)
      links.push({
        label: "Twitter / X",
        icon: Twitter,
        href: socials.twitter,
      });
    if (socials.linkedin)
      links.push({ label: "LinkedIn", icon: Linkedin, href: socials.linkedin });
    if (socials.instagram)
      links.push({
        label: "Instagram",
        icon: Instagram,
        href: socials.instagram,
      });
    if (portfolios.dribbble)
      links.push({ label: "Dribbble", icon: Globe, href: portfolios.dribbble });
    if (portfolios.behance)
      links.push({ label: "Behance", icon: Globe, href: portfolios.behance });
    if (portfolios.medium)
      links.push({ label: "Medium", icon: Globe, href: portfolios.medium });
    if (phone)
      links.push({ label: "Phone", icon: Phone, href: `tel:${phone}` });
    if (resume?.url)
      links.push({ label: "Resume", icon: FileText, href: resume.url });
    return links;
  }, [email, socials, portfolios, phone, resume]);

  const allFieldsFilled = useMemo(
    () =>
      Boolean(email) &&
      Boolean(socials?.twitter) &&
      Boolean(socials?.linkedin) &&
      Boolean(socials?.instagram) &&
      Boolean(portfolios?.dribbble) &&
      Boolean(portfolios?.medium) &&
      Boolean(phone) &&
      Boolean(resume?.url),
    [email, socials, portfolios, phone, resume],
  );

  const { hiddenSections = [], sectionOrder } = userDetails || {};

  const orderedSectionIds = useMemo(() => {
    const normalized = normalizeSectionOrder(sectionOrder, PROFESSIONAL_DEFAULT_ORDER);
    return normalized.filter(id => PROFESSIONAL_DEFAULT_ORDER.includes(id));
  }, [sectionOrder]);

  const visibleTabs = useMemo(() => {
    const sorted = orderedSectionIds
      .filter(id => {
        if (hiddenSections.includes(id) && !isEditing) return false;
        // Hide Projects tab in preview/public when there are no visible projects
        if (id === 'projects' && !isEditing && visibleProjects.length === 0) return false;
        // Hide Experience / Testimonials when empty for any read-only view (portfolio preview & public site); builder still shows tabs
        if (!isEditing && id === 'works' && (experiences || []).length === 0) return false;
        if (!isEditing && id === 'reviews' && (reviews || []).length === 0) return false;
        return true;
      })
      .map(id => PROFESSIONAL_TAB_MAP[id]);
    // Contact is not in sectionOrder (backend restriction) — always appended last, non-sortable
    if (isEditing || !hiddenSections.includes('contact')) {
      sorted.push(PROFESSIONAL_TAB_MAP['contact']);
    }
    return sorted;
  }, [orderedSectionIds, hiddenSections, isEditing, visibleProjects, experiences, reviews]);

  const [activeTab, setActiveTab] = useState(() => visibleTabs[0]?.key || "Projects");

  useEffect(() => {
    if (visibleTabs.length && !visibleTabs.find(t => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs]);

  const handleEditProfile = useCallback(
    () => openSidebar(sidebars.profile),
    [openSidebar],
  );
  const handleEditSkills = useCallback(
    () => openSidebar(sidebars.skills),
    [openSidebar],
  );
  const handleEditPersona = useCallback(
    () => openSidebar(sidebars.persona),
    [openSidebar],
  );
  const handleAddProject = useCallback(
    () => openSidebar(sidebars.project),
    [openSidebar],
  );
  const handleEditExperience = useCallback(
    (exp) => {
      setSelectedWork(exp);
      openSidebar(sidebars.work);
    },
    [setSelectedWork, openSidebar],
  );

  const handleAddExperience = useCallback(
    () => openNewWork(),
    [openNewWork],
  );
  const handleEditAbout = useCallback(
    () => openSidebar(sidebars.about),
    [openSidebar],
  );
  const handleEditTools = useCallback(
    () => openSidebar(sidebars.tools),
    [openSidebar],
  );
  const handleEditContact = useCallback(
    () => openSidebar(sidebars.footer),
    [openSidebar],
  );
  const handleAddReview = useCallback(
    () => openNewReview(),
    [openNewReview],
  );
  const handleEditReview = useCallback(
    (review) => {
      setSelectedReview(review);
      openSidebar(sidebars.review);
    },
    [setSelectedReview, openSidebar],
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Projects":
        return (
          <ProfessionalProjectsTab
            isEditing={isEditing}
            visibleProjects={visibleProjects}
            onAddProject={handleAddProject}
            onProjectClick={handleProjectClick}
            onEditProject={handleEditProject}
            onDeleteProject={onDeleteProject}
            onToggleVisibility={handleToggleProjectVisibility}
            openSidebar={openSidebar}
            isPro={!!userDetails?.pro}
          />
        );
      case "Experience":
        return (
          <ProfessionalExperienceTab
            isEditing={isEditing}
            experiences={experiences}
            onEditExperience={handleEditExperience}
            onAddExperience={handleAddExperience}
          />
        );
      case "About":
        return (
          <ProfessionalAboutTab
            isEditing={isEditing}
            about={about}
            skills={skills}
            tools={tools}
            onEditAbout={handleEditAbout}
            onEditSkills={handleEditSkills}
            onEditTools={handleEditTools}
          />
        );
      case "Contact":
        return (
          <ProfessionalContactTab
            isEditing={isEditing}
            socialLinks={socialLinks}
            onEditContact={handleEditContact}
            allFieldsFilled={allFieldsFilled}
          />
        );
      case "Testimonials":
        return (
          <ProfessionalTestimonialsTab
            isEditing={isEditing}
            reviews={reviews}
            onAddReview={handleAddReview}
            onEditReview={handleEditReview}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-3 max-w-[640px] mx-auto relative min-h-screen font-inter transition-colors duration-700 bg-[#EFECE6] dark:bg-[#1A1A1A] custom-solid-x">
      {!isEditing && <SmoothCursor type="professional" />}
      <div className="w-full flex-1 flex flex-col pt-12 overflow-hidden">
        <ProfessionalProfileHeader
          isEditing={isEditing}
          persistTheme={isEditing && !preview}
          avatarSrc={avatarSrc}
          displayName={fullName}
          bio={bio}
          userRole={userRole}
          onEditProfile={handleEditProfile}
          onEditPersona={handleEditPersona}
        />
        <ProfessionalNavTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={visibleTabs}
        />
        <div className="flex-1">{renderActiveTab()}</div>
      </div>
    </div>
  );
}
