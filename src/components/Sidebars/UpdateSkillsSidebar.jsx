import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, Loader2, Plus } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { _getSkills } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

function toOptionString(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (x?.label) return x.label;
  if (x?.value) return x.value;
  return String(x);
}

export default function UpdateSkillsSidebar() {
  const { userDetails, setUserDetails, updateCache, closeSidebar } = useGlobalContext();

  const personaId = userDetails?.persona?.value || "";

  // Local UI state - persists within the sidebar lifetime only
  const [skillsMap, setSkillsMap] = useState(() => {
    const map = new Map();
    (userDetails?.skills || []).forEach((s) => map.set(s.label, s));
    return map;
  });
  const [selectedLabels, setSelectedLabels] = useState(
    () => (userDetails?.skills || []).map((s) => s.label)
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Debounced search term for the query key
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const hasSearch = debouncedSearch.length > 0;
  const queryKey = ["skills", hasSearch ? debouncedSearch : personaId, hasSearch ? "search" : "persona"];

  const { data: fetchedSkills = [], isFetching: skillsLoading } = useQuery({
    queryKey,
    queryFn: () =>
      _getSkills(debouncedSearch, hasSearch ? "" : personaId).then((res) => {
        const apiSkills = res?.data?.skills || [];
        return Array.isArray(apiSkills)
          ? apiSkills.map((s) => ({
              label: toOptionString(s),
              value: s._id || s.id || s.value,
              __isNew__: false,
            }))
          : [];
      }),
    enabled: !!(personaId || hasSearch),
    staleTime: 5 * 60 * 1000, // 5 minutes - skills lists are stable
    placeholderData: (prev) => prev, // keep showing previous results while loading
  });

  // Merge fetched skills into the map and visible list
  useEffect(() => {
    if (!fetchedSkills.length) return;
    setSkillsMap((prev) => {
      const next = new Map(prev);
      fetchedSkills.forEach((s) => next.set(s.label, s));
      return next;
    });
  }, [fetchedSkills]);

  // All labels to display: selected first, then fetched
  const allLabels = useMemo(() => {
    const fetched = fetchedSkills.map((s) => s.label);
    return [...new Set([...selectedLabels, ...fetched])].slice(0, 40);
  }, [fetchedSkills, selectedLabels]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? allLabels.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
        : allLabels,
    [allLabels, search],
  );

  const hasExact = useMemo(
    () => allLabels.some((s) => s.toLowerCase() === search.trim().toLowerCase()),
    [allLabels, search],
  );
  const showAdd = search.trim() !== "" && !hasExact;

  const toggle = (label) =>
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const addCustom = (label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const skill = { label: trimmed, value: `custom-${Date.now()}`, __isNew__: true };
    setSkillsMap((prev) => new Map(prev).set(trimmed, skill));
    setSelectedLabels((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setSearch("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = selectedLabels.map(
        (label) => skillsMap.get(label) || { label, value: label, __isNew__: true }
      );
      const res = await _updateUser({ skills: payload });
      const updated = res?.data?.user;
      if (updated) {
        updateCache("userDetails", updated);
        setUserDetails(updated);
      }
      closeSidebar(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {skillsLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>

        {selectedLabels.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedLabels.length} skill{selectedLabels.length !== 1 ? "s" : ""} selected
          </p>
        )}

        {/* Skills */}
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
        >
          {filtered.map((skill) => {
            const isSelected = selectedLabels.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggle(skill)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all flex items-center gap-1.5",
                  isSelected
                    ? "bg-foreground border-foreground text-background"
                    : "bg-transparent border-border text-foreground hover:bg-muted"
                )}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0, width: 0 }}
                      animate={{ scale: 1, opacity: 1, width: "auto" }}
                      exit={{ scale: 0, opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {skill}
              </button>
            );
          })}

          {showAdd && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => addCustom(search)}
              className="px-3.5 py-1.5 rounded-full border border-dashed border-border text-sm font-medium flex items-center gap-1.5 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add "{search}"
            </motion.button>
          )}

          {!skillsLoading && filtered.length === 0 && !showAdd && (
            <p className="text-sm text-muted-foreground py-2">No skills found</p>
          )}
        </motion.div>
      </div>

      <div className="flex gap-2 py-3 px-6 border-t border-border justify-end">
        <Button variant="outline" type="button" onClick={() => closeSidebar(true)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
