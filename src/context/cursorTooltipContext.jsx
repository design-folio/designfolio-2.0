import React, { createContext, useContext, useState, useCallback } from "react";

const CursorTooltipContext = createContext(null);

export function CursorTooltipProvider({ children }) {
  const [state, setState] = useState({
    show: false,
    text: "View Case Study",
    icon: null,
  });

  const setCursorPill = useCallback((show, text = "View Case Study", icon = null) => {
    setState({ show: !!show, text: show ? text : "View Case Study", icon: show ? icon : null });
  }, []);

  return (
    <CursorTooltipContext.Provider value={{ ...state, setCursorPill }}>
      {children}
    </CursorTooltipContext.Provider>
  );
}

export function useCursorTooltip() {
  const ctx = useContext(CursorTooltipContext);
  if (!ctx) return { show: false, setCursorPill: () => {} };
  return ctx;
}
