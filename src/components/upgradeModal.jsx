import React, { useEffect, useState, useRef } from 'react';
import styles from '@/styles/domain.module.css';
import { useGlobalContext } from '@/context/globalContext';
import { _getProPlanDetails, createDodoCheckout } from '@/network/get-request';
import { usePostHogEvent } from '@/hooks/usePostHogEvent';
import { POSTHOG_EVENT_NAMES } from '@/lib/posthogEventNames';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PLAN_LABELS = { qtrly: 'Quarterly', yrly: 'Yearly' };

const PLAN_PERIOD = { qtrly: '/ 3 months', yrly: '/ year' };

const PLAN_HEADINGS = {
  qtrly: {
    title: 'For Job Seekers',
    subtitle: 'Build a complete portfolio and start landing interviews fast.',
    buttonText: 'Get PRO — Quarterly',
  },
  yrly: {
    title: 'Best Value',
    subtitle: 'Own your portfolio all year. No resets, full AI access.',
    buttonText: 'Get PRO — Yearly',
  },
};

const TRUSTED_BY_LOGOS = [
  '/assets/svgs/company logos/companylogos02.svg',
  '/assets/svgs/company logos/companylogos03.svg',
  '/assets/svgs/company logos/companylogos01.svg',
  '/assets/svgs/company logos/companylogos04.svg',
  '/assets/svgs/company logos/companylogos05.svg',
  '/assets/svgs/company logos/companylogos06.svg',
  '/assets/svgs/company logos/companylogos07.svg',
];

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

  const phEvent = usePostHogEvent();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (showUpgradeModal) {
      _getProPlanDetails().then(response => {
        const plans = response?.data?.proPlans;
        if (Array.isArray(plans) && plans.length > 0) {
          setProPlans(plans);
          setSelectedPlan(plans.find(p => p.plan === 'yrly') || plans[0]);
        }
      });
    }
  }, [showUpgradeModal]);

  useEffect(() => {
    if (showUpgradeModal && selectedPlan && !hasTrackedView.current) {
      phEvent(POSTHOG_EVENT_NAMES.UPGRADE_MODAL_VIEWED, {
        source: 'dropdown',
        default_plan: selectedPlan?.plan,
        default_plan_amount: Number(selectedPlan?.amount),
        default_plan_currency: selectedPlan?.currency,
      });
      hasTrackedView.current = true;
    }
  }, [showUpgradeModal, selectedPlan]);

  useEffect(() => {
    if (!showUpgradeModal) {
      hasTrackedView.current = false;
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
    if (currencyCode === 'USD') {
      return `$${Number(amount).toFixed(0)}`;
    }
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const openCheckout = async () => {
    if (!selectedPlan?.plan || checkoutLoading) return;
    phEvent(POSTHOG_EVENT_NAMES.UPGRADE_MODAL_CLICKED, {
      source: 'dropdown',
      selected_plan: selectedPlan?.plan,
      selected_amount: Number(selectedPlan?.amount),
      selected_currency: selectedPlan?.currency,
    });
    setCheckoutLoading(true);
    try {
      const res = await createDodoCheckout(selectedPlan.plan);
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      console.error('[UpgradeModal] Checkout failed:', err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };
  if (!showUpgradeModal || proPlans.length === 0 || !selectedPlan) return null;
  return (
    <div
      className={`${styles.modalOverlay} ${
        isModalExiting ? styles.modalOverlayExiting : ''
      }`}
      onClick={() => handleCloseModal()}
    >
      <div
        className={`${styles.modal} ${
          isModalExiting ? styles.modalExiting : ''
        }`}
        onClick={e => e.stopPropagation()}
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
                ? `Unhide ${upgradeModalUnhideProject.title || 'Project'}?`
                : (PLAN_HEADINGS[selectedPlan?.plan] ?? PLAN_HEADINGS.lifetime)
                    .title}
            </h2>
            <p className={styles.modalSubtitle}>
              {upgradeModalUnhideProject
                ? 'Free users can only have 2 visible projects. Go Pro to add unlimited and unhide this project.'
                : (PLAN_HEADINGS[selectedPlan?.plan] ?? PLAN_HEADINGS.lifetime)
                    .subtitle}
            </p>
          </div>
        </div>

        <div className={styles.modalContent}>
          <div className="mb-6">
            {/* {(() => {
              const qtrly = proPlans.find(p => p.plan === 'qtrly');
              const yrly  = proPlans.find(p => p.plan === 'yrly');
              if (!qtrly || !yrly || selectedPlan?.plan !== 'yrly') return null;
              const annualQtrly = Number(qtrly.amount) * 4;
              const savePct = Math.round((1 - Number(yrly.amount) / annualQtrly) * 100);
              if (savePct <= 0) return null;
              return (
                <div className="relative z-10 text-center -mb-2.5">
                  <span
                    className="inline-block px-2 py-1 text-[10px] font-semibold rounded-full whitespace-nowrap"
                    style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                  >
                    Save {savePct}%
                  </span>
                </div>
              );
            })()} */}
            <div className="relative z-0">
              <Tabs
                value={selectedPlan?.plan ?? ''}
                onValueChange={value => {
                  const newPlan = proPlans.find(p => p.plan === value);
                  setSelectedPlan(proPlans.find(p => p.plan === value));
                  phEvent(POSTHOG_EVENT_NAMES.UPGRADE_PLAN_SELECTED, {
                    source: 'dropdown',
                    selected_plan: newPlan?.plan,
                    selected_amount: Number(newPlan?.amount),
                    selected_currency: newPlan?.currency,
                  });
                }}
                className="mb-0"
              >
                <TabsList className="flex p-1 rounded-lg gap-1 w-full h-auto bg-[#f0f0f0]">
                  {proPlans.map(p => (
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
            </div>
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceContainer}>
              <div className={styles.price}>
                {formatAmount(selectedPlan?.amount, selectedPlan?.currency)}
              </div>
              {/* <div className={styles.slashPrice}>₹8,300</div> */}
              <div className={styles.priceSubtext}>{PLAN_PERIOD[selectedPlan?.plan] ?? ''}</div>
            </div>
          </div>

          <button className={styles.upgradeNowButton} onClick={openCheckout} disabled={checkoutLoading}>
            {checkoutLoading ? 'Opening checkout…' : (PLAN_HEADINGS[selectedPlan?.plan]?.buttonText ?? 'Upgrade Now')}
          </button>

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

          <div className="mt-6 pt-4 border-t border-[#e5e7eb] min-h-[64px]">
            <p className="text-center text-[10px] font-medium text-[#9ca3af] mb-2">
              Trusted by 20000+ designers
            </p>
            <div className="relative min-h-8 py-1">
              <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
              <div className="flex gap-0 overflow-x-hidden min-h-8 px-1">
                <div className="flex animate-scroll items-center gap-0 shrink-0 min-h-8 py-0.5">
                  {TRUSTED_BY_LOGOS.map((logo, index) => (
                    <div
                      key={`first-${index}`}
                      className="flex items-center justify-center px-2 sm:px-3 flex-shrink-0 min-h-8 min-w-[48px]"
                    >
                      <img
                        src={logo}
                        alt=""
                        width={32}
                        height={16}
                        className="h-4 w-auto max-h-6 opacity-50 grayscale object-contain"
                      />
                    </div>
                  ))}
                </div>
                <div
                  className="flex animate-scroll items-center gap-0 shrink-0 min-h-8 py-0.5"
                  aria-hidden="true"
                >
                  {TRUSTED_BY_LOGOS.map((logo, index) => (
                    <div
                      key={`second-${index}`}
                      className="flex items-center justify-center px-2 sm:px-3 flex-shrink-0 min-h-8 min-w-[48px]"
                    >
                      <img
                        src={logo}
                        alt=""
                        width={32}
                        height={16}
                        className="h-4 w-auto max-h-6 opacity-50 grayscale object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
