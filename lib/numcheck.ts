// Auto-checking typed answers to numerical questions.
import type { NumAnswer } from './casebook';

// "₹ 2,40,647.55", "(−) 23.55", "-11.66%", "2.05 lakh", "1.2 cr" → number, or null if unreadable.
export function parseNum(input: string): number | null {
  let s = input.trim().toLowerCase().replace(/[₹,\s]/g, '').replace(/[−–—]/g, '-').replace(/rs\.?/g, '');
  let neg = false;
  if (/^\(-?\)/.test(s)) { neg = true; s = s.replace(/^\(-?\)/, ''); }
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  let mult = 1;
  if (/(lakhs?|lacs?|l)$/.test(s)) { mult = 1e5; s = s.replace(/(lakhs?|lacs?|l)$/, ''); }
  else if (/(crores?|cr)$/.test(s)) { mult = 1e7; s = s.replace(/(crores?|cr)$/, ''); }
  s = s.replace(/(%|units?|days?|years?|yrs?|contracts?)$/, '');
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  const v = parseFloat(s) * mult;
  return neg ? -Math.abs(v) : v;
}

// Default tolerance: 0.25% of the answer, at least 0.006 (so 12.64 accepts 12.63–12.65); tiny values 5%.
export function tolerance(n: NumAnswer): number {
  if (n[3] !== undefined) return n[3];
  const a = Math.abs(n[1]);
  return a >= 0.1 ? Math.max(a * 0.0025, 0.006) : a * 0.05;
}

export function checkNum(input: string, n: NumAnswer): boolean | null {
  const v = parseNum(input);
  if (v === null) return null;
  return Math.abs(v - n[1]) <= tolerance(n) + 1e-12;
}

export function fmtNum(n: NumAnswer): string {
  const [, v, unit] = n;
  const abs = Math.abs(v);
  const s = abs >= 1000
    ? abs.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    : String(+abs.toFixed(6));
  const sign = v < 0 ? '−' : '';
  if (unit === '₹') return `${sign}₹${s}`;
  if (unit === '%') return `${sign}${s}%`;
  return `${sign}${s}${unit ? ' ' + unit : ''}`;
}
