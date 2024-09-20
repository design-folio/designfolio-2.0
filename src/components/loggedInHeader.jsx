import { popovers } from "@/lib/constant";
import { formatTimestamp } from "@/lib/times";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Logo from "../../public/assets/svgs/logo.svg";
import ThemeIcon from "../../public/assets/svgs/themeIcon.svg";
import CloseIcon from "../../public/assets/svgs/close.svg";
import SunIcon from "../../public/assets/svgs/sun.svg";
import MoonIcon from "../../public/assets/svgs/moon.svg";
import PreviewIcon from "../../public/assets/svgs/previewIcon.svg";
import LinkIcon from "../../public/assets/svgs/link.svg";
import CopyIcon from "../../public/assets/svgs/copy.svg";
import TickIcon from "../../public/assets/svgs/tick.svg";
import HamburgerIcon from "../../public/assets/svgs/hamburger.svg";
import SettingIcon from "../../public/assets/svgs/settings.svg";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";

import Button from "./button";
import { useTheme } from "next-themes";
import Text from "./text";
import DfImage from "./image";
import Cookies from "js-cookie";
import { _publish } from "@/network/post-request";
import Popover from "./popover";
import queryClient from "@/network/queryClient";

export default function LoggedInHeader({
  userDetails,
  setPopoverMenu,
  popoverMenu,
  changeTheme,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [isCopied, setCopied] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isMobileThemePopup, setIsMobileThemePopup] = useState(false);

  const { avatar, firstName, username, latestPublishDate } = userDetails || {};

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/account-settings");
    router.prefetch(`/profile-preview`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Header is visible if scrolling down or at the top of the page
      if (currentScrollY < lastScrollY || currentScrollY <= 0) {
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
    setPopoverMenu(null);
    queryClient.removeQueries();
    Cookies.remove("df-token", {
      domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
    });
    window.location.reload();
  };

  const handleUpdate = () => {
    setUpdateLoading(true);
    _publish({ status: 1 })
      .then((res) => {
        setPopoverMenu(null);
        setIsMobileThemePopup(false);
        toast.success("Published successfully.");
      })
      .finally(() => setUpdateLoading(false));
  };

  const handlePublishBtn = () => {
    if (!latestPublishDate) {
      handleUpdate();
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

  const formatedValue = formatTimestamp(latestPublishDate);

  const headerStyle = isVisible
    ? "fixed top-0 left-0 right-0 md:px-10 xl:px-0 z-10 transition-transform duration-300 ease-out"
    : "fixed top-0 left-0 right-0 md:px-10 xl:px-0 z-10 transform translate-y-[-100%] transition-transform duration-300 ease-out";

  return (
    <div className={`${headerStyle} px-3 md:px-0 py-2 md:py-5 `}>
      <div className="shadow-header-shadow max-w-[890px] p-3 md:px-[32px] md:!py-4 rounded-[24px] bg-header-bg-color mx-auto flex justify-between items-center">
        <div className="flex items-center gap-[24px]">
          <Link href={"/builder"}>
            <Logo className="text-logo-text-color" />
          </Link>
        </div>
        <div className="gap-[16px] items-center hidden md:flex">
          <div className="relative theme-button">
            <Button
              icon={<ThemeIcon className="text-icon-color" />}
              onClick={handleTheme}
              type="secondary"
              customClass="!p-4"
            />
            <div
              className={`pt-[21px] origin-top-right absolute z-20 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
                popoverMenu === popovers.themeMenu
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div className="w-[545.5px]  rounded-lg shadow-dropdown bg-theme-bg-color border-theme-border-color focus:outline-none">
                <div className="flex justify-between items-center p-5">
                  <Text
                    as="h3"
                    size="p-medium"
                    className="text-[18px] md:text-[25px] font-medium text-popover-heading-color"
                  >
                    Appearance Settings
                  </Text>
                  <Button
                    type="secondary"
                    customClass="!p-2 rounded-[8px]"
                    icon={<CloseIcon className="text-icon-color" />}
                    onClick={handleCloseTheme}
                  />
                </div>
                <div className="px-5 py-2">
                  <Text
                    size="p-small"
                    className="text-[14px] md:text-[16px] font-medium  text-popover-heading-color"
                  >
                    Choose your preferred theme
                  </Text>

                  <div className="flex gap-[24px] mt-3">
                    <div
                      onClick={() => changeTheme(0)}
                      className={`w-full border bg-default-theme-box-bg-color border-default-theme-box-border-color hover:bg-default-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer`}
                    >
                      <div className="flex justify-between items-center">
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
                      <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] mt-4">
                        Light mode
                      </p>
                    </div>
                    <div
                      onClick={() => changeTheme(1)}
                      className={`w-full border bg-theme-box-bg-color border-theme-box-border-color hover:bg-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer`}
                    >
                      <div className="flex justify-between items-center">
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

                  <Text
                    size="xxsmall"
                    className="text-xs font-medium text-popover-heading-color mt-2"
                  >
                    💫 More theme settings and templates coming soon! Keep an
                    eye.
                  </Text>
                </div>
              </div>
            </div>
          </div>
          <Button
            icon={<PreviewIcon />}
            type="secondary"
            customClass="!p-4"
            animation
          />
          <div className="relative publish-button">
            <Button
              text={"Publish Site"}
              onClick={handlePublishBtn}
              customClass="!p-4 mr-0"
              icon={<img src="/assets/svgs/power.svg" alt="launch builder" />}
              animation
            />
            <div
              className={`pt-5 origin-top-right absolute z-20 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
                popoverMenu === popovers.publishMenu
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div className=" w-[310px]  rounded-lg shadow-dropdown bg-theme-bg-color border-theme-border-color focus:outline-none">
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div
                      className="flex gap-2 cursor-pointer items-center"
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
                      <div>
                        <p className="text-base-text text-[14px] font-[500] font-sfpro underline underline-offset-4">
                          {username}.designfolio.me
                        </p>
                        <p className="text-description-text text-[12px] font-[400] font-inter mt-1">
                          {`Updated: ${formatedValue}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      icon={
                        isCopied ? (
                          <TickIcon className="text-icon-color" />
                        ) : (
                          <CopyIcon className="text-icon-color" />
                        )
                      }
                      type="secondary"
                      customClass="p-2 rounded-lg pointer-events"
                      onClick={handleCopyText}
                    />
                  </div>

                  <Button
                    customClass="w-full mt-4"
                    text="Update changes"
                    isDisabled={updateLoading}
                    onClick={handleUpdate}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative inline-block text-left">
            <DfImage
              onClick={() =>
                setPopoverMenu((prev) =>
                  prev == popovers.userMenu ? null : popovers.userMenu
                )
              }
              src={
                userDetails?.avatar?.url
                  ? userDetails?.avatar?.url
                  : "/assets/svgs/avatar.svg"
              }
              className={"w-[60px] h-[60px] rounded-2xl cursor-pointer"}
            />

            <div
              className={`pt-5 absolute z-20 right-0 origin-top-right transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
                popoverMenu === popovers.userMenu
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div className=" w-[310px] rounded-lg shadow-dropdown bg-theme-bg-color border-theme-border-color focus:outline-none">
                <div className="p-4">
                  <div className="py-1">
                    <Button
                      text={"Account settings"}
                      customClass="w-full text-[14px] justify-start py-[10px] rounded-lg"
                      type="normal"
                      onClick={handlenavigation}
                      icon={<SettingIcon className="text-icon-color" />}
                    />

                    <Button
                      text={"Logout"}
                      customClass="w-full text-[14px] justify-start py-[10px] rounded-lg"
                      type="normal"
                      onClick={handleLogout}
                      icon={
                        <img
                          src="/assets/svgs/logout.svg"
                          alt="designfolio logo"
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button
          customClass="md:hidden"
          type="secondary"
          icon={
            <>
              <HamburgerIcon
                className={`mb-[4.67px] transition-transform text-icon-color easeInOut ${
                  popovers.loggedInMenu === popoverMenu &&
                  "translate-y-3.2 rotate-45"
                }`}
              />
              <HamburgerIcon
                className={`transition-transform text-icon-color easeInOut ${
                  popovers.loggedInMenu === popoverMenu &&
                  "-rotate-45 -translate-y-3.2"
                }`}
              />
            </>
          }
          onClick={() =>
            setPopoverMenu((prev) =>
              prev == popovers.loggedInMenu ? null : popovers.loggedInMenu
            )
          }
        />
        <Popover
          show={popovers.loggedInMenu === popoverMenu}
          className="left-0"
        >
          {!isMobileThemePopup ? (
            <div>
              <Button
                text={"Account settings"}
                customClass="w-full text-[14px] justify-between py-[10px] rounded-lg px-0 hover:bg-transparent !transition-none"
                type="normal"
                onClick={handlenavigation}
                iconPosition="right"
                icon={<SettingIcon className="text-icon-color" />}
              />

              <Button
                text={"Logout"}
                customClass="w-full text-[14px]  justify-between py-[10px] rounded-lg px-0 hover:bg-transparent !transition-none"
                type="normal"
                onClick={handleLogout}
                iconPosition="right"
                icon={
                  <img src="/assets/svgs/logout.svg" alt="designfolio logo" />
                }
              />
              <Button
                icon={<ThemeIcon className="text-icon-color" />}
                onClick={() => setIsMobileThemePopup(true)}
                type="secondary"
                customClass="!p-4 w-full mt-4"
                text={"Change theme"}
              />
              <Button
                text={"Publish Site"}
                onClick={handleUpdate}
                customClass="!p-4 mr-0 w-full mt-4"
                icon={<img src="/assets/svgs/power.svg" alt="launch builder" />}
                animation
              />
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
                <div>
                  <p className="text-base-text text-[14px] font-[500] font-sfpro underline underline-offset-4 text-center">
                    {username}.designfolio.me
                  </p>
                  <p className="text-description-text text-[12px] font-[400] font-inter mt-1 text-center">
                    {`Updated: ${formatedValue}`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Button
                text="Go Back"
                onClick={() => setIsMobileThemePopup(false)}
                type="secondary"
                size="small"
                customClass="!transition-none"
                icon={<LeftArrow />}
              />
              <Text
                size="p-xsmall"
                className="text-[16px] font-medium text-popover-heading-color mt-4"
              >
                Appearance Settings
              </Text>
              <div>
                <Text
                  size="p-xxsmall"
                  className="text-[14px] font-medium  text-popover-heading-color mt-2"
                >
                  Choose your preferred theme
                </Text>

                <div className="flex gap-[24px] mt-3">
                  <div
                    onClick={() => changeTheme(0)}
                    className={`w-full border bg-default-theme-box-bg-color border-default-theme-box-border-color hover:bg-default-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer`}
                  >
                    <div className="flex justify-between items-center">
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
                    <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] mt-4">
                      Light mode
                    </p>
                  </div>
                  <div
                    onClick={() => changeTheme(1)}
                    className={`w-full border bg-theme-box-bg-color border-theme-box-border-color hover:bg-theme-bg-hover-color rounded-[8px] p-[10px] cursor-pointer`}
                  >
                    <div className="flex justify-between items-center">
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

                <Text
                  size="xxsmall"
                  className="text-xs leading-5 font-medium text-popover-heading-color mt-2"
                >
                  💫 More theme settings and templates coming soon! Keep an eye.
                </Text>
              </div>
            </div>
          )}
        </Popover>
      </div>
    </div>
  );
}
