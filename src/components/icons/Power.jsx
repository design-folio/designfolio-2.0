import * as React from "react";

function Power(props) {
  return (
    <svg width={16} height={27} viewBox="0 0 16 27" fill="none" {...props}>
      <path
        d="M8.012 26.422L7.428 12.71.363 14.192 3.276 2.006 10.802.53 8.864 7.609l6.76-1.418-7.612 20.231z"
        fill="url(#prefix__paint0_linear_26_189)"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_26_189"
          x1={0.49}
          y1={2.59}
          x2={28.131}
          y2={47.02}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary-btn-text-color)" />
          <stop offset={1} stopColor="var(--primary-btn-text-color)" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MemoPower = React.memo(Power);
export default MemoPower;
