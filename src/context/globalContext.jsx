import { setCursorvalue } from "@/lib/cursor";
import {
  getWallpaperUrl,
  extractWallpaperValue,
  extractWallpaperMode,
  extractWallpaperColor,
  resolveBackgroundColor,
  hasNoWallpaper,
  BACKGROUND_MODE,
} from "@/lib/wallpaper";
import { useRouter } from "next/router";
import { mapPendingPortfolioToUpdatePayload } from "@/lib/mapPendingPortfolioToUpdatePayload";
import {
  _getDomainDetails,
  _getUserDetails,
  _getPersonas,
  _getTools,
  _getUserQuota,
} from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import queryClient from "@/network/queryClient";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import {
  popovers,
  sidebars,
  DEFAULT_SECTION_ORDER,
  modals,
  resolveContainerWidth,
} from "@/lib/constant";
import { TEMPLATES_BY_ID } from "@/lib/templates";
import { DEFAULT_TYPOGRAPHY, normalizeTypography } from "@/lib/typography";
import { useDebouncedCallback } from "use-debounce";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  startTransition,
} from "react";

// Create a new context instance
const GlobalContext = createContext();

// Custom hook to use the GlobalContext
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

// Provider component to wrap your app and provide the context
export const GlobalProvider = ({ children }) => {
  const router = useRouter();
  const [popoverMenu, setPopoverMenu] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isUserDetailsFromCache, setIsUserDetailsFromCache] = useState(false);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [taskPercentage, setTaskPercentage] = useState(0);
  const [checkList, setCheckList] = useState([
    { name: "Add at least 1 Case Study", checked: false },
    { name: "Add Skills", checked: false },
    { name: "Add Experience", checked: false },
    { name: "Add Testimonials", checked: false },
  ]);
  const [showModal, setShowModal] = useState(null);
  const [step, setStep] = useState(1);
  const projectRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const [projectValue, setProjectValue] = useState(null);
  const [cursor, setCursor] = useState(0);
  const [template, setTemplate] = useState(0);

  // Sync data-template attribute on <html> for theme.css accent overrides
  useEffect(() => {
    if (router.pathname === "/project/[id]") return;
    const templateValue = TEMPLATES_BY_ID[template]?.value ?? "canvas";
    document.documentElement.dataset.template = templateValue;
  }, [template, router.pathname]);

  // Re-set data-template after every client-side navigation. Public pages (project/[id]/index)
  // clean up the attribute on unmount; this ensures globalContext restores it for the next page.
  useEffect(() => {
    const handleRouteChangeComplete = (url) => {
      if (url.startsWith("/project/")) return;
      const templateValue = TEMPLATES_BY_ID[template]?.value ?? "canvas";
      document.documentElement.dataset.template = templateValue;
    };
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => router.events.off("routeChangeComplete", handleRouteChangeComplete);
  }, [router.events, template]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  /** When set, upgrade modal shows "Unhide [title]?" and message about 2 visible projects limit */
  const [upgradeModalUnhideProject, setUpgradeModalUnhideProject] = useState(null);
  /** When set, upgrade modal shows a feature-specific title. Values: 'write-ai' | 'analyze' | 'fit-analysis' | 'resume' | 'cover-letter' | 'mock-interview' | null */
  const [upgradeModalSource, setUpgradeModalSource] = useState(null);
  /** When source is a job tool, carries { role, company, logoUrl } for the job context row */
  const [upgradeModalJob, setUpgradeModalJob] = useState(null);
  /** Cached AI writing credits remaining. null = not yet fetched. */
  const [_aiWritingCredits, _setAiWritingCredits] = useState(null);
  /** Case study analysis credits. null = not yet fetched. */
  const [analysisCreditsRemaining, setAnalysisCreditsRemaining] = useState(null);
  const [analysisCreditsLimit, setAnalysisCreditsLimit] = useState(2);
  const [domainDetails, setDomainDetails] = useState(null);
  const [wallpaper, setWallpaper] = useState(0);
  const [wallpaperEffects, setWallpaperEffects] = useState({
    blur: 0,
    effectType: "blur",
    grainIntensity: 25,
    motion: true,
  });
  // Solid background colour (light hex, e.g. "#FFD6E0") stored inside wallpaper.color.
  // null = no colour (an image wallpaper or nothing). Mutually exclusive with an image.
  const [wallpaperColor, setWallpaperColor] = useState(null);
  // Background display mode for the wallpaper: 0 = full-page, 1 = header-only.
  const [backgroundMode, setBackgroundMode] = useState(BACKGROUND_MODE.FULL_PAGE);
  // Content max-width (px). null = fall back to the active template's default.
  const [containerWidth, setContainerWidth] = useState(null);
  // Typography scale: 0 = compact, 1 = expressive.
  const [typography, setTypography] = useState(DEFAULT_TYPOGRAPHY);
  const containerWidthSaveTimer = useRef(null);

  // Sync data-typography on <html> so typography.css can scale --tpg-scale (mirrors data-template).
  useEffect(() => {
    document.documentElement.dataset.typography = String(typography);
  }, [typography]);

  // Resolved content max-width (px) for the active template, or null when the template
  // has no width setting (RetroOS). Consumers apply this as maxWidth on the centered wrapper.
  const containerMaxWidth = useMemo(
    () => resolveContainerWidth(template, containerWidth),
    [template, containerWidth]
  );
  const isHeaderMode = backgroundMode === BACKGROUND_MODE.HEADER;

  const [viewerThemeOverride, setViewerThemeOverride] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingSidebarAction, setPendingSidebarAction] = useState(null);
  const [isSwitchingSidebar, setIsSwitchingSidebar] = useState(false);
  const [pendingReplaceAwaitingConfirmation, setPendingReplaceAwaitingConfirmation] =
    useState(false);
  const unsavedChangesCheckers = useRef({});
  const userDetailsRef = useRef(userDetails);
  const isUpdatingEffectsFromAPI = useRef(false);
  const effectsInitializedRef = useRef(false);
  const pendingPrefillAppliedRef = useRef(false);
  const { setTheme, theme, resolvedTheme } = useTheme();

  // Fetch user details
  const {
    data,
    isLoading,
    isStale: userDetailsIsState,
    refetch: userDetailsRefecth,
  } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const response = await _getUserDetails(); // Adjust the endpoint
      return response.data;
    },
    enabled: !!Cookies.get("df-token") && isUserDetailsFromCache,
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      const popoverElement = document.querySelector(`[data-popover-id="${popoverMenu}"]`);

      if (popoverElement && !popoverElement.contains(event.target)) {
        setPopoverMenu(null);
      }
    };

    const handleScroll = () => {
      if (popoverMenu !== popovers.themeMenu) {
        setPopoverMenu(null);
      }
    };

    if (showModal || popoverMenu) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [showModal, popoverMenu]);

  // Keep userDetailsRef in sync with userDetails
  useEffect(() => {
    userDetailsRef.current = userDetails;
  }, [userDetails]);

  useEffect(() => {
    if (data && !userDetailsIsState) {
      const userData = data?.user;
      const prevUserDetails = userDetailsRef.current;

      // Skip update if projects are ONLY reordered (same IDs, different order, same data)
      const oldProjectIds = prevUserDetails?.projects?.map((p) => p._id) || [];
      const newProjectIds = userData?.projects?.map((p) => p._id) || [];
      const sameIdsDifferentOrder =
        prevUserDetails &&
        oldProjectIds.length === newProjectIds.length &&
        oldProjectIds.every((id) => newProjectIds.includes(id)) &&
        JSON.stringify(oldProjectIds) !== JSON.stringify(newProjectIds);

      if (sameIdsDifferentOrder) return;

      // Template 4 (macOS) is always light mode
      const isTemplate4 = userData?.template === 4;

      const wp = userData?.wallpaper;
      const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
      const wpEffects = userData?.wallpaper?.effects;
      const wpMode = extractWallpaperMode(wp);
      const wpColor = extractWallpaperColor(wp);

      // Helper to check if effects object has valid values (not all null/undefined)
      const hasValidEffects =
        wpEffects &&
        typeof wpEffects === "object" &&
        ((wpEffects.blur !== null && wpEffects.blur !== undefined) ||
          (wpEffects.effectType !== null && wpEffects.effectType !== undefined) ||
          (wpEffects.grainIntensity !== null && wpEffects.grainIntensity !== undefined) ||
          (wpEffects.motion !== null && wpEffects.motion !== undefined));

      let newWallpaperEffects = null;
      if (!effectsInitializedRef.current) {
        isUpdatingEffectsFromAPI.current = true;
        if (hasValidEffects) {
          const sanitizedEffects = Object.fromEntries(
            Object.entries(wpEffects).filter(([key, v]) => {
              if (v === null || v === undefined) return false;
              if (key === "motion" && v === false) return false;
              if (key === "grainIntensity" && v === 0) return false;
              return true;
            })
          );
          newWallpaperEffects = {
            blur: 0,
            effectType: "blur",
            grainIntensity: 25,
            motion: true,
            ...sanitizedEffects,
          };
        } else {
          newWallpaperEffects = { blur: 0, effectType: "blur", grainIntensity: 25, motion: true };
        }
        effectsInitializedRef.current = true;
      }

      // Merge sectionOrder: prefer existing custom order when API returns default (avoids overwriting with stale refetch)
      const mergedUserData = { ...userData };
      const incomingOrder = userData?.sectionOrder;
      const prevOrder = prevUserDetails?.sectionOrder;
      const defaultStr = JSON.stringify(DEFAULT_SECTION_ORDER);
      if (incomingOrder && prevOrder) {
        const incomingStr = JSON.stringify(incomingOrder);
        const prevStr = JSON.stringify(prevOrder);
        if (incomingStr === defaultStr && prevStr !== defaultStr) {
          mergedUserData.sectionOrder = prevOrder;
        }
      } else if (!incomingOrder && prevOrder) {
        mergedUserData.sectionOrder = prevOrder;
      }

      startTransition(() => {
        if (isTemplate4) {
          setTheme("light");
        } else if (userData?.theme != null && !viewerThemeOverride) {
          setTheme(userData.theme == 1 ? "dark" : "light");
        }
        setCursor(userData?.cursor ? userData?.cursor : 0);
        setTemplate(userData?.template ? userData?.template : 0);
        setWallpaper(wpValue !== undefined ? wpValue : 0);
        if (newWallpaperEffects) setWallpaperEffects(newWallpaperEffects);
        setBackgroundMode(wpMode);
        setWallpaperColor(wpColor);
        setContainerWidth(userData?.containerWidth ?? null);
        setTypography(normalizeTypography(userData?.typography));
        setUserDetails(mergedUserData);
        setIsUserDetailsFromCache(true);
        setCheckList((prevList) => {
          const newList = prevList.map((item) => {
            switch (item.name) {
              case "Add at least 1 Case Study":
                return { ...item, checked: userData?.projects?.length > 0 };
              case "Add Skills":
                return { ...item, checked: userData?.skills?.length > 0 };
              case "Add Experience":
                return { ...item, checked: userData?.experiences?.length > 0 };
              case "Add Testimonials":
                return { ...item, checked: userData?.reviews?.length > 0 };
              default:
                return item;
            }
          });
          const completedTasks = newList.filter((item) => item.checked).length;
          setIsTaskCompleted(completedTasks === newList.length);
          setTaskPercentage((completedTasks / newList.length) * 100);
          return newList;
        });
      });
    }
  }, [data, userDetailsIsState, setTheme, viewerThemeOverride]);

  useEffect(() => {
    setCursorvalue(cursor);
  }, [cursor]);

  const fetchDomainDetails = useCallback(() => {
    _getDomainDetails().then((res) => {
      setDomainDetails(res.data);
    });
  }, []);

  useEffect(() => {
    if (userDetails?.pro) {
      fetchDomainDetails();
    }
  }, [userDetails?.pro, fetchDomainDetails]);

  // Compute wallpaper URL centrally - handles object and primitive values
  const wallpaperUrl = useMemo(() => {
    const wp = wallpaper;
    const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
    const currentTheme = resolvedTheme || theme;
    return getWallpaperUrl(wpValue ?? 0, currentTheme, template);
  }, [wallpaper, resolvedTheme, theme, template]);

  // Solid background colour resolved for the active theme (pastels swap to their dark
  // variant in dark mode; custom colours render as-is). null when no colour is set.
  const wallpaperColorResolved = useMemo(() => {
    const currentTheme = resolvedTheme || theme;
    return resolveBackgroundColor(wallpaperColor, currentTheme);
  }, [wallpaperColor, resolvedTheme, theme]);

  const hasWallpaper = !hasNoWallpaper(wallpaper, template) || !!wallpaperColorResolved;

  const updateCache = useCallback((key, data) => {
    queryClient.setQueriesData({ queryKey: [key] }, (oldData) => {
      const existingUser = oldData?.user;
      const newUser =
        typeof data === "function" ? data(existingUser) : { ...existingUser, ...data };
      return { user: newUser };
    });
  }, []);

  const applyPendingPortfolio = useCallback(() => {
    if (pendingPrefillAppliedRef.current || typeof window === "undefined") return;
    const raw = localStorage.getItem("pending-portfolio-data");
    if (!raw) return;
    try {
      const content = JSON.parse(raw);
      pendingPrefillAppliedRef.current = true;
      setPendingReplaceAwaitingConfirmation(false);
      Promise.all([
        _getPersonas()
          .then((res) => res?.data?.personas || [])
          .catch(() => []),
        _getTools()
          .then((res) => res?.data?.tools || [])
          .catch(() => []),
      ])
        .then(([personas, tools]) => {
          const payload = mapPendingPortfolioToUpdatePayload(content, personas, tools);
          if (payload) return _updateUser(payload);
          localStorage.removeItem("pending-portfolio-data");
        })
        .then((res) => {
          if (res?.data?.user) {
            localStorage.removeItem("pending-portfolio-data");
            updateCache("userDetails", res.data.user);
            setUserDetails(res.data.user);
            userDetailsRefecth();
          }
        })
        .catch(() => {
          pendingPrefillAppliedRef.current = false;
          localStorage.removeItem("pending-portfolio-data");
        });
    } catch {
      localStorage.removeItem("pending-portfolio-data");
    }
  }, [setUserDetails, updateCache, userDetailsRefecth]);

  const discardPendingPortfolio = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pending-portfolio-data");
    }
    setPendingReplaceAwaitingConfirmation(false);
  }, []);

  // Post-signup prefill: apply pending-portfolio-data (from landing Analyze flow) once, or ask on builder if user has existing profile
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !userDetails ||
      pendingPrefillAppliedRef.current ||
      !Cookies.get("df-token")
    ) {
      return;
    }
    const raw = localStorage.getItem("pending-portfolio-data");
    if (!raw) return;
    const hasExistingProfile =
      (Array.isArray(userDetails.projects) && userDetails.projects.length > 0) ||
      !!(userDetails.user?.aboutMe || userDetails.user?.name || userDetails.aboutMe);
    if (hasExistingProfile) {
      startTransition(() => setPendingReplaceAwaitingConfirmation(true));
      return;
    }
    startTransition(() => applyPendingPortfolio());
  }, [userDetails, applyPendingPortfolio]);

  const changeCursor = (cursor) => {
    _updateUser({ cursor: cursor }).then((res) => {
      setCursor(cursor);
      updateCache("userDetails", res?.data?.user);
      setUserDetails(() => ({ ...userDetails, cursor: cursor }));
    });
  };

  const changeWallpaper = (wallpaper, filename) => {
    let wallpaperPayload;

    // Preserve existing effects if they exist, otherwise use defaults
    const existingEffects = userDetails?.wallpaper?.effects;
    const defaultEffects = {
      blur: 0,
      effectType: "blur",
      grainIntensity: 25,
      motion: true,
    };

    // Check for custom wallpaper object (Base64)
    if (typeof wallpaper === "object" && wallpaper.base64) {
      wallpaperPayload = {
        key: wallpaper.base64,
        originalName: wallpaper.name, // or filename argument
        __isNew__: true,
      };
      // Preserve effects if they exist, otherwise use defaults
      wallpaperPayload.effects = existingEffects || defaultEffects;
      // Set local state to valid CSS string (Base64)
      wallpaper = wallpaper.base64;
    }
    // Handle string URL
    else if (typeof wallpaper === "string") {
      let key = wallpaper;

      // If it's a full URL (existing S3 URL), extract the key component
      if (wallpaper.startsWith("http") || wallpaper.startsWith("/")) {
        const match = wallpaper.match(/(wallpaper\/.*?)(\?|$)/);
        if (match) {
          key = match[1];
        }
      }
      // If filename provided, construct new key (for fresh non-base64 uploads logic if used)
      else if (filename && userDetails) {
        const userId = userDetails._id || userDetails.id;
        key = `wallpaper/${userId}/${filename}`;
      }

      wallpaperPayload = {
        key: key,
        __isNew__: true,
      };
      // Preserve effects if they exist, otherwise use defaults
      wallpaperPayload.effects = existingEffects || defaultEffects;
    }
    // Handle Preset (number)
    else {
      wallpaperPayload = {
        value: wallpaper,
      };
      // Preserve effects if they exist, otherwise use defaults
      wallpaperPayload.effects = existingEffects || defaultEffects;
    }

    // Preserve the current background mode (full-page/header) across wallpaper changes
    wallpaperPayload.mode = backgroundMode;
    // Selecting an image clears any solid background colour (they are mutually exclusive).
    wallpaperPayload.color = null;
    setWallpaperColor(null); // optimistic

    _updateUser({ wallpaper: wallpaperPayload }).then((res) => {
      const updatedUser = res?.data?.user;

      // Extract authoritative wallpaper value from response
      const wp = updatedUser?.wallpaper;
      const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;

      // Update local state and context - only update wallpaper field to prevent signed URL changes
      setWallpaper(wpValue || wallpaper);
      setWallpaperColor(extractWallpaperColor(wp));
      // Only update wallpaper in cache to prevent flickers from new signed URLs
      updateCache("userDetails", { wallpaper: wp });
      // Only update wallpaper field in userDetails, not the entire object
      setUserDetails((prev) => ({
        ...prev,
        wallpaper: wp,
      }));
    });
  };

  const changeTemplate = (newTemplate) => {
    if (newTemplate === 4) {
      setTheme("light");
    }
    setIsLoadingTemplate(true);

    const isSwitchingFromMacOS = userDetails?.template === 4 && newTemplate !== 4;
    const previousTemplate = template;

    // Optimistic update — template state drives wallpaperUrl immediately
    setTemplate(newTemplate);

    const payload = { template: newTemplate };
    if (newTemplate === 4) {
      payload.theme = 0;
      // Retro OS is always full-page (like it's always light) — force + persist the mode.
      setBackgroundMode(BACKGROUND_MODE.FULL_PAGE); // optimistic
      const currentWp = userDetailsRef.current?.wallpaper ?? userDetails?.wallpaper;
      const wpPayload = { mode: BACKGROUND_MODE.FULL_PAGE };
      if (currentWp && typeof currentWp === "object") {
        if (currentWp.value !== undefined) wpPayload.value = currentWp.value;
        if (currentWp.key !== undefined) wpPayload.key = currentWp.key;
        if (currentWp.originalName !== undefined) wpPayload.originalName = currentWp.originalName;
        if (currentWp.__isNew__ !== undefined) wpPayload.__isNew__ = currentWp.__isNew__;
        if (currentWp.effects !== undefined) wpPayload.effects = currentWp.effects;
        if (currentWp.color !== undefined) wpPayload.color = currentWp.color;
      } else if (currentWp != null) {
        wpPayload.value = currentWp;
      }
      payload.wallpaper = wpPayload;
    }
    // Legacy cleanup: if user has 8 stored and is leaving Retro OS, reset to 0 in DB
    if (isSwitchingFromMacOS) {
      const currentWpValue = extractWallpaperValue(userDetails?.wallpaper);
      if (currentWpValue === 8) {
        payload.wallpaper = { value: 0 };
        setWallpaper(0); // optimistic local reset
      }
    }

    _updateUser(payload)
      .then((res) => {
        const updatedUser = res?.data?.user;
        updateCache("userDetails", updatedUser);
        const merge = { template: newTemplate };
        if (newTemplate === 4) merge.theme = 0;
        if (updatedUser?.wallpaper) merge.wallpaper = updatedUser.wallpaper;
        setUserDetails((prev) => ({ ...prev, ...merge }));
      })
      .catch((error) => {
        console.error("Error changing template:", error);
        // Roll back optimistic update on failure
        setTemplate(previousTemplate);
      })
      .finally(() => {
        setIsLoadingTemplate(false);
      });
  };

  const changeTheme = (themeValue) => {
    // Template 4 (macOS) is always light mode — ignore dark mode requests
    if (userDetails?.template === 4) {
      setTheme("light");
      return;
    }

    // Optimistic update: UI and cache first to prevent flicker and keep ThemePanel switch in sync
    setTheme(themeValue == 1 ? "dark" : "light");
    setUserDetails((prev) => ({ ...prev, theme: themeValue }));
    updateCache("userDetails", (prev) => ({ ...prev, theme: themeValue }));

    // Fire and forget backend update
    _updateUser({ theme: themeValue }).catch((err) => {
      console.error("Error updating theme:", err);
    });
  };

  // Function to save effects to backend (used by debounced and immediate calls)
  const saveWallpaperEffectsToBackend = useCallback(
    (effectsToSave) => {
      // Get current wallpaper object from ref (always has latest value)
      const currentWallpaper = userDetailsRef.current?.wallpaper || {};

      // Build wallpaper payload - exclude 'type' field, only include relevant fields
      const wallpaperPayload = {};

      // For preset wallpapers, only include 'value'
      if (currentWallpaper.value !== undefined) {
        wallpaperPayload.value = currentWallpaper.value;
      }

      // For custom wallpapers, include key, originalName, __isNew__
      if (currentWallpaper.key !== undefined) {
        wallpaperPayload.key = currentWallpaper.key;
      }
      if (currentWallpaper.originalName !== undefined) {
        wallpaperPayload.originalName = currentWallpaper.originalName;
      }
      if (currentWallpaper.__isNew__ !== undefined) {
        wallpaperPayload.__isNew__ = currentWallpaper.__isNew__;
      }

      // Preserve the background mode (backend rebuilds the wallpaper object on write)
      if (currentWallpaper.mode !== undefined && currentWallpaper.mode !== null) {
        wallpaperPayload.mode = currentWallpaper.mode;
      }

      // Preserve the solid background colour (grain can apply on a colour background too)
      if (currentWallpaper.color !== undefined) {
        wallpaperPayload.color = currentWallpaper.color;
      }

      // Only save if we have a valid wallpaper (value, key, or a colour background)
      if (
        wallpaperPayload.value !== undefined ||
        wallpaperPayload.key !== undefined ||
        wallpaperPayload.color
      ) {
        // Always include effects when we have a valid wallpaper
        wallpaperPayload.effects = effectsToSave;

        // Save to backend as part of wallpaper object
        _updateUser({ wallpaper: wallpaperPayload })
          .then((res) => {
            if (res?.data?.user) {
              const updatedUser = res?.data?.user;
              // Update cache with wallpaper including effects
              updateCache("userDetails", { wallpaper: updatedUser.wallpaper });
              // Update userDetails with wallpaper including effects
              setUserDetails((prev) => ({
                ...prev,
                wallpaper: updatedUser.wallpaper,
              }));
              // Update local effects state from response
              // Only update if effects have actually changed (prevent unnecessary updates)
              if (updatedUser.wallpaper?.effects) {
                const newEffects = updatedUser.wallpaper.effects;
                const currentEffects = wallpaperEffects;
                const effectsChanged =
                  currentEffects.blur !== newEffects.blur ||
                  currentEffects.effectType !== newEffects.effectType ||
                  currentEffects.grainIntensity !== newEffects.grainIntensity ||
                  currentEffects.motion !== newEffects.motion;

                // Only update if effects have actually changed
                if (effectsChanged) {
                  // Set flag to prevent updateWallpaperEffects useEffect from triggering
                  isUpdatingEffectsFromAPI.current = true;
                  setWallpaperEffects(newEffects);
                }
              }
            }
          })
          .catch((err) => {
            console.error("Error updating wallpaper effects:", err);
          });
      }
    },
    [updateCache, wallpaperEffects]
  );

  // Debounced version for slider updates (blur and grainIntensity)
  const debouncedSaveEffects = useDebouncedCallback(
    (effectsToSave) => {
      saveWallpaperEffectsToBackend(effectsToSave);
    },
    500 // 500ms delay
  );

  const updateWallpaperEffect = (key, value) => {
    const updatedEffects = { ...wallpaperEffects, [key]: value };

    // Always update local state immediately for responsive UI
    setWallpaperEffects(updatedEffects);

    // Debounce API calls for slider values (blur and grainIntensity)
    // Immediate API calls for toggles (effectType and motion)
    if (key === "blur" || key === "grainIntensity") {
      debouncedSaveEffects(updatedEffects);
    } else {
      // Immediate save for effectType and motion
      saveWallpaperEffectsToBackend(updatedEffects);
    }
  };

  // Change the wallpaper background mode (0 = full-page, 1 = header-only).
  // Mode lives inside the wallpaper object, so we resend the full wallpaper payload
  // (value/key + effects), mirroring saveWallpaperEffectsToBackend.
  const changeBackgroundMode = (mode) => {
    setBackgroundMode(mode); // optimistic

    const currentWallpaper = userDetailsRef.current?.wallpaper;
    const wallpaperPayload = { mode };

    if (currentWallpaper && typeof currentWallpaper === "object") {
      if (currentWallpaper.value !== undefined) wallpaperPayload.value = currentWallpaper.value;
      if (currentWallpaper.key !== undefined) wallpaperPayload.key = currentWallpaper.key;
      if (currentWallpaper.originalName !== undefined)
        wallpaperPayload.originalName = currentWallpaper.originalName;
      if (currentWallpaper.__isNew__ !== undefined)
        wallpaperPayload.__isNew__ = currentWallpaper.__isNew__;
      if (currentWallpaper.effects !== undefined)
        wallpaperPayload.effects = currentWallpaper.effects;
      if (currentWallpaper.color !== undefined) wallpaperPayload.color = currentWallpaper.color;
    } else if (currentWallpaper !== undefined && currentWallpaper !== null) {
      // Legacy bare-number wallpaper — normalize to an object so mode can be carried.
      wallpaperPayload.value = currentWallpaper;
    }

    setUserDetails((prev) => ({ ...prev, wallpaper: wallpaperPayload }));
    updateCache("userDetails", (prev) => ({ ...prev, wallpaper: wallpaperPayload }));

    _updateUser({ wallpaper: wallpaperPayload }).catch((err) => {
      console.error("Error updating background mode:", err);
    });
  };

  // Set (or clear) the solid background colour. A colour is mutually exclusive with an image
  // wallpaper, so this clears the image value; passing null clears the colour ("None").
  // Colour lives inside the wallpaper object, so we resend the full payload (mirrors mode).
  const changeWallpaperColor = (hex) => {
    setWallpaperColor(hex); // optimistic
    setWallpaper(0); // clear any image so the colour takes precedence

    const currentWallpaper = userDetailsRef.current?.wallpaper;
    const wallpaperPayload = { value: 0, color: hex ?? null, mode: backgroundMode };
    if (
      currentWallpaper &&
      typeof currentWallpaper === "object" &&
      currentWallpaper.effects !== undefined
    ) {
      wallpaperPayload.effects = currentWallpaper.effects;
    }

    setUserDetails((prev) => ({ ...prev, wallpaper: wallpaperPayload }));
    updateCache("userDetails", (prev) => ({ ...prev, wallpaper: wallpaperPayload }));

    _updateUser({ wallpaper: wallpaperPayload }).catch((err) => {
      console.error("Error updating background colour:", err);
    });
  };

  // Change the content container width (px). Debounced during drag; commits immediately
  // when `immediate` is true (preset click / drag end).
  const changeContainerWidth = (px, immediate = false) => {
    // Lightweight during drag: only the width state (drives containerMaxWidth → live preview).
    setContainerWidth(px);

    if (containerWidthSaveTimer.current) clearTimeout(containerWidthSaveTimer.current);
    if (immediate) {
      // Commit: sync userDetails + cache and persist to backend.
      setUserDetails((prev) => ({ ...prev, containerWidth: px }));
      updateCache("userDetails", (prev) => ({ ...prev, containerWidth: px }));
      _updateUser({ containerWidth: px }).catch((err) => {
        console.error("Error updating container width:", err);
      });
    } else {
      containerWidthSaveTimer.current = setTimeout(() => {
        setUserDetails((prev) => ({ ...prev, containerWidth: px }));
        updateCache("userDetails", (prev) => ({ ...prev, containerWidth: px }));
        _updateUser({ containerWidth: px }).catch((err) => {
          console.error("Error updating container width:", err);
        });
      }, 500);
    }
  };

  // Change the typography scale (0 = compact, 1 = expressive).
  const changeTypography = (level) => {
    const value = normalizeTypography(level);
    setTypography(value); // optimistic
    setUserDetails((prev) => ({ ...prev, typography: value }));
    updateCache("userDetails", (prev) => ({ ...prev, typography: value }));

    _updateUser({ typography: value }).catch((err) => {
      console.error("Error updating typography:", err);
    });
  };
  const changeProjectsColumns = (cols) => {
    const value = cols === 1 ? 1 : 2;
    setUserDetails((prev) => ({ ...prev, projectsColumns: value }));
    updateCache("userDetails", (prev) => ({ ...prev, projectsColumns: value }));

    _updateUser({ projectsColumns: value }).catch((err) => {
      console.error("Error updating projects columns:", err);
    });
  };

  const openModal = (type = null) => {
    if (type === modals.aiProject) {
      const open = () => {
        setShowModal(type);
        setPopoverMenu(null);
      };
      const openUpgrade = () => {
        setUpgradeModalSource("write-ai");
        setShowUpgradeModal(true);
      };
      if (_aiWritingCredits !== null) {
        _aiWritingCredits <= 0 ? openUpgrade() : open();
        return;
      }
      _getUserQuota()
        .then((res) => {
          const gen = res.data?.quota?.caseStudyGeneration;
          const remaining =
            gen?.limit === null ? Infinity : Math.max(0, (gen?.limit ?? 2) - (gen?.used ?? 0));
          _setAiWritingCredits(remaining);
          remaining <= 0 ? openUpgrade() : open();
        })
        .catch(open);
      return;
    }
    setShowModal(type);
    setPopoverMenu(null);
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedProject(null);
    setSelectedReview(null);
    setSelectedWork(null);
    setStep(1);
  };

  const setTemplateContext = (value) => {
    setTemplate(value);
    setUserDetails((prev) => ({
      ...prev,
      template: value,
    }));
  };

  // Register unsaved changes checker for a sidebar
  const registerUnsavedChangesChecker = (sidebarType, checker) => {
    unsavedChangesCheckers.current[sidebarType] = checker;
  };

  // Unregister unsaved changes checker for a sidebar
  const unregisterUnsavedChangesChecker = (sidebarType) => {
    delete unsavedChangesCheckers.current[sidebarType];
  };

  // Check if current sidebar has unsaved changes
  const hasUnsavedChanges = () => {
    if (!activeSidebar) return false;
    const checker = unsavedChangesCheckers.current[activeSidebar];
    return checker ? checker() : false;
  };

  // Open sidebar with unsaved changes check.
  const openSidebar = (sidebarType) => {
    if (activeSidebar === sidebarType) {
      setPopoverMenu(null);
      return;
    }

    if (activeSidebar) {
      const hasChanges = hasUnsavedChanges();
      if (hasChanges) {
        setIsSwitchingSidebar(true);
        setShowUnsavedWarning(true);
        setPendingSidebarAction({ type: "open", sidebarType });
        return;
      }
    }

    setActiveSidebar(sidebarType);
    setPopoverMenu(null);
  };

  // Helpers to open work/review sidebars for adding a new item (clears any selected entity first).
  const openNewWork = () => {
    setSelectedWork(null);
    openSidebar(sidebars.work);
  };

  const openNewReview = () => {
    setSelectedReview(null);
    openSidebar(sidebars.review);
  };

  // Close sidebar with unsaved changes check
  const closeSidebar = (force = false) => {
    if (!activeSidebar) return;

    // Check for unsaved changes unless forced
    if (!force) {
      const hasChanges = hasUnsavedChanges();
      if (hasChanges) {
        setShowUnsavedWarning(true);
        setPendingSidebarAction({ type: "close" });
        return;
      }
    }

    // No unsaved changes or forced, proceed to close
    setActiveSidebar(null);
    // Entity selection must reset whenever the panel closes. Work/Review sidebars unmount
    // immediately when activeSidebar becomes null, so their local reset effects may not run.
    setSelectedWork(null);
    setSelectedReview(null);
    setSelectedProject(null);
  };

  // Handle unsaved changes dialog confirmation
  const handleConfirmDiscardSidebar = () => {
    setShowUnsavedWarning(false);
    setIsSwitchingSidebar(false);

    if (pendingSidebarAction) {
      if (pendingSidebarAction.type === "open") {
        const { sidebarType } = pendingSidebarAction;
        setActiveSidebar(sidebarType);
        setPopoverMenu(null);
      } else if (pendingSidebarAction.type === "close") {
        // Close current sidebar
        setActiveSidebar(null);
        setSelectedWork(null);
        setSelectedReview(null);
        setSelectedProject(null);
      }
      setPendingSidebarAction(null);
    }
  };

  // Handle unsaved changes dialog cancel
  const handleCancelDiscardSidebar = () => {
    setShowUnsavedWarning(false);
    setIsSwitchingSidebar(false);
    setPendingSidebarAction(null);
  };

  return (
    <GlobalContext.Provider
      value={{
        popoverMenu,
        setPopoverMenu,
        userDetailLoading: isLoading,
        userDetails,
        setUserDetails,
        userDetailsRefecth,
        setIsUserDetailsFromCache,
        userDetailsIsState,
        changeTheme,
        viewerThemeOverride,
        setViewerThemeOverride,
        isTaskCompleted,
        taskPercentage,
        checkList,
        showModal,
        setShowModal,
        step,
        setStep,
        openModal,
        closeModal,
        updateCache,
        projectRef,
        selectedProject,
        setSelectedProject,
        selectedReview,
        setSelectedReview,
        selectedWork,
        setSelectedWork,
        wordCount,
        setWordCount,
        projectValue,
        setProjectValue,
        cursor,
        setCursor,
        changeCursor,
        changeTemplate,
        template,
        setTemplate,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeModalUnhideProject,
        setUpgradeModalUnhideProject,
        upgradeModalSource,
        setUpgradeModalSource,
        upgradeModalJob,
        setUpgradeModalJob,
        invalidateAiWritingCredits: () => _setAiWritingCredits(null),
        analysisCreditsRemaining,
        setAnalysisCreditsRemaining,
        analysisCreditsLimit,
        setAnalysisCreditsLimit,
        domainDetails,
        setDomainDetails,
        fetchDomainDetails,
        setTemplateContext,
        wallpaper,
        setWallpaper,
        changeWallpaper,
        wallpaperUrl,
        wallpaperColor,
        wallpaperColorResolved,
        changeWallpaperColor,
        wallpaperEffects,
        setWallpaperEffects,
        updateWallpaperEffect,
        backgroundMode,
        setBackgroundMode,
        changeBackgroundMode,
        isHeaderMode,
        hasWallpaper,
        containerWidth,
        setContainerWidth,
        containerMaxWidth,
        changeContainerWidth,
        typography,
        setTypography,
        changeTypography,
        changeProjectsColumns,
        isLoadingTemplate,
        activeSidebar,
        openSidebar,
        openNewWork,
        openNewReview,
        closeSidebar,
        registerUnsavedChangesChecker,
        unregisterUnsavedChangesChecker,
        showUnsavedWarning,
        setShowUnsavedWarning,
        handleConfirmDiscardSidebar,
        handleCancelDiscardSidebar,
        isSwitchingSidebar,
        pendingSidebarAction,
        pendingReplaceAwaitingConfirmation,
        setPendingReplaceAwaitingConfirmation,
        applyPendingPortfolio,
        discardPendingPortfolio,
        showSettingsModal,
        setShowSettingsModal,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
