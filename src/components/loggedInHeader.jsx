import {
  popovers,
  sidebars,
  isSidebarThatShifts,
  getSidebarShiftWidth,
} from '@/lib/constant';
import { formatTimestamp } from '@/lib/times';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '@/styles/domain.module.css';
import Logo from '../../public/assets/svgs/logo.svg';
import ButtonOld from './button';
// import ThemeIcon from "../../public/assets/svgs/themeIcon.svg";
import CloseIcon from '../../public/assets/svgs/close.svg';
import SunIcon from '../../public/assets/svgs/sun.svg';
import MoonIcon from '../../public/assets/svgs/moon.svg';
import LinkIcon from '../../public/assets/svgs/link.svg';
import HamburgerIcon from '../../public/assets/svgs/hamburger.svg';
import LeftArrow from '../../public/assets/svgs/left-arrow.svg';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Text from './text';
import DfImage from './image';
import { Button } from '@/components/ui/buttonNew';
import Cookies from 'js-cookie';
import { _publish } from '@/network/post-request';
import Popover from './popover';
import queryClient from '@/network/queryClient';
import useClient from '@/hooks/useClient';
import { twMerge } from 'tailwind-merge';
import { removeCursor } from '@/lib/cursor';
import Modal from './modal';
import { Badge } from './ui/badge';
import { Check, Copy, SettingsIcon } from 'lucide-react';
import { getUserAvatarImage } from '@/lib/getAvatarUrl';
import MemoThemeIcon from './icons/ThemeIcon';
import MemoAnalytics from './icons/Analytics';
import MemoPreviewIcon from './icons/PreviewIcon';
import MemoPower from './icons/Power';
import { cn } from '@/lib/utils';
import MobileMenuButton from './MobileMenuButton';
import ThemePanel from './ThemePanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGlobalContext } from '@/context/globalContext';
import { modals } from '@/lib/constant';
import { usePostHogEvent } from '@/hooks/usePostHogEvent';
import { POSTHOG_EVENT_NAMES } from '@/lib/posthogEventNames';
import { SegmentedControl } from './ui/segmented-control';

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
  hidden: { x: '100%' },
  visible: { x: '0%' },
};

const templates = [
  {
    id: 1,
    value: 'default',
    item: 'Default',
    isNew: false,
  },
  {
    id: 2,
    value: 'chat',
    item: 'Chat Box',
    isNew: false,
  },
  {
    id: 3,
    value: 'prism',
    item: 'Prism',
    isNew: true,
  },
  {
    id: 4,
    value: 'pristine',
    item: 'Pristine',
    isNew: true,
  },
];

/* Wallpapers definition moved inside component to access theme */

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
  wallpaper,
  setWallpaper,
  changeWallpaper,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();
  const isThemePanelOpen = popoverMenu === popovers.themeMenu;
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const { theme } = useTheme();
  const [isCopied, setCopied] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isMobileThemePopup, setIsMobileThemePopup] = useState(false);

  const phEvent = usePostHogEvent();

  // Get activeSidebar and wallpaper effects from context
  const {
    activeSidebar,
    openSidebar,
    closeSidebar,
    wallpaperEffects,
    updateWallpaperEffect,
  } = useGlobalContext();
  const shouldShiftHeader = !isMobile && isSidebarThatShifts(activeSidebar);

  const { username, latestPublishDate, _id, email } = userDetails || {};
  const { isClient } = useClient();

  const wpPath = theme === 'dark' ? '/wallpaper/darkui' : '/wallpaper';
  const wallpapers = [
    {
      id: 1,
      value: 0,
      item: (
        <p className="text-[14px] md:text-[16px] text-popover-heading-color font-inter font-[500] cursor-pointer">
          Default
        </p>
      ),
    },
    {
      id: 1,
      value: 1,
      item: (
        <div
          className="w-full h-8 rounded"
          style={{
            backgroundImage: `url(${wpPath}/wall1.png)`,
            backgroundSize: 'cover',
          }}
        ></div>
      ),
    },
    {
      id: 2,
      value: 2,
      item: (
        <div
          className="w-full h-8 rounded"
          style={{
            backgroundImage: `url(${wpPath}/wall2.png)`,
            backgroundSize: 'cover',
          }}
        ></div>
      ),
    },
    {
      id: 3,
      value: 3,
      item: (
        <div
          className="w-full h-8 rounded"
          style={{
            backgroundImage: `url(${wpPath}/wall3.png)`,
            backgroundSize: 'cover',
          }}
        ></div>
      ),
    },
    {
      id: 4,
      value: 4,
      item: (
        <div
          className="w-full h-8 rounded"
          style={{
            backgroundImage: `url(${wpPath}/wall4.png)`,
            backgroundSize: 'cover',
          }}
        ></div>
      ),
    },
    {
      id: 5,
      value: 5,
      item: (
        <div
          className="w-full h-8 rounded"
          style={{
            backgroundImage: `url(${wpPath}/wall5.png)`,
            backgroundSize: 'cover',
          }}
        ></div>
      ),
    },
    {
      id: 6,
      value: 6,
      item: (
        <div
          className="w-full h-8 rounded"
          style={{
            backgroundImage: `url(${wpPath}/wall6.png)`,
            backgroundSize: 'cover',
          }}
        ></div>
      ),
    },
    {
      id: 7,
      value: 7,
      item: (
        <div
          className="w-full h-8 rounded"
          style={{
            backgroundImage: `url(${wpPath}/wall7.png)`,
            backgroundSize: 'cover',
          }}
        ></div>
      ),
    },
  ];

  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/account-settings');
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

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        `${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('URL copied successfully');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleLogout = async () => {
    setUserDetails(null);
    setPopoverMenu(null);
    queryClient.removeQueries();
    Cookies.remove('df-token', {
      domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
    });
    localStorage.removeItem('bottom_notification_seen');
    removeCursor();
    router.replace('/');
  };

  const handleUpdate = (open = false) => {
    setUpdateLoading(true);
    changeTemplate(template);

    const isFirstPublished = !latestPublishDate;
    _publish({ status: 1 })
      .then(res => {
        setUserDetails(prev => ({ ...prev, ...res?.data?.user }));

        setIsMobileThemePopup(false);
        updateCache('userDetails', res?.data?.user);
        if (isFirstPublished) {
          phEvent(POSTHOG_EVENT_NAMES.PORTFOLIO_PUBLISHED, {
            email,
            username,
            publish_type: 'first_publish',
          });
        } else {
          phEvent(POSTHOG_EVENT_NAMES.EDIT_AFTER_PUBLISH, {
            email,
            username,
            publish_type: 'updated',
          });
        }

        toast.success('Published successfully.');
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
    setPopoverMenu(prev =>
      prev == popovers.publishMenu ? null : popovers.publishMenu
    );
  };

  const handleTheme = () => {
    if (activeSidebar === sidebars.theme) {
      closeSidebar(true); // Force close if already open
    } else {
      openSidebar(sidebars.theme); // Open theme sidebar
    }
  };

  const handleCloseTheme = () => {
    closeSidebar(); // Close theme sidebar (will check for unsaved changes)
  };
  const handlenavigation = () => {
    setPopoverMenu(null);
    router.push('/settings');
  };

  const handleChangeCursor = i => {
    changeCursor(i);
  };

  const renderTemplate = (template = 'default') => {
    if (template == 'default') {
      if (theme == 'light') {
        return '/assets/png/white-default-theme.png';
      } else {
        return '/assets/png/dark-default-theme.png';
      }
    } else if (template == 'chat') {
      if (theme == 'light') {
        return '/assets/png/white-chat-box-theme.png';
      } else {
        return '/assets/png/dark-chat-box-theme.png';
      }
    } else if (template == 'prism') {
      if (theme == 'light') {
        return '/assets/png/prism-light.png';
      } else {
        return '/assets/png/prism-dark.png';
      }
    } else if (template == 'pristine') {
      if (theme == 'light') {
        return '/assets/png/pristine-light.png';
      } else {
        return '/assets/png/pristine-dark.png';
      }
    }
  };

  const getStyles = i => {
    if (i == cursor) {
      return `bg-selected-cursor-bg-color hover:bg-selected-cursor-bg-color shadow-selected-cursor-shadow`;
    } else {
      return '';
    }
  };

  const getTemplateStyles = i => {
    if (i == template) {
      return `bg-selected-cursor-bg-color hover:bg-selected-cursor-bg-color shadow-selected-cursor-shadow`;
    } else {
      return '';
    }
  };

  const formatedValue = formatTimestamp(latestPublishDate);

  const headerStyle = isVisible
    ? 'fixed top-0 left-0 transition-all duration-300 ease-out'
    : 'fixed top-0 left-0 transform translate-y-[-100%] transition-all duration-300 ease-out';

  return (
    <div
      className={cn(headerStyle, 'z-50 px-2 md:px-0 py-2 md:py-6')}
      style={{
        right: shouldShiftHeader ? getSidebarShiftWidth(activeSidebar) : '0',
      }}
    >
      <div className={cn(
        "shadow-df-section-card-shadow max-w-[848px] p-2 bg-df-header-bg-color mx-auto flex justify-between items-center",
        router.pathname === "/builder" ? "rounded-full" : "rounded-2xl"
      )}>
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
              <Logo className="text-df-base-text-color" />
            </Link>
          )}
        </div>
        <div className="gap-3 items-center hidden md:flex">
          {router.pathname === "/builder" && router.query?.view === "ai-tools" ? (
            <>
              <Link href="/builder">
                <Button
                  variant="secondary"
                >
                  Go to Builder
                </Button>
              </Link>
              <div
                className="relative inline-block text-left"
                data-popover-id={popovers.userMenu}
              >
                <DfImage
                  onClick={() =>
                    setPopoverMenu(prev =>
                      prev == popovers.userMenu ? null : popovers.userMenu
                    )
                  }
                  src={getUserAvatarImage(userDetails)}
                  className={cn(
                    'w-[44px] h-[44px] rounded-full cursor-pointer',
                    !userDetails?.avatar ? 'bg-df-bg-color' : ''
                  )}
                />

                {isClient && (
                  <div
                    className={`pt-5 absolute z-20 right-0 origin-top-right transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.userMenu
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-90 pointer-events-none'
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
            </>
          ) : (
            <>
              <div
                className="relative theme-button"
                data-popover-menu={popovers.themeMenu}
              >
                <Button
                  onClick={handleTheme}
                  variant="secondary"
                  className="h-11 w-11 mr-3 rounded-full"
                >
                  <MemoThemeIcon className="!size-5" />

                </Button>

                <Link href="/analytics">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                  >
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
                    handleChangeCursor={handleChangeCursor}
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
                // size="icon"
                className="rounded-full h-11 w-11"
                data-testid="button-preview"
                onClick={() => router.push('/portfolio-preview')}
              >
                <MemoPreviewIcon className="!size-5" />
              </Button>
              <div
                className="relative publish-button"
                data-popover-id={popovers.publishMenu}
              >
                <ButtonOld
                  text={'Publish Site'}
                  onClick={handlePublishBtn}
                  customClass="mr-0"
                  icon={<MemoPower className="w-4 h-4" />}
                  isDisabled={
                    (!userDetails?.pro &&
                      userDetails?.template &&
                      userDetails?.template !== 0) ||
                    updateLoading
                  }
                  animation
                />
                {isClient && (
                  <div
                    className={`pt-5 origin-top-right absolute z-20 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.publishMenu
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-90 pointer-events-none'
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
                                '_blank'
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
                    setPopoverMenu(prev =>
                      prev == popovers.userMenu ? null : popovers.userMenu
                    )
                  }
                  src={getUserAvatarImage(userDetails)}
                  className={cn(
                    'w-[44px] h-[44px] rounded-full cursor-pointer',
                    !userDetails?.avatar ? 'bg-df-bg-color' : ''
                  )}
                />

                {isClient && (
                  <div
                    className={`pt-5 absolute z-20 right-0 origin-top-right transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.userMenu
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-90 pointer-events-none'
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
            </>
          )}
        </div>
        <MobileMenuButton
          isOpen={popovers.loggedInMenu === popoverMenu}
          onToggle={() =>
            setPopoverMenu(prev =>
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
                {router.pathname === "/builder" && router.query?.view === "ai-tools" ? (
                  <>
                    <Link href="/builder" onClick={() => setPopoverMenu(null)}>
                      <Button
                        variant="secondary"

                      >

                        Go to Builder
                      </Button>
                    </Link>
                    <div className="w-full h-[2px] bg-placeholder-color my-2" />
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
                  </>
                ) : (
                  <>
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
                      onClick={() => {
                        setPopoverMenu(null); // Close mobile menu
                        handleTheme(); // Open theme sidebar
                      }}
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
                          '_blank'
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
                  </>
                )}
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
                            theme == 'dark'
                              ? 'text-icon-color'
                              : 'text-default-theme-selected-color'
                          }
                        />
                        {(theme == 'light' || theme == undefined) && (
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
                            theme !== 'dark'
                              ? 'text-icon-color'
                              : 'text-default-theme-selected-color'
                          }
                        />
                        {theme == 'dark' && (
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
