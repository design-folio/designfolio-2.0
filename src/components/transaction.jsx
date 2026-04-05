import { _getPaymentDetails } from "@/network/get-request";
import React, { useEffect, useState } from "react";

export default function Transaction() {
  const [transaction, setTransaction] = useState(null);

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
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  if (!transaction) return null;

  return (
    <div>
      <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] mb-4">
        Payment Details
      </p>

      <div className="flex flex-col lg:flex-row justify-between gap-2 mb-4">
        <p className="text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
          Designfolio Pro • Lifetime Access
        </p>
        <div className="text-right">
          <span className="block text-[22px] font-bold text-[#1A1A1A] dark:text-[#F0EDE7] leading-none">
            {formatAmount(transaction?.amount, transaction?.currency)}
          </span>
          <span className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5] mt-0.5 block">
            {formatDate(transaction?.updatedAt)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">Order ID</span>
          <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] break-all text-right max-w-[60%]">
            {transaction?.razorpayOrderID}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">Status</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-[13px] font-medium text-[#065F46] dark:text-[#4ADE80]">Completed</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5D7C4] dark:border-white/10">
        <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
          Support: shai@designfolio.me
        </p>
      </div>
    </div>
  );
}
