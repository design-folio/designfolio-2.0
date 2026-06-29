import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  startTransition,
} from "react";
import { createPortal } from "react-dom";
import { X, Minus, Square, RefreshCw, ChevronDown, ZoomIn, ZoomOut } from "lucide-react";
import Button3D from "../../ui/button-3d";
import WindowContent from "./WindowContent";
import DockBar from "./DockBar";
import { _updateUser } from "@/network/post-request";
import { _getProjectDetails } from "@/network/get-request";
import queryClient from "@/network/queryClient";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/router";
import MacOSProjectToolbar from "./MacOSProjectToolbar";
import {
  clampWindowPosition,
  MOBILE_HEADER_SAFE_TOP_PX,
  MACOS_PDF_WINDOW_WIDTH,
  MACOS_PDF_WINDOW_HEIGHT_VH,
  getProjectUrl,
} from "@/lib/utils";

const ZOOM_MIN = 50;
const ZOOM_MAX = 150;
const ZOOM_STEP = 10;

const MacOSDock = ({
  apps,
  onAppClick,
  openApps = [],
  className = "",
  userDetails,
  edit = false,
  preview = false,
  onEditBio,
  onEditHome,
  onEditContact,
  onEditWorkExperience,
  onAddWorkExperience,
  onAddProject,
  onEditTools,
  onEditSkills,
  onEditResume,
  sidebarOffsetPx = 0,
  topOffsetPx = 0,
  onDockWindowFocus,
  onProjectWindowFocus,
}) => {
  const { setUserDetails, updateCache } = useGlobalContext();
  const router = useRouter();

  // ── Magnification ────────────────────────────────────────────────────────────
  const [mouseX, setMouseX] = useState(null);
  const [currentScales, setCurrentScales] = useState(apps.map(() => 1));
  const [currentPositions, setCurrentPositions] = useState([]);
  const dockRef = useRef(null);
  const iconRefs = useRef([]);
  const animationFrameRef = useRef(undefined);
  const lastMouseMoveTime = useRef(0);

  const getResponsiveConfig = useCallback(() => {
    if (typeof window === "undefined") return { baseIconSize: 64, maxScale: 1.6, effectWidth: 240 };
    const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
    if (smallerDimension < 480)
      return {
        baseIconSize: Math.max(40, smallerDimension * 0.08),
        maxScale: 1.4,
        effectWidth: smallerDimension * 0.4,
      };
    if (smallerDimension < 768)
      return {
        baseIconSize: Math.max(48, smallerDimension * 0.07),
        maxScale: 1.5,
        effectWidth: smallerDimension * 0.35,
      };
    if (smallerDimension < 1024)
      return {
        baseIconSize: Math.max(56, smallerDimension * 0.06),
        maxScale: 1.6,
        effectWidth: smallerDimension * 0.3,
      };
    return {
      baseIconSize: Math.max(64, Math.min(80, smallerDimension * 0.05)),
      maxScale: 1.8,
      effectWidth: 300,
    };
  }, []);

  const [config, setConfig] = useState(getResponsiveConfig);
  const { baseIconSize, maxScale, effectWidth } = config;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const minScale = 1.0;
  const baseSpacing = Math.max(4, baseIconSize * 0.08);

  useEffect(() => {
    const handleResize = () => setConfig(getResponsiveConfig());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getResponsiveConfig]);

  const calculateTargetMagnification = useCallback(
    (mousePosition) => {
      if (mousePosition === null) return apps.map(() => minScale);
      return apps.map((_, index) => {
        const normalIconCenter = index * (baseIconSize + baseSpacing) + baseIconSize / 2;
        const minX = mousePosition - effectWidth / 2;
        const maxX = mousePosition + effectWidth / 2;
        if (normalIconCenter < minX || normalIconCenter > maxX) return minScale;
        const theta = ((normalIconCenter - minX) / effectWidth) * 2 * Math.PI;
        const cappedTheta = Math.min(Math.max(theta, 0), 2 * Math.PI);
        const scaleFactor = (1 - Math.cos(cappedTheta)) / 2;
        return minScale + scaleFactor * (maxScale - minScale);
      });
    },
    [apps, baseIconSize, baseSpacing, effectWidth, maxScale, minScale]
  );

  const calculatePositions = useCallback(
    (scales) => {
      let currentX = 0;
      return scales.map((scale) => {
        const scaledWidth = baseIconSize * scale;
        const centerX = currentX + scaledWidth / 2;
        currentX += scaledWidth + baseSpacing;
        return centerX;
      });
    },
    [baseIconSize, baseSpacing]
  );

  useEffect(() => {
    const initialScales = apps.map(() => minScale);
    startTransition(() => {
      setCurrentScales(initialScales);
      setCurrentPositions(calculatePositions(initialScales));
    });
  }, [apps, calculatePositions, minScale, config]);

  const animateToTargetRef = useRef(null);
  const animateToTarget = useCallback(() => {
    const targetScales = calculateTargetMagnification(mouseX);
    const targetPositions = calculatePositions(targetScales);
    const lerpFactor = mouseX !== null ? 0.2 : 0.12;

    setCurrentScales((prev) => prev.map((s, i) => s + (targetScales[i] - s) * lerpFactor));
    setCurrentPositions((prev) => prev.map((p, i) => p + (targetPositions[i] - p) * lerpFactor));

    const scalesNeedUpdate = currentScales.some((s, i) => Math.abs(s - targetScales[i]) > 0.002);
    const positionsNeedUpdate = currentPositions.some(
      (p, i) => Math.abs(p - targetPositions[i]) > 0.1
    );

    if (scalesNeedUpdate || positionsNeedUpdate || mouseX !== null) {
      animationFrameRef.current = requestAnimationFrame(() => animateToTargetRef.current?.());
    }
  }, [mouseX, calculateTargetMagnification, calculatePositions, currentScales, currentPositions]);
  useLayoutEffect(() => {
    animateToTargetRef.current = animateToTarget;
  }, [animateToTarget]);

  useEffect(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animateToTarget);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animateToTarget]);

  const handleMouseMove = useCallback(
    (e) => {
      const now = performance.now();
      if (now - lastMouseMoveTime.current < 16) return;
      lastMouseMoveTime.current = now;
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        const padding = Math.max(8, baseIconSize * 0.12);
        setMouseX(e.clientX - rect.left - padding);
      }
    },
    [baseIconSize]
  );

  const handleMouseLeave = useCallback(() => setMouseX(null), []);

  const createBounceAnimation = (element) => {
    const bounceHeight = Math.max(-8, -baseIconSize * 0.15);
    element.style.transition = "transform 0.2s ease-out";
    element.style.transform = `translateY(${bounceHeight}px)`;
    setTimeout(() => {
      element.style.transform = "translateY(0px)";
    }, 200);
  };

  // ── Window state ─────────────────────────────────────────────────────────────
  // Start with no open windows — opened after mount so window dimensions are available
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(apps[0]?.id || null);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [maximizedWindows, setMaximizedWindows] = useState([]);
  const [animatingWindow, setAnimatingWindow] = useState(null);
  const [pdfWindows, setPdfWindows] = useState([]);
  const [animatingPdf, setAnimatingPdf] = useState(null);
  const [projectWindows, setProjectWindows] = useState([]);
  const [animatingProjectWindow, setAnimatingProjectWindow] = useState(null);
  const [windowPositions, setWindowPositions] = useState({});

  // After mount, set the initial window position and open the first window (clamped so it doesn't sit in sidebar area)
  useEffect(() => {
    if (apps.length > 0) {
      const firstId = apps[0].id;
      const clamped = clampWindowPosition(
        window.innerWidth / 2,
        window.innerHeight * 0.45,
        sidebarOffsetPx,
        topOffsetPx
      );
      startTransition(() => {
        setWindowPositions({ [firstId]: clamped });
        setOpenWindows([firstId]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-clamp all window positions to current viewport/sidebar/top bounds (shared logic)
  const reclampAllPositions = useCallback(() => {
    setWindowPositions((prev) => {
      const next = {};
      for (const [id, pos] of Object.entries(prev)) {
        const isPdf = id.startsWith("pdf-");
        const w = isPdf ? MACOS_PDF_WINDOW_WIDTH : undefined;
        const vh = isPdf ? MACOS_PDF_WINDOW_HEIGHT_VH : undefined;
        next[id] = clampWindowPosition(pos.x, pos.y, sidebarOffsetPx, topOffsetPx, w, vh);
      }
      return next;
    });
  }, [sidebarOffsetPx, topOffsetPx]);

  // When sidebar or top offset changes, re-clamp all window positions
  useEffect(() => {
    startTransition(() => reclampAllPositions());
  }, [sidebarOffsetPx, topOffsetPx, reclampAllPositions]);

  // When browser window is resized, re-clamp so windows stay within the new viewport
  useEffect(() => {
    const handleResize = () => reclampAllPositions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reclampAllPositions]);
  const [isDragging, setIsDragging] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Projects ─────────────────────────────────────────────────────────────────
  const rawProjects = userDetails?.projects || [];
  const [orderedProjects, setOrderedProjects] = useState(rawProjects);
  const [draggedProjectIndex, setDraggedProjectIndex] = useState(null);
  // Ref keeps the current dragged index synchronously accessible across
  // drag events without stale-closure issues.
  const draggedProjectIndexRef = useRef(null);

  // Keep orderedProjects in sync when userDetails changes externally
  useEffect(() => {
    startTransition(() => setOrderedProjects(userDetails?.projects || []));
  }, [userDetails?.projects]);

  // Prefetch project data so dock project windows show content immediately (no white screen delay)
  useEffect(() => {
    if (edit || !orderedProjects?.length) return;
    orderedProjects.forEach((proj) => {
      const id = proj._id || proj.id;
      if (!id) return;
      queryClient.prefetchQuery({
        queryKey: [`project-${id}`],
        queryFn: async () => {
          const res = await _getProjectDetails(id, 1);
          return res?.data ?? null;
        },
        staleTime: 60000,
      });
    });
  }, [edit, orderedProjects]);

  const handleDragStart = (e, index) => {
    draggedProjectIndexRef.current = index;
    setDraggedProjectIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnd = () => {
    draggedProjectIndexRef.current = null;
    setDraggedProjectIndex(null);
  };
  const handleDragOver = (e, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const fromIndex = draggedProjectIndexRef.current;
    if (fromIndex === null || fromIndex === targetIndex) return;
    setOrderedProjects((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    draggedProjectIndexRef.current = targetIndex;
    setDraggedProjectIndex(targetIndex);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    draggedProjectIndexRef.current = null;
    setDraggedProjectIndex(null);
    // Use functional updater so we always persist the latest ordered array,
    // not a potentially stale closure value.
    setOrderedProjects((prev) => {
      const sortedProjects = [...prev];

      // Optimistically update global userDetails so all templates stay in sync
      setUserDetails((u) => ({ ...u, projects: sortedProjects }));

      const payload = { projects: sortedProjects };

      _updateUser(payload)
        .then((res) => {
          if (res?.data?.user?.projects) {
            // Only update the projects array order in cache, mirroring Builder2/Projects
            updateCache("userDetails", { projects: sortedProjects });
          }
        })
        .catch((err) => {
          console.error("Error updating project order (macOS dock):", err);
        });

      return sortedProjects;
    });
  };

  // ── Project windows (in-place, no navigation in view mode) ───────────────────
  const closeProjectWindow = useCallback((windowId) => {
    setAnimatingProjectWindow({ id: windowId, type: "minimize" });
    setTimeout(() => {
      setProjectWindows((prev) => prev.filter((w) => w.id !== windowId));
      setMinimizedWindows((prev) => prev.filter((id) => id !== windowId));
      setMaximizedWindows((prev) => prev.filter((id) => id !== windowId));
      setAnimatingProjectWindow(null);
      setActiveWindowId((prev) => (prev === windowId ? null : prev));
    }, 500);
  }, []);

  const handleOpenProject = useCallback(
    (project) => {
      const id = project._id || project.id;
      if (!id) return;
      // Always open in a dock window — no full-page navigation
      const windowId = `project-${id}`;
      const existing = projectWindows.find((w) => w.projectId === id);
      if (existing) {
        setActiveWindowId(existing.id);
        if (minimizedWindows.includes(existing.id)) {
          setAnimatingProjectWindow({ id: existing.id, type: "open" });
          setMinimizedWindows((prev) => prev.filter((w) => w !== existing.id));
          setTimeout(() => setAnimatingProjectWindow(null), 500);
        }
        return;
      }
      // Close any open project windows before opening the new one
      const projectIds = projectWindows.map((w) => w.id);
      setProjectWindows([]);
      setAnimatingProjectWindow(null);
      setMinimizedWindows((prev) => prev.filter((wid) => !projectIds.includes(wid)));
      setMaximizedWindows((prev) => prev.filter((wid) => !projectIds.includes(wid)));
      setWindowPositions((prev) => {
        const next = { ...prev };
        projectIds.forEach((wid) => delete next[wid]);
        return next;
      });
      if (projectIds.some((wid) => activeWindowId === wid)) setActiveWindowId(null);

      const title = project.title || project.name || "Project";
      setProjectWindows([{ id: windowId, projectId: id, title }]);
      setAnimatingProjectWindow({ id: windowId, type: "open" });
      const clamped = clampWindowPosition(
        window.innerWidth / 2,
        window.innerHeight * 0.45,
        sidebarOffsetPx,
        topOffsetPx
      );
      setWindowPositions((prev) => ({ ...prev, [windowId]: clamped }));
      setActiveWindowId(windowId);
      onProjectWindowFocus?.();
      setTimeout(() => setAnimatingProjectWindow(null), 500);
    },
    [
      projectWindows,
      minimizedWindows,
      activeWindowId,
      sidebarOffsetPx,
      topOffsetPx,
      onProjectWindowFocus,
    ]
  );

  // ── PDF windows ──────────────────────────────────────────────────────────────
  const handleOpenPdf = useCallback(
    (title) => {
      const pdfId = `pdf-${Date.now()}`;
      const offset = (openWindows.length + pdfWindows.length) * 20;
      setPdfWindows((prev) => [...prev, { id: pdfId, title }]);
      setAnimatingPdf({ id: pdfId, type: "open" });
      const clamped = clampWindowPosition(
        window.innerWidth / 2 + offset,
        window.innerHeight * 0.45 + offset,
        sidebarOffsetPx,
        topOffsetPx,
        MACOS_PDF_WINDOW_WIDTH,
        MACOS_PDF_WINDOW_HEIGHT_VH
      );
      setWindowPositions((prev) => ({ ...prev, [pdfId]: clamped }));
      setActiveWindowId(pdfId);
      setTimeout(() => setAnimatingPdf(null), 500);
    },
    [openWindows.length, pdfWindows.length, sidebarOffsetPx, topOffsetPx]
  );

  const closePdf = (pdfId) => {
    setAnimatingPdf({ id: pdfId, type: "minimize" });
    setTimeout(() => {
      setPdfWindows((prev) => prev.filter((p) => p.id !== pdfId));
      setAnimatingPdf(null);
      if (activeWindowId === pdfId) setActiveWindowId(null);
    }, 500);
  };

  // ── App click / window management ────────────────────────────────────────────
  const handleAppClick = (appId, index) => {
    if (appId === "resume") {
      if (iconRefs.current[index]) createBounceAnimation(iconRefs.current[index]);
      const name =
        [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") || "Resume";
      handleOpenPdf(`${name}_Resume.pdf`);
      return;
    }

    if (iconRefs.current[index]) createBounceAnimation(iconRefs.current[index]);

    if (isMobile) {
      setOpenWindows((prev) => {
        const otherWindows = prev.filter((id) => id !== appId);
        setMinimizedWindows((cur) => {
          const n = [...cur];
          otherWindows.forEach((id) => {
            if (!n.includes(id)) n.push(id);
          });
          return n;
        });
        return prev;
      });
    }

    if (!openWindows.includes(appId)) {
      setAnimatingWindow({ id: appId, type: "open" });
      setOpenWindows((prev) => [...prev, appId]);
      if (!windowPositions[appId]) {
        const offset = openWindows.length * 20;
        const clamped = clampWindowPosition(
          window.innerWidth / 2 + offset,
          window.innerHeight * 0.45 + offset,
          sidebarOffsetPx,
          topOffsetPx
        );
        setWindowPositions((prev) => ({ ...prev, [appId]: clamped }));
      }
      setTimeout(() => setAnimatingWindow(null), 500);
    }
    if (minimizedWindows.includes(appId)) {
      setAnimatingWindow({ id: appId, type: "open" });
      setMinimizedWindows((prev) => prev.filter((id) => id !== appId));
      setTimeout(() => setAnimatingWindow(null), 500);
    }
    setActiveWindowId(appId);
    onDockWindowFocus?.();
    onAppClick(appId);
  };

  const closeWindow = (appId) => {
    setOpenWindows((prev) => prev.filter((id) => id !== appId));
    setMinimizedWindows((prev) => prev.filter((id) => id !== appId));
    setMaximizedWindows((prev) => prev.filter((id) => id !== appId));
    if (activeWindowId === appId) setActiveWindowId(null);
  };

  const toggleMinimize = (appId, e) => {
    e.stopPropagation();
    if (!minimizedWindows.includes(appId)) {
      setAnimatingWindow({ id: appId, type: "minimize" });
      setTimeout(() => {
        setMinimizedWindows((prev) => [...prev, appId]);
        setAnimatingWindow(null);
      }, 500);
    } else {
      setAnimatingWindow({ id: appId, type: "open" });
      setMinimizedWindows((prev) => prev.filter((id) => id !== appId));
      setTimeout(() => setAnimatingWindow(null), 500);
    }
    if (activeWindowId === appId) setActiveWindowId(null);
  };

  const toggleMaximize = (appId, e) => {
    e.stopPropagation();
    setMaximizedWindows((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  // ── Window drag ──────────────────────────────────────────────────────────────
  const handleMouseDown = (appId, e) => {
    setActiveWindowId(appId);
    if (appId.startsWith("project-")) onProjectWindowFocus?.();
    else onDockWindowFocus?.();
    setIsDragging(appId);
    const pos = windowPositions[appId] || {
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.45,
    };
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMouseMoveGlobal = useCallback(
    (e) => {
      if (isDragging) {
        const rawX = e.clientX - dragOffset.current.x;
        const rawY = e.clientY - dragOffset.current.y;
        const isPdf = isDragging.startsWith("pdf-");
        const w = isPdf ? MACOS_PDF_WINDOW_WIDTH : undefined;
        const vh = isPdf ? MACOS_PDF_WINDOW_HEIGHT_VH : undefined;
        const clamped = clampWindowPosition(rawX, rawY, sidebarOffsetPx, topOffsetPx, w, vh);
        setWindowPositions((prev) => ({ ...prev, [isDragging]: clamped }));
      }
    },
    [isDragging, sidebarOffsetPx, topOffsetPx]
  );

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(null);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMoveGlobal, { passive: true });
      window.addEventListener("mouseup", handleMouseUpGlobal);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, [isDragging, handleMouseMoveGlobal]);

  const contentWidth =
    currentPositions.length > 0
      ? Math.max(
          ...currentPositions.map((pos, index) => pos + (baseIconSize * currentScales[index]) / 2)
        )
      : apps.length * (baseIconSize + baseSpacing) - baseSpacing;
  const padding = Math.max(8, baseIconSize * 0.12);

  const workExperiences = userDetails?.experiences;
  const contactInfo = {
    email: userDetails?.email || "hello@example.com",
    github: userDetails?.github || "",
    linkedin: userDetails?.linkedin || "",
    twitter: userDetails?.twitter || "",
    dribbble: userDetails?.dribbble || "",
    instagram: userDetails?.instagram || "",
    medium: userDetails?.medium || "",
    notion: userDetails?.notion || "",
  };
  const fullName =
    [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") || "Portfolio";

  const [aboutEditMenuOpen, setAboutEditMenuOpen] = useState(false);
  const [aboutDropdownRect, setAboutDropdownRect] = useState(null);
  const aboutEditTriggerRef = useRef(null);

  // PDF (Resume) window zoom
  const [pdfZoom, setPdfZoom] = useState(100);

  // Close About dropdown on outside click
  useEffect(() => {
    if (!aboutEditMenuOpen) return;
    const handleClick = (e) => {
      const menu = document.getElementById("about-edit-dropdown");
      if (menu?.contains(e.target) || aboutEditTriggerRef.current?.contains(e.target)) return;
      setAboutEditMenuOpen(false);
      setAboutDropdownRect(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [aboutEditMenuOpen]);

  return (
    <div className="pointer-events-none relative flex h-full w-full flex-col items-center">
      {/* ── App Windows ── */}
      <div className="pointer-events-none relative w-full flex-1">
        {apps.map((app, index) => {
          const isOpen = openWindows.includes(app.id);
          const isMinimized = minimizedWindows.includes(app.id);
          const isMaximized = maximizedWindows.includes(app.id);
          const isAnimating = animatingWindow?.id === app.id;

          if (!isOpen || (isMinimized && !isAnimating)) return null;

          const pos = windowPositions[app.id] || {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.45,
          };
          const isActive = activeWindowId === app.id;

          let animationStyles = {};
          if (isAnimating) {
            const isOpening = animatingWindow.type === "open";
            animationStyles = {
              animation: isOpening
                ? "macWindowOpen 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                : "macWindowMinimize 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            };
          }

          return (
            <div
              key={`window-${app.id}`}
              onMouseDown={() => setActiveWindowId(app.id)}
              onWheel={(e) => e.stopPropagation()}
              className={`pointer-events-auto fixed z-40 flex flex-col overflow-hidden border shadow-2xl ${
                app.id === "work_experience"
                  ? "border-[#333] bg-[#1e1e1e]"
                  : "border-[#d1d1d1] bg-[#faf9f6]"
              } ${
                isMaximized || isMobile
                  ? "max-w-none rounded-none border-0 transition-all duration-300"
                  : "h-[70vh] w-[896px] rounded-lg transition-shadow"
              } ${isActive ? "shadow-2xl ring-1 ring-black/5" : "opacity-95 shadow-lg"}`}
              style={{
                ...(isMaximized || isMobile
                  ? {
                      zIndex: isActive ? 50 : 40,
                      left: isMobile ? "2.5%" : 0,
                      right: isMobile
                        ? undefined
                        : sidebarOffsetPx > 0
                          ? `${sidebarOffsetPx}px`
                          : undefined,
                      top: isMobile
                        ? `calc(${MOBILE_HEADER_SAFE_TOP_PX}px + env(safe-area-inset-top, 0px))`
                        : `${topOffsetPx}px`,
                      width: isMobile
                        ? "95vw"
                        : sidebarOffsetPx > 0
                          ? `calc(100vw - ${sidebarOffsetPx}px)`
                          : "100vw",
                      height: isMobile
                        ? `calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 104}px - env(safe-area-inset-top, 0px))`
                        : `calc(100vh - ${topOffsetPx}px - 80px)`,
                      transform: "none",
                      borderRadius: isMobile ? "12px" : "0",
                    }
                  : {
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                      zIndex: isActive ? 50 : 40,
                      transition:
                        isDragging === app.id
                          ? undefined
                          : "left 0.25s ease-out, top 0.25s ease-out",
                    }),
                ...animationStyles,
              }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: isMobile
                    ? `
                @keyframes macWindowOpen {
                  0% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; }
                  100% { transform: translate(0, 0) scale(1); opacity: 1; }
                }
                @keyframes macWindowMinimize {
                  0% { transform: translate(0, 0) scale(1); opacity: 1; }
                  100% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; }
                }
              `
                    : `
                @keyframes macWindowOpen {
                  0% { transform: translate(calc(${currentPositions[index] || 0}px - ${pos.x}px), calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; }
                  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes macWindowMinimize {
                  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                  100% { transform: translate(calc(${currentPositions[index] || 0}px - ${pos.x}px), calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; }
                }
              `,
                }}
              />

              {/* Title bar */}
              <div
                onMouseDown={(e) => !isMobile && !isMaximized && handleMouseDown(app.id, e)}
                className={`flex h-10 items-center justify-between border-b px-4 select-none ${
                  app.id === "work_experience"
                    ? "border-[#1e1e1e] bg-[#2d2d2d]"
                    : "border-[#d1d1d1] bg-[#e8e6e1]"
                } ${isMobile || isMaximized ? "cursor-default" : "cursor-move active:cursor-grabbing"}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 text-sm font-medium ${app.id === "work_experience" ? "text-[#d4d4d4]" : "text-[#444]"}`}
                  >
                    <span className="opacity-70">{app.id === "works" ? "📂" : "📄"}</span>
                    {app.id === "works" ? "Projects" : `${app.name}.mdx`}{" "}
                    <span className="text-[10px] opacity-50">⌄</span>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 ${app.id === "work_experience" ? "text-[#aaa]" : "text-[#666]"}`}
                >
                  <button
                    type="button"
                    className={`rounded p-1 transition-colors ${app.id === "work_experience" ? "hover:bg-white/10" : "hover:bg-black/10"}`}
                    onClick={(e) => toggleMinimize(app.id, e)}
                    title="Minimize"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={`rounded p-1 transition-colors ${app.id === "work_experience" ? "hover:bg-white/10" : "hover:bg-black/10"}`}
                    onClick={(e) => toggleMaximize(app.id, e)}
                    title="Maximize"
                  >
                    <Square className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className={`rounded p-1 transition-colors ${app.id === "work_experience" ? "hover:bg-red-500/30 hover:text-red-400" : "hover:bg-red-500/20 hover:text-red-600"}`}
                    onClick={() => closeWindow(app.id)}
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Toolbar (not shown for the Finder/works window) */}
              {app.id !== "works" && (
                <div
                  className={`flex h-12 items-center justify-between gap-4 overflow-x-auto border-b px-4 ${
                    app.id === "work_experience"
                      ? "border-[#1e1e1e] bg-[#252525]"
                      : "border-[#e0ddd8] bg-[#f4f2ee]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {app.id === "work_experience" ? (
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <button className="flex h-8 items-center justify-center gap-1.5 rounded border border-transparent px-2 text-[11px] text-[#aaa] transition-all hover:border-[#333] hover:bg-white/5">
                            <RefreshCw size={12} className="text-[#007aff]" />
                            <span>Build</span>
                          </button>
                          <button className="flex h-8 items-center justify-center gap-1.5 rounded border border-transparent px-2 text-[11px] text-[#aaa] transition-all hover:border-[#333] hover:bg-white/5">
                            <div className="h-2 w-2 rounded-full bg-[#28c841]" />
                            <span>Run</span>
                          </button>
                        </div>
                        <div className="mx-1 h-4 w-px bg-[#333]" />
                        <div
                          className={`flex gap-1 text-[11px] text-[#666] ${isMobile ? "hidden" : ""}`}
                        >
                          <span className="cursor-pointer hover:text-[#aaa]">Terminal</span>
                          <span className="ml-2 cursor-pointer hover:text-[#aaa]">Debug</span>
                          <span className="ml-2 cursor-pointer hover:text-[#aaa]">Console</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`flex overflow-hidden rounded-md border border-[#dcd9d4] bg-white/50 ${isMobile ? "hidden" : ""}`}
                        >
                          <button className="border-r border-[#dcd9d4] px-3 py-1 text-sm text-[#888] hover:bg-white">
                            ↺
                          </button>
                          <button className="px-3 py-1 text-sm text-[#888] hover:bg-white">
                            ↻
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button className="flex h-8 w-8 items-center justify-center rounded font-bold text-[#444] hover:bg-white">
                            B
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded text-[#444] italic hover:bg-white">
                            I
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded text-[#444] line-through hover:bg-white">
                            S
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  {edit && app.id === "about" && (
                    <div className="relative">
                      <button
                        ref={aboutEditTriggerRef}
                        type="button"
                        className="focus:outline-none"
                        onClick={() => {
                          if (aboutEditMenuOpen) {
                            setAboutEditMenuOpen(false);
                            setAboutDropdownRect(null);
                          } else {
                            const rect = aboutEditTriggerRef.current?.getBoundingClientRect();
                            if (rect) {
                              setAboutDropdownRect({
                                top: rect.bottom + 6,
                                left: rect.right - 160,
                              });
                              setAboutEditMenuOpen(true);
                            }
                          }
                        }}
                      >
                        <Button3D>
                          <span className="flex items-center gap-1">
                            EDIT
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${aboutEditMenuOpen ? "rotate-180" : ""}`}
                            />
                          </span>
                        </Button3D>
                      </button>
                      {aboutEditMenuOpen &&
                        aboutDropdownRect &&
                        typeof document !== "undefined" &&
                        createPortal(
                          <div
                            id="about-edit-dropdown"
                            className="fixed w-40 rounded-md border border-black/5 bg-white text-xs text-[#444] shadow-lg"
                            style={{
                              top: aboutDropdownRect.top,
                              left: aboutDropdownRect.left,
                              zIndex: 9999,
                            }}
                          >
                            <button
                              className="w-full rounded-t-md px-3 py-2 text-left hover:bg-[#f5f3ef]"
                              onClick={() => {
                                setAboutEditMenuOpen(false);
                                setAboutDropdownRect(null);
                                onEditBio?.();
                              }}
                            >
                              Edit about
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left hover:bg-[#f5f3ef]"
                              onClick={() => {
                                setAboutEditMenuOpen(false);
                                setAboutDropdownRect(null);
                                onEditSkills?.();
                              }}
                            >
                              Edit skills
                            </button>
                            <button
                              className="w-full rounded-b-md px-3 py-2 text-left hover:bg-[#f5f3ef]"
                              onClick={() => {
                                setAboutEditMenuOpen(false);
                                setAboutDropdownRect(null);
                                onEditTools?.();
                              }}
                            >
                              Edit tools
                            </button>
                          </div>,
                          document.body
                        )}
                    </div>
                  )}
                  {edit && app.id === "home" && <Button3D onClick={onEditHome}>EDIT</Button3D>}
                  {edit && app.id === "contact" && (
                    <Button3D onClick={onEditContact}>EDIT</Button3D>
                  )}
                  {edit && app.id === "tools" && <Button3D onClick={onEditTools}>EDIT</Button3D>}
                  {edit && app.id === "work_experience" && (
                    <div className="flex items-center gap-2">
                      <Button3D onClick={onAddWorkExperience}>ADD</Button3D>
                      {(userDetails?.experiences?.length ?? 0) > 0 && (
                        <Button3D onClick={onEditWorkExperience}>EDIT</Button3D>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content area */}
              <div
                className={`relative flex-1 overflow-hidden ${
                  app.id === "works"
                    ? ""
                    : app.id === "work_experience"
                      ? "m-4 rounded-md border border-[#333] bg-[#1e1e1e] shadow-sm"
                      : "m-4 rounded-md border border-[#e0ddd8] bg-white shadow-sm"
                }`}
              >
                <div className="h-full w-full overflow-y-auto">
                  <div className="relative flex h-full w-full flex-col">
                    <WindowContent
                      appId={app.id}
                      userDetails={userDetails}
                      isMobile={isMobile}
                      projects={orderedProjects}
                      draggedProjectIndex={draggedProjectIndex}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onProjectClick={handleOpenProject}
                      onAddProject={onAddProject}
                      onOpenPdf={handleOpenPdf}
                      onViewProjects={() =>
                        handleAppClick(
                          "works",
                          apps.findIndex((a) => a.id === "works")
                        )
                      }
                      edit={edit}
                      onEditContact={onEditContact}
                      onEditTools={onEditTools}
                      onEditBio={onEditBio}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Project Windows — one portal per window, directly on body, no wrapper stacking context ── */}
        {typeof document !== "undefined" &&
          projectWindows.map((pw) => {
            const pos = windowPositions[pw.id] || {
              x: window.innerWidth / 2,
              y: window.innerHeight * 0.45,
            };
            const isActive = activeWindowId === pw.id;
            const isMinimized = minimizedWindows.includes(pw.id);
            const isAnimating = animatingProjectWindow?.id === pw.id;
            if (isMinimized && !isAnimating) return null;

            let animationStyles = {};
            if (isAnimating) {
              const isOpening = animatingProjectWindow.type === "open";
              animationStyles = {
                animation: isOpening
                  ? "macProjWindowOpen 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                  : "macProjWindowMinimize 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              };
            }

            const isMaximizedPw = maximizedWindows.includes(pw.id);
            const iframeUrl = edit
              ? `/project/${pw.projectId}/editor?embed=1`
              : `/project/${pw.projectId}?embed=1`;

            return createPortal(
              <div
                onMouseDown={() => {
                  setActiveWindowId(pw.id);
                  onProjectWindowFocus?.();
                }}
                onWheel={(e) => e.stopPropagation()}
                className={`pointer-events-auto fixed flex flex-col overflow-hidden border border-[#d1d1d1] bg-[#faf9f6] shadow-2xl ${
                  isMaximizedPw || isMobile
                    ? "max-w-none rounded-none border-0 transition-all duration-300"
                    : "h-[70vh] w-[896px] rounded-lg transition-shadow"
                } ${isActive ? "shadow-2xl ring-1 ring-black/5" : "opacity-95 shadow-lg"}`}
                style={{
                  ...(isMaximizedPw || isMobile
                    ? {
                        zIndex: 350,
                        left: isMobile ? "2.5%" : 0,
                        right: isMobile
                          ? undefined
                          : sidebarOffsetPx > 0
                            ? `${sidebarOffsetPx}px`
                            : undefined,
                        top: isMobile
                          ? `calc(${MOBILE_HEADER_SAFE_TOP_PX}px + env(safe-area-inset-top, 0px))`
                          : `${topOffsetPx}px`,
                        width: isMobile
                          ? "95vw"
                          : sidebarOffsetPx > 0
                            ? `calc(100vw - ${sidebarOffsetPx}px)`
                            : "100vw",
                        height: isMobile
                          ? `calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 104}px - env(safe-area-inset-top, 0px))`
                          : `calc(100vh - ${topOffsetPx}px - 80px)`,
                        transform: "none",
                        borderRadius: isMobile ? "12px" : "0",
                      }
                    : {
                        left: pos.x,
                        top: pos.y,
                        transform: "translate(-50%, -50%)",
                        zIndex: 350,
                        transition:
                          isDragging === pw.id
                            ? undefined
                            : "left 0.25s ease-out, top 0.25s ease-out",
                      }),
                  ...animationStyles,
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: isMobile
                      ? `
                @keyframes macProjWindowOpen {
                  0% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; }
                  100% { transform: translate(0, 0) scale(1); opacity: 1; }
                }
                @keyframes macProjWindowMinimize {
                  0% { transform: translate(0, 0) scale(1); opacity: 1; }
                  100% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; }
                }
              `
                      : `
                @keyframes macProjWindowOpen {
                  0% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; }
                  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes macProjWindowMinimize {
                  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                  100% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; }
                }
              `,
                  }}
                />
                <div
                  onMouseDown={(e) => !isMobile && !isMaximizedPw && handleMouseDown(pw.id, e)}
                  className={`flex h-10 items-center justify-between border-b border-[#d1d1d1] bg-[#e8e6e1] px-4 select-none ${isMobile || maximizedWindows.includes(pw.id) ? "cursor-default" : "cursor-move active:cursor-grabbing"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#444]">
                      <span className="opacity-70">🌐</span>
                      <span className="max-w-[200px] truncate">{pw.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#666]">
                    <button
                      type="button"
                      className="rounded p-1 transition-colors hover:bg-black/10"
                      onClick={(e) => toggleMinimize(pw.id, e)}
                      title="Minimize"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 transition-colors hover:bg-black/10"
                      onClick={(e) => toggleMaximize(pw.id, e)}
                      title="Maximize"
                    >
                      <Square className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 transition-colors hover:bg-red-500/20 hover:text-red-600"
                      onClick={() => closeProjectWindow(pw.id)}
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <MacOSProjectToolbar
                  projectUrl={
                    getProjectUrl({
                      username: userDetails?.username,
                      baseDomain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
                      projectId: pw.projectId,
                    }) ||
                    (typeof window !== "undefined"
                      ? `${window.location.origin}/project/${pw.projectId}`
                      : "")
                  }
                  onBack={() => router.back()}
                  onRefresh={() =>
                    queryClient.invalidateQueries({ queryKey: [`project-${pw.projectId}`] })
                  }
                />
                <div className="min-h-0 flex-1 bg-white">
                  <iframe
                    key={iframeUrl}
                    src={iframeUrl}
                    title={pw.title}
                    className="h-full w-full border-0"
                    allow="clipboard-write"
                  />
                </div>
              </div>,
              document.body,
              `proj-portal-${pw.id}`
            );
          })}

        {/* ── PDF Windows ── */}
        {pdfWindows.map((pdf) => {
          const pos = windowPositions[pdf.id] || {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.45,
          };
          const isActive = activeWindowId === pdf.id;
          const isMinimized = minimizedWindows.includes(pdf.id);
          const isAnimating = animatingPdf?.id === pdf.id;
          if (isMinimized && !isAnimating) return null;

          let animationStyles = {};
          if (isAnimating) {
            const isOpening = animatingPdf.type === "open";
            animationStyles = {
              animation: isOpening
                ? "pdfWindowOpen 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                : "pdfWindowMinimize 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            };
          }

          return (
            <div
              key={pdf.id}
              onMouseDown={() => {
                setActiveWindowId(pdf.id);
                onDockWindowFocus?.();
              }}
              onWheel={(e) => e.stopPropagation()}
              className={`pointer-events-auto fixed z-40 flex flex-col overflow-hidden border border-[#333] bg-[#525659] shadow-2xl ${isMobile ? "max-w-none rounded-xl" : "h-[85vh] w-[800px] rounded-lg"} ${isActive ? "shadow-2xl ring-1 ring-black/5" : "opacity-95 shadow-lg"}`}
              style={{
                ...(isMobile
                  ? {
                      zIndex: isActive ? 60 : 40,
                      left: "2.5%",
                      top: `calc(${MOBILE_HEADER_SAFE_TOP_PX}px + env(safe-area-inset-top, 0px))`,
                      width: "95vw",
                      height: `calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 104}px - env(safe-area-inset-top, 0px))`,
                      transform: "none",
                      borderRadius: "12px",
                    }
                  : {
                      left: pos.x,
                      top: pos.y,
                      transform: "translate(-50%, -50%)",
                      zIndex: isActive ? 60 : 40,
                    }),
                ...animationStyles,
              }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: isMobile
                    ? `@keyframes pdfWindowOpen { 0% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; } 100% { transform: translate(0, 0) scale(1); opacity: 1; } } @keyframes pdfWindowMinimize { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; } }`
                    : `@keyframes pdfWindowOpen { 0% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } } @keyframes pdfWindowMinimize { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; } }`,
                }}
              />
              <div
                onMouseDown={(e) => handleMouseDown(pdf.id, e)}
                className="flex h-9 cursor-move items-center justify-between rounded-t-lg border-b border-[#1a1a1a] bg-[#323639] px-3 select-none active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <div className="ml-2 flex items-center gap-1 text-[12px] font-medium text-[#eee]">
                    <span className="opacity-70">📄</span>
                    <span>{pdf.title}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded p-1 text-[#ccc] transition-colors hover:bg-red-500/30 hover:text-red-400"
                  onClick={() => closePdf(pdf.id)}
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex h-12 flex-wrap items-center justify-between gap-2 border-b border-[#1a1a1a] bg-[#323639] px-3 sm:flex-nowrap md:px-4">
                {/* <div className="flex items-center gap-2 md:gap-4 text-[#eee] shrink-0">
                  <div className="flex items-center gap-2 bg-[#202124] px-2 md:px-3 py-1 rounded border border-[#444] text-xs"><span>1 / 1</span></div>
                  <div className="h-4 w-[1px] bg-[#444]" />
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-1.5 rounded transition-colors hover:bg-white/10 text-[#eee] disabled:opacity-40 disabled:cursor-not-allowed" title="Zoom out" onClick={() => setPdfZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))} disabled={pdfZoom <= ZOOM_MIN}>
                      <ZoomOut size={14} />
                    </button>
                    <span className="text-xs w-10 md:w-12 text-center tabular-nums">{pdfZoom}%</span>
                    <button type="button" className="p-1.5 rounded transition-colors hover:bg-white/10 text-[#eee] disabled:opacity-40 disabled:cursor-not-allowed" title="Zoom in" onClick={() => setPdfZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))} disabled={pdfZoom >= ZOOM_MAX}>
                      <ZoomIn size={14} />
                    </button>
                  </div>
                </div> */}
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  {edit && userDetails?.resume?.url && (
                    <Button3D onClick={onEditContact}>EDIT</Button3D>
                  )}
                  {/* {userDetails?.resume?.url && (
                    <a href={userDetails.resume.url} target="_blank" rel="noreferrer" download>
                      <Button3D>DOWNLOAD</Button3D>
                    </a>
                  )} */}
                </div>
              </div>
              <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-[#525659]">
                <div
                  className="origin-top transition-transform duration-150"
                  style={{ transform: `scale(${pdfZoom / 100})` }}
                >
                  {userDetails?.resume?.url ? (
                    <iframe
                      title="Resume"
                      src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(userDetails.resume.url)}#zoom=page-width&pagemode=none`}
                      className="h-[min(75vh,900px)] w-[min(90vw,800px)] rounded border-0 bg-[#525659] md:h-[85vh] md:w-[800px]"
                    />
                  ) : (
                    <div className="box-border flex min-h-full w-full max-w-[600px] min-w-0 flex-col bg-white p-5 shadow-2xl md:p-6">
                      <div className="box-border flex w-full min-w-0 flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:px-6">
                        <span className="mb-4 shrink-0 text-4xl opacity-60" aria-hidden>
                          📄
                        </span>
                        <h3 className="mb-2 w-full text-lg font-semibold text-[#333]">Resume</h3>
                        <p className="mx-auto mb-2 w-full max-w-md text-sm text-[#666]">
                          Add your resume in Footer settings to show it here.
                        </p>
                        <Button3D onClick={onEditContact} className="shrink-0">
                          UPLOAD RESUME
                        </Button3D>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dock Bar ── */}
      <DockBar
        dockRef={dockRef}
        className={className}
        contentWidth={contentWidth}
        padding={padding}
        baseIconSize={baseIconSize}
        apps={apps}
        currentScales={currentScales}
        currentPositions={currentPositions}
        openWindows={openWindows}
        openApps={openApps}
        activeWindowId={activeWindowId}
        iconRefs={iconRefs}
        handleAppClick={handleAppClick}
        handleMouseMove={handleMouseMove}
        handleMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default MacOSDock;
