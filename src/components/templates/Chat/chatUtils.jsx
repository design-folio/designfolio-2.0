import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex space-x-1.5 items-center px-1 min-h-[22px]">
      <motion.div
        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
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
      className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
    >
      <img
        src={avatarSrc}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}

export function EditButtons({ canEdit, onEdit, onDelete, className = "" }) {
  if (!canEdit) return null;
  return (
    <div
      className={`absolute -left-0 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100 ${className}`}
    >
      {onEdit && (
        <button
          className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <svg
            className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]"
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
          className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg
            className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]"
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
    <div className="flex flex-col gap-1 max-w-[85%] items-end">
      <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
        You
      </span>
      <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
        {children}
      </div>
    </div>
  );
}
