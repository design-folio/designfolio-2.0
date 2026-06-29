import { _getPaymentDetails, _getDodoPortalUrl } from "@/network/get-request";
import React, { useEffect, useState } from "react";

const STATUS_LABEL = {
  active: "Active",
  on_hold: "Payment issue",
  cancelled: "Cancelled",
  expired: "Expired",
  paid: "Active",
};

const STATUS_COLOR = {
  active: { dot: "bg-[#22C55E]", text: "text-[#065F46] dark:text-[#4ADE80]" },
  paid: { dot: "bg-[#22C55E]", text: "text-[#065F46] dark:text-[#4ADE80]" },
  on_hold: { dot: "bg-[#F59E0B]", text: "text-[#92400E] dark:text-[#FCD34D]" },
  cancelled: { dot: "bg-[#EF4444]", text: "text-[#991B1B] dark:text-[#FCA5A5]" },
  expired: { dot: "bg-[#9CA3AF]", text: "text-[#6B7280] dark:text-[#9CA3AF]" },
};

const PLAN_LABEL = {
  qtrly: "Quarterly",
  yrly: "Yearly",
  "1m": "1 Month",
  "3m": "3 Months",
  lifetime: "Lifetime",
  topup: "Credits Top-up",
};

export default function Transaction() {
  const [transaction, setTransaction] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    _getPaymentDetails().then((res) => {
      setTransaction(res?.data?.order);
    });
  }, []);

  function formatAmount(amount, currencyCode) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(isoDate) {
    if (!isoDate) return "—";
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  const openPortal = async () => {
    if (portalLoading) return;
    setPortalLoading(true);
    try {
      const res = await _getDodoPortalUrl();
      window.location.href = res.data.portalUrl;
    } catch (err) {
      console.error("[Transaction] Portal failed:", err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  if (!transaction) return null;

  const status = transaction?.status ?? "paid";
  const colors = STATUS_COLOR[status] ?? STATUS_COLOR.paid;
  const isDodo = transaction?.aggregator === 2;
  const planLabel = PLAN_LABEL[transaction?.planType] ?? transaction?.planType ?? "Pro";
  const orderId = isDodo ? transaction?.dodoSubscriptionId : transaction?.razorpayOrderID;

  return (
    <div>
      <p className="mb-4 text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
        Payment Details
      </p>

      <div className="mb-4 flex flex-col justify-between gap-2 lg:flex-row">
        <p className="text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
          Designfolio Pro • {planLabel}
        </p>
        <div className="text-right">
          <span className="block text-[22px] leading-none font-bold text-[#1A1A1A] dark:text-[#F0EDE7]">
            {formatAmount(transaction?.amount, transaction?.currency)}
          </span>
          <span className="mt-0.5 block text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
            {formatDate(transaction?.updatedAt)}
          </span>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        {orderId && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
              {isDodo ? "Subscription ID" : "Order ID"}
            </span>
            <span className="max-w-[60%] text-right text-[13px] font-medium break-all text-[#1A1A1A] dark:text-[#F0EDE7]">
              {orderId}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">Status</span>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
            <span className={`text-[13px] font-medium ${colors.text}`}>
              {STATUS_LABEL[status] ?? "Active"}
            </span>
          </div>
        </div>
        {transaction?.proExpiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
              {status === "active" ? "Renews" : "Expires"}
            </span>
            <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              {formatDate(transaction?.proExpiresAt)}
            </span>
          </div>
        )}
      </div>

      {transaction?.cancellationScheduled && (
        <p className="mb-4 text-[12px] text-[#B45309] dark:text-[#FCD34D]">
          Your plan is cancelled and will end on {formatDate(transaction?.proExpiresAt)}.
        </p>
      )}

      {status === "on_hold" && (
        <p className="mb-4 text-[12px] text-[#B45309] dark:text-[#FCD34D]">
          There was an issue with your last payment. Update your payment method to keep access.
        </p>
      )}

      <div className="flex flex-col gap-2 border-t border-[#E5D7C4] pt-4 dark:border-white/10">
        {isDodo && (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="text-left text-[13px] font-medium text-[#1A1A1A] underline underline-offset-2 disabled:opacity-50 dark:text-[#F0EDE7]"
          >
            {portalLoading ? "Opening portal…" : "Manage Subscription"}
          </button>
        )}
        <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
          Support: shai@designfolio.me
        </p>
      </div>
    </div>
  );
}
