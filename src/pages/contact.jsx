import FooterBottom from "@/components/footerBottom";
import { Card } from "@/components/ui/card";
import { Mail, MessageCircle, FileQuestion, MapPin } from "lucide-react";
import Link from "next/link";



export default function Index() {
    return (
        <div className="pt-16 sm:pt-20">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Card className="p-8 sm:p-12">
                    <h1 className="text-4xl font-bold mb-6" data-testid="text-page-title">
                        Contact & Support
                    </h1>

                    <div className="space-y-8 text-foreground">
                        <section>
                            <p className="text-lg leading-relaxed" data-testid="text-intro">
                                We're here to help! Whether you have a question, need technical support, or just want to share feedback, we'd love to hear from you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4" data-testid="text-section-email">
                                Email Support
                            </h2>
                            <div className="p-6 bg-muted/50 rounded-md border border-border">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 text-primary-landing/10 rounded-md">
                                        <Mail className="w-6 h-6 " data-testid="icon-email" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2" data-testid="text-email-title">
                                            General Inquiries & Support
                                        </h3>
                                        <p className="text-muted-foreground mb-2" data-testid="text-email-description">
                                            For any questions, technical issues, or account-related matters
                                        </p>
                                        <a
                                            href="mailto:shai@designfolio.me"
                                            className="text-primary-landing hover:underline font-medium cursor-pointer"
                                            data-testid="link-support-email"
                                        >
                                            shai@designfolio.me
                                        </a>
                                        <p className="text-sm text-muted-foreground mt-2" data-testid="text-response-time">
                                            We typically respond within 24-48 hours
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4" data-testid="text-section-address">
                                Address
                            </h2>
                            <div className="p-6 bg-muted/50 rounded-md border border-border">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 text-primary-landing/10 rounded-md">
                                        <MapPin className="w-6 h-6 text-primary-landing" data-testid="icon-address" />
                                    </div>
                                    <div>
                                        <p className="leading-relaxed" data-testid="text-address">
                                            No. 87, 1st Floor, 4th Cross St, Phase-1, Tirumalai Nagar, Perungudi, Chennai, Tamil Nadu 600096
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4" data-testid="text-section-support">
                                What We Can Help With
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-6 bg-muted/50 rounded-md border border-border">
                                    <div className="flex items-start gap-3">
                                        <MessageCircle className="w-5 h-5 text-primary-landing mt-1" data-testid="icon-questions" />
                                        <div>
                                            <h3 className="font-semibold mb-1" data-testid="text-help-questions">
                                                Questions
                                            </h3>
                                            <p className="text-sm text-muted-foreground" data-testid="text-help-questions-desc">
                                                General inquiries about Designfolio features and capabilities
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-muted/50 rounded-md border border-border">
                                    <div className="flex items-start gap-3">
                                        <FileQuestion className="w-5 h-5 text-primary-landing mt-1" data-testid="icon-technical" />
                                        <div>
                                            <h3 className="font-semibold mb-1" data-testid="text-help-technical">
                                                Technical Support
                                            </h3>
                                            <p className="text-sm text-muted-foreground" data-testid="text-help-technical-desc">
                                                Issues with your portfolio, account, or platform functionality
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4" data-testid="text-section-faq">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2" data-testid="text-faq-1-question">
                                        How do I get started with Designfolio?
                                    </h3>
                                    <p className="text-muted-foreground" data-testid="text-faq-1-answer">
                                        Simply claim your username on the homepage and start building your portfolio for free. No credit card required to get started.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2" data-testid="text-faq-2-question">
                                        Can I use my own domain name?
                                    </h3>
                                    <p className="text-muted-foreground" data-testid="text-faq-2-answer">
                                        Yes! Paid plans include the option to connect your own custom domain to your Designfolio portfolio.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2" data-testid="text-faq-3-question">
                                        How do I cancel my subscription?
                                    </h3>
                                    <p className="text-muted-foreground" data-testid="text-faq-3-answer">
                                        You can cancel anytime from your account settings. Your access continues until the end of your billing period. See our{" "}
                                        <Link href="/refund-policy" className="text-primary-landing cursor-pointer hover:underline">
                                            Refund Policy
                                        </Link>
                                        {" "}for more details.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2" data-testid="text-faq-4-question">
                                        What kind of content can I showcase?
                                    </h3>
                                    <p className="text-muted-foreground" data-testid="text-faq-4-answer">
                                        You can showcase any type of creative work including design projects, photography, illustrations, case studies, and more. As long as it's your work or you have permission to display it.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="pt-4">
                            <div className="p-6 bg-primary-landing/5 border border-primary/20 rounded-md">
                                <p className="text-center" data-testid="text-feedback">
                                    Have feedback or suggestions?{" "}
                                    <a
                                        href="mailto:shai@designfolio.me?subject=Feedback"
                                        className="text-primary-landing cursor-pointer hover:underline font-medium"
                                        data-testid="link-feedback-email"
                                    >
                                        We'd love to hear from you
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </Card>
            </div>
            <FooterBottom />
        </div>
    );
}

Index.theme = "light";
