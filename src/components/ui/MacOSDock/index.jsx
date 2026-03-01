import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Minus, Square, RefreshCw, Lock } from 'lucide-react';
import Button3D from '../button-3d';
import WindowContent from './WindowContent';
import DockBar from './DockBar';


const MacOSDock = ({ apps, onAppClick, openApps = [], className = '', userDetails, edit = false, onEditBio, onEditHome, onEditContact, onEditWorkExperience, onAddWorkExperience }) => {
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

  // ── Projects ─────────────────────────────────────────────────────────────────
  const userProjects = userDetails?.projects?.slice(0, 5) || [];
  const [projects, setProjects] = useState(
    userProjects.length > 0
      ? userProjects.map((p, i) => ({
        id: `proj${i}`,
        name: p.title || `Project ${i + 1}`,
        icon: p.thumbnail?.url || '📂',
        category: p.category || 'Design',
        date: '',
        slug: p.slug || p._id || '',
      }))
      : [
        { id: 'proj1', name: 'Project 1', icon: '🧠', category: 'Design', date: '', slug: '' },
        { id: 'proj2', name: 'Project 2', icon: '⚡', category: 'Dev', date: '', slug: '' },
        { id: 'proj3', name: 'Project 3', icon: '🎨', category: 'Design', date: '', slug: '' },
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
      const dragged = newProjects[draggedProjectIndex];
      newProjects.splice(draggedProjectIndex, 1);
      newProjects.splice(index, 0, dragged);
      setProjects(newProjects);
      setDraggedProjectIndex(index);
    }
  };
  const handleDrop = (e) => { e.preventDefault(); setDraggedProjectIndex(null); };

  // ── Browser windows ──────────────────────────────────────────────────────────
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

  // ── PDF windows ──────────────────────────────────────────────────────────────
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

  // ── App click / window management ────────────────────────────────────────────
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

  // ── Window drag ──────────────────────────────────────────────────────────────
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

          const pos = windowPositions[app.id] || { x: 0, y: 0 };
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
                    left: isMobile ? '2.5%' : '0',
                    top: isMobile ? '50px' : '40px',
                    width: isMobile ? '95vw' : '100vw',
                    height: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 140px)',
                    transform: 'none',
                    borderRadius: isMobile ? '12px' : '0',
                  }
                  : {
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isActive ? 50 : 40,
                  }),
                ...animationStyles,
              }}
            >
              <style dangerouslySetInnerHTML={{
                __html: `
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
                <div className={`flex items-center gap-4 ${app.id === 'work_experience' ? 'text-[#aaa]' : 'text-[#666]'}`}>
                  <Minus className="w-4 h-4 cursor-pointer hover:opacity-70" onClick={(e) => toggleMinimize(app.id, e)} />
                  <Square className="w-3 h-3 cursor-pointer hover:opacity-70" onClick={(e) => toggleMaximize(app.id, e)} />
                  <X className="w-4 h-4 cursor-pointer hover:opacity-70" onClick={() => closeWindow(app.id)} />
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
                    <Button3D onClick={onEditBio}>EDIT</Button3D>
                  )}
                  {edit && app.id === 'home' && (
                    <Button3D onClick={onEditHome}>EDIT</Button3D>
                  )}
                  {edit && app.id === 'contact' && (
                    <Button3D onClick={onEditContact}>EDIT</Button3D>
                  )}
                  {edit && app.id === 'work_experience' && (
                    <div className="flex items-center gap-2">
                      <Button3D onClick={onAddWorkExperience}>ADD</Button3D>
                      <Button3D onClick={onEditWorkExperience}>EDIT</Button3D>
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
                      projects={projects}
                      draggedProjectIndex={draggedProjectIndex}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onProjectClick={handleOpenBrowser}
                      onOpenPdf={handleOpenPdf}
                      onViewProjects={() => handleAppClick('works', apps.findIndex(a => a.id === 'works'))}
                      edit={edit}
                      onEditContact={onEditContact}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── PDF Windows ── */}
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
                  {(userDetails?.about?.description || (typeof userDetails?.about === 'string' && userDetails.about)) && (
                    <section className="mb-8">
                      <h2 className="text-sm font-bold uppercase border-b border-black/10 mb-3">Summary</h2>
                      <p className="text-xs leading-relaxed">
                        {userDetails.about?.description ?? userDetails.about}
                      </p>
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

        {/* ── Browser Windows ── */}
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
