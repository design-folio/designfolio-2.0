

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input-new";
import { Label } from "@/components/ui/label";
import { Check, } from "lucide-react";



export default function RoleGrid({ roles, selectedRole, onSelect, customRole, setCustomRole }) {
    return (
        <>
            <motion.div
                className="grid grid-cols-2 gap-3 mb-8"
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
                            className="px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all hover-elevate text-left flex items-center gap-3 relative overflow-hidden"
                            style={
                                isSelected
                                    ? { backgroundColor: "#FFF5F0", borderColor: "#FF553E", color: "#FF553E" }
                                    : { backgroundColor: "transparent", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }
                            }
                            data-testid={`button-role-${role.label.toLowerCase().replace(/[\s\/]/g, "-")}`}
                        >
                            <motion.img
                                src={role.image}
                                alt={role.label}
                                className="w-10 h-10 object-contain"
                                animate={isSelected ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                            <span className="flex-1">{role.label}</span>
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                                        <Check className="w-4 h-4" style={{ color: "#FF553E" }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </motion.div>

            <AnimatePresence>
                {selectedRole === "Others" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mb-8 space-y-2">
                        <Label htmlFor="custom-role" className="text-sm font-medium text-foreground">
                            Your Role
                        </Label>
                        <div className="bg-input-bg-color border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out">
                            <Input
                                id="custom-role"
                                type="text"
                                placeholder="Tell us your role..."
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                                data-testid="input-custom-role"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}