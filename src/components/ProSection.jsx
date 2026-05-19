import React, { useEffect, useState } from "react";
import { _getPaymentDetails, _getDodoPortalUrl } from "@/network/get-request";
import { useGlobalContext } from "@/context/globalContext";

const PLAN_LABEL = {
  qtrly:    "Quarterly",
  yrly:     "Yearly",
  "1m":     "1 Month",
  "3m":     "3 Months",
  lifetime: "Lifetime",
  free:     "Free",
};

const STATUS_CONFIG = {
  active:    { dot: "#22C55E", label: "Active",        textClass: "text-[#15803d] dark:text-[#4ade80]" },
  paid:      { dot: "#22C55E", label: "Active",        textClass: "text-[#15803d] dark:text-[#4ade80]" },
  on_hold:   { dot: "#F59E0B", label: "Payment issue", textClass: "text-[#b45309] dark:text-[#fcd34d]" },
  cancelled: { dot: "#EF4444", label: "Cancelled",     textClass: "text-[#b91c1c] dark:text-[#fca5a5]" },
  expired:   { dot: "#9CA3AF", label: "Expired",       textClass: "text-[#6b7280] dark:text-[#9ca3af]" },
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-[#E5D7C4] dark:bg-white/10" />
        <div className="h-7 w-24 rounded-full bg-[#E5D7C4] dark:bg-white/10" />
      </div>
      <div className="h-3 w-32 rounded bg-[#E5D7C4] dark:bg-white/10" />
    </div>
  );
}

export default function ProSection() {
  const { setShowUpgradeModal } = useGlobalContext();
  const [order, setOrder]             = useState(undefined);
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

  const loading    = order === undefined;
  const isPro      = order && ["active", "on_hold", "paid"].includes(order.status)
                     || (order?.status === "cancelled" && order?.cancellationScheduled);
  const isDodo     = order?.aggregator === 2;
  const status     = order?.status ?? "free";
  const statusCfg  = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const planType   = (isPro && order?.planType) ? order.planType : "free";

  return (
    <div>
      <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] mb-5">
        Plan &amp; Billing
      </p>

      {loading ? (
        <Skeleton />
      ) : (
        <div className="transition-opacity duration-300">
          {/* ── Subscription row ──────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                  {PLAN_LABEL[planType] ?? planType}
                </span>

                {isPro && (
                  <span className={`flex items-center gap-1.5 text-[12px] font-medium ${statusCfg.textClass}`}>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: statusCfg.dot }}
                    />
                    {statusCfg.label}
                  </span>
                )}
              </div>

              {order?.proExpiresAt && (
                <p className="text-[12px] text-[#7A736C] dark:text-[#B5AFA5]">
                  {order.cancellationScheduled
                    ? `Ends ${formatDate(order.proExpiresAt)}`
                    : status === "active"
                    ? `Renews ${formatDate(order.proExpiresAt)}`
                    : `Expired ${formatDate(order.proExpiresAt)}`}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {isDodo && isPro && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] underline underline-offset-2 decoration-[#7A736C]/40 hover:decoration-[#1A1A1A] dark:hover:decoration-[#F0EDE7] transition-all disabled:opacity-40"
                >
                  {portalLoading ? "Opening…" : "Manage subscription"}
                </button>
              )}
              {!isPro && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-[12px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] px-3 py-1.5 rounded-full border border-[#E5D7C4] dark:border-white/10 hover:bg-[#F0EDE7] dark:hover:bg-white/5 transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {/* ── Warnings ──────────────────────────────────────────────── */}
          {status === "on_hold" && (
            <div className="mt-4 px-3 py-2.5 rounded-xl bg-[#fffbeb] dark:bg-[#F59E0B]/10 border border-[#fde68a] dark:border-[#F59E0B]/20">
              <p className="text-[12px] text-[#92400e] dark:text-[#fcd34d] leading-relaxed">
                Your last payment failed. Update your payment method to keep access.
              </p>
            </div>
          )}
          {order?.cancellationScheduled && (
            <div className="mt-4 px-3 py-2.5 rounded-xl bg-[#fff7ed] dark:bg-[#f59e0b]/10 border border-[#fed7aa] dark:border-[#f59e0b]/20">
              <p className="text-[12px] text-[#9a3412] dark:text-[#fed7aa] leading-relaxed">
                Plan cancelled. You have access until {formatDate(order.proExpiresAt)}.
              </p>
            </div>
          )}

          {/* ── Support footer ─────────────────────────────────────────── */}
          <div className="pt-4 mt-4 border-t border-[#E5D7C4] dark:border-white/10">
            <p className="text-[12px] text-[#7A736C] dark:text-[#B5AFA5]">
              Questions? <a href="mailto:shai@designfolio.me" className="underline underline-offset-2">shai@designfolio.me</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
