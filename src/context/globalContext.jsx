import { setCursorvalue } from "@/lib/cursor";
import { getWallpaperUrl, hasNoWallpaper } from "@/lib/wallpaper";
import { mapPendingPortfolioToUpdatePayload } from "@/lib/mapPendingPortfolioToUpdatePayload";
import { _getDomainDetails, _getUserDetails } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import queryClient from "@/network/queryClient";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import { popovers, sidebars } from "@/lib/constant";
import { useDebouncedCallback } from "use-debounce";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

// Create a new context instance
const GlobalContext = createContext();

// Custom hook to use the GlobalContext
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

// Provider component to wrap your app and provide the context
export const GlobalProvider = ({ children }) => {
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [domainDetails, setDomainDetails] = useState(null);
  const [wallpaper, setWallpaper] = useState(0);
  const [wallpaperEffects, setWallpaperEffects] = useState({
    blur: 0,
    effectType: 'blur',
    grainIntensity: 25,
    motion: true
  });
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingSidebarAction, setPendingSidebarAction] = useState(null);
  const [isSwitchingSidebar, setIsSwitchingSidebar] = useState(false);
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
      const popoverElement = document.querySelector(
        `[data-popover-id="${popoverMenu}"]`
      );

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

      // Skip update if projects are ONLY reordered (same IDs, different order, same data)
      const oldProjectIds = userDetails?.projects?.map(p => p._id) || [];
      const newProjectIds = userData?.projects?.map(p => p._id) || [];
      const sameIdsDifferentOrder = userDetails &&
        oldProjectIds.length === newProjectIds.length &&
        oldProjectIds.every(id => newProjectIds.includes(id)) &&
        JSON.stringify(oldProjectIds) !== JSON.stringify(newProjectIds); // Different order

      if (sameIdsDifferentOrder) {
        return;
      }

      setTheme(userData?.theme == 1 ? "dark" : "light");
      setCursor(userData?.cursor ? userData?.cursor : 0);
      setTemplate(userData?.template ? userData?.template : 0);

      const wp = userData?.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);

      const wpEffects = userData?.wallpaper?.effects;

      // Helper to check if effects object has valid values (not all null/undefined)
      const hasValidEffects = wpEffects && typeof wpEffects === 'object' && (
        (wpEffects.blur !== null && wpEffects.blur !== undefined) ||
        (wpEffects.effectType !== null && wpEffects.effectType !== undefined) ||
        (wpEffects.grainIntensity !== null && wpEffects.grainIntensity !== undefined) ||
        (wpEffects.motion !== null && wpEffects.motion !== undefined)
      );

      if (!effectsInitializedRef.current) {
        if (hasValidEffects) {
          // Set flag to prevent updateWallpaperEffects useEffect from triggering during initial load
          isUpdatingEffectsFromAPI.current = true;
          // Sanitize wpEffects: remove null/undefined values, and also remove false for motion (treat as "not set")
          // This ensures defaults are used when backend doesn't provide proper values
          const sanitizedEffects = Object.fromEntries(
            Object.entries(wpEffects).filter(([key, v]) => {
              if (v === null || v === undefined) return false;
              // Treat motion: false as "not set" so default (true) is used
              if (key === 'motion' && v === false) return false;
              // Treat grainIntensity 0 as "not set" so default (25) is used
              if (key === 'grainIntensity' && v === 0) return false;
              return true;
            })
          );
          // Merge with defaults: defaults first, then sanitized effects override (only valid values)
          setWallpaperEffects({
            blur: 0,
            effectType: 'blur',
            grainIntensity: 25,
            motion: true,
            ...sanitizedEffects
          });
          effectsInitializedRef.current = true;
        } else {
          // Only set defaults if effects haven't been initialized yet
          isUpdatingEffectsFromAPI.current = true;
          setWallpaperEffects({
            blur: 0,
            effectType: 'blur',
            grainIntensity: 25,
            motion: true
          });
          effectsInitializedRef.current = true;
        }
      }

      setUserDetails(userData);
      setIsUserDetailsFromCache(true);
      setCheckList((prevList) => {
        const newList = prevList.map((item) => {
          switch (item.name) {
            case "Add at least 1 Case Study":
              return {
                ...item,
                checked: userData?.projects?.length > 0,
              };
            case "Add Skills":
              return { ...item, checked: userData?.skills?.length > 0 };
            case "Add Experience":
              return {
                ...item,
                checked: userData?.experiences?.length > 0,
              };
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
    }
  }, [data, userDetailsIsState]);

  useEffect(() => {
    setCursorvalue(cursor);
  }, [cursor]);

  useEffect(() => {
    if (userDetails?.pro) {
      fetchDomainDetails();
    }
  }, [userDetails?.pro]);

  // Compute wallpaper URL centrally - handles object and primitive values
  const wallpaperUrl = useMemo(() => {
    const wp = wallpaper;
    const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
    const currentTheme = resolvedTheme || theme;

    return wpValue && wpValue !== 0
      ? getWallpaperUrl(wpValue, currentTheme)
      : null;
  }, [wallpaper, resolvedTheme, theme]);

  const fetchDomainDetails = () => {
    _getDomainDetails().then((res) => {
      setDomainDetails(res.data);
    });
  };

  const updateCache = (key, data) => {
    queryClient.setQueriesData({ queryKey: [key] }, (oldData) => {
      const existingUser = oldData?.user;
      const newUser =
        typeof data === "function"
          ? data(existingUser)
          : { ...existingUser, ...data };
      return { user: newUser };
    });
  };

  // Post-signup prefill: apply pending-portfolio-data (from landing Analyze flow) once
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
    try {
      const content = JSON.parse(raw);
      const payload = mapPendingPortfolioToUpdatePayload(content);
      pendingPrefillAppliedRef.current = true;
      if (payload) {
        _updateUser(payload)
          .then((res) => {
            localStorage.removeItem("pending-portfolio-data");
            if (res?.data?.user) {
              updateCache("userDetails", res.data.user);
              setUserDetails(res.data.user);
            }
            userDetailsRefecth();
          })
          .catch(() => {
            pendingPrefillAppliedRef.current = false;
          });
      } else {
        localStorage.removeItem("pending-portfolio-data");
      }
    } catch {
      localStorage.removeItem("pending-portfolio-data");
    }
  }, [userDetails, setUserDetails, updateCache, userDetailsRefecth]);

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
      effectType: 'blur',
      grainIntensity: 25,
      motion: true
    };

    // Check for custom wallpaper object (Base64)
    if (typeof wallpaper === 'object' && wallpaper.base64) {
      wallpaperPayload = {
        key: wallpaper.base64,
        originalName: wallpaper.name, // or filename argument
        __isNew__: true
      };
      // Preserve effects if they exist, otherwise use defaults
      wallpaperPayload.effects = existingEffects || defaultEffects;
      // Set local state to valid CSS string (Base64)
      wallpaper = wallpaper.base64;
    }
    // Handle string URL
    else if (typeof wallpaper === 'string') {
      let key = wallpaper;

      // If it's a full URL (existing S3 URL), extract the key component
      if (wallpaper.startsWith('http') || wallpaper.startsWith('/')) {
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
        __isNew__: true
      };
      // Preserve effects if they exist, otherwise use defaults
      wallpaperPayload.effects = existingEffects || defaultEffects;
    }
    // Handle Preset (number)
    else {
      wallpaperPayload = {
        value: wallpaper
      };
      // Preserve effects if they exist, otherwise use defaults
      wallpaperPayload.effects = existingEffects || defaultEffects;
    }

    _updateUser({ wallpaper: wallpaperPayload }).then((res) => {
      const updatedUser = res?.data?.user;

      // Extract authoritative wallpaper value from response
      const wp = updatedUser?.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;

      // Update local state and context - only update wallpaper field to prevent signed URL changes
      setWallpaper(wpValue || wallpaper);
      // Only update wallpaper in cache to prevent flickers from new signed URLs
      updateCache("userDetails", { wallpaper: wp });
      // Only update wallpaper field in userDetails, not the entire object
      setUserDetails((prev) => ({
        ...prev,
        wallpaper: wp,
      }));
    });
  };

  const changeTemplate = (template) => {
    setIsLoadingTemplate(true);
    _updateUser({ template: template })
      .then((res) => {
        setTemplate(template);
        updateCache("userDetails", res?.data?.user);
        setUserDetails(() => ({ ...userDetails, template: template }));
      })
      .catch((error) => {
        console.error("Error changing template:", error);
      })
      .finally(() => {
        setIsLoadingTemplate(false);
      });
  };

  const changeTheme = (themeValue) => {
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
  const saveWallpaperEffectsToBackend = useCallback((effectsToSave) => {
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

    // Only save if we have a valid wallpaper (value or key), otherwise just update local state
    if (wallpaperPayload.value !== undefined || wallpaperPayload.key !== undefined) {
      // Always include effects when we have a valid wallpaper
      wallpaperPayload.effects = effectsToSave;

      // Save to backend as part of wallpaper object
      _updateUser({ wallpaper: wallpaperPayload }).then((res) => {
        if (res?.data?.user) {
          const updatedUser = res?.data?.user;
          // Update cache with wallpaper including effects
          updateCache("userDetails", { wallpaper: updatedUser.wallpaper });
          // Update userDetails with wallpaper including effects
          setUserDetails((prev) => ({
            ...prev,
            wallpaper: updatedUser.wallpaper
          }));
          // Update local effects state from response
          // Only update if effects have actually changed (prevent unnecessary updates)
          if (updatedUser.wallpaper?.effects) {
            const newEffects = updatedUser.wallpaper.effects;
            const currentEffects = wallpaperEffects;
            const effectsChanged = (
              currentEffects.blur !== newEffects.blur ||
              currentEffects.effectType !== newEffects.effectType ||
              currentEffects.grainIntensity !== newEffects.grainIntensity ||
              currentEffects.motion !== newEffects.motion
            );

            // Only update if effects have actually changed
            if (effectsChanged) {
              // Set flag to prevent updateWallpaperEffects useEffect from triggering
              isUpdatingEffectsFromAPI.current = true;
              setWallpaperEffects(newEffects);
            }
          }
        }
      }).catch((err) => {
        console.error("Error updating wallpaper effects:", err);
      });
    }
  }, [updateCache]);

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
    if (key === 'blur' || key === 'grainIntensity') {
      debouncedSaveEffects(updatedEffects);
    } else {
      // Immediate save for effectType and motion
      saveWallpaperEffectsToBackend(updatedEffects);
    }
  };

  const openModal = (type = null) => {
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

  // Open sidebar with unsaved changes check
  const openSidebar = (sidebarType) => {
    // If trying to open the same sidebar, do nothing
    if (activeSidebar === sidebarType) return;

    // If another sidebar is open, check for unsaved changes
    if (activeSidebar) {
      const hasChanges = hasUnsavedChanges();
      if (hasChanges) {
        // Show warning and store the pending action
        setIsSwitchingSidebar(true);
        setShowUnsavedWarning(true);
        setPendingSidebarAction({ type: "open", sidebarType });
        return;
      }
    }

    // No unsaved changes or no active sidebar, proceed to open
    setActiveSidebar(sidebarType);
    setPopoverMenu(null);
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
  };

  // Handle unsaved changes dialog confirmation
  const handleConfirmDiscardSidebar = () => {
    setShowUnsavedWarning(false);
    setIsSwitchingSidebar(false);

    if (pendingSidebarAction) {
      if (pendingSidebarAction.type === "open") {
        // Close current sidebar and open new one
        setActiveSidebar(pendingSidebarAction.sidebarType);
        setPopoverMenu(null);
      } else if (pendingSidebarAction.type === "close") {
        // Close current sidebar
        setActiveSidebar(null);
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
        domainDetails,
        setDomainDetails,
        fetchDomainDetails,
        setTemplateContext,
        wallpaper,
        setWallpaper,
        changeWallpaper,
        wallpaperUrl,
        wallpaperEffects,
        setWallpaperEffects,
        updateWallpaperEffect,
        isLoadingTemplate,
        activeSidebar,
        openSidebar,
        closeSidebar,
        registerUnsavedChangesChecker,
        unregisterUnsavedChangesChecker,
        showUnsavedWarning,
        setShowUnsavedWarning,
        handleConfirmDiscardSidebar,
        handleCancelDiscardSidebar,
        isSwitchingSidebar,
        pendingSidebarAction,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
