import React, { useState, useEffect, useRef, useCallback } from 'react';

// Default Finder menus
const DEFAULT_MENUS = [
  {
    label: 'File',
    items: [
      { label: 'New Tab', action: 'new-tab', shortcut: '⌘T' },
      { label: 'New Window', action: 'new-window', shortcut: '⌘N' },
      { label: 'New Private Window', action: 'new-private', shortcut: '⇧⌘N' },
      { type: 'separator' },
      { label: 'Open File...', action: 'open-file', shortcut: '⌘O' },
      { label: 'Open Location...', action: 'open-location', shortcut: '⌘L' },
      { type: 'separator' },
      { label: 'Close Window', action: 'close-window', shortcut: '⇧⌘W' },
      { label: 'Close Tab', action: 'close-tab', shortcut: '⌘W' },
      { label: 'Save Page As...', action: 'save-page', shortcut: '⌘S' },
      { type: 'separator' },
      { label: 'Share', action: 'share', hasSubmenu: true },
      { type: 'separator' },
      { label: 'Print...', action: 'print', shortcut: '⌘P' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', action: 'undo', shortcut: '⌘Z' },
      { label: 'Redo', action: 'redo', shortcut: '⇧⌘Z' },
      { type: 'separator' },
      { label: 'Cut', action: 'cut', shortcut: '⌘X' },
      { label: 'Copy', action: 'copy', shortcut: '⌘C' },
      { label: 'Paste', action: 'paste', shortcut: '⌘V' },
      { label: 'Select All', action: 'select-all', shortcut: '⌘A' },
      { type: 'separator' },
      { label: 'Find', action: 'find', shortcut: '⌘F' },
      { label: 'Find Next', action: 'find-next', shortcut: '⌘G' },
      { label: 'Find Previous', action: 'find-prev', shortcut: '⇧⌘G' },
      { type: 'separator' },
      { label: 'Emoji & Symbols', action: 'emoji', shortcut: '⌃⌘␣' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'as Icons', action: 'view-icons', shortcut: '⌘1' },
      { label: 'as List', action: 'view-list', shortcut: '⌘2' },
      { label: 'as Columns', action: 'view-columns', shortcut: '⌘3' },
      { label: 'as Gallery', action: 'view-gallery', shortcut: '⌘4' },
      { type: 'separator' },
      { label: 'Use Stacks', action: 'use-stacks', shortcut: '⌃⌘0' },
      { label: 'Sort By', action: 'sort-by', hasSubmenu: true },
      { type: 'separator' },
      { label: 'Hide Sidebar', action: 'hide-sidebar', shortcut: '⌥⌘S' },
      { label: 'Show Preview', action: 'show-preview', shortcut: '⇧⌘P' },
      { type: 'separator' },
      { label: 'Enter Full Screen', action: 'fullscreen', shortcut: '⌃⌘F' },
    ],
  },
  {
    label: 'Window',
    items: [
      { label: 'Minimize', action: 'minimize', shortcut: '⌘M' },
      { label: 'Zoom', action: 'zoom' },
      { type: 'separator' },
      { label: 'Cycle Through Windows', action: 'cycle-windows', shortcut: '⌘`' },
      { type: 'separator' },
      { label: 'Bring All to Front', action: 'bring-to-front' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Search', action: 'search-help' },
      { type: 'separator' },
      { label: 'App Help', action: 'app-help' },
      { label: 'Keyboard Shortcuts', action: 'shortcuts' },
      { type: 'separator' },
      { label: 'Contact Support', action: 'contact-support' },
    ],
  },
];

const APPLE_MENU_ITEMS = [
  { label: 'About This Mac', action: 'about' },
  { type: 'separator' },
  { label: 'System Preferences...', action: 'preferences' },
  { label: 'App Store...', action: 'app-store' },
  { type: 'separator' },
  { label: 'Recent Items', action: 'recent', hasSubmenu: true },
  { type: 'separator' },
  { label: 'Force Quit Applications...', action: 'force-quit', shortcut: '⌥⌘⎋' },
  { type: 'separator' },
  { label: 'Sleep', action: 'sleep' },
  { label: 'Restart...', action: 'restart' },
  { label: 'Shut Down...', action: 'shutdown' },
  { type: 'separator' },
  { label: 'Lock Screen', action: 'lock', shortcut: '⌃⌘Q' },
  { label: 'Log Out...', action: 'logout', shortcut: '⇧⌘Q' },
];

const MenuDropdown = ({ isOpen, onClose, items, position, onAction }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed backdrop-blur-md z-[110]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'rgba(40, 40, 40, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
        minWidth: '220px',
      }}
    >
      <div className="py-1">
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={index} className="h-px bg-white/15 mx-2 my-1" />;
          }

          return (
            <div
              key={index}
              className="px-4 py-1 text-white text-sm cursor-pointer hover:bg-white/10 transition-colors duration-100 flex justify-between items-center"
              onClick={() => {
                if (item.action) onAction?.(item.action);
                onClose();
              }}
            >
              <span className="flex items-center">
                {item.label}
                {item.hasSubmenu && <span className="ml-2 text-xs opacity-70">▶</span>}
              </span>
              {item.shortcut && (
                <span className="text-xs text-white/60 ml-4">{item.shortcut}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * MacOSMenuBar
 *
 * @param {string}   appName      - Bold app name shown after the Apple logo. Default: 'Finder'
 * @param {Array}    menus        - Array of { label, items[] } menu configs. Default: DEFAULT_MENUS
 * @param {Function} onMenuAction - Callback called with the action string when a menu item is clicked
 * @param {string}   className    - Extra CSS classes applied to the bar root element
 */
export default function MacOSMenuBar({
  appName = 'Finder',
  menus = DEFAULT_MENUS,
  onMenuAction,
  className = '',
}) {
  const [currentTime, setCurrentTime] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const appleLogoRef = useRef(null);
  const menuRefs = useRef({});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAppleMenuClick = useCallback(() => {
    if (activeMenu === 'apple') {
      setActiveMenu(null);
    } else {
      if (appleLogoRef.current) {
        const rect = appleLogoRef.current.getBoundingClientRect();
        setDropdownPosition({ x: rect.left, y: rect.bottom + 4 });
      }
      setActiveMenu('apple');
    }
  }, [activeMenu]);

  const handleMenuItemClick = useCallback((menuLabel) => {
    if (activeMenu === menuLabel) {
      setActiveMenu(null);
    } else {
      const menuRef = menuRefs.current[menuLabel];
      if (menuRef) {
        const rect = menuRef.getBoundingClientRect();
        setDropdownPosition({ x: rect.left, y: rect.bottom + 4 });
        setActiveMenu(menuLabel);
      }
    }
  }, [activeMenu]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-7 backdrop-blur-md z-[100] flex justify-between items-center px-4 select-none ${className}`}
      style={{
        background: 'rgba(40, 40, 40, 0.65)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-center space-x-4">
        {/* Apple Logo */}
        <div
          ref={appleLogoRef}
          onClick={handleAppleMenuClick}
          className="cursor-pointer hover:opacity-80 transition-opacity duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <g clipPath="url(#clip0_macos_apple)">
              <path d="M30.472 3.045H28.952V1.525H27.432V-0.00500488H6.09197V12.195H1.52197V13.715H9.14197V12.195H7.62197V1.525H24.382V7.615H30.472V22.855H28.952V25.905H30.472V30.475H32.002V4.575H30.472V3.045Z" fill="white"/>
              <path d="M30.4719 30.475H7.62195V31.995H30.4719V30.475Z" fill="white"/>
              <path d="M28.952 19.805H27.432V22.855H28.952V19.805Z" fill="white"/>
              <path d="M27.432 16.765H25.902V19.805H27.432V16.765Z" fill="white"/>
              <path d="M25.902 15.235H10.672V16.765H25.902V15.235Z" fill="white"/>
              <path d="M21.332 7.61499H19.812V9.14499H21.332V7.61499Z" fill="white"/>
              <path d="M19.8119 10.665H15.2419V12.195H19.8119V10.665Z" fill="white"/>
              <path d="M15.2419 7.61499H13.7119V9.14499H15.2419V7.61499Z" fill="white"/>
              <path d="M10.672 13.715H9.14197V15.235H10.672V13.715Z" fill="white"/>
              <path d="M7.62192 27.425H6.09192V30.475H7.62192V27.425Z" fill="white"/>
              <path d="M6.0919 24.385H4.5719V27.425H6.0919V24.385Z" fill="white"/>
              <path d="M4.572 21.335H3.052V24.385H4.572V21.335Z" fill="white"/>
              <path d="M3.05197 18.285H1.52197V21.335H3.05197V18.285Z" fill="white"/>
              <path d="M1.52195 13.715H0.00195312V18.285H1.52195V13.715Z" fill="white"/>
            </g>
            <defs>
              <clipPath id="clip0_macos_apple">
                <rect width="32" height="32" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Current App Name */}
        <span className="text-white text-[13px] font-bold cursor-default px-2">
          {appName}
        </span>

        {/* Menu Items */}
        {menus.map((menu) => (
          <span
            key={menu.label}
            ref={(el) => { menuRefs.current[menu.label] = el; }}
            onClick={() => handleMenuItemClick(menu.label)}
            className="hidden md:inline-block text-white text-[13px] cursor-default px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          >
            {menu.label}
          </span>
        ))}
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* System Icons */}
        <div className="flex items-center space-x-3 text-white">
          {/* Battery */}
          <svg className="inline-block" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
            <line x1="22" y1="11" x2="22" y2="13" />
            <line x1="6" y1="11" x2="14" y2="11" />
          </svg>
          {/* WiFi */}
          <svg className="hidden md:inline-block" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <span className="text-white text-[13px] font-medium cursor-default">{currentTime}</span>
      </div>

      {/* Apple Menu Dropdown */}
      <MenuDropdown
        isOpen={activeMenu === 'apple'}
        onClose={() => setActiveMenu(null)}
        items={APPLE_MENU_ITEMS}
        position={dropdownPosition}
        onAction={onMenuAction}
      />

      {/* App Menu Dropdowns */}
      {menus.map((menu) => (
        <MenuDropdown
          key={menu.label}
          isOpen={activeMenu === menu.label}
          onClose={() => setActiveMenu(null)}
          items={menu.items}
          position={dropdownPosition}
          onAction={onMenuAction}
        />
      ))}
    </div>
  );
}
