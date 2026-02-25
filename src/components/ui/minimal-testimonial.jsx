"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    quote:
      "The customisations are awesome and incredibly helpful in bringing out the true flavour of my design projects! 🙌🏼 Totally worth spending time on — such a GOATed portfolio builder!",
    name: "Ashutosh Vashishtha",
    role: "Design Evangelist at Apple",
    image: "/assets/png/ashuthosh.png"
  },
  {
    quote:
      "I was procrastinating on building my portfolio for a year, but Designfolio completely changed that — it helped me go from Word/Figma case studies to a live website in just 20 minutes.",
    name: "Ishita Chaudhary",
    role: "Product & Business @ Cisco",
    image: "/assets/png/ishita.png"
  },
  {
    quote:
      "Designfolio is the ideal launchpad for designers and product managers to showcase their skills with an extremely efficient portfolio builder that covers every section recruiters care about.",
    name: "Suvigya Nijhawan",
    role: "Product @ Google",
    image: "/assets/png/suvigya.png"
  },
  {
    quote:
      "Designfolio has been a fantastic way to showcase my work in a clean, customizable format that reflects my personal style while keeping everything polished and professional",
    name: "Aditya Krishna",
    role: "Design Manager @ Multiplier",
    image: "/assets/png/aditya.png"
  }
]

const AUTO_PLAY_DURATION = 8000 // 8 seconds

export function TestimonialsMinimal() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / AUTO_PLAY_DURATION) * 100

      if (newProgress >= 100) {
        setActive(prev => (prev + 1) % testimonials.length)
        setProgress(0)
      } else {
        setProgress(newProgress)
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [active])

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-6 text-center">
      {/* Quote */}
      <div className="relative min-h-[100px] mb-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl font-light leading-relaxed text-foreground-landing"
          >
            "{testimonials[active].quote}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Author Row */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              setActive(
                prev => (prev - 1 + testimonials.length) % testimonials.length
              )
              setProgress(0)
            }}
            className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Avatars */}
          <div className="flex -space-x-2">
            {testimonials.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i)
                  setProgress(0)
                }}
                className={`
                  relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-background-landing
                  transition-all duration-500 ease-in-out
                  ${active === i
                    ? "z-10 scale-125 shadow-md"
                    : "grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:scale-110"
                  }
                `}
              >
                <img
                  src={t.image || "/placeholder.svg"}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setActive(prev => (prev + 1) % testimonials.length)
              setProgress(0)
            }}
            className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground-landing"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Active Author Info */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center"
            >
              <span className="text-sm font-medium text-foreground-landing">
                {testimonials[active].name}
              </span>
              <span className="text-xs text-muted-foreground">
                {testimonials[active].role}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-32 h-0.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-foreground-landing/10"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  )
}
