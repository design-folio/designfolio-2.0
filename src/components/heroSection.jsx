import { useState, useEffect, useRef } from "react"
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useMotionTemplate
} from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import ClaimDomain from "./claimDomain"
import Link from "next/link"
import Button from "./button"

export default function HeroSection({ dfToken }) {
    const sectionRef = useRef(null)
    const leftCardRef = useRef(null)
    const rightCardRef = useRef(null)
    const isMobile = useIsMobile()
    const lastWidthRef = useRef(0)

    const [leftCardOffset, setLeftCardOffset] = useState({ x: 0, y: 0 })
    const [rightCardOffset, setRightCardOffset] = useState({ x: 0, y: 0 })
    const [leftInitialScale, setLeftInitialScale] = useState(1)
    const [rightInitialScale, setRightInitialScale] = useState(1)
    const [leftCardWidth, setLeftCardWidth] = useState(null)
    const [rightCardWidth, setRightCardWidth] = useState(null)
    const [scrollRange, setScrollRange] = useState(800)

    const names = ["john", "morgan", "sarah", "tom", "brad"]
    const [currentNameIndex, setCurrentNameIndex] = useState(0)
    const [inputValue, setInputValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (inputValue || isFocused) return

        const interval = setInterval(() => {
            setCurrentNameIndex(prev => (prev + 1) % names.length)
        }, 1400)

        return () => clearInterval(interval)
    }, [inputValue, isFocused, names.length])

    useEffect(() => {
        const updateCardPositions = (force = false) => {
            const currentWidth = window.innerWidth

            // Only skip recalculation if width unchanged AND not forced
            // This allows recalculation when layout shifts due to fonts/height changes
            if (
                !force &&
                lastWidthRef.current !== 0 &&
                Math.abs(currentWidth - lastWidthRef.current) < 1
            ) {
                return
            }

            lastWidthRef.current = currentWidth

            const portfolioCard1 = document.getElementById("portfolio-card-1")
            const portfolioCard2 = document.getElementById("portfolio-card-2")

            let maxDeltaY = 0

            // Desired hero widths (responsive based on breakpoint)
            const getDesiredHeroWidth = () => {
                if (currentWidth >= 1536) return 256 // 2xl:w-64
                if (currentWidth >= 1280) return 224 // xl:w-56
                if (currentWidth >= 1024) return 192 // lg:w-48
                if (currentWidth >= 768) return 144 // md:w-36
                if (currentWidth >= 640) return 128 // sm:w-32
                return 112 // w-28
            }

            if (portfolioCard1 && leftCardRef.current) {
                // Get portfolio card dimensions
                const portfolio1Rect = portfolioCard1.getBoundingClientRect()

                // Set card to match portfolio width
                setLeftCardWidth(portfolio1Rect.width)

                // Calculate initial scale (how small the card should appear in hero)
                const desiredHeroWidth = getDesiredHeroWidth()
                const initialScale = desiredHeroWidth / portfolio1Rect.width
                setLeftInitialScale(initialScale)

                // Temporarily disable transforms to get accurate position
                const leftElement = leftCardRef.current
                const prevTransform = leftElement.style.transform
                leftElement.style.transform = "none"

                const leftRect = leftElement.getBoundingClientRect()

                // Calculate center positions
                const leftCenterX = leftRect.left + leftRect.width / 2
                const leftCenterY = leftRect.top + window.scrollY + leftRect.height / 2
                const portfolio1CenterX = portfolio1Rect.left + portfolio1Rect.width / 2
                const portfolio1CenterY =
                    portfolio1Rect.top + window.scrollY + portfolio1Rect.height / 2

                // Calculate offset from center to center
                const deltaX = portfolio1CenterX - leftCenterX
                const deltaY = portfolio1CenterY - leftCenterY

                setLeftCardOffset({ x: deltaX, y: deltaY })
                maxDeltaY = Math.max(maxDeltaY, Math.abs(deltaY))

                // Restore transform
                leftElement.style.transform = prevTransform
            }

            if (portfolioCard2 && rightCardRef.current) {
                // Get portfolio card dimensions
                const portfolio2Rect = portfolioCard2.getBoundingClientRect()

                // Set card to match portfolio width
                setRightCardWidth(portfolio2Rect.width)

                // Calculate initial scale (how small the card should appear in hero)
                const desiredHeroWidth = getDesiredHeroWidth()
                const initialScale = desiredHeroWidth / portfolio2Rect.width
                setRightInitialScale(initialScale)

                // Temporarily disable transforms to get accurate position
                const rightElement = rightCardRef.current
                const prevTransform = rightElement.style.transform
                rightElement.style.transform = "none"

                const rightRect = rightElement.getBoundingClientRect()

                // Calculate center positions
                const rightCenterX = rightRect.left + rightRect.width / 2
                const rightCenterY =
                    rightRect.top + window.scrollY + rightRect.height / 2
                const portfolio2CenterX = portfolio2Rect.left + portfolio2Rect.width / 2
                const portfolio2CenterY =
                    portfolio2Rect.top + window.scrollY + portfolio2Rect.height / 2

                // Calculate offset from center to center
                const deltaX = portfolio2CenterX - rightCenterX
                const deltaY = portfolio2CenterY - rightCenterY

                setRightCardOffset({ x: deltaX, y: deltaY })
                maxDeltaY = Math.max(maxDeltaY, Math.abs(deltaY))

                // Restore transform
                rightElement.style.transform = prevTransform
            }

            // Set scroll range based on the maximum distance either card needs to travel
            // Use a much smaller multiplier on mobile for faster animation (less scroll needed)
            const multiplier = isMobile ? 0.15 : 0.6
            const calculatedScrollRange = Math.max(maxDeltaY * multiplier, 200)
            setScrollRange(calculatedScrollRange)
        }

        // Initial calculation
        updateCardPositions()

        // Wait for fonts to load, then recalculate after layout settles
        document.fonts.ready.then(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    updateCardPositions(true)
                })
            })
        })

        // Fallback timeout for browsers that don't support fonts API
        const timeoutId = setTimeout(() => updateCardPositions(true), 300)

        const handleResize = () => updateCardPositions()
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            clearTimeout(timeoutId)
        }
    }, [isMobile])

    const { scrollY } = useScroll()

    // Spring configuration - more responsive on mobile for better performance
    const springConfig = isMobile
        ? { stiffness: 200, damping: 30, mass: 0.5 }
        : { stiffness: 100, damping: 30, mass: 1 }

    const leftCardTranslateYRaw = useTransform(
        scrollY,
        [0, scrollRange],
        [0, leftCardOffset.y],
        { clamp: true }
    )
    const leftCardTranslateY = useSpring(leftCardTranslateYRaw, springConfig)

    const leftCardTranslateXRaw = useTransform(
        scrollY,
        [0, scrollRange],
        [0, leftCardOffset.x],
        { clamp: true }
    )
    const leftCardTranslateX = useSpring(leftCardTranslateXRaw, springConfig)

    const rightCardTranslateYRaw = useTransform(
        scrollY,
        [0, scrollRange],
        [0, rightCardOffset.y],
        { clamp: true }
    )
    const rightCardTranslateY = useSpring(rightCardTranslateYRaw, springConfig)

    const rightCardTranslateXRaw = useTransform(
        scrollY,
        [0, scrollRange],
        [0, rightCardOffset.x],
        { clamp: true }
    )
    const rightCardTranslateX = useSpring(rightCardTranslateXRaw, springConfig)

    // Add rotation on all devices for visual interest
    const leftCardRotateRaw = useTransform(
        scrollY,
        [0, scrollRange],
        isMobile ? [-8, 0] : [-6, 0],
        { clamp: true }
    )
    const leftCardRotate = useSpring(leftCardRotateRaw, springConfig)

    const rightCardRotateRaw = useTransform(
        scrollY,
        [0, scrollRange],
        isMobile ? [8, 0] : [6, 0],
        { clamp: true }
    )
    const rightCardRotate = useSpring(rightCardRotateRaw, springConfig)

    const leftScaleRaw = useTransform(
        scrollY,
        [0, scrollRange],
        [leftInitialScale, 1],
        { clamp: true }
    )
    const leftScale = useSpring(leftScaleRaw, springConfig)

    const rightScaleRaw = useTransform(
        scrollY,
        [0, scrollRange],
        [rightInitialScale, 1],
        { clamp: true }
    )
    const rightScale = useSpring(rightScaleRaw, springConfig)

    // Fade out shadow as cards reach profile section
    const shadowOpacityRaw = useTransform(scrollY, [0, scrollRange], [1, 0], {
        clamp: true
    })
    const shadowOpacity = useSpring(shadowOpacityRaw, springConfig)

    const cardBoxShadow = useMotionTemplate`0 10px 15px -3px rgba(0, 0, 0, ${useTransform(
        shadowOpacity,
        v => v * 0.1
    )}), 0 4px 6px -4px rgba(0, 0, 0, ${useTransform(
        shadowOpacity,
        v => v * 0.1
    )})`

    return (
        <section
            ref={sectionRef}
            className="relative overflow-visible py-8 sm:py-12 md:py-16 px-6"
        >
            <div
                className="absolute left-0 right-0 z-0"
                style={{
                    top: "40%",
                    bottom: "-120%",
                    backgroundImage: `
            radial-gradient(ellipse 80% 60% at center, transparent 20%, hsl(var(--background-landing)) 70%),
            linear-gradient(to right, hsl(var(--foreground-landing) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground-landing) / 0.08) 1px, transparent 1px)
          `,
                    backgroundSize: "cover, 80px 80px, 80px 80px"
                }}
            />

            <motion.div
                ref={leftCardRef}
                className="absolute -left-40 -top-12 lg:-left-8 xl:left-4 2xl:left-16 lg:top-20 xl:top-28 z-[31] will-change-transform"
                style={{
                    width: leftCardWidth ? `${leftCardWidth}px` : undefined,
                    y: leftCardTranslateY,
                    x: leftCardTranslateX,
                    z: 0,
                    rotate: leftCardRotate,
                    scale: leftScale,
                    transformOrigin: "center",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                    WebkitFontSmoothing: "antialiased"
                }}
            >
                <motion.div
                    className="bg-white dark:bg-card rounded-lg md:rounded-xl lg:rounded-2xl border border-border overflow-hidden flex flex-col"
                    style={{
                        boxShadow: cardBoxShadow
                    }}
                    data-testid="card-project-left"
                >
                    <div className="aspect-video relative overflow-hidden">
                        <img
                            src="/assets/svgs/casestudyux1.svg"
                            alt="Fitness app redesign case study"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-4 md:p-5 flex-1 flex flex-col">
                        <h3
                            className="font-gsans text-base md:text-lg lg:text-xl font-semibold text-foreground mb-1 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]"
                            data-testid="text-project-left-title"
                        >
                            Redesigning fitness app experience for 4M users.
                        </h3>
                        <p
                            className="text-xs md:text-sm text-foreground/50"
                            data-testid="text-project-left-category"
                        >
                            AI Fitness Tracker
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                ref={rightCardRef}
                className="absolute -right-32 -bottom-20 lg:-right-8 xl:right-4 2xl:right-16 lg:top-32 xl:top-40 lg:bottom-auto z-[29] will-change-transform"
                style={{
                    width: rightCardWidth ? `${rightCardWidth}px` : undefined,
                    y: rightCardTranslateY,
                    x: rightCardTranslateX,
                    z: 0,
                    rotate: rightCardRotate,
                    scale: rightScale,
                    transformOrigin: "center",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                    WebkitFontSmoothing: "antialiased"
                }}
            >
                <motion.div
                    className="bg-white dark:bg-card rounded-lg md:rounded-xl lg:rounded-2xl border border-border overflow-hidden flex flex-col"
                    style={{
                        boxShadow: cardBoxShadow
                    }}
                    data-testid="card-project-right"
                >
                    <div className="aspect-video relative overflow-hidden">
                        <img
                            src="/assets/svgs/casestudyux2.svg"
                            alt="Blockchain crypto app case study"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-4 md:p-5 flex-1 flex flex-col">
                        <h3
                            className="font-gsans text-base md:text-lg lg:text-xl font-semibold text-foreground mb-1 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]"
                            data-testid="text-project-right-title"
                        >
                            Built a blockchain crypto app using Next.js
                        </h3>
                        <p
                            className="text-xs md:text-sm text-foreground/50"
                            data-testid="text-project-right-category"
                        >
                            Launched on Product Hunt
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            <div className="max-w-5xl mx-auto relative z-50">
                <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 md:px-12 lg:px-0">
                    <motion.h1
                        className="font-gsans font-semibold text-3xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-6xl leading-tight mb-4 sm:mb-6 text-foreground"
                        data-testid="text-hero-headline"
                        initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: 0.1,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                    >
                        Building a portfolio was never meant to be hard.
                    </motion.h1>

                    <motion.p
                        className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/70 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8"
                        data-testid="text-hero-description"
                        initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: 0.2,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                    >
                        Skip the busywork with Designfolio — publish in hours, not weeks.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: 0.35,
                            ease: [0.22, 1, 0.36, 1]
                        }}>
                        {dfToken ? (
                            <Link href={"builder"} className="flex items-center justify-center mt-6 ">
                                <Button
                                    text="Launch Builder"
                                    customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
                                    icon={
                                        <img
                                            src="/assets/svgs/power.svg"
                                            alt="launch builder"
                                            className="cursor-pointer"
                                        />
                                    }
                                />
                            </Link>
                        ) : (
                            <ClaimDomain form="header" />
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
