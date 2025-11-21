import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import ErrorBanner from "./ErrorBanner";

export default function OptionList({ items, selected, onSelect, testPrefix, message }) {
    return (
        <div className="overflow-y-auto md:mb-8 mb-4 pr-2 -mr-2 max-h-[calc(100vh-420px)] md:max-h-[calc(100vh-450px)]">
            <ErrorBanner message={message} />
            <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >

                {items.map((item) => {
                    const isSelected = selected === item.label;
                    return (
                        <button
                            key={item.label}
                            onClick={() => onSelect(item.label)}
                            className="px-6 py-4 rounded-2xl border-2 text-base font-medium transition-all hover-elevate text-left flex items-center gap-4 relative overflow-hidden"
                            style={
                                isSelected
                                    ? { backgroundColor: "#FFF5F0", borderColor: "#FF553E", color: "#FF553E" }
                                    : { backgroundColor: "transparent", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }
                            }
                            data-testid={`${testPrefix}-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                            <motion.img
                                src={item.image}
                                alt={item.label}
                                className="w-12 h-12 object-contain"
                                animate={isSelected ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                            <span className="flex-1">{item.label}</span>
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                                        <Check className="w-5 h-5" style={{ color: "#FF553E" }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </motion.div>
        </div>
    );
}