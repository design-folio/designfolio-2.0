import React, { useEffect, useState } from "react";
import styles from "@/styles/domain.module.css";
import { useGlobalContext } from "@/context/globalContext";
import Script from "next/script";
import { _getProPlanDetails, createOrder } from "@/network/get-request";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLAN_LABELS = { "1m": "1 Month", "3m": "3 Months", lifetime: "Lifetime" };

export default function UpgradeModal() {
  const [isModalExiting, setIsModalExiting] = useState(false);
  const [proPlans, setProPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    upgradeModalUnhideProject,
    setUpgradeModalUnhideProject,
    userDetails,
    userDetailsRefecth,
  } = useGlobalContext();

  useEffect(() => {
    if (showUpgradeModal) {
      _getProPlanDetails().then((response) => {
        const plans = response?.data?.proPlans;
        if (Array.isArray(plans) && plans.length > 0) {
          setProPlans(plans);
          setSelectedPlan(plans.find((p) => p.plan === "lifetime") || plans[0]);
        }
      });
    }
  }, [showUpgradeModal]);

  const handleCloseModal = () => {
    setIsModalExiting(true);
    setTimeout(() => {
      setShowUpgradeModal(false);
      setUpgradeModalUnhideProject(null);
      setIsModalExiting(false);
    }, 300);
  };

  function formatAmount(amount, currencyCode) {
    if (currencyCode === "USD") {
      return `$${Number(amount).toFixed(0)}`;
    }
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const openCheckout = () => {
    if (!selectedPlan?.plan) return;
    createOrder(selectedPlan.plan).then((response) => {
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
  if (!showUpgradeModal || proPlans.length === 0 || !selectedPlan) return null;
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
            <h2 className={styles.modalTitle}>
              {upgradeModalUnhideProject
                ? `Unhide ${upgradeModalUnhideProject.title || "Project"}?`
                : "Designfolio Lifetime Access"}
            </h2>
            <p className={styles.modalSubtitle}>
              {upgradeModalUnhideProject
                ? "Free users can only have 2 visible projects. Go Pro to add unlimited and unhide this project."
                : "Just one payment. That's it. You get everything, forever."}
            </p>
          </div>
        </div>

        <div className={styles.modalContent}>
          <Tabs
            value={selectedPlan?.plan ?? ""}
            onValueChange={(value) => setSelectedPlan(proPlans.find((p) => p.plan === value))}
            className="mb-6"
          >
            <TabsList className="flex p-1 rounded-lg gap-1 w-full h-auto bg-[#f0f0f0]">
              {proPlans.map((p) => (
                <TabsTrigger
                  key={p.plan}
                  value={p.plan}
                  className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 text-[#525252] hover:text-[#0a0a0a] data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] dark:text-[#525252] dark:hover:text-[#0a0a0a] dark:data-[state=active]:bg-[#ffffff] dark:data-[state=active]:text-[#0a0a0a] dark:data-[state=active]:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                >
                  {PLAN_LABELS[p.plan] ?? p.plan}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className={styles.priceSection}>
            <div className={styles.priceContainer}>
              <div className={styles.price}>
                {formatAmount(selectedPlan?.amount, selectedPlan?.currency)}
              </div>
              {/* <div className={styles.slashPrice}>₹8,300</div> */}
            </div>
            <div className={styles.priceSubtext}>one-time payment</div>
          </div>

          <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
          />

          <button className={styles.upgradeNowButton} onClick={openCheckout}>
            Upgrade Now
          </button>
          {(() => {
            const lifetimePlan = proPlans.find((p) => p.plan === "lifetime");
            if (!lifetimePlan) return null;
            return (
              <div className={styles.lifetimeDealBanner}>
                <div className={styles.dealBannerIcon}>⏰</div>
                <span className={styles.dealBannerText}>
                  Best value: Lifetime at {formatAmount(lifetimePlan.amount, lifetimePlan.currency)} — unlock forever
                </span>
                <div className={styles.dealBannerPulse}></div>
              </div>
            );
          })()}

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
              <span>Create unlimited projects (not just 2)</span>
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
