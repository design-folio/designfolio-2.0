import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { useRouter } from "next/router";
import { itemVariants } from "@/lib/animationVariants";

export default function CanvasProjectCta({ ownerUser }) {
  const router = useRouter();

  return (
    <motion.div
      variants={itemVariants}
      className="flex w-full flex-col items-center rounded-[32px] border border-[#E5D7C4] bg-white p-6 text-center md:p-8 dark:border-white/10 dark:bg-[#2A2520]"
    >
      <h2 className="mb-6 text-[24px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
        {`Let's build something great.`}
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {ownerUser?.email && (
          <button
            onClick={() => navigator.clipboard.writeText(ownerUser.email)}
            className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:text-[#F0EDE7] dark:hover:bg-[#35302A]"
          >
            <Mail size={16} className="text-[#7A736C] dark:text-[#9E9893]" />
            Copy Email
          </button>
        )}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl bg-[#1A1A1A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-white/90"
        >
          Back to Portfolio
        </button>
      </div>
    </motion.div>
  );
}
