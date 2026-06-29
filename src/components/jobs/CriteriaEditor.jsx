import { useState, useEffect, useRef, useMemo } from "react";
import { Zap } from "lucide-react";
import { motion } from "motion/react";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { _getJobRoleSuggestions } from "@/network/jobs";

export function CriteriaEditor({ answers, onRescan, isRescanning }) {
  const [role, setRole] = useState(answers[0]?.answer || "");
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const suggestTimerRef = useRef(null);

  useEffect(() => {
    clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await _getJobRoleSuggestions(role);
        setRoleSuggestions(data.suggestions || []);
      } catch {
        setRoleSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(suggestTimerRef.current);
  }, [role]);

  const [city, setCity] = useState(() => {
    const raw = answers[1]?.answer || "";
    if (raw.includes(": ")) return raw.split(": ").slice(1).join(": ");
    return raw;
  });

  const isDirty = useMemo(() => {
    const storedCity = (() => {
      const raw = answers[1]?.answer || "";
      if (raw.includes(": ")) return raw.split(": ").slice(1).join(": ");
      return raw;
    })();
    return role !== (answers[0]?.answer || "") || city !== storedCity;
  }, [role, city, answers]);

  const canRescan = role.trim().length > 0;

  const handleRescan = () => {
    if (!canRescan || isRescanning) return;
    onRescan([
      { question: "What role are you looking for?", answer: role.trim() },
      { question: answers[1]?.question || "Where are you open to working?", answer: city.trim() },
    ]);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-black/[0.05] px-4 pt-4 pb-3.5 dark:border-white/[0.06]">
        <p className="text-foreground/40 text-[11px]">Edit below to refresh your AI picks</p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-3">
        {/* Role */}
        <div className="flex flex-col gap-1.5">
          <label className="text-foreground/40 text-[11px] font-medium tracking-wide uppercase">
            Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Product Designer"
            className="text-foreground placeholder:text-foreground/30 h-9 w-full rounded-xl border border-black/[0.08] bg-black/[0.03] px-3 text-[13px] transition-colors outline-none focus:border-black/[0.18] dark:border-white/[0.1] dark:bg-white/[0.05] dark:focus:border-white/[0.22]"
          />
          {roleSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {roleSuggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setRole(s.label)}
                  className={`h-6 rounded-full border px-2.5 text-[11px] transition-colors ${
                    role === s.label
                      ? "bg-foreground text-background border-foreground"
                      : "text-foreground/55 hover:text-foreground border-black/[0.08] bg-black/[0.03] hover:border-black/[0.16] hover:bg-black/[0.06] dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:border-white/[0.2] dark:hover:bg-white/[0.08]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-foreground/40 text-[11px] font-medium tracking-wide uppercase">
            Location
          </label>
          <LocationAutocomplete
            value={city}
            onChange={setCity}
            onSelect={setCity}
            placeholder="e.g. Remote, New York"
            size="sm"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="px-3 pt-2 pb-3">
        <button
          onClick={handleRescan}
          disabled={!canRescan || !isDirty || isRescanning}
          className="bg-foreground text-background flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl text-[13px] font-semibold transition-opacity select-none hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-80 dark:bg-[#2E2B27] dark:text-white"
        >
          {isRescanning ? (
            <>
              <div className="pointer-events-none flex gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1 w-1 rounded-full bg-current"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              Scanning…
            </>
          ) : (
            <span className="pointer-events-none">Rescan jobs</span>
          )}
        </button>
      </div>
    </div>
  );
}
