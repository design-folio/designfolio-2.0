import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import ClaimDomain from "./claimDomain";
import Link from "next/link";
import Button from "./button";
import MemoPower from "./icons/Power";
import Text from "./text";

export default function Footer({ dfToken, innerClass = "", className = "" }) {
  const names = ["john", "morgan", "sarah", "tom", "brad"];
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (inputValue || isFocused) return;

    const interval = setInterval(() => {
      setCurrentNameIndex((prev) => (prev + 1) % names.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [inputValue, isFocused, names.length]);

  return (
    <footer className={`w-full px-6 py-16 ${className}`}>
      <div className={`mx-auto max-w-5xl ${innerClass}`}>
        <Card className="bg-card-landing p-8 sm:p-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <Text
                as="h2"
                size="section-heading"
                className="text-center leading-tight text-balance"
                data-testid="text-footer-headline"
              >
                Yo. I&apos;m Shai
                <br />
                (I built Designfolio)
              </Text>
              <div className="pt-4">
                <img
                  src="/assets/svgs/footerimage.svg"
                  alt="Footer illustration"
                  className="hidden h-auto w-full sm:block"
                  data-testid="image-footer-illustration"
                />
                <img
                  src="/assets/svgs/footerimageformob.svg"
                  alt="Footer illustration mobile"
                  className="block h-auto w-full sm:hidden"
                  data-testid="image-footer-illustration-mobile"
                />
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
              <div className="space-y-6">
                <p className="text-foreground text-base leading-relaxed" data-testid="text-intro">
                  You just wanted to show your work, not learn five new tools to do it.
                </p>

                <p className="text-foreground text-base leading-relaxed" data-testid="text-options">
                  There are endless ways to &quot;build a portfolio.&quot; Figma templates, Notion
                  pages, Framer sites — all promising to help you stand out. You&apos;ve probably
                  tried a few. Yet, here you are — still without something you&apos;re proud to
                  share.
                </p>

                <p
                  className="text-foreground text-base leading-relaxed font-semibold"
                  data-testid="text-problem"
                >
                  Unfortunately, most portfolio builders offer the same experience—overwhelming, too
                  technical, or simply not motivating enough to finish.
                </p>
              </div>

              <div className="space-y-6">
                <p
                  className="text-foreground text-base leading-relaxed"
                  data-testid="text-solution"
                >
                  Designfolio is refreshingly simple — built by designers who&apos;ve been in your
                  shoes. It&apos;s fast, no-code, and focused on one thing: getting your best work
                  online.
                </p>

                <p
                  className="text-foreground text-base leading-relaxed"
                  data-testid="text-invitation"
                >
                  So, give it a spin. You&apos;ll be surprised how quickly &quot;work in
                  progress&quot; turns into &quot;link in bio.&quot;
                </p>

                <div className="space-y-2 pt-4">
                  <img
                    src={"/assets/png/shainow_1761634386828.png"}
                    alt="Shai's signature"
                    className="h-8 w-auto sm:h-10"
                    data-testid="image-signature"
                  />
                  <p
                    className="text-muted-foreground text-sm font-semibold"
                    data-testid="text-contact"
                  >
                    <a
                      href="mailto:shai@designfolio.me"
                      className="text-primary-landing cursor-pointer hover:underline"
                      data-testid="link-email"
                    >
                      shai@designfolio.me
                    </a>
                  </p>
                  <p className="text-muted-foreground text-sm italic" data-testid="text-role">
                    Founder
                  </p>
                </div>
              </div>
            </div>

            {dfToken ? (
              <Link href={"builder"} className="mt-6 flex items-center justify-center">
                <Button
                  text="Launch Builder"
                  customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
                  icon={<MemoPower />}
                />
              </Link>
            ) : (
              <ClaimDomain form="footer" />
            )}
          </div>
        </Card>
      </div>
    </footer>
  );
}
