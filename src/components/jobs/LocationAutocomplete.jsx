import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";

async function fetchLocationSuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6&featuretype=city&accept-language=en`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set();
  return data
    .map((item) => {
      const addr = item.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || item.display_name.split(",")[0];
      const state = addr.state || "";
      const country = addr.country || "";
      const label = [city, state, country].filter(Boolean).join(", ");
      return { label, city, country };
    })
    .filter(({ label }) => {
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
}

/**
 * Google Maps-style location autocomplete backed by OpenStreetMap Nominatim.
 *
 * Props:
 *   value       — controlled string value
 *   onChange    — called with raw string as user types
 *   onSelect    — called with the chosen suggestion label string
 *   inputRef    — optional forwarded ref for the <input>
 *   onKeyDown   — passthrough for unhandled key events (e.g. Enter to advance)
 *   placeholder — input placeholder text
 *   inputClassName — extra classes for the <input> element
 *   size        — "default" | "sm"  (controls padding / font size)
 */
export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  inputRef,
  onKeyDown,
  placeholder = "e.g. Bangalore, India",
  inputClassName = "",
  size = "default",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  const search = useCallback(async (q) => {
    setIsLoading(true);
    try {
      const results = await fetchLocationSuggestions(q);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(val), 320);
  };

  const handleSelect = (suggestion) => {
    onSelect(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
        return;
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }
    }
    onKeyDown?.(e);
  };

  const handleClear = () => {
    onSelect("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef?.current?.focus();
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSm = size === "sm";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <MapPin
          className={`absolute left-3 pointer-events-none flex-shrink-0 text-muted-foreground/50 ${
            isSm ? "w-3 h-3" : "w-4 h-4 left-4"
          }`}
        />
        <input
          ref={inputRef}
          data-testid="input-city"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full outline-none transition-colors ${
            isSm
              ? "pl-7 pr-7 py-2 text-[13px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-border rounded-xl focus:border-foreground/25"
              : "pl-10 pr-10 py-4 text-[15px] bg-background/70 dark:bg-foreground/5 border border-border rounded-2xl focus:border-foreground/30"
          } text-foreground ${inputClassName}`}
        />
        {isLoading && (
          <div className={`absolute flex gap-[3px] ${isSm ? "right-3" : "right-4"}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-muted-foreground/40 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        {!isLoading && value && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute text-muted-foreground/40 hover:text-muted-foreground transition-colors ${
              isSm ? "right-2.5" : "right-4"
            }`}
          >
            <X className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.ul
            className="absolute z-50 mt-1.5 w-full bg-background dark:bg-muted/90 border border-border rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {suggestions.map((s, i) => (
              <li key={s.label}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] transition-colors ${
                    i === activeIndex
                      ? "bg-foreground/6 dark:bg-foreground/10 text-foreground"
                      : "text-foreground/80 hover:bg-foreground/4 dark:hover:bg-foreground/8"
                  } ${i < suggestions.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 mt-px" />
                  <span className="truncate">{s.label}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
