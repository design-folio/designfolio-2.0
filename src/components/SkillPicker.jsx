import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input-new";
import { Check, Search, Loader2 } from "lucide-react";

export default function SkillsPicker({ skills, selected, onToggle, onAdd, search, setSearch, loading }) {
    const filtered = useMemo(() => skills.filter((s) => s.toLowerCase().includes(search.toLowerCase())), [skills, search]);
    const hasExact = useMemo(() => skills.some((s) => s.toLowerCase() === search.toLowerCase()), [skills, search]);
    const showAdd = search.trim() !== "" && !hasExact;

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} className="mb-4 md:mb-6">
                <div className="relative bg-input-bg-color border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search skills..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 bg-transparent h-11 pl-11 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                        data-testid="input-skills-search"
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="overflow-y-auto md:mb-8 mb-4 pr-2 -mr-2 max-h-[calc(100vh-420px)] md:max-h-[calc(100vh-450px)]">
                <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
                    {loading && filtered.length === 0 ? (
                        <div className="px-5 py-2.5 rounded-full border-2 border-border relative overflow-hidden bg-muted/10 flex items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Loading</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-animation"></div>
                        </div>
                    ) : (
                        <>
                            {filtered.map((interest) => {
                                const isSelected = selected.includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        onClick={() => onToggle(interest)}
                                        className="px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all hover-elevate relative cursor-pointer flex items-center gap-2"
                                        style={
                                            isSelected
                                                ? { backgroundColor: "#FFF5F0", borderColor: "#FF553E", color: "#FF553E" }
                                                : { backgroundColor: "transparent", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }
                                        }
                                        data-testid={`button-interest-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                                    >
                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                                                    <Check className="w-4 h-4" style={{ color: "#FF553E" }} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {interest}
                                    </button>
                                );
                            })}
                            {showAdd && (
                                <motion.button
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => onAdd(search)}
                                    className="px-5 py-2.5 rounded-full border-2 border-dashed text-sm font-medium transition-all hover-elevate relative flex items-center gap-2"
                                    style={{ backgroundColor: "transparent", borderColor: "#FF553E", color: "#FF553E" }}
                                    data-testid="button-add-custom-skill"
                                >
                                    <span>Add "{search}" as new skill</span>
                                </motion.button>
                            )}
                        </>
                    )}
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .shimmer-animation {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </>
    );
}
