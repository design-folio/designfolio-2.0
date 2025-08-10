import React from "react";
import styles from "@/styles/domain.module.css";
import { useGlobalContext } from "@/context/globalContext";
import LockIcon from "../../public/assets/svgs/lock.svg";
import Button from "./button";

export default function ProjectLock() {
  const { setShowUpgradeModal } = useGlobalContext();
  return (
    <div className={styles.addProjectCardBlocked}>
      <div className={styles.addProjectBlockedContent}>
        <div className={styles.lockIcon}>
          <LockIcon className="stroke-bg-df-icon-color cursor-pointer w-[50px] h-[50px]" />
        </div>
        <span className={styles.addProjectBlockedTitle}>Add More Projects</span>
        <span className={styles.addProjectBlockedSubtext}>
          You've reached the 3 project limit on the free plan
        </span>
        <Button
          text="Upgrade to Pro"
          onClick={() => setShowUpgradeModal(true)}
          customClass="bg-gradient-to-r from-[#C8780D] to-[#FFBC4B]"
        />
      </div>
    </div>
  );
}
