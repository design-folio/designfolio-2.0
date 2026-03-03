import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDuration = (exp) => {
  const startMonth = exp.startMonth ? MONTHS[Number(exp.startMonth) - 1] : '';
  const startYear = exp.startYear || '';
  const start = [startMonth, startYear].filter(Boolean).join(' ');

  if (exp.currentlyWorking) {
    const startDate = new Date(Number(exp.startYear), Number(exp.startMonth) - 1);
    const now = new Date();
    const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    const parts = [];
    if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? 's' : ''}`);
    if (mos > 0) parts.push(`${mos} mo${mos > 1 ? 's' : ''}`);
    return `${start} – Present${parts.length ? ` · ${parts.join(' ')}` : ''}`;
  }

  const endMonth = exp.endMonth ? MONTHS[Number(exp.endMonth) - 1] : '';
  const endYear = exp.endYear || '';
  const end = [endMonth, endYear].filter(Boolean).join(' ');

  if (exp.startYear && exp.startMonth && exp.endYear && exp.endMonth) {
    const startDate = new Date(Number(exp.startYear), Number(exp.startMonth) - 1);
    const endDate = new Date(Number(exp.endYear), Number(exp.endMonth) - 1);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    const parts = [];
    if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? 's' : ''}`);
    if (mos > 0) parts.push(`${mos} mo${mos > 1 ? 's' : ''}`);
    return `${start} – ${end}${parts.length ? ` · ${parts.join(' ')}` : ''}`;
  }

  return [start, end].filter(Boolean).join(' – ') || 'N/A';
};

/**
 * Returns the portfolio base URL (with protocol). Prefers verified custom domain when provided.
 * @param {{ username?: string, baseDomain?: string, customDomain?: string, isCustomVerified?: boolean }} opts
 * @returns {string} e.g. "https://username.designfolio.me" or "https://myportfolio.com"
 */
export function getPortfolioBaseUrl({ username, baseDomain, customDomain, isCustomVerified }) {
  if (customDomain && isCustomVerified) {
    return `https://${customDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  }
  if (username && baseDomain) {
    return `https://${username}.${baseDomain}`;
  }
  return '';
}

/**
 * Returns the project page URL (base + /project/id). Uses custom domain when verified.
 */
export function getProjectUrl({ username, baseDomain, customDomain, isCustomVerified, projectId }) {
  const base = getPortfolioBaseUrl({ username, baseDomain, customDomain, isCustomVerified });
  return base && projectId ? `${base}/project/${projectId}` : '';
}

/** MacOS dock window dimensions (used for clampWindowPosition) */
export const MACOS_WINDOW_WIDTH = 896;
export const MACOS_WINDOW_HEIGHT_VH = 0.7;

/** Minimum top offset on mobile so the window stays below status bar + header (desktop unchanged) */
export const MOBILE_HEADER_SAFE_TOP_PX = 92;

/** Clamp window center position so the window stays within viewport, below the header/menu bar, and left of the sidebar */
export function clampWindowPosition(x, y, sidebarOffsetPx = 0, topOffsetPx = 0) {
  if (typeof window === 'undefined') return { x, y };
  const halfW = MACOS_WINDOW_WIDTH / 2;
  const halfH = (window.innerHeight * MACOS_WINDOW_HEIGHT_VH) / 2;
  const minX = halfW;
  const maxX = Math.max(minX, window.innerWidth - sidebarOffsetPx - halfW);
  const isMobile = window.innerWidth < 768;
  const effectiveTopPx = isMobile ? Math.max(topOffsetPx, MOBILE_HEADER_SAFE_TOP_PX) : topOffsetPx;
  const minY = effectiveTopPx + halfH;
  const maxY = Math.max(minY, window.innerHeight - halfH);
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  };
}
