import React, { useEffect, useState, useRef } from 'react';
import styles from '@/styles/domain.module.css';
import { useGlobalContext } from '@/context/globalContext';
import { _getProPlanDetails, createDodoCheckout } from '@/network/get-request';
import { usePostHogEvent } from '@/hooks/usePostHogEvent';
import { POSTHOG_EVENT_NAMES } from '@/lib/posthogEventNames';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Zap } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { ConicButton } from '@/components/ui/ConicButton';

const PLAN_LABELS = { qtrly: 'Quarterly', yrly: 'Yearly' };

const PLAN_HEADINGS = {
  qtrly: {
    title: 'Get Hired Faster',
    subtitle: 'Your portfolio, resumes, AI job tools & interview prep — all in one place.',
  },
  yrly: {
    title: 'Get Hired Faster',
    subtitle: 'Your portfolio, resumes, AI job tools & interview prep — all in one place.',
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

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You keep access to Pro until the end of your current billing cycle. No questions asked.',
  },
  {
    q: 'What happens to my portfolio if I downgrade to Free?',
    a: "Your portfolio stays live. You'll be limited to 2 case studies; extras stay hidden until you upgrade again. Custom domain support will also be removed.",
  },
  {
    q: 'What does AI case study analysis mean?',
    a: 'Our AI reviews your case studies and gives you targeted feedback on structure, storytelling, depth of process, and how recruiters are likely to perceive them.',
  },
  {
    q: 'Which plans include AI job matching?',
    a: 'AI job matching, tailored resumes, cover letters, mock interviews, and job insights are all exclusive to Pro — available on both Quarterly and Yearly billing.',
  },
  {
    q: 'Is there a free trial?',
    a: 'No free trial right now, but the Free plan lets you explore the portfolio builder with up to 2 case studies before you decide to upgrade.',
  },
];

// Prepends centering translate so framer-motion's y/scale animations don't conflict with
// the element's own position: fixed + top:50% + left:50% centering.
function centeredTransform(_, generated) {
  return `translate(-50%, -50%) ${generated}`;
}

export default function UpgradeModal() {
  const [proPlans, setProPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showFaq, setShowFaq] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [sideBySide, setSideBySide] = useState(false);
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    upgradeModalUnhideProject,
    setUpgradeModalUnhideProject,
  } = useGlobalContext();

  const phEvent = usePostHogEvent();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    const check = () => setSideBySide(window.innerWidth >= 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
      setShowFaq(false);
    }
  }, [showUpgradeModal]);

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
    setUpgradeModalUnhideProject(null);
  };

  function formatAmount(amount, currencyCode) {
    if (currencyCode === 'USD') return `$${Number(amount).toFixed(0)}`;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function getMonthlyAmount(plan) {
    if (!plan) return 0;
    if (plan.plan === 'yrly') return Math.round(Number(plan.amount) / 12);
    if (plan.plan === 'qtrly') return Math.round(Number(plan.amount) / 3);
    return Number(plan.amount);
  }

  function getYearlySavingsPct() {
    const qtrly = proPlans.find(p => p.plan === 'qtrly');
    const yrly = proPlans.find(p => p.plan === 'yrly');
    if (!qtrly || !yrly) return 0;
    const annualQtrly = Number(qtrly.amount) * 4;
    return Math.round((1 - Number(yrly.amount) / annualQtrly) * 100);
  }

  function getButtonText() {
    if (checkoutLoading) return 'Opening checkout…';
    if (selectedPlan?.plan === 'yrly') {
      const savePct = getYearlySavingsPct();
      return savePct > 0 ? `Get PRO — Save ${savePct}% yearly` : 'Get PRO — Yearly';
    }
    return 'Get PRO — Quarterly';
  }

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

  if (proPlans.length === 0 || !selectedPlan) return null;

  // Expanded width: 880px (2 × 440). Collapsed: 440px. Mobile: no framer width control.
  const cardWidth = sideBySide ? (showFaq ? 880 : 440) : undefined;

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <>
          {/* Backdrop — sibling to the card so its opacity doesn't clip the card's exit */}
          <motion.div
            key="upgrade-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={handleCloseModal}
          />

          {/* Modal card — centered via transformTemplate, expands symmetrically */}
          <motion.div
            key="upgrade-card"
            transformTemplate={centeredTransform}
            className={`${styles.modal} ${sideBySide ? styles.modalFMRow : ''}`}
            initial={{ opacity: 0, y: 12, scale: 0.97, ...(sideBySide ? { width: 440 } : {}) }}
            animate={{ opacity: 1, y: 0, scale: 1, ...(cardWidth !== undefined ? { width: cardWidth } : {}) }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 1001,
              animation: 'none',
              ...(sideBySide ? { maxWidth: 'none', overflow: 'hidden' } : {}),
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button — anchored to the card, not inside the scrolling panel,
                top: 88px clears the 80px ::before orange gradient */}
            <button
              className={styles.modalClose}
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <X size={14} strokeWidth={2.5} />
            </button>

            {/* ── Left panel: pricing (always visible) ── */}
            <div className={sideBySide ? styles.modalLeftPanel : styles.modalSinglePanel}>
              <div className={styles.modalHeader}>
                <div>
                  <div className={styles.modalIcon} />
                  <h2 className={styles.modalTitle}>
                    {upgradeModalUnhideProject
                      ? `Unhide ${upgradeModalUnhideProject.title || 'Project'}?`
                      : (PLAN_HEADINGS[selectedPlan?.plan] ?? PLAN_HEADINGS.yrly).title}
                  </h2>
                  <p className={styles.modalSubtitle}>
                    {upgradeModalUnhideProject
                      ? 'Free users can only have 2 visible projects. Go Pro to add unlimited and unhide this project.'
                      : (PLAN_HEADINGS[selectedPlan?.plan] ?? PLAN_HEADINGS.yrly).subtitle}
                  </p>
                </div>
              </div>

              <div className={styles.modalContent}>
                {/* Billing toggle */}
                <div className="mb-6">
                  <Tabs
                    value={selectedPlan?.plan ?? ''}
                    onValueChange={value => {
                      const newPlan = proPlans.find(p => p.plan === value);
                      setSelectedPlan(newPlan);
                      phEvent(POSTHOG_EVENT_NAMES.UPGRADE_PLAN_SELECTED, {
                        source: 'dropdown',
                        selected_plan: newPlan?.plan,
                        selected_amount: Number(newPlan?.amount),
                        selected_currency: newPlan?.currency,
                      });
                    }}
                  >
                    <TabsList className="flex p-1 rounded-lg gap-1 w-full h-auto bg-[#f0f0f0]">
                      {proPlans.map(p => (
                        <TabsTrigger
                          key={p.plan}
                          value={p.plan}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 text-[#525252] hover:text-[#0a0a0a] data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                        >
                          {PLAN_LABELS[p.plan] ?? p.plan}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Price */}
                <div className={styles.priceSection}>
                  <div className={styles.priceContainer}>
                    <div className="flex items-baseline gap-2">
                      <div className={styles.price}>
                        {formatAmount(getMonthlyAmount(selectedPlan), selectedPlan?.currency)}
                      </div>
                      <div className={styles.priceSubtext}>/ per month</div>
                    </div>
                    <div className="text-sm text-[#6b7280] font-medium mt-0.5">
                      billed {formatAmount(selectedPlan?.amount, selectedPlan?.currency)}{' '}
                      {selectedPlan?.plan === 'yrly' ? 'yearly' : 'quarterly'}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <ConicButton
                  onClick={openCheckout}
                  disabled={checkoutLoading}
                  className="w-full mb-4"
                >
                  <Zap size={13} />
                  {getButtonText()}
                </ConicButton>

                {/* Features */}
                <div className={styles.featuresList}>
                  {[
                    'Use your own custom domain',
                    'Access all templates — now & forever',
                    'Create unlimited projects (not just 2)',
                    'Track views with built-in analytics',
                  ].map(f => (
                    <div key={f} className={styles.featureItem}>
                      <div className={styles.featureIcon}>✓</div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Logo marquee */}
                <div className="mt-6 pt-4 border-t border-[#e5e7eb] min-h-[64px]">
                  <p className="text-center text-[10px] font-medium text-[#9ca3af] mb-2">
                    Trusted by 20000+ designers
                  </p>
                  <div className="relative min-h-8 py-1">
                    <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                    <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
                    <div className="flex gap-0 overflow-x-hidden min-h-8 px-1">
                      {[TRUSTED_BY_LOGOS, TRUSTED_BY_LOGOS].map((logos, pass) => (
                        <div
                          key={pass}
                          className="flex animate-scroll items-center gap-0 shrink-0 min-h-8 py-0.5"
                          aria-hidden={pass === 1 ? 'true' : undefined}
                        >
                          {logos.map((logo, i) => (
                            <div key={i} className="flex items-center justify-center px-2 flex-shrink-0 min-h-8 min-w-[48px]">
                              <img src={logo} alt="" width={32} height={16} className="h-4 w-auto max-h-6 opacity-50 grayscale object-contain" />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FAQ toggle chip */}
                <div className="flex mt-3.5">
                  <button
                    onClick={() => setShowFaq(s => !s)}
                    className={`flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-[5px] border transition-all duration-200 ${
                      showFaq
                        ? 'border-[#d1d5db] bg-[#f3f4f6] text-[#4b5563]'
                        : 'border-[#e5e7eb] bg-transparent text-[#9ca3af] hover:text-[#6b7280] hover:border-[#d1d5db]'
                    }`}
                  >
                    <HelpCircle className="w-3 h-3 flex-shrink-0" />
                    Have more doubts? FAQ
                  </button>
                </div>

                {/* Mobile: FAQ stacks inline below */}
                {!sideBySide && (
                  <AnimatePresence>
                    {showFaq && (
                      <motion.div
                        key="faq-inline"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-3 border-t border-[#e5e7eb]">
                          <h3 className="text-[14px] font-bold text-[#111827] tracking-tight mb-0.5">
                            FAQs
                          </h3>
                          <Accordion type="single" collapsible className="w-full">
                            {FAQS.map((item, i) => (
                              <AccordionItem
                                key={i}
                                value={`faq-mob-${i}`}
                                className="border-b border-[#f3f4f6] last:border-0"
                              >
                                <AccordionTrigger className="text-[12px] font-medium text-left text-[#374151] hover:no-underline py-3 leading-snug">
                                  {item.q}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <p className="text-[11.5px] text-[#6b7280] leading-relaxed pb-1">
                                    {item.a}
                                  </p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* ── Right panel: FAQ (desktop side-by-side, fades in after card expands) ── */}
            {sideBySide && (
              <AnimatePresence>
                {showFaq && (
                  <motion.div
                    key="faq-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, delay: 0.14 }}
                    className={styles.modalRightPanel}
                  >
                    {/* Header pushed below the 80px ::before orange gradient */}
                    <div className="px-5 pt-[88px] pb-4 border-b border-[#f3f4f6]">
                      <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">
                        FAQs
                      </h3>
              
                    </div>
                    <div className="overflow-y-auto flex-1 px-5 py-2">
                      <Accordion type="single" collapsible className="w-full">
                        {FAQS.map((item, i) => (
                          <AccordionItem
                            key={i}
                            value={`faq-desk-${i}`}
                            className="border-b border-[#f3f4f6] last:border-0"
                          >
                            <AccordionTrigger className="text-[13.5px] font-medium text-left text-[#1f2937] hover:no-underline py-4 leading-snug">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-[13px] text-[#6b7280] leading-relaxed pb-2">
                                {item.a}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
