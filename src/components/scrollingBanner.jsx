import { Star } from "lucide-react";

const testimonials = [
  "Built my site in hours.",
  "Finally finished my portfolio.",
  "Just works.",
  "Got shortlisted the same week.",
  "Clean design.",
  "So clean. So fast.",
  "Exactly what I needed.",
  "Landed couple of interviews.",
];

export default function ScrollingBanner() {
  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  return (
    <div
      className="bg-foreground-landing w-full overflow-hidden py-4"
      data-testid="banner-scrolling"
    >
      <div className="animate-scroll flex whitespace-nowrap">
        {duplicatedTestimonials.map((text, index) => (
          <div key={index} className="inline-flex items-center gap-2 px-6">
            <span
              className="text-background-landing text-sm font-medium sm:text-base"
              data-testid={`text-testimonial-${index}`}
            >
              &quot;{text}&quot;
            </span>
            <div className="flex gap-0.5" data-testid={`stars-${index}`}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
