import { useRouter } from "next/router";
import { Gem } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";

export function UpgradePill() {
  const router = useRouter();
  const { setShowUpgradeModal, userDetails, activeSidebar } = useGlobalContext();

  const isValidRoute = router.pathname === "/builder" || router.pathname === "/project/[id]/editor";

  if (!isValidRoute || userDetails?.pro || activeSidebar) return null;

  return (
    <button
      onClick={() => setShowUpgradeModal(true)}
      className="pointer-events-auto fixed top-[18px] right-5 z-10 flex items-center gap-1.5 px-3.5 py-[7px] rounded-full text-[12px] font-semibold tracking-wide cursor-pointer select-none
        bg-gradient-to-b from-white to-[#EAE5DE] dark:from-[#2A2A2A] dark:to-[#202020]
        border border-black/[0.09] dark:border-white/[0.08]
        shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06)]
        dark:shadow-[0_2px_10px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)]
        text-[#1A1A1A] dark:text-[#EFEFEF]
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.06)]
        dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]
        active:shadow-[inset_0_2px_3px_rgba(0,0,0,0.07)]
        hover:-translate-y-[1px] active:translate-y-0 transition-all duration-150"
    >
      <Gem size={12} className="text-df-orange-color shrink-0" />
      Upgrade
    </button>
  );
}
