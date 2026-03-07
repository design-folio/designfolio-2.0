import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Square, RefreshCw, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react';
import Button3D from '../ui/button-3d';
import WindowContent from './WindowContent';
import DockBar from './DockBar';
import { _updateUser } from '@/network/post-request';
import { useGlobalContext } from '@/context/globalContext';
import { useRouter } from 'next/router';
import { clampWindowPosition, MOBILE_HEADER_SAFE_TOP_PX, MACOS_PDF_WINDOW_WIDTH, MACOS_PDF_WINDOW_HEIGHT_VH } from '@/lib/utils';

const ZOOM_MIN = 50;
const ZOOM_MAX = 150;
const ZOOM_STEP = 10;

const MacOSDock = ({ apps, onAppClick, openApps = [], className = '', userDetails, edit = false, preview = false, onEditBio, onEditHome, onEditContact, onEditWorkExperience, onAddWorkExperience, onAddProject, onEditTools, onEditSkills, onEditResume, sidebarOffsetPx = 0, topOffsetPx = 0 }) => {
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
    if (typeof window === 'undefined') return { baseIconSize: 64, maxScale: 1.6, effectWidth: 240 };
    const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
    if (smallerDimension < 480) return { baseIconSize: Math.max(40, smallerDimension * 0.08), maxScale: 1.4, effectWidth: smallerDimension * 0.4 };
    if (smallerDimension < 768) return { baseIconSize: Math.max(48, smallerDimension * 0.07), maxScale: 1.5, effectWidth: smallerDimension * 0.35 };
    if (smallerDimension < 1024) return { baseIconSize: Math.max(56, smallerDimension * 0.06), maxScale: 1.6, effectWidth: smallerDimension * 0.3 };
    return { baseIconSize: Math.max(64, Math.min(80, smallerDimension * 0.05)), maxScale: 1.8, effectWidth: 300 };
  }, []);

  const [config, setConfig] = useState(getResponsiveConfig);
  const { baseIconSize, maxScale, effectWidth } = config;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const minScale = 1.0;
  const baseSpacing = Math.max(4, baseIconSize * 0.08);

  useEffect(() => {
    const handleResize = () => setConfig(getResponsiveConfig());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getResponsiveConfig]);

  const calculateTargetMagnification = useCallback((mousePosition) => {
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
  }, [apps, baseIconSize, baseSpacing, effectWidth, maxScale, minScale]);

  const calculatePositions = useCallback((scales) => {
    let currentX = 0;
    return scales.map((scale) => {
      const scaledWidth = baseIconSize * scale;
      const centerX = currentX + scaledWidth / 2;
      currentX += scaledWidth + baseSpacing;
      return centerX;
    });
  }, [baseIconSize, baseSpacing]);

  useEffect(() => {
    const initialScales = apps.map(() => minScale);
    setCurrentScales(initialScales);
    setCurrentPositions(calculatePositions(initialScales));
  }, [apps, calculatePositions, minScale, config]);

  const animateToTarget = useCallback(() => {
    const targetScales = calculateTargetMagnification(mouseX);
    const targetPositions = calculatePositions(targetScales);
    const lerpFactor = mouseX !== null ? 0.2 : 0.12;

    setCurrentScales(prev => prev.map((s, i) => s + (targetScales[i] - s) * lerpFactor));
    setCurrentPositions(prev => prev.map((p, i) => p + (targetPositions[i] - p) * lerpFactor));

    const scalesNeedUpdate = currentScales.some((s, i) => Math.abs(s - targetScales[i]) > 0.002);
    const positionsNeedUpdate = currentPositions.some((p, i) => Math.abs(p - targetPositions[i]) > 0.1);

    if (scalesNeedUpdate || positionsNeedUpdate || mouseX !== null) {
      animationFrameRef.current = requestAnimationFrame(animateToTarget);
    }
  }, [mouseX, calculateTargetMagnification, calculatePositions, currentScales, currentPositions]);

  useEffect(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animateToTarget);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [animateToTarget]);

  const handleMouseMove = useCallback((e) => {
    const now = performance.now();
    if (now - lastMouseMoveTime.current < 16) return;
    lastMouseMoveTime.current = now;
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      const padding = Math.max(8, baseIconSize * 0.12);
      setMouseX(e.clientX - rect.left - padding);
    }
  }, [baseIconSize]);

  const handleMouseLeave = useCallback(() => setMouseX(null), []);

  const createBounceAnimation = (element) => {
    const bounceHeight = Math.max(-8, -baseIconSize * 0.15);
    element.style.transition = 'transform 0.2s ease-out';
    element.style.transform = `translateY(${bounceHeight}px)`;
    setTimeout(() => { element.style.transform = 'translateY(0px)'; }, 200);
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
  const [windowPositions, setWindowPositions] = useState({});

  // After mount, set the initial window position and open the first window (clamped so it doesn't sit in sidebar area)
  useEffect(() => {
    if (apps.length > 0) {
      const firstId = apps[0].id;
      const clamped = clampWindowPosition(window.innerWidth / 2, window.innerHeight * 0.45, sidebarOffsetPx, topOffsetPx);
      setWindowPositions({ [firstId]: clamped });
      setOpenWindows([firstId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-clamp all window positions to current viewport/sidebar/top bounds (shared logic)
  const reclampAllPositions = useCallback(() => {
    setWindowPositions(prev => {
      const next = {};
      for (const [id, pos] of Object.entries(prev)) {
        const isPdf = id.startsWith('pdf-');
        const w = isPdf ? MACOS_PDF_WINDOW_WIDTH : undefined;
        const vh = isPdf ? MACOS_PDF_WINDOW_HEIGHT_VH : undefined;
        next[id] = clampWindowPosition(pos.x, pos.y, sidebarOffsetPx, topOffsetPx, w, vh);
      }
      return next;
    });
  }, [sidebarOffsetPx, topOffsetPx]);

  // When sidebar or top offset changes, re-clamp all window positions
  useEffect(() => {
    reclampAllPositions();
  }, [sidebarOffsetPx, topOffsetPx, reclampAllPositions]);

  // When browser window is resized, re-clamp so windows stay within the new viewport
  useEffect(() => {
    const handleResize = () => reclampAllPositions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    setOrderedProjects(userDetails?.projects || []);
  }, [userDetails?.projects]);

  const handleDragStart = (e, index) => {
    draggedProjectIndexRef.current = index;
    setDraggedProjectIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = () => {
    draggedProjectIndexRef.current = null;
    setDraggedProjectIndex(null);
  };
  const handleDragOver = (e, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
            updateCache('userDetails', { projects: sortedProjects });
          }
        })
        .catch((err) => {
          console.error('Error updating project order (macOS dock):', err);
        });

      return sortedProjects;
    });
  };

  // ── Project navigation ────────────────────────────────────────────────────────
  const handleOpenProject = useCallback((project) => {
    const id = project._id || project.id;
    if (!id) return;
    if (edit) {
      router.push(`/project/${id}/editor`);
    } else if (preview) {
      router.push(`/project/${id}/preview`);
    } else {
      router.push(`/project/${id}`);
    }
  }, [edit, preview, router]);

  // ── PDF windows ──────────────────────────────────────────────────────────────
  const handleOpenPdf = useCallback((title) => {
    const pdfId = `pdf-${Date.now()}`;
    const offset = (openWindows.length + pdfWindows.length) * 20;
    setPdfWindows(prev => [...prev, { id: pdfId, title }]);
    setAnimatingPdf({ id: pdfId, type: 'open' });
    const clamped = clampWindowPosition(window.innerWidth / 2 + offset, window.innerHeight * 0.45 + offset, sidebarOffsetPx, topOffsetPx, MACOS_PDF_WINDOW_WIDTH, MACOS_PDF_WINDOW_HEIGHT_VH);
    setWindowPositions(prev => ({ ...prev, [pdfId]: clamped }));
    setActiveWindowId(pdfId);
    setTimeout(() => setAnimatingPdf(null), 500);
  }, [openWindows.length, pdfWindows.length, sidebarOffsetPx]);

  const closePdf = (pdfId) => {
    setAnimatingPdf({ id: pdfId, type: 'minimize' });
    setTimeout(() => {
      setPdfWindows(prev => prev.filter(p => p.id !== pdfId));
      setAnimatingPdf(null);
      if (activeWindowId === pdfId) setActiveWindowId(null);
    }, 500);
  };

  // ── App click / window management ────────────────────────────────────────────
  const handleAppClick = (appId, index) => {
    if (appId === 'resume') {
      if (iconRefs.current[index]) createBounceAnimation(iconRefs.current[index]);
      const name = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ') || 'Resume';
      handleOpenPdf(`${name}_Resume.pdf`);
      return;
    }

    if (iconRefs.current[index]) createBounceAnimation(iconRefs.current[index]);

    if (isMobile) {
      setOpenWindows(prev => {
        const otherWindows = prev.filter(id => id !== appId);
        setMinimizedWindows(cur => { const n = [...cur]; otherWindows.forEach(id => { if (!n.includes(id)) n.push(id); }); return n; });
        return prev;
      });
    }

    if (!openWindows.includes(appId)) {
      setAnimatingWindow({ id: appId, type: 'open' });
      setOpenWindows(prev => [...prev, appId]);
      if (!windowPositions[appId]) {
        const offset = openWindows.length * 20;
        const clamped = clampWindowPosition(window.innerWidth / 2 + offset, window.innerHeight * 0.45 + offset, sidebarOffsetPx, topOffsetPx);
        setWindowPositions(prev => ({ ...prev, [appId]: clamped }));
      }
      setTimeout(() => setAnimatingWindow(null), 500);
    }
    if (minimizedWindows.includes(appId)) {
      setAnimatingWindow({ id: appId, type: 'open' });
      setMinimizedWindows(prev => prev.filter(id => id !== appId));
      setTimeout(() => setAnimatingWindow(null), 500);
    }
    setActiveWindowId(appId);
    onAppClick(appId);
  };

  const closeWindow = (appId) => {
    setOpenWindows(prev => prev.filter(id => id !== appId));
    setMinimizedWindows(prev => prev.filter(id => id !== appId));
    setMaximizedWindows(prev => prev.filter(id => id !== appId));
    if (activeWindowId === appId) setActiveWindowId(null);
  };

  const toggleMinimize = (appId, e) => {
    e.stopPropagation();
    if (!minimizedWindows.includes(appId)) {
      setAnimatingWindow({ id: appId, type: 'minimize' });
      setTimeout(() => { setMinimizedWindows(prev => [...prev, appId]); setAnimatingWindow(null); }, 500);
    } else {
      setAnimatingWindow({ id: appId, type: 'open' });
      setMinimizedWindows(prev => prev.filter(id => id !== appId));
      setTimeout(() => setAnimatingWindow(null), 500);
    }
    if (activeWindowId === appId) setActiveWindowId(null);
  };

  const toggleMaximize = (appId, e) => {
    e.stopPropagation();
    setMaximizedWindows(prev => prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]);
  };

  // ── Window drag ──────────────────────────────────────────────────────────────
  const handleMouseDown = (appId, e) => {
    setActiveWindowId(appId);
    setIsDragging(appId);
    const pos = windowPositions[appId] || { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMouseMoveGlobal = useCallback((e) => {
    if (isDragging) {
      const rawX = e.clientX - dragOffset.current.x;
      const rawY = e.clientY - dragOffset.current.y;
      const isPdf = isDragging.startsWith('pdf-');
      const w = isPdf ? MACOS_PDF_WINDOW_WIDTH : undefined;
      const vh = isPdf ? MACOS_PDF_WINDOW_HEIGHT_VH : undefined;
      const clamped = clampWindowPosition(rawX, rawY, sidebarOffsetPx, topOffsetPx, w, vh);
      setWindowPositions(prev => ({ ...prev, [isDragging]: clamped }));
    }
  }, [isDragging, sidebarOffsetPx, topOffsetPx]);

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(null);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveGlobal, { passive: true });
      window.addEventListener('mouseup', handleMouseUpGlobal);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, handleMouseMoveGlobal]);

  const contentWidth = currentPositions.length > 0
    ? Math.max(...currentPositions.map((pos, index) => pos + (baseIconSize * currentScales[index]) / 2))
    : apps.length * (baseIconSize + baseSpacing) - baseSpacing;
  const padding = Math.max(8, baseIconSize * 0.12);


  const workExperiences = userDetails?.experiences
  const contactInfo = {
    email: userDetails?.email || 'hello@example.com',
    github: userDetails?.github || '',
    linkedin: userDetails?.linkedin || '',
    twitter: userDetails?.twitter || '',
    dribbble: userDetails?.dribbble || '',
    behance: userDetails?.behance || '',
    instagram: userDetails?.instagram || '',
    medium: userDetails?.medium || '',
    notion: userDetails?.notion || '',
    behance: userDetails?.behance || '',
  };
  const fullName = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ') || 'Portfolio';

  const [aboutEditMenuOpen, setAboutEditMenuOpen] = useState(false);
  const [aboutDropdownRect, setAboutDropdownRect] = useState(null);
  const aboutEditTriggerRef = useRef(null);

  // PDF (Resume) window zoom
  const [pdfZoom, setPdfZoom] = useState(100);

  // Close About dropdown on outside click
  useEffect(() => {
    if (!aboutEditMenuOpen) return;
    const handleClick = (e) => {
      const menu = document.getElementById('about-edit-dropdown');
      if (menu?.contains(e.target) || aboutEditTriggerRef.current?.contains(e.target)) return;
      setAboutEditMenuOpen(false);
      setAboutDropdownRect(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [aboutEditMenuOpen]);

  return (
    <div className="flex flex-col items-center w-full h-full relative pointer-events-none">

      {/* ── App Windows ── */}
      <div className="flex-1 w-full relative pointer-events-none">
        {apps.map((app, index) => {
          const isOpen = openWindows.includes(app.id);
          const isMinimized = minimizedWindows.includes(app.id);
          const isMaximized = maximizedWindows.includes(app.id);
          const isAnimating = animatingWindow?.id === app.id;

          if (!isOpen || (isMinimized && !isAnimating)) return null;

          const pos = windowPositions[app.id] || { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
          const isActive = activeWindowId === app.id;

          let animationStyles = {};
          if (isAnimating) {
            const isOpening = animatingWindow.type === 'open';
            animationStyles = {
              animation: isOpening
                ? 'macWindowOpen 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                : 'macWindowMinimize 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            };
          }

          return (
            <div
              key={`window-${app.id}`}
              onMouseDown={() => setActiveWindowId(app.id)}
              onWheel={(e) => e.stopPropagation()}
              className={`fixed z-40 overflow-hidden border shadow-2xl flex flex-col pointer-events-auto ${app.id === 'work_experience' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#faf9f6] border-[#d1d1d1]'
                } ${isMaximized || isMobile
                  ? 'max-w-none rounded-none border-0 transition-all duration-300'
                  : 'w-[896px] h-[70vh] rounded-lg transition-shadow'
                } ${isActive ? 'shadow-2xl ring-1 ring-black/5' : 'shadow-lg opacity-95'}`}
              style={{
                ...(isMaximized || isMobile
                  ? {
                    zIndex: isActive ? 50 : 40,
                    left: isMobile ? '2.5%' : 0,
                    right: isMobile ? undefined : (sidebarOffsetPx > 0 ? `${sidebarOffsetPx}px` : undefined),
                    top: isMobile ? `calc(${MOBILE_HEADER_SAFE_TOP_PX}px + env(safe-area-inset-top, 0px))` : `${topOffsetPx}px`,
                    width: isMobile ? '95vw' : (sidebarOffsetPx > 0 ? `calc(100vw - ${sidebarOffsetPx}px)` : '100vw'),
                    height: isMobile ? `calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 104}px - env(safe-area-inset-top, 0px))` : `calc(100vh - ${topOffsetPx}px - 80px)`,
                    transform: 'none',
                    borderRadius: isMobile ? '12px' : '0',
                  }
                  : {
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isActive ? 50 : 40,
                    transition: isDragging === app.id ? undefined : 'left 0.25s ease-out, top 0.25s ease-out',
                  }),
                ...animationStyles,
              }}
            >
              <style dangerouslySetInnerHTML={{
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
              `}} />

              {/* Title bar */}
              <div
                onMouseDown={(e) => !isMobile && !isMaximized && handleMouseDown(app.id, e)}
                className={`h-10 border-b flex items-center px-4 justify-between select-none ${app.id === 'work_experience' ? 'bg-[#2d2d2d] border-[#1e1e1e]' : 'bg-[#e8e6e1] border-[#d1d1d1]'
                  } ${isMobile || isMaximized ? 'cursor-default' : 'cursor-move active:cursor-grabbing'}`}
              >
                <div className="flex gap-2 items-center">
                  <div className={`text-sm font-medium flex items-center gap-2 ${app.id === 'work_experience' ? 'text-[#d4d4d4]' : 'text-[#444]'}`}>
                    <span className="opacity-70">{app.id === 'works' ? '📂' : '📄'}</span>
                    {app.id === 'works' ? 'Projects' : `${app.name}.mdx`}{' '}
                    <span className="opacity-50 text-[10px]">⌄</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${app.id === 'work_experience' ? 'text-[#aaa]' : 'text-[#666]'}`}>
                  <button type="button" className={`p-1 rounded transition-colors ${app.id === 'work_experience' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`} onClick={(e) => toggleMinimize(app.id, e)} title="Minimize">
                    <Minus className="w-4 h-4" />
                  </button>
                  <button type="button" className={`p-1 rounded transition-colors ${app.id === 'work_experience' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`} onClick={(e) => toggleMaximize(app.id, e)} title="Maximize">
                    <Square className="w-3 h-3" />
                  </button>
                  <button type="button" className={`p-1 rounded transition-colors ${app.id === 'work_experience' ? 'hover:bg-red-500/30 hover:text-red-400' : 'hover:bg-red-500/20 hover:text-red-600'}`} onClick={() => closeWindow(app.id)} title="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toolbar (not shown for the Finder/works window) */}
              {app.id !== 'works' && (
                <div className={`h-12 border-b flex items-center px-4 gap-4 overflow-x-auto justify-between ${app.id === 'work_experience' ? 'bg-[#252525] border-[#1e1e1e]' : 'bg-[#f4f2ee] border-[#e0ddd8]'
                  }`}>
                  <div className="flex items-center gap-4">
                    {app.id === 'work_experience' ? (
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <button className="h-8 px-2 flex items-center justify-center gap-1.5 text-[11px] text-[#aaa] hover:bg-white/5 rounded border border-transparent hover:border-[#333] transition-all">
                            <RefreshCw size={12} className="text-[#007aff]" /><span>Build</span>
                          </button>
                          <button className="h-8 px-2 flex items-center justify-center gap-1.5 text-[11px] text-[#aaa] hover:bg-white/5 rounded border border-transparent hover:border-[#333] transition-all">
                            <div className="w-2 h-2 rounded-full bg-[#28c841]" /><span>Run</span>
                          </button>
                        </div>
                        <div className="h-4 w-px bg-[#333] mx-1" />
                        <div className={`flex gap-1 text-[11px] text-[#666] ${isMobile ? 'hidden' : ''}`}>
                          <span className="hover:text-[#aaa] cursor-pointer">Terminal</span>
                          <span className="hover:text-[#aaa] cursor-pointer ml-2">Debug</span>
                          <span className="hover:text-[#aaa] cursor-pointer ml-2">Console</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`flex bg-white/50 border border-[#dcd9d4] rounded-md overflow-hidden ${isMobile ? 'hidden' : ''}`}>
                          <button className="px-3 py-1 border-r border-[#dcd9d4] hover:bg-white text-[#888] text-sm">↺</button>
                          <button className="px-3 py-1 hover:bg-white text-[#888] text-sm">↻</button>
                        </div>
                        <div className="flex gap-1">
                          <button className="w-8 h-8 flex items-center justify-center font-bold text-[#444] hover:bg-white rounded">B</button>
                          <button className="w-8 h-8 flex items-center justify-center italic text-[#444] hover:bg-white rounded">I</button>
                          <button className="w-8 h-8 flex items-center justify-center line-through text-[#444] hover:bg-white rounded">S</button>
                        </div>
                      </>
                    )}
                  </div>
                  {edit && app.id === 'about' && (
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
                              setAboutDropdownRect({ top: rect.bottom + 6, left: rect.right - 160 });
                              setAboutEditMenuOpen(true);
                            }
                          }
                        }}
                      >
                        <Button3D>
                          <span className="flex items-center gap-1">
                            EDIT
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${aboutEditMenuOpen ? 'rotate-180' : ''}`}
                            />
                          </span>
                        </Button3D>
                      </button>
                      {aboutEditMenuOpen && aboutDropdownRect && typeof document !== 'undefined' &&
                        createPortal(
                          <div
                            id="about-edit-dropdown"
                            className="fixed w-40 bg-white rounded-md shadow-lg border border-black/5 text-xs text-[#444]"
                            style={{
                              top: aboutDropdownRect.top,
                              left: aboutDropdownRect.left,
                              zIndex: 9999,
                            }}
                          >
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-[#f5f3ef] rounded-t-md"
                              onClick={() => {
                                setAboutEditMenuOpen(false);
                                setAboutDropdownRect(null);
                                onEditBio?.();
                              }}
                            >
                              Edit about
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-[#f5f3ef]"
                              onClick={() => {
                                setAboutEditMenuOpen(false);
                                setAboutDropdownRect(null);
                                onEditSkills?.();
                              }}
                            >
                              Edit skills
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-[#f5f3ef] rounded-b-md"
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
                  {edit && app.id === 'home' && (
                    <Button3D onClick={onEditHome}>EDIT</Button3D>
                  )}
                  {edit && app.id === 'contact' && (
                    <Button3D onClick={onEditContact}>EDIT</Button3D>
                  )}
                  {edit && app.id === 'tools' && (
                    <Button3D onClick={onEditTools}>EDIT</Button3D>
                  )}
                  {edit && app.id === 'work_experience' && (
                    <div className="flex items-center gap-2">
                      <Button3D onClick={onAddWorkExperience}>ADD</Button3D>
                      {
                        (userDetails?.experiences?.length ?? 0) > 0 && (<Button3D onClick={onEditWorkExperience}>EDIT</Button3D>)
                      }

                    </div>
                  )}
                </div>
              )}

              {/* Content area */}
              <div className={`flex-1 overflow-hidden relative ${app.id === 'works'
                ? ''
                : app.id === 'work_experience'
                  ? 'bg-[#1e1e1e] m-4 rounded-md border border-[#333] shadow-sm'
                  : 'bg-white m-4 rounded-md border border-[#e0ddd8] shadow-sm'
                }`}>
                <div className="w-full h-full overflow-y-auto">
                  <div className="w-full h-full flex flex-col relative">
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
                      onViewProjects={() => handleAppClick('works', apps.findIndex(a => a.id === 'works'))}
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

        {/* ── PDF Windows ── */}
        {pdfWindows.map((pdf) => {
          const pos = windowPositions[pdf.id] || { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
          const isActive = activeWindowId === pdf.id;
          const isMinimized = minimizedWindows.includes(pdf.id);
          const isAnimating = animatingPdf?.id === pdf.id;
          if (isMinimized && !isAnimating) return null;

          let animationStyles = {};
          if (isAnimating) {
            const isOpening = animatingPdf.type === 'open';
            animationStyles = { animation: isOpening ? 'pdfWindowOpen 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'pdfWindowMinimize 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' };
          }

          return (
            <div
              key={pdf.id}
              onMouseDown={() => setActiveWindowId(pdf.id)}
              onWheel={(e) => e.stopPropagation()}
              className={`fixed z-40 overflow-hidden bg-[#525659] border border-[#333] shadow-2xl flex flex-col pointer-events-auto ${isMobile ? 'max-w-none rounded-xl' : 'w-[800px] h-[85vh] rounded-lg'} ${isActive ? 'shadow-2xl ring-1 ring-black/5' : 'shadow-lg opacity-95'}`}
              style={{
                ...(isMobile ? { zIndex: isActive ? 60 : 40, left: '2.5%', top: `calc(${MOBILE_HEADER_SAFE_TOP_PX}px + env(safe-area-inset-top, 0px))`, width: '95vw', height: `calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 104}px - env(safe-area-inset-top, 0px))`, transform: 'none', borderRadius: '12px' } : { left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)', zIndex: isActive ? 60 : 40 }),
                ...animationStyles,
              }}
            >
              <style dangerouslySetInnerHTML={{
                __html: isMobile
                  ? `@keyframes pdfWindowOpen { 0% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; } 100% { transform: translate(0, 0) scale(1); opacity: 1; } } @keyframes pdfWindowMinimize { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(0, calc(100vh - ${MOBILE_HEADER_SAFE_TOP_PX + 74}px)) scale(0.1); opacity: 0; } }`
                  : `@keyframes pdfWindowOpen { 0% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } } @keyframes pdfWindowMinimize { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; } }`
              }} />
              <div onMouseDown={(e) => handleMouseDown(pdf.id, e)} className="h-9 bg-[#323639] border-b border-[#1a1a1a] flex items-center px-3 justify-between select-none cursor-move active:cursor-grabbing rounded-t-lg">
                <div className="flex gap-2 items-center">

                  <div className="text-[12px] font-medium text-[#eee] flex items-center gap-1 ml-2">
                    <span className="opacity-70">📄</span><span>{pdf.title}</span>
                  </div>
                </div>
                <button type="button" className="p-1 rounded transition-colors hover:bg-red-500/30 hover:text-red-400 text-[#ccc]" onClick={() => closePdf(pdf.id)} title="Close">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-12 bg-[#323639] border-b border-[#1a1a1a] flex items-center px-3 md:px-4 justify-between gap-2 flex-wrap sm:flex-nowrap">
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
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  {edit && userDetails?.resume?.url && <Button3D onClick={onEditContact}>EDIT</Button3D>}
                  {/* {userDetails?.resume?.url && (
                    <a href={userDetails.resume.url} target="_blank" rel="noreferrer" download>
                      <Button3D>DOWNLOAD</Button3D>
                    </a>
                  )} */}
                </div>
              </div>
              <div className="flex-1 bg-[#525659] overflow-auto flex justify-center min-h-0">
                <div className="origin-top transition-transform duration-150" style={{ transform: `scale(${pdfZoom / 100})` }}>
                  {userDetails?.resume?.url ? (
                    <iframe
                      title="Resume"
                      src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(userDetails.resume.url)}#zoom=page-width&pagemode=none`}
                      className="w-[min(90vw,800px)] h-[min(75vh,900px)] md:w-[800px] md:h-[85vh] rounded border-0 bg-[#525659]"
                    />
                  ) : (
                    <div className="bg-white w-full min-w-0 max-w-[600px] min-h-full shadow-2xl p-5 md:p-6 box-border flex flex-col">
                      <div className="flex flex-col items-center justify-center flex-1 py-8 text-center px-4 sm:px-6 w-full min-w-0 box-border">
                        <span className="text-4xl mb-4 opacity-60 shrink-0" aria-hidden>📄</span>
                        <h3 className="text-lg font-semibold text-[#333] mb-2 w-full">Resume</h3>
                        <p className="text-sm text-[#666] mb-2 w-full max-w-md mx-auto">
                          Add your resume in Footer settings to show it here.
                        </p>
                        <Button3D onClick={onEditContact} className="shrink-0">UPLOAD RESUME</Button3D>
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
