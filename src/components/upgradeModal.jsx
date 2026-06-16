import React, { useEffect, useState, useRef } from 'react';
import styles from '@/styles/domain.module.css';
import { useGlobalContext } from '@/context/globalContext';
import { _getProPlanDetails, createDodoCheckout } from '@/network/get-request';
import { usePostHogEvent } from '@/hooks/usePostHogEvent';
import { POSTHOG_EVENT_NAMES } from '@/lib/posthogEventNames';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Gem, HelpCircle, Rocket, Sprout, Star, X, Zap } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { ConicButton } from '@/components/ui/ConicButton';
import { Button } from '@/components/ui/button';

const PLAN_LABELS = { mthly: 'Monthly', qtrly: 'Quarterly', yrly: 'Yearly', lifetime: "Lifetime" };

const PLAN_HEADINGS = {
  mthly: {
    title: 'Get Hired Faster',
    subtitle: 'Your portfolio, resumes, AI job tools & interview prep — all in one place.',
  },
  qtrly: {
    title: 'Get Hired Faster',
    subtitle: 'Your portfolio, resumes, AI job tools & interview prep — all in one place.',
  },
  yrly: {
    title: 'Get Hired Faster',
    subtitle: 'Your portfolio, resumes, AI job tools & interview prep — all in one place.',
  },
  lifetime: {
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
    a: 'AI job matching, tailored resumes, cover letters, mock interviews, and job insights are all exclusive to Pro — available on Monthly, Quarterly, and Yearly billing.',
  },
  {
    q: 'Is there a free trial?',
    a: 'No free trial right now, but the Free plan lets you explore the portfolio builder with up to 2 case studies before you decide to upgrade.',
  },
  {
    q: 'When do AI credits expire for Lifetime members?',
    a: 'AI credits on the Lifetime plan expire 18 months after your purchase date. After that, you can top up credits as needed — your portfolio and all other Pro features remain active forever.',
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
  const [showAllFeatures, setShowAllFeatures] = useState(false);
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
          setSelectedPlan(plans.find(p => p.plan === 'lifetime') || plans[0]);
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
      setShowAllFeatures(false);
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
    return Number(plan.amount); // mthly: amount is already monthly
  }

  function getSavingsPct(planKey) {
    const mthly = proPlans.find(p => p.plan === 'mthly');
    if (!mthly) return 0;
    const monthlyPrice = Number(mthly.amount);
    if (planKey === 'qtrly') {
      const q = proPlans.find(p => p.plan === 'qtrly');
      if (!q) return 0;
      return Math.round((1 - Number(q.amount) / 3 / monthlyPrice) * 100);
    }
    if (planKey === 'yrly') {
      const y = proPlans.find(p => p.plan === 'yrly');
      if (!y) return 0;
      return Math.round((1 - Number(y.amount) / 12 / monthlyPrice) * 100);
    }
    return 0;
  }

  function getButtonText() {
    if (checkoutLoading) return 'Opening checkout…';
    const label = PLAN_LABELS[selectedPlan?.plan];
    return label ? `Get ${label} Access` : 'Get PRO';
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

  const stashedPrice = selectedPlan?.currency === 'USD' ? '$149' : '₹11,999';

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
            className={`${styles.modal} ${sideBySide ? styles.modalFMRow : ''} ${sideBySide && showFaq ? styles.modalFaqOpen : ''}`}
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
                  <UrgencyBanner />
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
                <div className="mb-6 pt-5">
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
                    <TabsList className="flex p-1 rounded-lg gap-1 w-full h-auto bg-[#f0f0f0] overflow-visible">
                      {proPlans.map(p => (
                        <TabsTrigger
                          key={p.plan}
                          value={p.plan}
                          className="relative flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 text-[#525252] hover:text-[#0a0a0a] data-[state=active]:bg-[#ffffff] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                        >
                          {p.plan === 'lifetime' && (
                            <span
                              className="absolute -top-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-[3.5px] rounded-full text-[8.5px] font-semibold uppercase select-none"
                              style={{
                                background: "linear-gradient(180deg, #383838 0%, #1c1c1c 100%)",
                                color: "rgba(255,255,255,0.82)",
                                letterSpacing: "0.09em",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.13), 0 2px 5px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(0,0,0,0.35)",
                              }}
                            >Best Value</span>
                          )}
                          {PLAN_LABELS[p.plan] ?? p.plan}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Price */}
                <div className={styles.priceSection}>
                  <div className={styles.priceContainer}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedPlan?.plan}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14 }}
                      >
                        {selectedPlan?.plan === 'lifetime' ? (
                          <>
                            <div className="flex items-baseline gap-2">
                              <div className={styles.price}>
                                {formatAmount(selectedPlan?.amount, selectedPlan?.currency)}
                              </div>
                              <div className={styles.priceSubtext}><span className=' line-through'> {stashedPrice} </span> /one-time</div>
                            </div>
                            <div className="text-sm text-[#6b7280] font-medium mt-0.5">
                              Pay once. Use it throughout your career.
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-2">
                              <div className={styles.price}>
                                {formatAmount(getMonthlyAmount(selectedPlan), selectedPlan?.currency)}
                              </div>
                              <div className={styles.priceSubtext}>/ per month</div>
                            </div>
                            <div className="text-sm text-[#6b7280] font-medium mt-0.5">
                              billed {formatAmount(selectedPlan?.amount, selectedPlan?.currency)}{' '}
                              {{ mthly: 'monthly', qtrly: 'quarterly', yrly: 'yearly' }[selectedPlan?.plan] ?? 'per period'}
                            </div>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* CTA */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPlan?.plan + "-quote"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                  >
                    <div
                      className="flex items-center gap-2.5 mb-3 px-3 py-2.5 rounded-xl"
                      style={{
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      <span
                        className="flex-shrink-0 w-[22px] h-[22px] rounded-md flex items-center justify-center"
                        style={{ background: "rgba(232,89,58,0.12)" }}
                      >
                        {selectedPlan?.plan === 'lifetime' && <Gem className="w-3 h-3" style={{ color: "#E8593A" }} />}
                        {selectedPlan?.plan === 'mthly' && <Sprout className="w-3 h-3" style={{ color: "#E8593A" }} />}
                        {selectedPlan?.plan === 'qtrly' && <Rocket className="w-3 h-3" style={{ color: "#E8593A" }} />}
                        {selectedPlan?.plan === 'yrly' && <Star className="w-3 h-3" style={{ color: "#E8593A" }} />}
                      </span>
                      <p className="text-[11.5px] leading-snug" style={{ color: "#4b5563" }}>
                        {selectedPlan?.plan === 'lifetime' && "78% of paying members choose Lifetime."}
                        {selectedPlan?.plan === 'mthly' && "Start building today. Upgrade anytime."}
                        {selectedPlan?.plan === 'qtrly' && "Enough time to build, apply, interview, and get hired."}
                        {selectedPlan?.plan === 'yrly' && "The best value for a serious job search."}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {(selectedPlan?.plan === 'yrly' || selectedPlan?.plan === 'lifetime') ? (
                  <ConicButton
                    onClick={openCheckout}
                    disabled={checkoutLoading}
                    className="w-full mb-4"
                  >
                    <Zap size={13} />
                    {getButtonText()}
                  </ConicButton>
                ) : (
                  <Button
                    onClick={openCheckout}
                    disabled={checkoutLoading}
                    className="w-full mb-4 h-12 text-sm font-bold bg-[hsl(7,100%,62%)] hover:bg-[hsl(7,100%,55%)] text-white border-none"
                  >
                    {getButtonText()}
                  </Button>
                )}

                {/* Features */}
                {(() => {
                  const allFeatures = [
                    "Unlimited case studies",
                    "Custom domain",
                    "All premium templates",
                    "AI job search & matching",
                    "Tailored resumes & cover letters",
                    "Mock interviews",
                    "AI case study analysis",
                  ];
                  const visible = allFeatures.slice(0, 4);
                  const hidden = allFeatures.slice(4);
                  return (
                    <div className={styles.featuresList}>
                      {visible.map(f => (
                        <div key={f} className={styles.featureItem}>
                          <div className={styles.featureIcon}>✓</div>
                          <span>{f}</span>
                        </div>
                      ))}
                      <AnimatePresence>
                        {showAllFeatures && (
                          <motion.div
                            key="extra-features"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden flex flex-col gap-3"
                          >
                            {hidden.map(f => (
                              <div key={f} className={styles.featureItem}>
                                <div className={styles.featureIcon}>✓</div>
                                <span>{f}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => setShowAllFeatures(s => !s)}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#9ca3af] hover:text-[#6b7280] transition-colors duration-150"
                      >
                        <ChevronDown
                          size={12}
                          strokeWidth={2.5}
                          className={`transition-transform duration-200 ${showAllFeatures ? 'rotate-180' : ''}`}
                        />
                        {showAllFeatures ? 'Show less' : `+${hidden.length} more features`}
                      </button>
                    </div>
                  );
                })()}

                {/* FAQ toggle chip */}
                <div className="flex mt-3">
                  <button
                    onClick={() => setShowFaq(s => !s)}
                    className={`flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-[5px] border transition-all duration-200 ${showFaq
                      ? 'border-[#9ca3af] bg-[#f3f4f6] text-[#374151]'
                      : 'border-[#c4c9d4] bg-transparent text-[#6b7280] hover:text-[#374151] hover:border-[#9ca3af]'
                      }`}
                  >
                    <HelpCircle className="w-3 h-3 flex-shrink-0" />
                    Have more doubts? FAQ
                  </button>
                </div>

                {/* Logo marquee */}
                <div className="pt-4  flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-[#e5e7eb]" />
                    <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ca3af] whitespace-nowrap">
                      31,000+ Designfolio users work at
                    </span>
                    <div className="flex-1 h-px bg-[#e5e7eb]" />
                  </div>
                  <div
                    className="w-full overflow-hidden relative"
                    style={{
                      maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                      WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                    }}
                  >
                    <motion.div
                      className="flex items-center w-max"
                      animate={{ x: ["0%", "-50%"] }}
                      transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                    >
                      {[...Array(2)].map((_, pass) => (
                        <div key={pass} className="flex items-center gap-x-6 pr-6" aria-hidden={pass === 1 ? 'true' : undefined}>
                          {[...Array(7)].map((_, num) => (
                            <img
                              key={num}
                              src={`/companylogo/companienames0${num + 1}.svg`}
                              alt=""
                              className="h-4 w-auto opacity-50 grayscale object-contain"
                            />
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  </div>
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
                    <div className="px-5 py-4 border-b border-[#f3f4f6]">
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

function UrgencyBanner() {
  return (
    <div
      className="flex items-center gap-2 mb-1 px-3 py-2 rounded-lg"
      style={{
        background: "rgba(232,89,58,0.07)",
        border: "1px solid rgba(232,89,58,0.14)",
      }}
    >
      <span className="relative flex-shrink-0 flex h-[7px] w-[7px]">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full"
          style={{ backgroundColor: "#E8593A", opacity: 0.5 }}
        />
        <span
          className="relative inline-flex rounded-full h-[7px] w-[7px]"
          style={{ backgroundColor: "#E8593A" }}
        />
      </span>
      <p className="text-[11px] leading-none">
        <span style={{ color: "#9a3412" }}>Current pricing ends next month.</span>{" "}
        <span className="font-semibold" style={{ color: "#7c2d12" }}>Lock in today's price.</span>
      </p>
    </div>
  )
}