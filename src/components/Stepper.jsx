import { motion } from "framer-motion";

export default function Stepper({ current }) {
    const gradients = [
        "linear-gradient(90deg, #FF9A56 0%, #FF8A7A 100%)",
        "linear-gradient(90deg, #FF8A7A 0%, #F77BB1 100%)",
        "linear-gradient(90deg, #F77BB1 0%, #D97DD8 100%)",
        "linear-gradient(90deg, #D97DD8 0%, #B47EE8 100%)",
    ];
    return (
        <div className="mb-3 md:mb-8">
            <div className="flex gap-1 mb-3" data-testid="progress-bar">
                {[1, 2, 3, 4].map((step) => {
                    const isActive = step <= current;
                    return (
                        <div
                            key={step}
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: "#E5E5E5" }}
                            data-testid={`stepper-${step}`}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: gradients[step - 1] }}
                                initial={{ width: "0%" }}
                                animate={{ width: isActive ? "100%" : "0%" }}
                                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-1.5" data-testid="text-step-indicator">
                <span className="text-sm font-semibold text-foreground">
                    {Math.round((current / 4) * 100)}% of magic completed
                </span>
                <motion.img
                    key={current}
                    src="/assets/png/heartonfire.png"
                    alt="heart on fire"
                    className="w-6 h-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.5, times: [0, 0.6, 1], ease: [0.34, 1.56, 0.64, 1] }}
                />
            </div>
        </div>
    );
}
