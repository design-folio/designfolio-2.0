import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useRouter } from "next/router";
import { itemVariants } from "@/lib/animationVariants";

export default function CanvasProjectCta({ ownerUser }) {
  const router = useRouter();

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-6 md:p-8 w-full text-center flex flex-col items-center"
    >
      <h2 className="text-[24px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] mb-6">
        {`Let's build something great.`}
      </h2>
      <div className="flex gap-4 flex-wrap justify-center">
        {ownerUser?.email && (
          <button
            onClick={() => navigator.clipboard.writeText(ownerUser.email)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A] text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm transition-colors"
          >
            <Mail size={16} className="text-[#7A736C] dark:text-[#9E9893]" />
            Copy Email
          </button>
        )}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 font-medium text-sm transition-colors"
        >
          Back to Portfolio
        </button>
      </div>
    </motion.div>
  );
}
