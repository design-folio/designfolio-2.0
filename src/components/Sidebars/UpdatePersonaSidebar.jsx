import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { _getPersonas } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

function normalizePersona(p) {
  return {
    _id: p._id || p.id,
    label: p.label || p.name || p.title,
    image: p.image || "/onboarding-animated-icons/others.png",
  };
}

export default function UpdatePersonaSidebar() {
  const { userDetails, setUserDetails, updateCache, closeSidebar } = useGlobalContext();

  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [customRole, setCustomRole] = useState("");

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["personas"],
    queryFn: () =>
      _getPersonas().then((res) =>
        (res?.data?.personas || []).map(normalizePersona)
      ),
    staleTime: Infinity, // personas never change during a session
  });

  useEffect(() => {
    if (!userDetails || roles.length === 0) return;
    const { persona } = userDetails;
    if (persona?.value && persona?.label) {
      const isCustom = persona.__isNew__ === true || persona.label === "Others" || !!persona.custom;
      if (isCustom) {
        setSelectedRole("Others");
        setCustomRole(persona.custom || "");
        setSelectedPersonaId(persona.value);
      } else {
        const match =
          roles.find((r) => r._id === persona.value) ||
          roles.find((r) => r.label === persona.label);
        if (match) {
          setSelectedRole(match.label);
          setSelectedPersonaId(match._id);
        } else {
          setSelectedRole("Others");
          setCustomRole(persona.label);
          setSelectedPersonaId(persona.value);
        }
      }
    }
  }, [roles, userDetails]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const persona = {
        value: selectedPersonaId,
        label: selectedRole === "Others" ? customRole.trim() : selectedRole,
        ...(selectedRole === "Others" && { __isNew__: true }),
      };
      const res = await _updateUser({ persona });
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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Role
          </p>

          {rolesLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading roles...
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-2"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
            >
              {roles.map((role) => {
                const isSelected = selectedRole === role.label;
                return (
                  <button
                    key={role.label}
                    onClick={() => {
                      setSelectedRole(role.label);
                      if (role._id) setSelectedPersonaId(role._id);
                    }}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-2 relative overflow-hidden",
                      isSelected
                        ? "bg-foreground border-foreground text-background"
                        : "bg-transparent border-border text-foreground hover:bg-muted"
                    )}
                  >
                    <motion.img
                      src={role.image}
                      alt={role.label}
                      className={cn(
                        "w-8 h-8 object-contain shrink-0 transition-all",
                        isSelected && "invert dark:invert-0"
                      )}
                      animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="flex-1 leading-tight">{role.label}</span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </motion.div>
          )}

          <AnimatePresence>
            {selectedRole === "Others" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-1.5 overflow-hidden"
              >
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Your Role
                </Label>
                <Input
                  type="text"
                  placeholder="Tell us your role..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
