import { motion } from "motion/react";

export function TypingIndicator() {
  return (
    <div className="flex min-h-[22px] items-center space-x-1.5 px-1">
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5]"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5]"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5]"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}

export function ChatAvatar({ avatarSrc, show = true }) {
  if (!show) return null;
  return (
    <motion.div
      layoutId="matt-avatar-sequence"
      className="h-8 w-8 overflow-hidden rounded-full border border-black/5 dark:border-white/5"
    >
      <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
    </motion.div>
  );
}

export function EditButtons({ canEdit, onEdit, onDelete, className = "" }) {
  if (!canEdit) return null;
  return (
    <div
      className={`absolute top-1/2 -left-0 z-40 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100 ${className}`}
    >
      {onEdit && (
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <svg
            className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg
            className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export function YouPrompt({ children }) {
  return (
    <div className="flex max-w-[85%] flex-col items-end gap-1">
      <span className="mr-1 text-[11px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">You</span>
      <div className="rounded-2xl rounded-br-sm bg-[#1A8CFF] px-4 py-3 text-[15px] leading-relaxed text-white shadow-sm dark:bg-[#0073E6]">
        {children}
      </div>
    </div>
  );
}
