import { getSidebarShiftWidth, isSidebarThatShifts, popovers, sidebars } from "@/lib/constant";
import { TEMPLATES_LIST, getTemplatePreviewImage } from "@/lib/templates";
import { formatTimestamp } from "@/lib/times";
import styles from "@/styles/domain.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/buttonNew";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import useClient from "@/hooks/useClient";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { removeCursor } from "@/lib/cursor";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";
import { cn } from "@/lib/utils";
import { _publish } from "@/network/post-request";
import queryClient from "@/network/queryClient";
import Cookies from "js-cookie";
import { Check, Copy, SettingsIcon } from "lucide-react";
import { useTheme } from "next-themes";
import LeftArrow from "../../../public/assets/svgs/left-arrow.svg";
import LinkIcon from "../../../public/assets/svgs/link.svg";
import MoonIcon from "../../../public/assets/svgs/moon.svg";
import SunIcon from "../../../public/assets/svgs/sun.svg";
import MemoAnalytics from "../icons/Analytics";
import MemoPower from "../icons/Power";
import MemoPreviewIcon from "../icons/PreviewIcon";
import MemoThemeIcon from "../icons/ThemeIcon";
import MobileMenuButton from "../MobileMenuButton";
import Popover from "../popover";
import Text from "../text";
import ThemePanel from "../ThemePanel";
import { SegmentedControl } from "../ui/segmented-control";
import MemoDFLogo from "../icons/DFLogo";
import { cursors, getWallpapers } from "./constants";
import { AvatarDropdown } from "./avatar-dropdown";
import { PublishDropdown } from "./publish-dropdown";

const templates = TEMPLATES_LIST;

export default function LegacyHeader({
  userDetails,
  setUserDetails,
  setPopoverMenu,
  popoverMenu,
  changeTheme,
  updateCache,
  cursor,
  changeCursor,
  changeTemplate,
  template,
  setShowUpgradeModal,
  wallpaper,
  changeWallpaper,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCopied, setCopied] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isMobileThemePopup, setIsMobileThemePopup] = useState(false);

  const isMobile = useIsMobile();
  const router = useRouter();
  const { theme } = useTheme();
  const { isClient } = useClient();
  const phEvent = usePostHogEvent();

  const {
    activeSidebar,
    openSidebar,
    closeSidebar,
    wallpaperEffects,
    updateWallpaperEffect,
    setUpgradeModalUnhideProject,
  } = useGlobalContext();

  const { username, latestPublishDate, email } = userDetails || {};

  const isMacOSTemplate =
    template == 4 &&
    (router.pathname === "/builder" ||
      router.pathname === "/project/[id]/editor" ||
      router.pathname === "/project/[id]/preview");

  const shouldShiftHeader = !isMobile && isSidebarThatShifts(activeSidebar);
  const wallpapers = getWallpapers(theme === "dark");
  const formatedValue = formatTimestamp(latestPublishDate);

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/account-settings");
    router.prefetch(`/portfolio-preview`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY <= 150);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("URL copied successfully");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleLogout = async () => {
    setUserDetails(null);
    setPopoverMenu(null);
    queryClient.removeQueries();
    Cookies.remove("df-token", { domain: process.env.NEXT_PUBLIC_BASE_DOMAIN });
    localStorage.removeItem("bottom_notification_seen");
    removeCursor();
    router.replace("/");
  };

  const handleUpdate = (open = false) => {
    setUpdateLoading(true);
    changeTemplate(template);
    const isFirstPublished = !latestPublishDate;
    _publish({ status: 1 })
      .then((res) => {
        setUserDetails((prev) => ({ ...prev, ...res?.data?.user }));
        setIsMobileThemePopup(false);
        updateCache("userDetails", res?.data?.user);
        if (isFirstPublished) {
          phEvent(POSTHOG_EVENT_NAMES.PORTFOLIO_PUBLISHED, { email, username, publish_type: "first_publish" });
        } else {
          phEvent(POSTHOG_EVENT_NAMES.EDIT_AFTER_PUBLISH, { email, username, publish_type: "updated" });
        }
        toast.success("Published successfully.");
        setPopoverMenu(open ? popovers.publishMenu : null);
      })
      .finally(() => setUpdateLoading(false));
  };

  const handleTheme = () => {
    if (activeSidebar === sidebars.theme) closeSidebar(true);
    else openSidebar(sidebars.theme);
  };

  const handleNavigation = () => {
    setPopoverMenu(null);
    router.push("/settings");
  };

  const renderTemplate = (templateId = 0) =>
    getTemplatePreviewImage(templateId, theme === "light" ? "light" : "dark");

  const getStyles = (i) =>
    i == cursor ? "bg-muted border-primary hover:bg-muted" : "";

  const getTemplateStyles = (i) =>
    i == template ? "bg-selected-cursor-bg-color hover:bg-selected-cursor-bg-color shadow-selected-cursor-shadow" : "";

  const headerStyle = isVisible ? "fixed top-0 left-0" : "fixed top-0 left-0 -translate-y-full";
  const headerZ = isMacOSTemplate
    ? popoverMenu ? "z-[10050]" : "z-[110]"
    : "z-50 py-2 md:py-6 px-2 md:px-0";

  return (
    <div
      className={cn(headerStyle, headerZ)}
      style={{
        right: shouldShiftHeader ? getSidebarShiftWidth(activeSidebar) : "0",
        transition: "transform 0.3s ease-out, right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className={cn(
          "shadow-df-section-card-shadow p-2 bg-df-header-bg-color flex justify-between items-center rounded-full",
          isMacOSTemplate ? "w-full rounded-none h-[62px]" : "max-w-[848px] mx-auto",
        )}
      >
        {/* Left — logo / mode switcher */}
        <div className="flex items-center gap-[24px]">
          {router.pathname === "/builder" ? (
            <div className="rounded-full bg-[#F6F2EF] p-1 border border-black/[0.03] dark:bg-muted/30 dark:border-border/50">
              <SegmentedControl
                layoutId="segmented-control-header"
                options={["Portfolio Builder", "AI Tools"]}
                value={router.query?.view === "ai-tools" ? "AI Tools" : "Portfolio Builder"}
                onChange={(id) => {
                  if (id === "AI Tools") {
                    router.push("/builder?view=ai-tools&type=optimize-resume", undefined, { shallow: true });
                  } else {
                    router.push("/builder", undefined, { shallow: true });
                  }
                }}
                className="!p-0 !bg-transparent !border-0 !backdrop-blur-none"
              />
            </div>
          ) : (
            <Link href="/builder">
              <MemoDFLogo className="text-df-icon-color h-5 sm:h-7 w-auto cursor-pointer ml-2" />
            </Link>
          )}
        </div>

        {/* Desktop right */}
        <div className="gap-3 items-center hidden md:flex">
          <div className="relative theme-button" data-popover-menu={popovers.themeMenu}>
            <Button onClick={handleTheme} variant="secondary" className="h-11 w-11 mr-3 rounded-full">
              <MemoThemeIcon className="!size-5" />
            </Button>
            <Link href="/analytics">
              <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full">
                <MemoAnalytics className="!size-5" />
              </Button>
            </Link>
            {isClient && (
              <ThemePanel
                theme={theme}
                changeTheme={changeTheme}
                template={template}
                changeTemplate={changeTemplate}
                templates={templates}
                renderTemplate={renderTemplate}
                getTemplateStyles={getTemplateStyles}
                cursor={cursor}
                handleChangeCursor={(i) => changeCursor(i)}
                cursors={cursors}
                getStyles={getStyles}
                wallpaper={wallpaper}
                changeWallpaper={changeWallpaper}
                wallpapers={wallpapers}
                effects={wallpaperEffects}
                updateWallpaperEffect={updateWallpaperEffect}
              />
            )}
          </div>

          <Button
            variant="secondary"
            className="rounded-full h-11 w-11"
            data-testid="button-preview"
            onClick={() => router.push("/portfolio-preview")}
          >
            <MemoPreviewIcon className="!size-5" />
          </Button>

          {/* Publish */}
          <PublishDropdown />

          {/* Avatar */}
          <AvatarDropdown />
        </div>

        {/* Mobile hamburger */}
        <MobileMenuButton
          isOpen={popovers.loggedInMenu === popoverMenu}
          onToggle={() =>
            setPopoverMenu((prev) => (prev === popovers.loggedInMenu ? null : popovers.loggedInMenu))
          }
        />

        {/* Mobile popover */}
        {isClient && (
          <Popover show={popovers.loggedInMenu === popoverMenu} className="left-0 top-[82px]">
            {!isMobileThemePopup ? (
              <div>
                <Button
                  variant="ghost"
                  className="w-full text-[14px] justify-between py-[10px] rounded-lg px-0 hover:bg-transparent transition-none"
                  onClick={handleNavigation}
                >
                  Account settings
                  <SettingsIcon className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-[14px] justify-between py-[10px] rounded-lg px-0 hover:bg-transparent transition-none"
                  onClick={handleLogout}
                >
                  Logout
                  <img src="/assets/svgs/logout.svg" alt="logout" className="w-4 h-4" />
                </Button>

                <Link href="/analytics">
                  <Button variant="secondary" className="h-11 px-4 mr-0 w-full mt-4 rounded-full">
                    <MemoAnalytics className="" />
                    Insights
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  className="h-11 px-4 w-full mt-4 rounded-full"
                  onClick={() => { setPopoverMenu(null); handleTheme(); }}
                >
                  <MemoThemeIcon className="w-4 h-4" />
                  Change theme
                </Button>

                <Button
                  className="h-11 px-4 mr-0 w-full mt-4 bg-foreground text-background hover:bg-foreground/90 rounded-full"
                  onClick={handleUpdate}
                >
                  <img src="/assets/svgs/power.svg" alt="publish" className="w-4 h-4" />
                  Publish Site
                </Button>

                <div className="w-full h-[2px] bg-placeholder-color my-4" />

                <div
                  className="flex gap-2 cursor-pointer justify-center items-start mr-5"
                  onClick={() =>
                    window.open(`https://${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`, "_blank")
                  }
                >
                  <div className="mt-1">
                    <LinkIcon className="text-icon-color" />
                  </div>
                  {username && (
                    <div>
                      <Text size="p-xxsmall" className="underline underline-offset-4">
                        {username}.designfolio.me
                      </Text>
                      <Text size="p-xxxsmall" className="text-df-secondary-text-color text-center mt-1">
                        {`Updated: ${formatedValue}`}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="transition-none rounded-full"
                  onClick={() => setIsMobileThemePopup(false)}
                >
                  <LeftArrow className="w-4 h-4" />
                  Go Back
                </Button>
                <Text size="p-small" className="text-popover-heading-color mt-4">
                  Appearance
                </Text>
                <Text className="text-df-secondary-text-color mt-4" size="p-xxsmall">
                  Choose your preferred theme
                </Text>
                <div className="flex gap-[24px] mt-2">
                  <div
                    onClick={() => changeTheme(0)}
                    className="w-full border bg-default-theme-box-bg-color border-default-theme-box-border-color hover:bg-default-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer"
                  >
                    <div className="flex justify-between items-center cursor-pointer">
                      <SunIcon className={theme == "dark" ? "text-icon-color" : "text-default-theme-selected-color"} />
                      {(theme == "light" || theme == undefined) && <img src="/assets/svgs/select.svg" alt="" />}
                    </div>
                    <p className="text-popover-heading-color font-inter font-[500] mt-4">Light mode</p>
                  </div>
                  <div
                    onClick={() => changeTheme(1)}
                    className="w-full border bg-theme-box-bg-color border-theme-box-border-color hover:bg-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer"
                  >
                    <div className="flex justify-between items-center cursor-pointer">
                      <MoonIcon className={theme !== "dark" ? "text-icon-color" : "text-default-theme-selected-color"} />
                      {theme == "dark" && <img src="/assets/svgs/select.svg" alt="" />}
                    </div>
                    <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] mt-4">
                      Dark mode
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Popover>
        )}
      </div>
    </div>
  );
}
