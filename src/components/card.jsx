import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-card-shadow px-[24px] py-[32px] w-[95%] lg:w-[577px] m-auto ${className}`}
    >
      {children}
    </div>
  );
}
