import { useGlobalContext } from "@/context/globalContext";
import React from "react";
import styles from "@/styles/domain.module.css";
import { TriangleAlert, ArrowUpRight } from "lucide-react";
export default function ProWarning() {
  const { template, setTemplate, setShowUpgradeModal, setUpgradeModalUnhideProject, setTemplateContext } = useGlobalContext();

  if (template === 0) return null;
  const isMacOS = template === 4;
  return (
    <div className={`${styles.proTemplateBanner} ${isMacOS ? "mt-[100px] relative z-[20]" : ""}`}>
      <div className={styles.proTemplateBannerContent}>
        <div className={styles.proTemplateBannerText}>
          <TriangleAlert size={16} className="shrink-0 mt-[1px]" />
          <span>
            You're using a Pro template. Some features might be limited.{" "}
            <span
              className="underline underline-offset-1 cursor-pointer"
              onClick={() => { setUpgradeModalUnhideProject(null); setShowUpgradeModal(true); }}
            >
              Upgrade now
            </span>
          </span>
        </div>
        <button
          className={styles.revertTemplateButton}
          onClick={() => setTemplateContext(0)}
        >
          Revert to Default
        </button>
      </div>
    </div>
  );
}
