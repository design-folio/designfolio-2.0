import React, { useState } from "react";
import styles from "@/styles/domain.module.css";
import { useGlobalContext } from "@/context/globalContext";
import Script from "next/script";
import { createOrder } from "@/network/get-request";

export default function UpgradeModal() {
  const [isModalExiting, setIsModalExiting] = useState(false);
  const { showUpgradeModal, setShowUpgradeModal, userDetails } =
    useGlobalContext();

  const handleCloseModal = () => {
    setIsModalExiting(true);
    setTimeout(() => {
      setShowUpgradeModal(false);
      setIsModalExiting(false);
    }, 300);
  };

  const openCheckout = () => {
    // This is a minimal configuration.
    // A secure app would first fetch an `order_id` from its own server.
    createOrder().then((response) => {
      const { amount, id } = response?.data?.order; // Assuming the response contains necessary data for Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your public Key ID
        amount: { amount }, // Amount in paise (e.g., ₹500.00)
        currency: "INR",
        name: "Designfolio",
        description: "Insecure Test Transaction",
        image: "/your-logo.png",
        handler: function (response) {
          // This handler is called on successful payment.
          // 🚨 WITHOUT SERVER-SIDE VERIFICATION, THIS CAN BE FAKED.
          // A user can manually trigger this function without actually paying.
          alert(
            `Payment supposedly successful! Payment ID: ${response.razorpay_payment_id}`
          );
          alert("Warning: This payment has NOT been securely verified.");
        },
        prefill: {
          name: userDetails?.username,
          email: userDetails?.email,
          contact: "",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };
  if (!showUpgradeModal) return null;
  return (
    <div
      className={`${styles.modalOverlay} ${
        isModalExiting ? styles.modalOverlayExiting : ""
      }`}
      onClick={() => handleCloseModal()}
    >
      <div
        className={`${styles.modal} ${
          isModalExiting ? styles.modalExiting : ""
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
            <div className={styles.price}>₹4,999</div>
            <div className={styles.priceSubtext}>one-time payment</div>
          </div>

          <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
          />

          <button className={styles.upgradeNowButton} onClick={openCheckout}>
            Upgrade Now
          </button>

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
