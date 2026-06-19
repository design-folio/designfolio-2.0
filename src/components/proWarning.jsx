import { useGlobalContext } from "@/context/globalContext";
import React from "react";
import styles from "@/styles/domain.module.css";
import { Zap } from "lucide-react";

export default function ProWarning() {
  const { template, setShowUpgradeModal, setUpgradeModalUnhideProject, changeTemplate } = useGlobalContext();

  if (template === 0) return null;
  const isMacOS = template === 4;
  return (
    <div className={`${styles.proTemplateBanner} ${isMacOS ? styles.proTemplateBannerMacOS : ""}`}>
      <div className={styles.proTemplateBannerContent}>
        <div className={styles.proTemplateBannerLeft}>
          <div className={styles.proTemplateBannerIcon} />
          <div className={styles.proTemplateBannerTextBlock}>
            <div className={styles.proTemplateBannerTitle}>You're using a Pro template</div>
            <div className={styles.proTemplateBannerSubtext}>
              Customize it freely. Upgrade to publish this portfolio.{" "}
              <span className={styles.proTemplateBannerLink} onClick={() => changeTemplate(0)}>
                Switch to a free template
              </span>
            </div>
          </div>
        </div>
        <button
          className={styles.proTemplateBannerButton}
          onClick={() => { setUpgradeModalUnhideProject(null); setShowUpgradeModal(true); }}
        >
          <Zap size={13} fill="white" />
          Upgrade to Publish
        </button>
      </div>
    </div>
  );
}
