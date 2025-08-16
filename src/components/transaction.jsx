import { _getPaymentDetails } from "@/network/get-request";
import React, { useEffect, useState } from "react";
import styles from "@/styles/domain.module.css";
export default function Transaction() {
  const [transaction, setTransaction] = useState(null);
  useEffect(() => {
    _getPaymentDetails().then((res) => {
      setTransaction(res?.data?.order);
    });
  }, []);
  function formatAmount(amount, currencyCode, locale = undefined) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0, // no decimals
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDateToDDMMYYYY(isoDate, useUTC = true) {
    const dateObj = new Date(isoDate);

    const options = {
      month: "short", // "Jan"
      day: "2-digit", // "29"
      year: "numeric", // "2025"
    };

    return dateObj.toLocaleDateString("en-US", options, {
      timeZone: useUTC ? "UTC" : undefined,
    });
  }
  if (!transaction) {
    return null;
  }
  return (
    <div>
      <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
        Payment Details
      </p>
      <div
        className={`${styles.accordionContent} ${styles.accordionContentOpen}`}
      >
        <div className="flex flex-col lg:flex-row justify-between">
          <p className={styles.paymentDescription}>
            Designfolio Pro • Lifetime Access
          </p>
          <div className={`  ${styles.accordionRight} justify-end`}>
            <div className={styles.paymentAmountSection}>
              <>
                <span className={styles.paymentAmount}>
                  {formatAmount(transaction?.amount, transaction?.currency)}
                </span>
                <span className={styles.paymentDate}>
                  {formatDateToDDMMYYYY(transaction?.updatedAt, false)}
                </span>
              </>
            </div>
          </div>
        </div>
        {/* Tab Content */}
        <div className={styles.paymentDetailsGrid}>
          <div className={styles.paymentDetail}>
            <span className={styles.paymentDetailLabel}>Order ID</span>
            <span className={styles.paymentDetailValue}>
              {transaction?.razorpayOrderID}
            </span>
          </div>
          <div className={styles.paymentDetail}>
            <span className={styles.paymentDetailLabel}>Status</span>
            <div className={styles.statusBadge}>
              <div className={styles.statusDot}></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
        <div className={styles.paymentActions}>
          {/* <button className={styles.downloadInvoiceButton}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Invoice
          </button> */}
          {/* <button className={styles.contactSupportButton}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact Support
          </button> */}
          <p className={styles.paymentDescription}>
            Support: shai@designfolio.me
          </p>
        </div>
      </div>
    </div>
  );
}
