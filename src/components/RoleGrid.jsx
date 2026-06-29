import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import ErrorBanner from "./ErrorBanner";

export default function RoleGrid({
  roles,
  selectedRole,
  onSelect,
  customRole,
  setCustomRole,
  message,
}) {
  return (
    <>
      <div className="-mr-2 mb-4 max-h-[calc(100vh-420px)] overflow-y-auto pr-2 md:mb-8 md:max-h-[calc(100vh-450px)]">
        <ErrorBanner message={message} />
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {roles.map((role) => {
            const isSelected = selectedRole === role.label;
            const isOthers = role.label === "Others";
            return (
              <button
                key={role.label}
                onClick={() => onSelect(role.label)}
                className="hover-elevate relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition-all md:gap-3"
                style={
                  isSelected
                    ? {
                        backgroundColor: "var(--onboarding-selected-bg)",
                        borderColor: "#FF553E",
                        color: "#FF553E",
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }
                }
                data-testid={`button-role-${role.label.toLowerCase().replace(/[\s\/]/g, "-")}`}
              >
                <motion.img
                  src={role.image}
                  alt={role.label}
                  className="h-10 w-10 object-contain"
                  animate={isSelected ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
                <span className="flex-1">{role.label}</span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Check className="h-4 w-4" style={{ color: "#FF553E" }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedRole === "Others" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 space-y-2 md:mb-8"
          >
            <Label htmlFor="custom-role" className="text-foreground text-sm font-medium">
              Your Role
            </Label>
            <div className="border-border hover:border-foreground/20 focus-within:border-foreground/30 rounded-full border-2 bg-(--input-bg-color) transition-all duration-300 ease-out focus-within:shadow-[0_0_0_4px_hsl(var(--ring)/0.15)]">
              <Input
                id="custom-role"
                type="text"
                placeholder="Tell us your role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="text-foreground placeholder:text-muted-foreground/60 h-11 border-0 bg-transparent px-4 text-base placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                data-testid="input-custom-role"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
