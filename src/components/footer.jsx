import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import ClaimDomain from "./claimDomain"
import Link from "next/link"
import Button from "./button"
import MemoPower from "./icons/Power"

export default function Footer({ dfToken, innerClass = "", className = "" }) {
    const names = ["john", "morgan", "sarah", "tom", "brad"]
    const [currentNameIndex, setCurrentNameIndex] = useState(0)
    const [inputValue, setInputValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)

    useEffect(() => {
        if (inputValue || isFocused) return

        const interval = setInterval(() => {
            setCurrentNameIndex(prev => (prev + 1) % names.length)
        }, 1400)

        return () => clearInterval(interval)
    }, [inputValue, isFocused, names.length])

    return (
        <footer className={`w-full py-16 px-6 ${className}`} >
            <div className={`max-w-5xl mx-auto ${innerClass}`}>
                <Card className="p-8 sm:p-12 bg-card-landing">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl  font-semibold font-gsans leading-tight text-center text-balance"
                                data-testid="text-footer-headline"
                            >
                                It was supposed to take a weekend,
                                <br />
                                not a quarter.
                            </h2>
                            <div className="pt-4">
                                <img
                                    src="/assets/svgs/footerimage.svg"
                                    alt="Footer illustration"
                                    className="w-full h-auto"
                                    data-testid="image-footer-illustration"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            <div className="space-y-6">
                                <p
                                    className="text-base text-foreground leading-relaxed"
                                    data-testid="text-intro"
                                >
                                    You just wanted to show your work, not learn five new tools to
                                    do it.
                                </p>

                                <p
                                    className="text-base text-foreground leading-relaxed"
                                    data-testid="text-options"
                                >
                                    There are endless ways to "build a portfolio." Figma
                                    templates, Notion pages, Framer sites — all promising to help
                                    you stand out. You've probably tried a few. Yet, here you are
                                    — still without something you're proud to share.
                                </p>

                                <p
                                    className="text-base font-semibold text-foreground leading-relaxed"
                                    data-testid="text-problem"
                                >
                                    Unfortunately, most portfolio builders offer the same experience—overwhelming, too technical, or simply not motivating enough to finish.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <p
                                    className="text-base text-foreground leading-relaxed"
                                    data-testid="text-solution"
                                >
                                    Designfolio is refreshingly simple — built by designers who've
                                    been in your shoes. It's fast, no-code, and focused on one
                                    thing: getting your best work online.
                                </p>

                                <p
                                    className="text-base text-foreground leading-relaxed"
                                    data-testid="text-invitation"
                                >
                                    So, give it a spin. You'll be surprised how quickly "work in
                                    progress" turns into "link in bio."
                                </p>

                                <div className="pt-4 space-y-2">
                                    <img
                                        src={"/assets/png/shainow_1761634386828.png"}
                                        alt="Shai's signature"
                                        className="h-8 sm:h-10 w-auto"
                                        data-testid="image-signature"
                                    />
                                    <p
                                        className="text-sm text-muted-foreground font-semibold"
                                        data-testid="text-contact"
                                    >
                                        <a
                                            href="mailto:shai@designfolio.me"
                                            className="text-primary-landing hover:underline cursor-pointer"
                                            data-testid="link-email"
                                        >
                                            shai@designfolio.me
                                        </a>
                                    </p>
                                    <p
                                        className="text-sm text-muted-foreground italic"
                                        data-testid="text-role"
                                    >
                                        Founder
                                    </p>
                                </div>
                            </div>
                        </div>

                        {dfToken ? (
                            <Link href={"builder"} className="flex items-center justify-center mt-6 ">
                                <Button
                                    text="Launch Builder"
                                    customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
                                    icon={
                                        <MemoPower />
                                    }
                                />
                            </Link>
                        ) : (
                            <ClaimDomain form="footer" />
                        )}
                    </div>
                </Card>
            </div>
        </footer >
    )
}
