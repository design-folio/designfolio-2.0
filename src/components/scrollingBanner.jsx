import { Star } from "lucide-react"

const testimonials = [
    "Built my site in hours.",
    "Finally finished my portfolio.",
    "Just works.",
    "Got shortlisted the same week.",
    "Clean design.",
    "So clean. So fast.",
    "Exactly what I needed.",
    "Landed couple of interviews."
]

export default function ScrollingBanner() {
    const duplicatedTestimonials = [
        ...testimonials,
        ...testimonials,
        ...testimonials,
        ...testimonials
    ]

    return (
        <div
            className="w-full bg-foreground-landing py-4 overflow-hidden"
            data-testid="banner-scrolling"
        >
            <div className="flex animate-scroll whitespace-nowrap">
                {duplicatedTestimonials.map((text, index) => (
                    <div key={index} className="inline-flex items-center gap-2 px-6">
                        <span
                            className="text-background-landing font-medium text-sm sm:text-base"
                            data-testid={`text-testimonial-${index}`}
                        >
                            "{text}"
                        </span>
                        <div className="flex gap-0.5" data-testid={`stars-${index}`}>
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
