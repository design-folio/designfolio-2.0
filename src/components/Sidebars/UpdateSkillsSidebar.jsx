import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Check, Search, Loader2, Plus } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { _getSkills } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { UnsavedChangesDialog } from "../ui/UnsavedChangesDialog";
import { sidebars } from "@/lib/constant";

function toOptionString(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (x?.label) return x.label;
  if (x?.value) return x.value;
  return String(x);
}

export default function UpdateSkillsSidebar() {
  const {
    userDetails,
    setUserDetails,
    updateCache,
    closeSidebar,
    activeSidebar,
    registerUnsavedChangesChecker,
    unregisterUnsavedChangesChecker,
    showUnsavedWarning,
    handleConfirmDiscardSidebar,
    handleCancelDiscardSidebar,
    isSwitchingSidebar,
    pendingSidebarAction,
  } = useGlobalContext();

  const isOpen = activeSidebar === sidebars.skills;

  const personaId = userDetails?.persona?.value || "";

  // Local UI state - persists within the sidebar lifetime only
  const [skillsMap, setSkillsMap] = useState(() => {
    const map = new Map();
    (userDetails?.skills || []).forEach((s) => map.set(s.label, s));
    return map;
  });
  const [selectedLabels, setSelectedLabels] = useState(() =>
    (userDetails?.skills || []).map((s) => s.label)
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const initialLabels = (userDetails?.skills || []).map((s) => s.label);

  const hasUnsavedChanges = useCallback(() => {
    const initial = JSON.stringify(initialLabels.slice().sort());
    const current = JSON.stringify(selectedLabels.slice().sort());
    return initial !== current;
  }, [initialLabels, selectedLabels]);

  useEffect(() => {
    if (isOpen) registerUnsavedChangesChecker(sidebars.skills, hasUnsavedChanges);
    return () => unregisterUnsavedChangesChecker(sidebars.skills);
  }, [isOpen, hasUnsavedChanges, registerUnsavedChangesChecker, unregisterUnsavedChangesChecker]);

  // Reset search when sidebar closes
  useEffect(() => {
    if (!isOpen) queueMicrotask(() => setSearch(""));
  }, [isOpen]);

  // Debounced search term for the query key
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const hasSearch = debouncedSearch.length > 0;
  const queryKey = [
    "skills",
    hasSearch ? debouncedSearch : personaId,
    hasSearch ? "search" : "persona",
  ];

  const { data: fetchedSkills = [], isFetching: skillsLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await _getSkills(debouncedSearch, hasSearch ? "" : personaId);
      const apiSkills = res?.data?.skills || [];
      return apiSkills.map((s) => ({
        label: toOptionString(s),
        value: s._id || s.id || s.value,
        __isNew__: false,
      }));
    },
    enabled: !!(personaId || hasSearch),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge fetched skills into the map and visible list
  useEffect(() => {
    if (!fetchedSkills.length) return;
    queueMicrotask(() =>
      setSkillsMap((prev) => {
        const next = new Map(prev);
        fetchedSkills.forEach((s) => next.set(s.label, s));
        return next;
      })
    );
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
    [allLabels, search]
  );

  const hasExact = useMemo(
    () => allLabels.some((s) => s.toLowerCase() === search.trim().toLowerCase()),
    [allLabels, search]
  );
  const showAdd = search.trim() !== "" && !hasExact;

  const toggle = (label) =>
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
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

  const resetStateAndClose = () => {
    setSearch("");
    closeSidebar(true);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 pl-10"
          />
          {skillsLoading && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {selectedLabels.length > 0 && (
          <p className="text-muted-foreground text-xs">
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
              <motion.button
                key={skill}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={() => toggle(skill)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                  isSelected
                    ? "bg-foreground border-foreground text-background"
                    : "border-border text-foreground hover:bg-muted bg-transparent"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0, width: 0, marginRight: 0 }}
                      animate={{ scale: 1, opacity: 1, width: "auto", marginRight: 2 }}
                      exit={{ scale: 0, opacity: 0, width: 0, marginRight: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="flex items-center overflow-hidden"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {skill}
              </motion.button>
            );
          })}

          {showAdd && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => addCustom(search)}
              className="border-border text-muted-foreground hover:border-foreground hover:text-foreground flex items-center gap-1.5 rounded-full border border-dashed px-3.5 py-1.5 text-sm font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add &quot;{search}&quot;
            </motion.button>
          )}

          {!skillsLoading && filtered.length === 0 && !showAdd && (
            <p className="text-muted-foreground py-2 text-sm">No skills found</p>
          )}
        </motion.div>
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-3">
        <Button variant="outline" type="button" onClick={() => closeSidebar()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <UnsavedChangesDialog
        open={
          showUnsavedWarning &&
          isOpen &&
          !isSwitchingSidebar &&
          pendingSidebarAction?.type === "close"
        }
        onOpenChange={(open) => {
          if (!open) handleCancelDiscardSidebar();
        }}
        onConfirmDiscard={() => {
          handleConfirmDiscardSidebar();
          resetStateAndClose();
        }}
        title="Unsaved Changes"
        description="You have made changes to your skills. Are you sure you want to discard them?"
      />
    </div>
  );
}
