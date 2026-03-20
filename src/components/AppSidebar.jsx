import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import { useTheme } from "next-themes";
import { sidebars } from "@/lib/constant";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { getTemplatePreviewImage, TEMPLATES_LIST } from "@/lib/templates";
import { cursors, getWallpapers } from "./loggedInHeader/constants";
import ThemePanel from "./ThemePanel";
import AddWork from "./addWork";
import AddReview from "./addReview";
import FooterSettingsPanel from "./FooterSettingsPanel";
import AddAbout from "./addAbout";
import AddTools from "./addTools";
import AddProject from "./addProject";
import RearrangeProjectsSidebar from "./RearrangeProjectsSidebar";

const SIDEBAR_TITLES = {
  [sidebars.theme]: "Theme Settings",
  [sidebars.footer]: "Footer Settings",
  [sidebars.about]: "About",
  [sidebars.tools]: "Toolbox",
  [sidebars.sortProjects]: "Rearrange Projects",
};

export default function AppSidebar() {
  const {
    activeSidebar,
    closeSidebar,
    template,
    cursor,
    changeTemplate,
    changeCursor,
    wallpaper,
    changeWallpaper,
    changeTheme,
    wallpaperEffects,
    updateWallpaperEffect,
    selectedWork,
    selectedReview,
    selectedProject,
  } = useGlobalContext();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const wallpapers = getWallpapers(isDark);

  const renderTemplate = (templateId = 0) =>
    getTemplatePreviewImage(templateId, isDark ? "dark" : "light");

  const getTemplateStyles = (i) =>
    i === template
      ? "bg-selected-cursor-bg-color hover:bg-selected-cursor-bg-color shadow-selected-cursor-shadow"
      : "";

  const getStyles = (i) =>
    i === cursor ? "bg-muted border-primary hover:bg-muted" : "";

  const renderPanel = () => {
    switch (activeSidebar) {
      case sidebars.theme:
        return (
          <ThemePanel
            theme={theme}
            changeTheme={changeTheme}
            template={template}
            changeTemplate={changeTemplate}
            templates={TEMPLATES_LIST}
            renderTemplate={renderTemplate}
            getTemplateStyles={getTemplateStyles}
            cursor={cursor}
            handleChangeCursor={changeCursor}
            cursors={cursors}
            getStyles={getStyles}
            wallpaper={wallpaper}
            changeWallpaper={changeWallpaper}
            wallpapers={wallpapers}
            effects={wallpaperEffects}
            updateWallpaperEffect={updateWallpaperEffect}
          />
        );
      case sidebars.work:
        return <AddWork />;
      case sidebars.review:
        return <AddReview />;
      case sidebars.footer:
        return <FooterSettingsPanel />;
      case sidebars.about:
        return <AddAbout />;
      case sidebars.tools:
        return <AddTools />;
      case sidebars.project:
        return <AddProject />;
      case sidebars.sortProjects:
        return <RearrangeProjectsSidebar />;
      default:
        return null;
    }
  };

  const getDynamicTitle = () => {
    switch (activeSidebar) {
      case sidebars.work:
        return selectedWork?.role ? "Edit Work Experience" : "Work Experience";
      case sidebars.review:
        return selectedReview?.name ? "Edit Review" : "Reviews";
      case sidebars.project:
        return selectedProject?._id ? "Edit Project" : "Add Project";
      default:
        return SIDEBAR_TITLES[activeSidebar] || "";
    }
  };

  const title = getDynamicTitle();

  return (
    <Sidebar
      side="right"
      collapsible="offcanvas"
      className="border-l border-border"
    >
      <SidebarHeader className="flex flex-row items-center justify-between px-6 border-b border-border py-4">
        <h2 className=" text-[15px] font-medium">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => closeSidebar()}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden p-0">
        {renderPanel()}
      </SidebarContent>
    </Sidebar>
  );
}
