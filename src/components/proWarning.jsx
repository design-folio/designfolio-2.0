import { useGlobalContext } from "@/context/globalContext";
import React from "react";
import styles from "@/styles/domain.module.css";
export default function ProWarning() {
  const { template, setTemplate } = useGlobalContext();
  if (template === 0) return null;
  return (
    <div className={styles.proTemplateBanner}>
      <div className={styles.proTemplateBannerContent}>
        <div className={styles.proTemplateBannerText}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          You're using a Pro template. Some features might be limited.
        </div>
        <button
          className={styles.revertTemplateButton}
          onClick={() => setTemplate(0)}
        >
          Revert to Default
        </button>
      </div>
    </div>
  );
}
