import React, { useEffect, useState } from "react";
import styles from "@/styles/domain.module.css";
import { useGlobalContext } from "@/context/globalContext";
import Script from "next/script";
import { _getProPlanDetails, createOrder } from "@/network/get-request";

export default function UpgradeModal() {
  const [isModalExiting, setIsModalExiting] = useState(false);
  const [plan, setPlan] = useState(null);
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    userDetails,
    userDetailsRefecth,
  } = useGlobalContext();

  useEffect(() => {
    if (showUpgradeModal) {
      _getProPlanDetails().then((response) => {
        console.log(response);
        setPlan(response?.data?.proPlan);
      });
    }
  }, [showUpgradeModal]);

  const handleCloseModal = () => {
    setIsModalExiting(true);
    setTimeout(() => {
      setShowUpgradeModal(false);
      setIsModalExiting(false);
    }, 300);
  };

  function formatAmount(amount, currencyCode, locale = undefined) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0, // no decimals
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const openCheckout = () => {
    // This is a minimal configuration.
    // A secure app would first fetch an `order_id` from its own server.
    createOrder().then((response) => {
      const { id } = response?.data?.order; // Assuming the response contains necessary data for Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your public Key ID
        // amount: { amount }, // Amount in paise (e.g., ₹500.00)
        // currency: "INR",
        order_id: id,
        name: "Designfolio by DOT Workspaces",
        description: "Insecure Test Transaction",
        image: "../../public/assets/svgs/logo.svg",
        handler: function (response) {
          // console.log(response);
          userDetailsRefecth();
          handleCloseModal();
          // This handler is called on successful payment.
          // 🚨 WITHOUT SERVER-SIDE VERIFICATION, THIS CAN BE FAKED.
          // A user can manually trigger this function without actually paying.
          // alert(
          //   `Payment supposedly successful! Payment ID: ${response.razorpay_payment_id}`
          // );
          // alert("Warning: This payment has NOT been securely verified.");
        },
        prefill: {
          name: userDetails?.username,
          email: userDetails?.email,
          // contact: "",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };
  if (!showUpgradeModal || !plan) return null;
  return (
    <div
      className={`${styles.modalOverlay} ${isModalExiting ? styles.modalOverlayExiting : ""
        }`}
      onClick={() => handleCloseModal()}
    >
      <div
        className={`${styles.modal} ${isModalExiting ? styles.modalExiting : ""
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.modalClose}
          onClick={() => handleCloseModal()}
        >
          ✕
        </button>

        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalIcon}></div>
            <h2 className={styles.modalTitle}>Designfolio Lifetime Access</h2>
            <p className={styles.modalSubtitle}>
              Just one payment. That's it. You get everything, forever.
            </p>
          </div>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.priceSection}>
            <div className={styles.priceContainer}>
              <div className={styles.price}>
                {formatAmount(plan?.amount, plan?.currency)}
              </div>
              {/* <div className={styles.slashPrice}>₹8,300</div> */}
            </div>
            <div className={styles.price}></div>
            <div className={styles.priceSubtext}>one-time payment</div>
          </div>

          <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
          />

          <button className={styles.upgradeNowButton} onClick={openCheckout}>
            Upgrade Now
          </button>
          <div className={styles.lifetimeDealBanner}>
            <div className={styles.dealBannerIcon}>⏰</div>
            <span className={styles.dealBannerText}>
              Will be {plan?.currency === "INR" ? "₹6,999" : "$99"} starting next month
            </span>
            <div className={styles.dealBannerPulse}></div>
          </div>

          {/* <div className={styles.lifetimeDealBanner}>
            <div className={styles.dealBannerIcon}>⏰</div>
            <span className={styles.dealBannerText}>
              Lifetime deal ending soon
            </span>
            <div className={styles.dealBannerPulse}></div>
          </div> */}
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Use your own custom domain</span>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Access all templates — now & forever</span>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Create unlimited projects (not just 3)</span>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Track views with built-in analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
