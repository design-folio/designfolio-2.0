import { popovers } from "@/lib/constant";
import { formatTimestamp } from "@/lib/times";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "@/styles/domain.module.css";
import Logo from "../../public/assets/svgs/logo.svg";
// import ThemeIcon from "../../public/assets/svgs/themeIcon.svg";
import CloseIcon from "../../public/assets/svgs/close.svg";
import SunIcon from "../../public/assets/svgs/sun.svg";
import MoonIcon from "../../public/assets/svgs/moon.svg";
import LinkIcon from "../../public/assets/svgs/link.svg";
import HamburgerIcon from "../../public/assets/svgs/hamburger.svg";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Text from "./text";
import DfImage from "./image";
import { Button } from "@/components/ui/buttonNew"
import Cookies from "js-cookie";
import { _publish } from "@/network/post-request";
import Popover from "./popover";
import queryClient from "@/network/queryClient";
import useClient from "@/hooks/useClient";
import { twMerge } from "tailwind-merge";
import { removeCursor } from "@/lib/cursor";
import Modal from "./modal";
import { Badge } from "./ui/badge";
import { Check, Copy, SettingsIcon } from "lucide-react";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import MemoThemeIcon from "./icons/ThemeIcon";
import MemoAnalytics from "./icons/Analytics";
import MemoPreviewIcon from "./icons/PreviewIcon";
import MemoPower from "./icons/Power";
import { cn } from "@/lib/utils";
import MobileMenuButton from "./MobileMenuButton";

const cursors = [
  {
    id: 1,
    item: (
      <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
        Default
      </p>
    ),
  },
  {
    id: 2,
    item: (
      <img
        src="/assets/svgs/default1.svg"
        alt="flight"
        className="cursor-pointer"
      />
    ),
  },
  {
    id: 3,
    item: (
      <img
        src="/assets/svgs/default2.svg"
        alt="flight"
        className="cursor-pointer"
      />
    ),
  },
  {
    id: 4,
    item: (
      <img
        src="/assets/svgs/default3.svg"
        alt="flight"
        className="cursor-pointer"
      />
    ),
  },
  {
    id: 5,
    item: (
      <img
        src="/assets/svgs/default4.svg"
        alt="flight"
        className="w-8 h-8 cursor-pointer"
      />
    ),
  },
  {
    id: 6,
    item: (
      <img
        src="/assets/svgs/default5.svg"
        alt="flight"
        className="cursor-pointer"
      />
    ),
  },
  {
    id: 7,
    item: (
      <img
        src="/assets/svgs/default6.svg"
        alt="flight"
        className="cursor-pointer"
      />
    ),
  },
];
const variants = {
  hidden: { x: "100%" },
  visible: { x: "0%" },
};

const templates = [
  {
    id: 1,
    value: "default",
    item: "Default",
    isNew: false,
  },
  {
    id: 2,
    value: "chat",
    item: "Chat Box",
    isNew: false,
  },
  {
    id: 3,
    value: "prism",
    item: "Prism",
    isNew: true,
  },
  {
    id: 4,
    value: "pristine",
    item: "Pristine",
    isNew: true,
  },
];

export default function LoggedInHeader({
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
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const { theme } = useTheme();
  const [isCopied, setCopied] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isMobileThemePopup, setIsMobileThemePopup] = useState(false);

  const { username, latestPublishDate, _id, email } = userDetails || {};
  const { isClient } = useClient();

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/account-settings");
    router.prefetch(`/portfolio-preview`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // useEffect(() => {
  //   if (emails.includes(email)) {
  //     templates.push({
  //       id: 4,
  //       value: "pristine",
  //       item: "Pristine",
  //       isNew: true,
  //     });
  //   }
  // }, [email]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Header is visible if scrolling down or at the top of the page
      if (currentScrollY < lastScrollY || currentScrollY <= 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        `${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`
      );
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
    Cookies.remove("df-token", {
      domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
    });
    removeCursor();
    router.replace("/");
  };

  const handleUpdate = (open = false) => {
    setUpdateLoading(true);
    changeTemplate(template);
    _publish({ status: 1 })
      .then((res) => {
        setUserDetails((prev) => ({ ...prev, ...res?.data?.user }));

        setIsMobileThemePopup(false);
        updateCache("userDetails", res?.data?.user);
        toast.success("Published successfully.");
        if (open) {
          setPopoverMenu(popovers.publishMenu);
        } else {
          setPopoverMenu(null);
        }
      })
      .finally(() => setUpdateLoading(false));
  };

  const goToDomains = () => {
    setPopoverMenu(null);
    setShowUpgradeModal(true);
  };

  const handlePublishBtn = () => {
    if (!latestPublishDate && template == 0) {
      return handleUpdate(true);
    }
    setPopoverMenu((prev) =>
      prev == popovers.publishMenu ? null : popovers.publishMenu
    );
  };

  const handleTheme = () => {
    setPopoverMenu((prev) =>
      prev == popovers.themeMenu ? null : popovers.themeMenu
    );
  };

  const handleCloseTheme = () => {
    setPopoverMenu(null);
  };
  const handlenavigation = () => {
    setPopoverMenu(null);
    router.push("/settings");
  };

  const handleChangeCursor = (i) => {
    changeCursor(i);
  };

  const renderTemplate = (template = "default") => {
    if (template == "default") {
      if (theme == "light") {
        return "/assets/png/white-default-theme.png";
      } else {
        return "/assets/png/dark-default-theme.png";
      }
    } else if (template == "chat") {
      if (theme == "light") {
        return "/assets/png/white-chat-box-theme.png";
      } else {
        return "/assets/png/dark-chat-box-theme.png";
      }
    } else if (template == "prism") {
      if (theme == "light") {
        return "/assets/png/prism-light.png";
      } else {
        return "/assets/png/prism-dark.png";
      }
    } else if (template == "pristine") {
      if (theme == "light") {
        return "/assets/png/pristine-light.png";
      } else {
        return "/assets/png/pristine-dark.png";
      }
    }
  };

  const getStyles = (i) => {
    if (i == cursor) {
      return `bg-selected-cursor-bg-color hover:bg-selected-cursor-bg-color shadow-selected-cursor-shadow`;
    } else {
      return "";
    }
  };

  const getTemplateStyles = (i) => {
    if (i == template) {
      return `bg-selected-cursor-bg-color hover:bg-selected-cursor-bg-color shadow-selected-cursor-shadow`;
    } else {
      return "";
    }
  };

  const formatedValue = formatTimestamp(latestPublishDate);

  const headerStyle = isVisible
    ? "fixed top-0 left-0 right-0 md:px-4 xl:px-0 z-10 transition-transform duration-300 ease-out"
    : "fixed top-0 left-0 right-0 md:px-4 xl:px-0 z-10 transform translate-y-[-100%] transition-transform duration-300 ease-out";

  return (
    <div
      className={`${headerStyle} z-50 px-2 md:px-0 py-2 md:py-6 bg-transparent`}
    >
      <div className="shadow-df-section-card-shadow max-w-[890px] p-3 border border-card-border md:!p-4 rounded-2xl bg-df-header-bg-color mx-auto flex justify-between items-center">
        <div className="flex items-center gap-[24px]">
          <Link href={"/builder"}>
            <Logo className="text-df-base-text-color" />
          </Link>
        </div>
        <div className="gap-[16px] items-center hidden md:flex">
          <div
            className="relative theme-button"
            data-popover-menu={popovers.themeMenu}
          >
            <Link href="/analytics">
              <Button
                variant="secondary"
                className="h-11 px-4 mr-4 rounded-full"
              >
                <MemoAnalytics className="!size-5" />
                Insights
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={handleTheme}
            >
              <MemoThemeIcon className="!size-5" />
            </Button>

            {isClient && (
              <Modal
                show={popoverMenu === popovers.themeMenu}
                className={"md:block"}
              >
                <motion.div
                  className="bg-modal-bg-color h-[95%] w-[95%] m-auto md:w-[602px] md:fixed md:top-[2.25%] md:right-4 flex flex-col rounded-2xl"
                  initial="hidden"
                  animate="visible"
                  variants={variants}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <header className="p-8 text-lg font-bold pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex gap-4 items-center">
                        <Button
                          size="icon"
                          className="rounded-md"
                          style={{ background: "var(--ai-btn-bg-color)" }}
                        >
                          <MemoThemeIcon className="text-secondary-btn-text-color w-[22px] h-[22px]" />
                        </Button>
                        <Text
                          size="p-small"
                          className="font-semibold font-inter"
                        >
                          Personalisation
                        </Text>
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-lg"
                        onClick={handleCloseTheme}
                      >
                        <CloseIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </header>
                  <div className="hide-scrollbar overflow-y-scroll p-8 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Text
                        size="p-xsmall"
                        className=" font-semibold text-popover-heading-color"
                      >
                        Appearance
                      </Text>
                      {/* <Button
                        type="secondary"
                        customClass="!p-2 rounded-[8px]"
                        icon={
                          <CloseIcon className="text-df-icon-color cursor-pointer" />
                        }
                        onClick={handleCloseTheme}
                      /> */}
                    </div>
                    <div>
                      <div className="flex gap-[16px] mt-3">
                        <div
                          onClick={() => changeTheme(0)}
                          className={`flex gap-[10px] w-full justify-center items-center border bg-default-theme-box-bg-color border-default-theme-box-border-color hover:bg-default-theme-bg-hover-color shadow-default-theme-shadow rounded-[16px] px-[32px] py-[16px] cursor-pointer`}
                        >
                          <SunIcon className={"cursor-pointer"} />
                          <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
                            Light
                          </p>
                        </div>
                        <div
                          onClick={() => changeTheme(1)}
                          className={`border flex gap-[10px] w-full justify-center bg-theme-box-bg-color border-theme-box-border-color hover:bg-theme-bg-hover-color shadow-theme-shadow rounded-[16px] px-[32px] py-[16px] cursor-pointer`}
                        >
                          <MoonIcon className={"cursor-pointer"} />
                          <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
                            Dark
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Text
                        size="p-xsmall"
                        className=" font-semibold text-popover-heading-color"
                      >
                        Template
                      </Text>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {templates.map((template, index) => (
                          <div
                            key={template.value}
                            onClick={() => changeTemplate(index)}
                            className={twMerge(
                              "px-4 py-6 flex flex-col justify-center items-center border rounded-[16px] cursor-pointer",
                              "bg-default-cursor-box-bg border-default-cursor-box-border",
                              "hover:bg-default-cursor-bg-hover",
                              getTemplateStyles(index) // This will dynamically add classes based on index
                            )}
                          >
                            <div className="flex gap-2 items-center mb-2">
                              <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
                                {template.item}
                              </p>
                              {template.isNew && (
                                <Badge className="bg-[#EE7F70] text-white text-[12px] font-medium">
                                  New
                                </Badge>
                              )}
                            </div>
                            <img
                              src={renderTemplate(template.value)}
                              alt=""
                              className="cursor-pointer"
                            />
                            {template?.id != 1 && (
                              <div
                                className={`mt-4 ${styles.templateBadgePro}`}
                              >
                                Pro
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-8">
                      <Text
                        size="p-xsmall"
                        className=" font-semibold text-popover-heading-color"
                      >
                        Cursor
                      </Text>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {cursors.map((cursor, index) => (
                          <div
                            key={index}
                            onClick={() => handleChangeCursor(index)}
                            className={twMerge(
                              "px-4 py-6 flex justify-center items-center border rounded-[16px] cursor-pointer",
                              "bg-default-cursor-box-bg border-default-cursor-box-border",
                              "hover:bg-default-cursor-bg-hover",
                              getStyles(index) // This will dynamically add classes based on index
                            )}
                          >
                            {cursor.item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Modal>
            )}
          </div>
          <Button
            variant="secondary"
            // size="icon"
            className="rounded-full h-11 w-11"
            data-testid="button-preview"
            onClick={() => router.push("/portfolio-preview")}
          >
            <MemoPreviewIcon className="!size-5" />
          </Button>
          <div
            className="relative publish-button"
            data-popover-id={popovers.publishMenu}
          >
            <Button
              className=""
              onClick={handlePublishBtn}
              disabled={
                (!userDetails?.pro &&
                  userDetails?.template &&
                  userDetails?.template !== 0) ||
                updateLoading
              }
            >
              <MemoPower className="w-4 h-4" />
              Publish Site
            </Button>
            {isClient && (
              <div
                className={`pt-5 origin-top-right absolute z-20 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.publishMenu
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
                  }`}
              >
                <div className=" w-[310px] rounded-xl shadow-lg bg-popover-bg-color border-4 border-solid border-popover-border-color">
                  <div className="p-4">
                    <div className="flex justify-between items-center gap-2 overflow-hidden">
                      <div
                        className="flex gap-2 cursor-pointer items-center min-w-0 flex-1"
                        onClick={() =>
                          window.open(
                            `https://${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`,
                            "_blank"
                          )
                        }
                      >
                        <div className="cursor-pointer min-w-0 flex-1">
                          <p className="text-base-text text-[16px] font-[500] font-sfpro cursor-pointer truncate">
                            {username}.{process.env.NEXT_PUBLIC_BASE_DOMAIN}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-lg h-8 w-8"
                        onClick={handleCopyText}
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-2 items-center mt-1">
                      <p className="text-description-text text-[12px] font-[400] font-inter cursor-pointer">
                        {`Updated: ${formatedValue}`}
                      </p>
                    </div>
                    {!userDetails?.pro && (
                      <>
                        <Button
                          variant="secondary"
                          className="w-full mt-4 gap-1 text-[13px] rounded-full"
                          disabled={updateLoading}
                          onClick={goToDomains}
                        >
                          Want your own domain?
                          <span className={styles.upgradeLink}>Go Pro</span>
                        </Button>
                        <hr className="mt-4 border-tools-card-item-border-color" />
                      </>
                    )}
                    <Button
                      className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90 rounded-full"
                      disabled={
                        (!userDetails?.pro &&
                          userDetails?.template &&
                          userDetails?.template !== 0) ||
                        updateLoading
                      }
                      onClick={handleUpdate}
                    >
                      Update changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="relative inline-block text-left"
            data-popover-id={popovers.userMenu}
          >
            <DfImage
              onClick={() =>
                setPopoverMenu((prev) =>
                  prev == popovers.userMenu ? null : popovers.userMenu
                )
              }
              src={
                getUserAvatarImage(userDetails)
              }
              className={cn("w-[44px] h-[44px] rounded-full cursor-pointer", !userDetails?.avatar ? "bg-[#FFB088]" : "")}
            />

            {isClient && (
              <div
                className={`pt-5 absolute z-20 right-0 origin-top-right transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.userMenu
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
                  }`}
              >
                <div className=" w-[250px] rounded-xl shadow-lg bg-popover-bg-color border-4 border-solid border-popover-border-color">
                  <div className="p-4">
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        className="w-full text-[14px] justify-start py-[10px] rounded-lg"
                        onClick={handlenavigation}
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Account settings
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full text-[14px] justify-start py-[10px] rounded-lg"
                        onClick={handleLogout}
                      >
                        <img
                          src="/assets/svgs/logout.svg"
                          alt="designfolio logo"
                          className="w-4 h-4"
                        />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <MobileMenuButton
          isOpen={popovers.loggedInMenu === popoverMenu}
          onToggle={() =>
            setPopoverMenu((prev) =>
              prev === popovers.loggedInMenu ? null : popovers.loggedInMenu
            )
          }
        />
        {isClient && (
          <Popover
            show={popovers.loggedInMenu === popoverMenu}
            className="left-0 top-[82px]"
          >
            {!isMobileThemePopup ? (
              <div>
                <Button
                  variant="ghost"
                  className="w-full text-[14px] justify-between py-[10px] rounded-lg px-0 hover:bg-transparent transition-none"
                  onClick={handlenavigation}
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
                  <img
                    src="/assets/svgs/logout.svg"
                    alt="designfolio logo"
                    className="w-4 h-4"
                  />
                </Button>

                <Link href="/analytics">
                  <Button
                    variant="secondary"
                    className="h-11 px-4 mr-0 w-full mt-4 rounded-full"
                  >
                    <MemoAnalytics className="" />
                    Insights
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="h-11 px-4 w-full mt-4 rounded-full"
                  onClick={() => setIsMobileThemePopup(true)}
                >
                  <MemoThemeIcon className="w-4 h-4" />
                  Change theme
                </Button>
                <Button
                  className="h-11 px-4 mr-0 w-full mt-4 bg-foreground text-background hover:bg-foreground/90 rounded-full"
                  onClick={handleUpdate}
                  disabled={!userDetails?.pro && userDetails?.template != 0}
                >
                  <img
                    src="/assets/svgs/power.svg"
                    alt="launch builder"
                    className="w-4 h-4"
                  />
                  Publish Site
                </Button>
                <div className="w-full h-[2px] bg-placeholder-color my-4" />
                <div
                  className="flex gap-2 cursor-pointer justify-center items-start mr-5"
                  onClick={() =>
                    window.open(
                      `https://${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`,
                      "_blank"
                    )
                  }
                >
                  <div className="mt-1">
                    <LinkIcon className="text-icon-color" />
                  </div>
                  {username && (
                    <div>
                      <Text
                        size="p-xxsmall"
                        className="underline underline-offset-4"
                      >
                        {username}.designfolio.me
                      </Text>
                      <Text
                        size="p-xxxsmall"
                        className="text-df-secondary-text-color text-center mt-1"
                      >
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
                <Text
                  size="p-small"
                  className="text-popover-heading-color mt-4"
                >
                  Appearance
                </Text>
                <div>
                  <Text
                    className="text-df-secondary-text-color mt-4"
                    size="p-xxsmall"
                  >
                    Choose your preferred theme
                  </Text>

                  <div className="flex gap-[24px] mt-2">
                    <div
                      onClick={() => changeTheme(0)}
                      className={`w-full border bg-default-theme-box-bg-color border-default-theme-box-border-color hover:bg-default-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer`}
                    >
                      <div className="flex justify-between items-center cursor-pointer">
                        <SunIcon
                          className={
                            theme == "dark"
                              ? "text-icon-color"
                              : "text-default-theme-selected-color"
                          }
                        />
                        {(theme == "light" || theme == undefined) && (
                          <img src="/assets/svgs/select.svg" alt="" />
                        )}
                      </div>
                      <p className="text-popover-heading-color font-inter font-[500] mt-4">
                        Light mode
                      </p>
                    </div>
                    <div
                      onClick={() => changeTheme(1)}
                      className={`w-full border bg-theme-box-bg-color border-theme-box-border-color hover:bg-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer`}
                    >
                      <div className="flex justify-between items-center cursor-pointer">
                        <MoonIcon
                          className={
                            theme !== "dark"
                              ? "text-icon-color"
                              : "text-default-theme-selected-color"
                          }
                        />
                        {theme == "dark" && (
                          <img src="/assets/svgs/select.svg" alt="" />
                        )}
                      </div>
                      <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] mt-4">
                        Dark mode
                      </p>
                    </div>
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
