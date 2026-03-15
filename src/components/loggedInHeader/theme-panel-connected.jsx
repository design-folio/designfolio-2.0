import { useTheme } from "next-themes";
import { useGlobalContext } from "@/context/globalContext";
import { getTemplatePreviewImage, TEMPLATES_LIST } from "@/lib/templates";
import ThemePanel from "../ThemePanel";
import { cursors, getWallpapers } from "./constants";

export default function ThemePanelConnected({
  changeTheme,
  changeTemplate,
  template,
  cursor,
  changeCursor,
  wallpaper,
  changeWallpaper,
}) {
  const { theme } = useTheme();
  const { wallpaperEffects, updateWallpaperEffect } = useGlobalContext();

  const isDark = theme === "dark";
  const wallpapers = getWallpapers(isDark);

  const renderTemplate = (templateId = 0) =>
    getTemplatePreviewImage(templateId, isDark ? "dark" : "light");

  const getTemplateStyles = (i) =>
    i == template
      ? "bg-selected-cursor-bg-color hover:bg-selected-cursor-bg-color shadow-selected-cursor-shadow"
      : "";

  const getStyles = (i) =>
    i == cursor ? "bg-muted border-primary hover:bg-muted" : "";

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
}
