import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "../../../public/assets/svgs/logo.svg";
import Link from "next/link";
import TrustedBySection from "@/components/trustedBySection";
import { useMeasuredHeight } from "@/hooks/useMeasuredHeight";

export function AuthLayout({
    children,
    title,
    description,
    showBackButton = false,
    onBack,
    className = ""
}) {

    const [contentRef, contentHeight] = useMeasuredHeight();
    console.log(contentRef)
    return (
        <div className="min-h-screen bg-background-landing flex flex-col relative overflow-hidden">
            {/* Simple 3x3 Grid Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none grid grid-cols-3 grid-rows-3 gap-8 p-8">
                {/* Row 1 */}
                <div className="bg-muted/25 rounded-[4rem]" />
                <div className="bg-muted/30 rounded-[5rem]" />
                <div className="bg-muted/25 rounded-[4rem]" />

                {/* Row 2 */}
                <div className="bg-muted/30 rounded-[5rem]" />
                <div className="bg-muted/25 rounded-[4rem]" />
                <div className="bg-muted/30 rounded-[5rem]" />

                {/* Row 3 */}
                <div className="bg-muted/25 rounded-[4rem]" />
                <div className="bg-muted/30 rounded-[5rem]" />
                <div className="bg-muted/25 rounded-[4rem]" />
            </div>

            <div className="flex-1 flex flex-col relative z-10">
                <div className="pt-8 pb-4 flex justify-center">
                    <Link href="/" className="cursor-pointer" data-testid="link-home">
                        <Logo className="text-df-icon-color" />
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-6">
                    <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <Card className={`bg-white/95 backdrop-blur-sm py-8 px-6 sm:px-8 border-0 rounded-3xl shadow-2xl overflow-hidden ${className}`}>
                            <motion.div
                                initial={false}
                                animate={{ height: contentHeight || "auto" }}
                                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <div ref={contentRef}>



                                    {showBackButton && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground -ml-2 mb-6 hover-elevate px-2 py-1 rounded-md"
                                            data-testid="button-back"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Go Back
                                        </button>
                                    )}

                                    {(title || description) && (
                                        <div className="mb-8">
                                            {title && (
                                                <h1 className="font-semibold text-2xl mb-2 text-foreground text-center">
                                                    {title}
                                                </h1>
                                            )}
                                            {description && (
                                                <p className="text-sm text-foreground/60 text-center">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <AnimatePresence mode="wait" initial={false}>
                                        {children}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </Card>
                    </motion.div>
                </div>

                <TrustedBySection classNames="from-background/30" />
            </div >
        </div >
    );
}