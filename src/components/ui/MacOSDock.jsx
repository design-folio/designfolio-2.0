import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Info, X, Minus, Square, ChevronLeft, ChevronRight, RefreshCw, Lock, Trash2, EyeOff } from 'lucide-react';
import Button3D from './button-3d';
import { AnimatedFolder } from './3d-folder';
import ImgStack from './image-stack';

/**
 * MacOSDock
 *
 * Full macOS-style dock with magnification, draggable windows, PDF viewer, and browser windows.
 *
 * @param {Array}    apps         - Array of { id, name, icon } app config
 * @param {Function} onAppClick   - Callback when a dock icon is clicked
 * @param {Array}    openApps     - Array of app IDs to show as "open" with indicator dot
 * @param {string}   className    - Extra CSS classes
 * @param {Object}   userDetails  - Portfolio user data for populating window content
 */
const MacOSDock = ({ apps, onAppClick, openApps = [], className = '', userDetails }) => {
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

  // Window state
  const [openWindows, setOpenWindows] = useState(apps.slice(0, 1).map(a => a.id));
  const [activeWindowId, setActiveWindowId] = useState(apps[0]?.id || null);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [maximizedWindows, setMaximizedWindows] = useState([]);
  const [animatingWindow, setAnimatingWindow] = useState(null);
  const [browserWindows, setBrowserWindows] = useState([]);
  const [pdfWindows, setPdfWindows] = useState([]);
  const [animatingPdf, setAnimatingPdf] = useState(null);
  const [windowPositions, setWindowPositions] = useState(() => {
    const initialPositions = {};
    if (typeof window !== 'undefined' && apps.length > 0) {
      initialPositions[apps[0].id] = { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
    }
    return initialPositions;
  });
  const [isDragging, setIsDragging] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Projects from userDetails
  const userProjects = userDetails?.projects?.slice(0, 5) || [];
  const [projects, setProjects] = useState(
    userProjects.length > 0
      ? userProjects.map((p, i) => ({ id: `proj${i}`, name: p.title || `Project ${i + 1}`, icon: '📂', category: p.category || 'Design', date: '' }))
      : [
          { id: 'proj1', name: 'Project 1', icon: '🧠', category: 'Design', date: '' },
          { id: 'proj2', name: 'Project 2', icon: '⚡', category: 'Dev', date: '' },
          { id: 'proj3', name: 'Project 3', icon: '🎨', category: 'Design', date: '' },
        ]
  );
  const [draggedProjectIndex, setDraggedProjectIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedProjectIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };
  const handleDragEnd = (e) => {
    setDraggedProjectIndex(null);
    e.currentTarget.style.opacity = '1';
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedProjectIndex !== null && draggedProjectIndex !== index) {
      const newProjects = [...projects];
      const draggedProject = newProjects[draggedProjectIndex];
      newProjects.splice(draggedProjectIndex, 1);
      newProjects.splice(index, 0, draggedProject);
      setProjects(newProjects);
      setDraggedProjectIndex(index);
    }
  };
  const handleDrop = (e) => { e.preventDefault(); setDraggedProjectIndex(null); };

  const handleOpenBrowser = useCallback((project) => {
    const browserId = `browser-${project.id}-${Date.now()}`;
    const offset = (openWindows.length + browserWindows.length) * 20;
    setBrowserWindows(prev => [...prev, { ...project, browserId }]);
    setWindowPositions(prev => ({ ...prev, [browserId]: { x: window.innerWidth / 2 + offset, y: window.innerHeight * 0.45 + offset } }));
    setActiveWindowId(browserId);
  }, [openWindows.length, browserWindows.length]);

  const closeBrowser = (browserId) => {
    setBrowserWindows(prev => prev.filter(b => b.browserId !== browserId));
    if (activeWindowId === browserId) setActiveWindowId(null);
  };

  const handleOpenPdf = useCallback((title) => {
    const pdfId = `pdf-${Date.now()}`;
    const offset = (openWindows.length + browserWindows.length + pdfWindows.length) * 20;
    setPdfWindows(prev => [...prev, { id: pdfId, title }]);
    setAnimatingPdf({ id: pdfId, type: 'open' });
    setWindowPositions(prev => ({ ...prev, [pdfId]: { x: window.innerWidth / 2 + offset, y: window.innerHeight * 0.45 + offset } }));
    setActiveWindowId(pdfId);
    setTimeout(() => setAnimatingPdf(null), 500);
  }, [openWindows.length, browserWindows.length, pdfWindows.length]);

  const closePdf = (pdfId) => {
    setAnimatingPdf({ id: pdfId, type: 'minimize' });
    setTimeout(() => {
      setPdfWindows(prev => prev.filter(p => p.id !== pdfId));
      setAnimatingPdf(null);
      if (activeWindowId === pdfId) setActiveWindowId(null);
    }, 500);
  };

  const handleAppClick = (appId, index) => {
    if (appId === 'resume') {
      const name = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ') || 'Resume';
      handleOpenPdf(`${name}_Resume.pdf`);
      if (iconRefs.current[index]) createBounceAnimation(iconRefs.current[index]);
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
        setWindowPositions(prev => ({ ...prev, [appId]: { x: window.innerWidth / 2 + offset, y: window.innerHeight * 0.45 + offset } }));
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

  const handleMouseDown = (appId, e) => {
    setActiveWindowId(appId);
    setIsDragging(appId);
    const pos = windowPositions[appId] || { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMouseMoveGlobal = useCallback((e) => {
    if (isDragging) {
      setWindowPositions(prev => ({ ...prev, [isDragging]: { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y } }));
    }
  }, [isDragging]);

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

  // Work experience from userDetails
  const workExperiences = userDetails?.workExperience || [];
  const contactInfo = {
    email: userDetails?.email || 'hello@example.com',
    github: userDetails?.github || '',
    linkedin: userDetails?.linkedin || '',
    twitter: userDetails?.twitter || '',
    dribbble: userDetails?.dribbble || '',
    behance: userDetails?.behance || '',
  };
  const fullName = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ') || 'Portfolio';

  return (
    <div className="flex flex-col items-center w-full h-full relative pointer-events-none">
      {/* Windows Layer */}
      <div className="flex-1 w-full relative pointer-events-none">
        {apps.map((app, index) => {
          const isOpen = openWindows.includes(app.id);
          const isMinimized = minimizedWindows.includes(app.id);
          const isMaximized = maximizedWindows.includes(app.id);
          const isAnimating = animatingWindow?.id === app.id;

          if (!isOpen || (isMinimized && !isAnimating)) return null;

          const pos = windowPositions[app.id] || { x: 0, y: 0 };
          const isActive = activeWindowId === app.id;

          let animationStyles = {};
          if (isAnimating) {
            const dockPos = currentPositions[index] || 0;
            const dockRect = dockRef.current?.getBoundingClientRect();
            const targetX = dockRect ? dockRect.left + dockPos + padding : window.innerWidth / 2;
            const targetY = dockRect ? dockRect.top + baseIconSize / 2 : window.innerHeight;
            const isOpening = animatingWindow.type === 'open';
            if (isOpening) {
              animationStyles = { animation: 'macWindowOpen 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' };
            } else {
              animationStyles = { animation: 'macWindowMinimize 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' };
            }
          }

          return (
            <div
              key={`window-${app.id}`}
              onMouseDown={() => setActiveWindowId(app.id)}
              onWheel={(e) => e.stopPropagation()}
              className={`fixed z-40 overflow-hidden border shadow-2xl flex flex-col pointer-events-auto ${
                app.id === 'work_experience' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#faf9f6] border-[#d1d1d1]'
              } ${
                isMaximized || isMobile
                  ? 'max-w-none rounded-none border-0 transition-all duration-300'
                  : 'w-[896px] h-[70vh] rounded-lg transition-shadow'
              } ${isActive ? 'shadow-2xl ring-1 ring-black/5' : 'shadow-lg opacity-95'}`}
              style={{
                ...(isMaximized || isMobile ? {
                  zIndex: isActive ? 50 : 40,
                  left: isMobile ? '2.5%' : '0',
                  top: isMobile ? '50px' : '40px',
                  width: isMobile ? '95vw' : '100vw',
                  height: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 140px)',
                  transform: 'none',
                  borderRadius: isMobile ? '12px' : '0',
                } : {
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isActive ? 50 : 40,
                }),
                ...animationStyles,
              }}
            >
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes macWindowOpen {
                  0% { transform: translate(calc(${currentPositions[index] || 0}px - ${pos.x}px), calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; }
                  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes macWindowMinimize {
                  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                  100% { transform: translate(calc(${currentPositions[index] || 0}px - ${pos.x}px), calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; }
                }
              `}} />

              {/* Window Header */}
              <div
                onMouseDown={(e) => !isMobile && !isMaximized && handleMouseDown(app.id, e)}
                className={`h-10 border-b flex items-center px-4 justify-between select-none ${
                  app.id === 'work_experience' ? 'bg-[#2d2d2d] border-[#1e1e1e]' : 'bg-[#e8e6e1] border-[#d1d1d1]'
                } ${isMobile || isMaximized ? 'cursor-default' : 'cursor-move active:cursor-grabbing'}`}
              >
                <div className="flex gap-2 items-center">
                  <div className={`text-sm font-medium flex items-center gap-2 ${app.id === 'work_experience' ? 'text-[#d4d4d4]' : 'text-[#444]'}`}>
                    <span className="opacity-70">{app.id === 'works' ? '📂' : '📄'}</span>
                    {app.id === 'works' ? 'Projects' : `${app.name}.mdx`} <span className="opacity-50 text-[10px]">⌄</span>
                  </div>
                </div>
                <div className={`flex items-center gap-4 ${app.id === 'work_experience' ? 'text-[#aaa]' : 'text-[#666]'}`}>
                  <Minus className="w-4 h-4 cursor-pointer hover:opacity-70" onClick={(e) => toggleMinimize(app.id, e)} />
                  <Square className="w-3 h-3 cursor-pointer hover:opacity-70" onClick={(e) => toggleMaximize(app.id, e)} />
                  <X className="w-4 h-4 cursor-pointer hover:opacity-70" onClick={() => closeWindow(app.id)} />
                </div>
              </div>

              {/* Window Toolbar */}
              {app.id !== 'works' && (
                <div className={`h-12 border-b flex items-center px-4 gap-4 overflow-x-auto justify-between ${
                  app.id === 'work_experience' ? 'bg-[#252525] border-[#1e1e1e]' : 'bg-[#f4f2ee] border-[#e0ddd8]'
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
                  <Button3D>EDIT</Button3D>
                </div>
              )}

              {/* Window Content */}
              <div className={`flex-1 overflow-hidden relative ${
                app.id === 'works' ? '' : app.id === 'work_experience'
                  ? 'bg-[#1e1e1e] m-4 rounded-md border border-[#333] shadow-sm'
                  : 'bg-white m-4 rounded-md border border-[#e0ddd8] shadow-sm'
              }`}>
                <div className="w-full h-full overflow-y-auto">
                  <div className="w-full h-full flex flex-col relative">
                    {/* WORKS — Finder style */}
                    {app.id === 'works' ? (
                      <div className="flex h-full bg-[#faf9f6]">
                        <div className={`w-44 bg-[#ebe9e4]/50 backdrop-blur-md border-r border-[#d1d1d1] p-3 flex flex-col gap-6 ${isMobile ? 'hidden' : 'flex'}`}>
                          <div>
                            <div className="text-[10px] font-bold text-[#8e8c87] uppercase tracking-wider mb-2 px-2">Favorites</div>
                            <div className="flex flex-col gap-0.5">
                              {[{ name: 'AirDrop', icon: '📡' }, { name: 'Recents', icon: '🕒' }, { name: 'Applications', icon: '🚀' }, { name: 'Desktop', icon: '🖥️' }, { name: 'Documents', icon: '📄' }, { name: 'Downloads', icon: '⬇️' }].map((item) => (
                                <div key={item.name} className={`px-2 py-1.5 rounded-md text-[11px] flex items-center gap-2 cursor-pointer transition-colors ${item.name === 'Desktop' ? 'bg-[#d1cfca] text-[#222] font-semibold' : 'text-[#555] hover:bg-[#e1dfda]'}`}>
                                  <span className="text-sm opacity-80">{item.icon}</span>{item.name}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-[#8e8c87] uppercase tracking-wider mb-2 px-2">Tags</div>
                            <div className="flex flex-col gap-1.5 px-2">
                              <div className="flex items-center gap-2 text-[10px] text-[#555] cursor-pointer hover:text-[#222]"><div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-sm" /> Work</div>
                              <div className="flex items-center gap-2 text-[10px] text-[#555] cursor-pointer hover:text-[#222]"><div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shadow-sm" /> Personal</div>
                              <div className="flex items-center gap-2 text-[10px] text-[#555] cursor-pointer hover:text-[#222]"><div className="w-2.5 h-2.5 rounded-full bg-[#28c841] shadow-sm" /> Important</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col bg-white">
                          <div className="h-8 border-b border-[#e0ddd8] flex items-center px-4 gap-2 text-[10px] text-[#888] bg-[#fdfdfb]">
                            <span>Macintosh HD</span><span className="opacity-40">›</span><span>Users</span><span className="opacity-40">›</span><span>{fullName}</span><span className="opacity-40">›</span><span className="text-[#444] font-medium">Projects</span>
                          </div>
                          <div className="flex-1 p-8 overflow-y-auto">
                            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-x-6 gap-y-10 max-w-4xl mx-auto`}>
                              {projects.map((proj, index) => (
                                <div
                                  key={proj.id}
                                  className={`transform scale-110 origin-center cursor-move transition-all duration-500 ease-in-out ${draggedProjectIndex === index ? 'opacity-50 scale-100 z-50' : 'opacity-100'}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => handleDragOver(e, index)}
                                  onDrop={handleDrop}
                                >
                                  <AnimatedFolder
                                    title={proj.name}
                                    projects={[
                                      { id: `${proj.id}-1`, title: proj.name, image: proj.icon },
                                      { id: `${proj.id}-2`, title: 'Documentation', image: '📄' },
                                      { id: `${proj.id}-3`, title: 'Assets', image: '🎨' },
                                    ]}
                                    onProjectClick={(project) => handleOpenBrowser({ ...project, title: proj.name, image: proj.icon })}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : app.id === 'work_experience' ? (
                      /* WORK EXPERIENCE — VS Code style */
                      <div className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-0 flex flex-col overflow-hidden">
                        <div className="flex bg-[#2d2d2d] border-b border-[#1e1e1e]">
                          <div className="px-3 py-2 bg-[#1e1e1e] border-t border-t-[#007aff] flex items-center gap-2">
                            <span className="text-[#e06c75]">experience.ts</span>
                            <X size={10} className="opacity-50" />
                          </div>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                          <div className="w-10 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end pr-2 pt-4 text-[#858585] select-none">
                            {Array.from({ length: 30 }).map((_, i) => (
                              <div key={i} className="leading-5">{i + 1}</div>
                            ))}
                          </div>
                          <div className="flex-1 p-4 pt-4 overflow-y-auto leading-5">
                            <div>
                              <span className="text-[#c678dd]">const</span> <span className="text-[#e06c75]">workExperience</span> = [
                            </div>
                            {workExperiences.length > 0 ? workExperiences.map((exp, i) => (
                              <div key={i} className="pl-4 mt-2">
                                <span className="text-[#abb2bf]">{'{'}</span>
                                <div className="pl-4"><span className="text-[#d19a66]">company</span>: <span className="text-[#98c379]">"{exp.company || exp.name}"</span>,</div>
                                <div className="pl-4"><span className="text-[#d19a66]">role</span>: <span className="text-[#98c379]">"{exp.role || exp.position}"</span>,</div>
                                <div className="pl-4"><span className="text-[#d19a66]">duration</span>: <span className="text-[#98c379]">"{exp.startDate || exp.duration}"</span>,</div>
                                <span className="text-[#abb2bf]">{'}'}{i < workExperiences.length - 1 ? ',' : ''}</span>
                              </div>
                            )) : (
                              <div className="pl-4 mt-2 text-[#5c6370]">// Add work experience to see it here</div>
                            )}
                            <div className="mt-2"><span className="text-[#abb2bf]">];</span></div>
                            <div className="mt-4"><span className="text-[#c678dd]">export default</span> <span className="text-[#e06c75]">workExperience</span>;</div>
                          </div>
                        </div>
                        <div className="h-6 bg-[#007aff] text-white flex items-center px-2 justify-between text-[10px]">
                          <div className="flex gap-3"><span>Main*</span><span>Ln 1, Col 1</span></div>
                          <div className="flex gap-3"><span>UTF-8</span><span>TypeScript</span></div>
                        </div>
                      </div>
                    ) : app.id === 'about' ? (
                      /* ABOUT — Chalkboard style */
                      <div className="w-full h-full bg-[#1e3d2f] relative font-sans flex flex-col">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/chalkboard.png")`, backgroundColor: '#1e3d2f' }} />
                          <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white/5 rounded-full opacity-20 -rotate-12" />
                          <div className="absolute bottom-20 left-10 w-48 h-1 bg-white/5 rotate-3 opacity-20" />
                        </div>
                        <div className="relative z-10 flex-1 overflow-y-auto p-8">
                          <div className="flex flex-col gap-8 text-white/90 max-w-2xl mx-auto w-full">
                            <div className="border-b-2 border-white/20 pb-4">
                              <h1 className="text-4xl font-bold tracking-tight mb-2 text-white italic">
                                {userDetails?.about ? '' : 'Hi, I\'m'} {fullName}
                              </h1>
                              {userDetails?.introduction && (
                                <p className="text-lg text-white/70 italic">{userDetails.introduction}</p>
                              )}
                            </div>
                            {userDetails?.about && (
                              <section>
                                <h2 className="text-2xl font-bold text-[#fef08a] mb-3 underline decoration-wavy">About</h2>
                                <p className="text-lg leading-relaxed italic">{userDetails.about}</p>
                              </section>
                            )}
                            <section>
                              <h2 className="text-2xl font-bold text-[#fecaca] mb-3 underline decoration-wavy">Skills</h2>
                              <div className="flex flex-wrap gap-3 mt-2">
                                {(userDetails?.skills || userDetails?.tools || []).slice(0, 8).map((skill, i) => (
                                  <div key={i} className="px-4 py-2 bg-[#86efac]/10 border border-[#86efac]/30 rounded-full text-[#86efac] text-xs font-bold">
                                    #{typeof skill === 'string' ? skill : skill.name}
                                  </div>
                                ))}
                                {(!userDetails?.skills && !userDetails?.tools) && (
                                  <div className="text-white/40 italic text-sm">Add skills to see them here</div>
                                )}
                              </div>
                            </section>
                            <div className="flex items-center justify-center pt-8">
                              <ImgStack images={
                                (userDetails?.avatar?.url ? [userDetails.avatar.url] : []).length > 0
                                  ? [userDetails.avatar.url, userDetails.avatar.url, userDetails.avatar.url]
                                  : ['/assets/png/seo-profile.png', '/assets/png/seo-profile.png', '/assets/png/seo-profile.png']
                              } />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : app.id === 'contact' ? (
                      /* CONTACT — Notion style */
                      <div className="w-full h-full bg-white flex flex-col font-sans text-[#37352f]">
                        <div className="px-10 pt-12 pb-4">
                          <div className="flex items-center gap-4 mb-2 opacity-50 text-sm">
                            <span>📂</span><span>Contacts</span><span>/</span><span>contact.mdx</span>
                          </div>
                          <h1 className="text-4xl font-bold mb-8 text-[#37352f]">Get in touch</h1>
                        </div>
                        <div className="px-10 pb-20 space-y-8 overflow-y-auto">
                          <section>
                            <div className="flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4">
                              <span className="text-xl">📧</span>
                              <h2 className="text-lg font-semibold">Contact Details</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {contactInfo.email && (
                                <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer">
                                  <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Email</div>
                                  <div className="font-medium">{contactInfo.email}</div>
                                </div>
                              )}
                              {contactInfo.github && (
                                <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer">
                                  <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">GitHub</div>
                                  <div className="font-medium">{contactInfo.github}</div>
                                </div>
                              )}
                              {contactInfo.linkedin && (
                                <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer">
                                  <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">LinkedIn</div>
                                  <div className="font-medium">{contactInfo.linkedin}</div>
                                </div>
                              )}
                              <div className="p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors cursor-pointer" onClick={() => handleOpenPdf(`${fullName}_Resume.pdf`)}>
                                <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">Resume</div>
                                <div className="font-medium text-[#007aff] hover:underline">View Resume</div>
                              </div>
                            </div>
                          </section>
                          {(contactInfo.twitter || contactInfo.dribbble || contactInfo.behance) && (
                            <section>
                              <div className="flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4">
                                <span className="text-xl">🌐</span>
                                <h2 className="text-lg font-semibold">Social Connect</h2>
                              </div>
                              <div className="space-y-3">
                                {contactInfo.twitter && (
                                  <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                                    <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded text-[10px] font-bold">X</span>
                                    <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.twitter}</span>
                                  </div>
                                )}
                                {contactInfo.dribbble && (
                                  <div className="flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors">
                                    <span className="w-6 h-6 flex items-center justify-center bg-[#ea4c89] text-white rounded text-[10px] font-bold">Dr</span>
                                    <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.dribbble}</span>
                                  </div>
                                )}
                              </div>
                            </section>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* HOME — Hero card */
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0033] to-[#0d001a] text-white p-8">
                        <div className="text-center max-w-lg">
                          {userDetails?.avatar?.url && (
                            <img src={userDetails.avatar.url} alt={fullName} className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-white/20 shadow-xl" />
                          )}
                          <h1 className="text-4xl font-bold mb-4 tracking-tight" style={{ textShadow: '2px 2px 0px rgba(255,0,255,0.4)' }}>
                            {fullName || 'Welcome'}
                          </h1>
                          {userDetails?.introduction && (
                            <p className="text-slate-300 text-sm leading-relaxed mb-8">{userDetails.introduction}</p>
                          )}
                          <button className="border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-black">
                            View Portfolio
                          </button>
                        </div>
                        {/* Decorative stars */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute rounded-full bg-white"
                              style={{
                                width: `${Math.random() * 2 + 1}px`,
                                height: `${Math.random() * 2 + 1}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.7 + 0.3,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* PDF Windows */}
        {pdfWindows.map((pdf) => {
          const pos = windowPositions[pdf.id] || { x: 0, y: 0 };
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
                ...(isMobile ? { zIndex: isActive ? 60 : 40, left: '2.5%', top: '50px', width: '95vw', height: 'calc(100vh - 160px)', transform: 'none', borderRadius: '12px' } : { left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)', zIndex: isActive ? 60 : 40 }),
                ...animationStyles,
              }}
            >
              <style dangerouslySetInnerHTML={{ __html: `@keyframes pdfWindowOpen { 0% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } } @keyframes pdfWindowMinimize { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, calc(100vh - ${pos.y}px)) scale(0.1); opacity: 0; } }` }} />
              <div onMouseDown={(e) => handleMouseDown(pdf.id, e)} className="h-9 bg-[#323639] border-b border-[#1a1a1a] flex items-center px-3 justify-between select-none cursor-move active:cursor-grabbing rounded-t-lg">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1.5 px-1">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c940] border border-[#1aab29]" />
                  </div>
                  <div className="text-[12px] font-medium text-[#eee] flex items-center gap-1 ml-2">
                    <span className="opacity-70">📄</span><span>{pdf.title}</span>
                  </div>
                </div>
                <div className="p-1 hover:bg-white/10 rounded text-[#ccc]" onClick={() => closePdf(pdf.id)}><X className="w-3.5 h-3.5" /></div>
              </div>
              <div className="h-12 bg-[#323639] border-b border-[#1a1a1a] flex items-center px-4 justify-between">
                <div className="flex items-center gap-4 text-[#eee]">
                  <div className="flex items-center gap-2 bg-[#202124] px-3 py-1 rounded border border-[#444] text-xs"><span>1 / 1</span></div>
                  <div className="h-4 w-[1px] bg-[#444]" />
                  <div className="flex items-center gap-3">
                    <Minus size={14} className="cursor-pointer hover:text-white" />
                    <span className="text-xs w-8 text-center">100%</span>
                    <Square size={12} className="cursor-pointer hover:text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-[#007aff] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[#0062cc]">Download</button>
                </div>
              </div>
              <div className="flex-1 bg-[#525659] overflow-auto p-8 flex justify-center">
                <div className="bg-white w-full max-w-[600px] shadow-2xl p-12 text-[#333] font-serif min-h-[842px]">
                  <div className="border-b-2 border-black pb-4 mb-8">
                    <h1 className="text-3xl font-bold uppercase tracking-tighter">{fullName}</h1>
                    <p className="text-sm italic mt-1">{userDetails?.introduction || 'Portfolio'}</p>
                    <div className="flex gap-4 text-[10px] mt-2 opacity-70">
                      {contactInfo.email && <span>{contactInfo.email}</span>}
                      {contactInfo.github && <><span>•</span><span>{contactInfo.github}</span></>}
                    </div>
                  </div>
                  {userDetails?.about && (
                    <section className="mb-8">
                      <h2 className="text-sm font-bold uppercase border-b border-black/10 mb-3">Summary</h2>
                      <p className="text-xs leading-relaxed">{userDetails.about}</p>
                    </section>
                  )}
                  {workExperiences.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-sm font-bold uppercase border-b border-black/10 mb-3">Experience</h2>
                      {workExperiences.slice(0, 3).map((exp, i) => (
                        <div key={i} className="mb-4">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-xs font-bold">{exp.role || exp.position} @ {exp.company || exp.name}</h3>
                            <span className="text-[10px] opacity-60">{exp.startDate || exp.duration}</span>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                  <div className="mt-12 pt-8 border-t border-black/5 text-center opacity-30 text-[8px]">
                    Generated by Designfolio
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Browser Windows */}
        {browserWindows.map((browser) => {
          const pos = windowPositions[browser.browserId] || { x: 0, y: 0 };
          const isActive = activeWindowId === browser.browserId;
          const isMinimized = minimizedWindows.includes(browser.browserId);
          if (isMinimized) return null;

          return (
            <div
              key={browser.browserId}
              onMouseDown={() => setActiveWindowId(browser.browserId)}
              onWheel={(e) => e.stopPropagation()}
              className={`fixed z-40 overflow-hidden bg-[#faf9f6] border border-[#d1d1d1] shadow-2xl flex flex-col pointer-events-auto ${isMobile ? 'max-w-none rounded-xl' : 'w-[896px] h-[70vh] rounded-lg'} ${isActive ? 'shadow-2xl ring-1 ring-black/5' : 'shadow-lg opacity-95'}`}
              style={isMobile ? { zIndex: isActive ? 60 : 40, left: '2.5%', top: '50px', width: '95vw', height: 'calc(100vh - 160px)', transform: 'none', borderRadius: '12px' } : { left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)', zIndex: isActive ? 60 : 40 }}
            >
              <div onMouseDown={(e) => handleMouseDown(browser.browserId, e)} className="h-9 bg-[#f6f6f6] border-b border-[#d1d1d1] flex items-center px-3 justify-between select-none cursor-move active:cursor-grabbing rounded-t-lg">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1.5 px-1">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c940] border border-[#1aab29]" />
                  </div>
                  <div className="text-[12px] font-medium text-[#444] flex items-center gap-1 ml-2">
                    <span className="opacity-70">🌐</span><span>{browser.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 hover:bg-red-500 hover:text-white rounded text-[#666] transition-colors" onClick={() => closeBrowser(browser.browserId)}><X className="w-3.5 h-3.5" /></div>
                </div>
              </div>
              <div className="h-10 bg-[#f6f6f6] border-b border-[#d1d1d1] flex items-center px-3 gap-3">
                <div className="flex-1 flex items-center bg-[#e3e3e3]/50 border border-[#c8c8c8] rounded-md h-7 px-3 shadow-inner">
                  <Lock size={10} className="text-[#666] mr-2" />
                  <span className="text-[11px] text-[#444] truncate">{browser.title?.toLowerCase()?.replace(/\s+/g, '-')}.com</span>
                </div>
              </div>
              <div className="flex-1 bg-white overflow-auto flex flex-col items-center justify-center text-center p-8">
                <div className="text-8xl mb-8 opacity-20 grayscale">{browser.image}</div>
                <h1 className="text-2xl font-semibold text-gray-800">{browser.title}</h1>
                <p className="text-gray-500 leading-relaxed mt-4">Case study preview for {browser.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dock Bar */}
      <div
        ref={dockRef}
        className={`backdrop-blur-md mb-4 pointer-events-auto ${className}`}
        style={{
          width: `${contentWidth + padding * 2}px`,
          background: 'rgba(45, 45, 45, 0.75)',
          borderRadius: `${Math.max(12, baseIconSize * 0.4)}px`,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `0 ${Math.max(4, baseIconSize * 0.1)}px ${Math.max(16, baseIconSize * 0.4)}px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
          padding: `${padding}px`,
          zIndex: 100,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative" style={{ height: `${baseIconSize}px`, width: '100%' }}>
          {apps.map((app, index) => {
            const scale = currentScales[index];
            const position = currentPositions[index] || 0;
            const scaledSize = baseIconSize * scale;
            const isOpen = openWindows.includes(app.id);
            const isActive = activeWindowId === app.id;

            return (
              <div
                key={app.id}
                ref={(el) => { iconRefs.current[index] = el; }}
                className="absolute cursor-pointer flex flex-col items-center justify-end"
                title={app.name}
                onClick={() => handleAppClick(app.id, index)}
                style={{
                  left: `${position - scaledSize / 2}px`,
                  bottom: '0px',
                  width: `${scaledSize}px`,
                  height: `${scaledSize}px`,
                  transformOrigin: 'bottom center',
                  zIndex: Math.round(scale * 10),
                }}
              >
                <img
                  src={app.icon}
                  alt={app.name}
                  width={scaledSize}
                  height={scaledSize}
                  className="object-contain"
                  style={{ filter: `drop-shadow(0 ${scale > 1.2 ? Math.max(2, baseIconSize * 0.05) : Math.max(1, baseIconSize * 0.03)}px ${scale > 1.2 ? Math.max(4, baseIconSize * 0.1) : Math.max(2, baseIconSize * 0.06)}px rgba(0,0,0,${0.2 + (scale - 1) * 0.15}))` }}
                />
                {(isOpen || openApps.includes(app.id)) && (
                  <div
                    className="absolute"
                    style={{
                      bottom: `${Math.max(-2, -baseIconSize * 0.05)}px`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: `${Math.max(3, baseIconSize * 0.06)}px`,
                      height: `${Math.max(3, baseIconSize * 0.06)}px`,
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)',
                      boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MacOSDock;
