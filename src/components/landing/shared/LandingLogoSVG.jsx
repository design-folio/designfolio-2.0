export default function LandingLogoSVG({ size = 24, id = "logo" }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden flex-shrink-0 shadow-sm"
    >
      <svg
        width="125"
        height="125"
        viewBox="0 0 125 125"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g filter={`url(#${id}-filter)`}>
          <rect
            width="124.5"
            height="124.5"
            rx="62.25"
            fill={`url(#${id}-gradient)`}
          />
          <path
            d="M67.437 15.5625H57.062V49.7263L32.9046 25.5688L25.5683 32.9051L49.7258 57.0625H15.562V67.4375H49.7258L25.5684 91.5949L32.9046 98.9311L57.062 74.7737V108.937H67.437V74.7737L91.5944 98.9312L98.9307 91.5949L74.7732 67.4375H108.937V57.0625H74.7732L98.9307 32.9051L91.5944 25.5688L67.437 49.7263V15.5625Z"
            fill="white"
          />
        </g>
        <defs>
          <filter
            id={`${id}-filter`}
            x="0"
            y="0"
            width="124.5"
            height="124.5"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="6.72973" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 0.333333 0 0 0 0 0.243137 0 0 0 1 0"
            />
            <feBlend mode="normal" in2="shape" result={`${id}-shadow`} />
          </filter>
          <linearGradient
            id={`${id}-gradient`}
            x1="62.25"
            y1="0"
            x2="62.25"
            y2="124.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFDCD7" />
            <stop offset="0.788462" stopColor="#FF553E" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
