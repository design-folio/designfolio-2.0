import React, { useEffect, useState } from "react";
import { _getPaymentDetails, _getDodoPortalUrl } from "@/network/get-request";
import { useGlobalContext } from "@/context/globalContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PLAN_LABEL = {
  mthly: "Monthly",
  qtrly: "Quarterly",
  yrly: "Yearly",
  "1m": "1 Month",
  "3m": "3 Months",
  lifetime: "Lifetime",
  free: "Free",
};

const STATUS_CONFIG = {
  active: { dot: "#22C55E", label: "Active", textClass: "text-[#15803d] dark:text-[#4ade80]" },
  paid: { dot: "#22C55E", label: "Active", textClass: "text-[#15803d] dark:text-[#4ade80]" },
  on_hold: {
    dot: "#F59E0B",
    label: "Payment issue",
    textClass: "text-[#b45309] dark:text-[#fcd34d]",
  },
  cancelled: {
    dot: "#EF4444",
    label: "Cancelled",
    textClass: "text-[#b91c1c] dark:text-[#fca5a5]",
  },
  expired: { dot: "#9CA3AF", label: "Expired", textClass: "text-[#6b7280] dark:text-[#9ca3af]" },
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DataRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/[0.05] px-2 py-3 last:border-0 dark:border-white/[0.05]">
      <span className="shrink-0 text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">{label}</span>
      <span className="text-right text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
        {children}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-[#E5D7C4] dark:bg-white/10" />
        <div className="h-7 w-24 rounded bg-[#E5D7C4] dark:bg-white/10" />
      </div>
      <div className="h-3 w-32 rounded bg-[#E5D7C4] dark:bg-white/10" />
    </div>
  );
}

export default function ProSection() {
  const { setShowUpgradeModal } = useGlobalContext();
  const [order, setOrder] = useState(undefined);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    _getPaymentDetails()
      .then((r) => setOrder(r?.data?.order ?? null))
      .catch(() => setOrder(null));
  }, []);

  const openPortal = async () => {
    if (portalLoading) return;
    setPortalLoading(true);
    try {
      const res = await _getDodoPortalUrl();
      window.location.href = res.data.portalUrl;
    } catch {
      setPortalLoading(false);
    }
  };

  const loading = order === undefined;
  const isPro =
    (order && ["active", "on_hold", "paid"].includes(order.status)) ||
    (order?.status === "cancelled" && order?.cancellationScheduled);
  const isDodo = order?.aggregator === 2;
  const status = order?.status ?? "free";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const planType = isPro && order?.planType ? order.planType : "free";
  const cancelScheduled = isPro && !!order?.cancellationScheduled;

  // For active Dodo subscriptions: proExpiresAt is null (active indefinitely), periodEnd = renewal date
  // For cancelled: proExpiresAt = when access ends; for expired: proExpiresAt = when it expired
  const renewalDate = cancelScheduled
    ? order?.proExpiresAt || order?.periodEnd
    : status === "active" || status === "paid"
      ? order?.periodEnd || order?.proExpiresAt
      : order?.proExpiresAt;

  return (
    <div>
      <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
        Plan &amp; Billing
      </p>
      <Separator className="mt-3 mb-6" />

      {loading ? (
        <Skeleton />
      ) : (
        <div className="transition-opacity duration-300">
          {isPro ? (
            /* ── Active / Pro state ── */
            <>
              <div className="mb-5 overflow-hidden rounded-xl border border-black/[0.07] dark:border-white/[0.07]">
                <DataRow label="Plan">{PLAN_LABEL[planType] ?? planType}</DataRow>

                <DataRow label="Status">
                  <span
                    className={`flex items-center justify-end gap-1.5 ${cancelScheduled ? "text-[#b45309] dark:text-[#fcd34d]" : statusCfg.textClass}`}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: cancelScheduled ? "#F59E0B" : statusCfg.dot }}
                    />
                    {cancelScheduled ? "Cancels soon" : statusCfg.label}
                  </span>
                </DataRow>

                {renewalDate && (
                  <DataRow
                    label={
                      cancelScheduled
                        ? "Ends on"
                        : status === "active" || status === "paid"
                          ? "Renews on"
                          : "Expired on"
                    }
                  >
                    {formatDate(renewalDate)}
                  </DataRow>
                )}
              </div>

              {isDodo && (
                <Button variant="outline" size="sm" disabled={portalLoading} onClick={openPortal}>
                  {portalLoading ? "Opening…" : "Manage subscription"}
                </Button>
              )}

              {/* ── Warnings ── */}
              {status === "on_hold" && (
                <div className="mt-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2.5 dark:border-[#F59E0B]/20 dark:bg-[#F59E0B]/10">
                  <p className="text-[12px] leading-relaxed text-[#92400e] dark:text-[#fcd34d]">
                    Your last payment failed. Update your payment method to keep access.
                  </p>
                </div>
              )}
              {cancelScheduled && (
                <div className="mt-4 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-3 py-2.5 dark:border-[#f59e0b]/20 dark:bg-[#f59e0b]/10">
                  <p className="text-[12px] leading-relaxed text-[#9a3412] dark:text-[#fed7aa]">
                    Your Pro plan is set to cancel. You&apos;ll keep full access until{" "}
                    <span className="font-semibold">{formatDate(renewalDate)}</span>, then move to
                    Free.
                    {isDodo && " Changed your mind? Resume anytime from Manage subscription."}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* ── Free state ── */
            <div className="mb-5 overflow-hidden rounded-xl border border-black/[0.07] dark:border-white/[0.07]">
              <DataRow label="Plan">Free</DataRow>
              <DataRow label="Status">
                <Button variant="outline" size="sm" onClick={() => setShowUpgradeModal(true)}>
                  Upgrade to Pro
                </Button>
              </DataRow>
            </div>
          )}

          {/* ── Support footer ── */}
          <Separator className="mt-5 mb-4" />
          <p className="text-[12px] text-[#7A736C] dark:text-[#B5AFA5]">
            Questions?{" "}
            <a href="mailto:shai@designfolio.me" className="underline underline-offset-2">
              shai@designfolio.me
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
