import React, { useState, useMemo, useCallback } from "react";
import {
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
  FileText,
  Phone,
} from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { useRouter } from "next/router";
import { modals, sidebars } from "@/lib/constant";
import SpotlightProfileHeader from "./SpotlightProfileHeader";
import SpotlightNavTabs from "./SpotlightNavTabs";
import SpotlightProjectsTab from "./SpotlightProjectsTab";
import SpotlightExperienceTab from "./SpotlightExperienceTab";
import SpotlightAboutTab from "./SpotlightAboutTab";
import SpotlightContactTab from "./SpotlightContactTab";
import SpotlightTestimonialsTab from "./SpotlightTestimonialsTab";

export default function Spotlight({
  isEditing,
  preview = false,
  publicView = false,
}) {
  const {
    userDetails,
    openModal,
    openSidebar,
    setSelectedProject,
    setSelectedReview,
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
  const displayName = (introduction || "Your Name").toUpperCase();
  const userRole = userDetails?.persona?.label || "";

  const visibleProjects = useMemo(() => {
    if (preview && projects) {
      return projects.filter((project) => !project.hidden);
    }
    return projects || [];
  }, [projects, preview]);

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

  const [currentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Projects");

  const handleEditProfile = useCallback(
    () => openModal("onboarding"),
    [openModal],
  );
  const handleAddProject = useCallback(
    () => openSidebar(sidebars.project),
    [openSidebar],
  );
  const handleEditExperience = useCallback(
    () => openSidebar(sidebars.work),
    [openSidebar],
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
    () => openSidebar(sidebars.review),
    [openSidebar],
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
          <SpotlightProjectsTab
            isEditing={isEditing}
            visibleProjects={visibleProjects}
            onAddProject={handleAddProject}
            onProjectClick={handleProjectClick}
            onEditProject={handleEditProject}
            onDeleteProject={onDeleteProject}
          />
        );
      case "Experience":
        return (
          <SpotlightExperienceTab
            isEditing={isEditing}
            experiences={experiences}
            onEditExperience={handleEditExperience}
            onAddExperience={handleEditExperience}
          />
        );
      case "About":
        return (
          <SpotlightAboutTab
            isEditing={isEditing}
            about={about}
            skills={skills}
            tools={tools}
            onEditAbout={handleEditAbout}
            onEditTools={handleEditTools}
          />
        );
      case "Contact":
        return (
          <SpotlightContactTab
            isEditing={isEditing}
            socialLinks={socialLinks}
            onEditContact={handleEditContact}
          />
        );
      case "Testimonials":
        return (
          <SpotlightTestimonialsTab
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
    <div className="w-full flex-1 flex flex-col gap-3 max-w-[640px] mx-auto relative min-h-screen font-['Inter'] transition-colors duration-700 bg-[#EFECE6] dark:bg-[#1A1A1A] custom-solid-x">
      <div className="w-full flex-1 flex flex-col pt-12 overflow-hidden">
        <SpotlightProfileHeader
          isEditing={isEditing}
          avatarSrc={avatarSrc}
          displayName={displayName}
          bio={bio}
          userRole={userRole}
          currentTime={currentTime}
          onEditProfile={handleEditProfile}
        />
        <SpotlightNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">{renderActiveTab()}</div>
      </div>
    </div>
  );
}
