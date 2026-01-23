import {
    BookOpen,
    Files,
    MessageCircleQuestion,
    Link2Off,
    CalendarX
} from "lucide-react"
import { Card } from "@/components/ui/card"
import Text from "./text"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), {
    ssr: false,
    loading: () => <></>
});
const features = [
    {
        icon: BookOpen,
        title: "Endless hours learning Framer or Webflow",
        color: "text-purple-500"
    },
    {
        icon: Files,
        title: "Projects scattered across Figma files and PDFs",
        color: "text-blue-500"
    },
    {
        icon: MessageCircleQuestion,
        title: '"Can you share your work?" in every interview',
        color: "text-orange-500"
    },
    {
        icon: Link2Off,
        title: "Storytelling that doesnt make sense to recruiters",
        color: "text-red-500"
    },
    {
        icon: CalendarX,
        title: "Wasted weekends editing layouts instead of growing",
        color: "text-pink-500"
    }
]

const inspirationCards = [
    {
        step: "Step 1",
        title: "First, claim your unique link",
        description: "Choose a username",
        type: "input",
        example: "designfolio.me"
    },
    {
        step: "Step 2",
        title: "Setup your profile",
        description: "Your intro can be your game-changer",
        type: "profile"
    },
    {
        step: "Step 3",
        title: "Build your case study",
        description: "Highlight your best work",
        type: "showcase"
    },
    {
        step: "Step 4",
        title: "Publish your website",
        description: "Tell the world what you're capable of",
        type: "action"
    }
]

export default function FeaturesSection() {
    const [animations, setAnimations] = useState({})

    useEffect(() => {
        const loadAnimations = async () => {
            try {
                const [step1, step2, step3, step4] = await Promise.all([
                    fetch("/lottie/designfolio-step1.json").then(res => res.json()),
                    fetch("/lottie/designfolio-step2.json").then(res => res.json()),
                    fetch("/lottie/designfolio-step3.json").then(res => res.json()),
                    fetch("/lottie/designfolio-step4.json").then(res => res.json())
                ])

                setAnimations({
                    step1,
                    step2,
                    step3,
                    step4
                })
            } catch (error) {
                console.error("Error loading Lottie animations:", error)
            }
        }

        loadAnimations()
    }, [])

    return (
        <section
            id="howitworks"
            className="py-8 sm:py-12 md:py-16 px-6 bg-background-landing"
        >
            <div className="max-w-5xl mx-auto">
                <Text
                    as="h2"
                    size="section-heading"
                    className="text-center mb-4 sm:mb-6"
                    data-testid="text-features-heading"
                >
                    Done fighting with Framer?
                    <br />
                    Meet Designfolio!
                </Text>

                <div className="flex justify-center mb-8 sm:mb-12">
                    <div
                        className="bg-pink-50 border border-pink-200 rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 text-center"
                        data-testid="badge-time-wasted"
                    >
                        <span className="text-sm sm:text-base text-foreground">
                            It's been 3 months. You've applied to 40+ jobs — but your work
                            still lives in random Figma links.
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white border border-border rounded-full px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-2.5 hover-elevate cursor-pointer"
                            data-testid={`badge-feature-${index}`}
                        >
                            <feature.icon
                                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${feature.color}`}
                                data-testid={`icon-feature-${index}`}
                            />
                            <span
                                className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap"
                                data-testid={`text-feature-title-${index}`}
                            >
                                {feature.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 pt-6">
                    <div className="flex flex-col gap-4 sm:gap-6 flex-1">
                        {inspirationCards
                            .filter((_, index) => index % 2 === 0)
                            .map((card, originalIndex) => {
                                const index = originalIndex * 2
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, filter: "blur(4px)", y: 20 }}
                                        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.08,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                    >
                                        <Card
                                            className="relative p-6 sm:p-8 transition-all duration-300 bg-muted/40 border-border/30 overflow-visible shadow-none"
                                            style={{
                                                boxShadow:
                                                    "inset 0 3px 8px 0 rgb(0 0 0 / 0.08), inset 0 -3px 8px 0 rgb(0 0 0 / 0.05)"
                                            }}
                                            data-testid={`card-inspiration-${index}`}
                                        >
                                            <div
                                                className="absolute -top-3 left-6 px-5 py-2 text-xs font-bold tracking-wide uppercase font-kalam"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)",
                                                    color: "#fff",
                                                    transform: "rotate(-2deg)",

                                                }}
                                                data-testid={`badge-step-${index}`}
                                            >
                                                {card.step}
                                            </div>

                                            <Text
                                                as="h3"
                                                size="section-heading-sm"
                                                className="mb-2"
                                                data-testid={`text-card-title-${index}`}
                                            >
                                                {card.title}
                                            </Text>

                                            <p
                                                className="text-sm sm:text-base text-muted-foreground mb-6"
                                                data-testid={`text-card-description-${index}`}
                                            >
                                                {card.description}
                                            </p>

                                            {card.type === "input" && (
                                                <div className="w-full" data-testid="lottie-step1">
                                                    {animations.step1 && (
                                                        <Lottie
                                                            animationData={animations.step1}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {card.type === "profile" && (
                                                <div className="w-full" data-testid="lottie-step2">
                                                    {animations.step2 && (
                                                        <Lottie
                                                            animationData={animations.step2}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {card.type === "showcase" && (
                                                <div className="w-full" data-testid="lottie-step3">
                                                    {animations.step3 && (
                                                        <Lottie
                                                            animationData={animations.step3}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {card.type === "action" && (
                                                <div className="w-full" data-testid="lottie-step4">
                                                    {animations.step4 && (
                                                        <Lottie
                                                            animationData={animations.step4}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    </motion.div>
                                )
                            })}
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-6 flex-1">
                        {inspirationCards
                            .filter((_, index) => index % 2 === 1)
                            .map((card, originalIndex) => {
                                const index = originalIndex * 2 + 1
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, filter: "blur(4px)", y: 20 }}
                                        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.08,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                    >
                                        <Card
                                            className="relative p-6 sm:p-8 transition-all duration-300 bg-muted/40 border-border/30 overflow-visible shadow-none"
                                            style={{
                                                boxShadow:
                                                    "inset 0 3px 8px 0 rgb(0 0 0 / 0.08), inset 0 -3px 8px 0 rgb(0 0 0 / 0.05)"
                                            }}
                                            data-testid={`card-inspiration-${index}`}
                                        >
                                            <div
                                                className="absolute -top-3 left-6 px-5 py-2 text-xs font-bold tracking-wide uppercase font-kalam"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)",
                                                    color: "#fff",
                                                    transform: "rotate(-2deg)",
                                                }}
                                                data-testid={`badge-step-${index}`}
                                            >
                                                {card.step}
                                            </div>

                                            <Text
                                                as="h3"
                                                size="section-heading-sm"
                                                className="mb-2"
                                                data-testid={`text-card-title-${index}`}
                                            >
                                                {card.title}
                                            </Text>

                                            <p
                                                className="text-sm sm:text-base text-muted-foreground mb-6"
                                                data-testid={`text-card-description-${index}`}
                                            >
                                                {card.description}
                                            </p>

                                            {card.type === "input" && (
                                                <div className="w-full" data-testid="lottie-step1">
                                                    {animations.step1 && (
                                                        <Lottie
                                                            animationData={animations.step1}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {card.type === "profile" && (
                                                <div className="w-full" data-testid="lottie-step2">
                                                    {animations.step2 && (
                                                        <Lottie
                                                            animationData={animations.step2}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {card.type === "showcase" && (
                                                <div className="w-full" data-testid="lottie-step3">
                                                    {animations.step3 && (
                                                        <Lottie
                                                            animationData={animations.step3}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {card.type === "action" && (
                                                <div className="w-full" data-testid="lottie-step4">
                                                    {animations.step4 && (
                                                        <Lottie
                                                            animationData={animations.step4}
                                                            loop={true}
                                                            style={{ width: "100%", height: "auto" }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    </motion.div>
                                )
                            })}
                    </div>
                </div>
            </div>
        </section>
    )
}
