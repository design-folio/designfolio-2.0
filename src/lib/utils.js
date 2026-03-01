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

