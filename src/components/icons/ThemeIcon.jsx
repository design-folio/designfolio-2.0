import * as React from "react";

function ThemeIcon(props) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M10 4a2 2 0 012-2h1a2 2 0 012 2v2.553a3 3 0 002.107 2.864l.787.246A3 3 0 0120 12.527V14a1 1 0 01-1 1H6a1 1 0 01-1-1v-1.473a3 3 0 012.106-2.864l.788-.246A3 3 0 0010 6.553V4z"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M6.002 15c.156 1.308-.506 4.513-2.002 6.868 0 0 10.292 1.191 11.685-3.925v1.928c0 .942 0 1.412.293 1.705.564.562 3.211.577 3.776-.024.296-.316.267-.77.207-1.679-.098-1.498-.368-3.417-1.109-4.873"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MemoThemeIcon = React.memo(ThemeIcon);
export default MemoThemeIcon;
