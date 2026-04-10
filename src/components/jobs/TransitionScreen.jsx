import { motion } from "framer-motion";
import { Mic, ChevronRight } from "lucide-react";

export function TransitionScreen({ onVoice, onType }) {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#F0EDE7] dark:bg-background px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full dark:bg-[#FF553E]/8 blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 max-w-md text-center space-y-6"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <svg width="44" height="44" viewBox="0 0 37 37" fill="none">
            <rect width="37" height="37" rx="18.5" fill="#FF553E" />
            <path
              d="M20.0417 4.625H16.9583V14.7781L9.77902 7.59877L7.59877 9.77902L14.7781 16.9583H4.625V20.0417H14.7781L7.59877 27.221L9.77902 29.4012L16.9583 22.2219V32.375H20.0417V22.2219L27.221 29.4012L29.4012 27.221L22.2219 20.0417H32.375V16.9583H22.2219L29.4012 9.77902L27.221 7.59877L20.0417 14.7781V4.625Z"
              fill="white"
            />
          </svg>
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
            Let&apos;s find a job that actually fits you.
          </h1>
          <p className="text-[16px] text-muted-foreground leading-relaxed font-light">
            Your portfolio and resume are already here.
            <br />I just need 5 minutes with you.
          </p>
        </div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button
            data-testid="button-lets-talk"
            onClick={onVoice}
            className="flex items-center gap-2 bg-foreground text-background font-medium text-[14px] px-6 py-3 rounded-full hover:bg-foreground/90 transition-all active:scale-[0.97]"
          >
            <Mic className="w-4 h-4" />
            Let&apos;s talk
          </button>
          <button
            data-testid="button-type-instead"
            onClick={onType}
            className="flex items-center gap-2 text-muted-foreground font-medium text-[14px] px-6 py-3 rounded-full border border-border hover:border-foreground/30 hover:text-foreground/80 transition-all active:scale-[0.97]"
          >
            I&apos;ll type instead
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
