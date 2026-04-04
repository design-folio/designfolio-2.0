

import * as React from "react";

function DFLogoV2(props) {
    return (
        <svg width={37} height={37} viewBox="0 0 37 37" fill="none" {...props}>
            <g filter="url(#filter0_i_445_295)">
                <rect width="37" height="37" rx="18.5" fill="url(#paint0_linear_445_295)" />
                <path d="M20.0417 4.625H16.9583V14.7781L9.77902 7.59877L7.59877 9.77902L14.7781 16.9583H4.625V20.0417H14.7781L7.59877 27.221L9.77902 29.4012L16.9583 22.2219V32.375H20.0417V22.2219L27.221 29.4012L29.4012 27.221L22.2219 20.0417H32.375V16.9583H22.2219L29.4012 9.77902L27.221 7.59877L20.0417 14.7781V4.625Z" fill="white" />
            </g>
            <defs>
                <filter id="filter0_i_445_295" x="0" y="0" width="37" height="37" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.333333 0 0 0 0 0.243137 0 0 0 1 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_445_295" />
                </filter>
                <linearGradient id="paint0_linear_445_295" x1="18.5" y1="0" x2="18.5" y2="37" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFDCD7" />
                    <stop offset="0.788462" stop-color="#FF553E" />
                </linearGradient>
            </defs>
        </svg>

    );
}

const MemoDFLogoV2 = React.memo(DFLogoV2);
export default MemoDFLogoV2;
<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">

</svg>