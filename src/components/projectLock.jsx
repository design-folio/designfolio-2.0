import React from "react";
import styles from "@/styles/domain.module.css";
import { useGlobalContext } from "@/context/globalContext";

export default function ProjectLock() {
  const { setShowUpgradeModal } = useGlobalContext();
  return (
    <div className={styles.addProjectCardBlocked}>
      <div className={styles.addProjectBlockedContent}>
        <div className={styles.lockIcon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span className={styles.addProjectBlockedTitle}>Add More Projects</span>
        <span className={styles.addProjectBlockedSubtext}>
          You've reached the 3 project limit on the free plan
        </span>
        <button
          className={styles.upgradeToAddButton}
          onClick={() => setShowUpgradeModal(true)}
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
