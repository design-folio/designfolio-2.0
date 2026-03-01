import React from 'react';

const DockBar = ({
  dockRef,
  className,
  contentWidth,
  padding,
  baseIconSize,
  apps,
  currentScales,
  currentPositions,
  openWindows,
  openApps,
  activeWindowId,
  iconRefs,
  handleAppClick,
  handleMouseMove,
  handleMouseLeave,
}) => (
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
);

export default DockBar;
