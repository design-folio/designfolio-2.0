import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useGlobalContext } from "@/context/globalContext";

/**
 * Theme toggles in template headers: in the builder (`persist` true), delegate to
 * `changeTheme` so context + API stay in sync with Theme sidebar. In preview/public,
 * only `next-themes` is updated.
 */
export function usePersistableThemeToggle(persist) {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const { changeTheme } = useGlobalContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const resolved = (resolvedTheme ?? theme) || "light";
  const isDark = mounted && resolved === "dark";

  const applyTheme = useCallback(
    (nextDark) => {
      if (persist) {
        changeTheme(nextDark ? 1 : 0);
      } else {
        setTheme(nextDark ? "dark" : "light");
      }
    },
    [persist, changeTheme, setTheme],
  );

  const toggleTheme = useCallback(() => {
    applyTheme(!isDark);
  }, [isDark, applyTheme]);

  return { mounted, isDark, toggleTheme, applyTheme };
}
