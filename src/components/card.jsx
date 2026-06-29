import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`shadow-df-section-card-shadow m-auto w-[95%] rounded-2xl bg-white px-[24px] py-[32px] lg:w-[577px] ${className}`}
    >
      {children}
    </div>
  );
}
