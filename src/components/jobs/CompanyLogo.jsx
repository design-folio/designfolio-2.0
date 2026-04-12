import { useState } from "react";

// Deterministic fallback colour from company name (client-side only)
const LOGO_COLORS = [
  '#5E6AD2', '#171717', '#F24E1E', '#625DF5', '#6772E5',
  '#0A66C2', '#FF553E', '#1DB954', '#FF9500', '#007AFF',
  '#34C759', '#FF2D55', '#5856D6', '#FF6B35', '#8B5CF6',
];
function fallbackColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

/**
 * Shows the employer logo image when `logoUrl` is provided and loads successfully.
 * Falls back to a coloured square with the company initial (computed client-side).
 *
 * Props:
 *   logoUrl   {string|null}  — employer_logo URL from JSearch
 *   company   {string}       — company name (used for fallback colour + letter)
 *   size      {number}       — px size of the square (default 42)
 *   className {string}       — extra classes on the wrapper
 */
export function CompanyLogo({ logoUrl, company = '', size = 42, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  const letter = (company || '?').charAt(0).toUpperCase();
  const color  = fallbackColor(company);

  const base = `rounded-lg flex-shrink-0 overflow-hidden ${className}`;
  const style = { width: size, height: size, minWidth: size };

  if (logoUrl && !imgFailed) {
    return (
      <div className={`${base} bg-white border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center p-1`} style={style}>
        <img
          src={logoUrl}
          alt={company}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} flex items-center justify-center text-white font-bold`}
      style={{ ...style, backgroundColor: color, fontSize: Math.round(size * 0.36) }}
    >
      {letter}
    </div>
  );
}
