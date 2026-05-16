import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Sparkles } from 'lucide-react';
import { _getJobCredits, _createJobCreditOrder } from '@/network/jobs';

function Bubbles() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    if (!document.getElementById('bubble-rise-kf')) {
      const s = document.createElement('style');
      s.id = 'bubble-rise-kf';
      s.textContent = '@keyframes bubble-rise{0%{transform:translateY(0) scale(1);opacity:.4}100%{transform:translateY(-100px) scale(0);opacity:0}}';
      document.head.appendChild(s);
    }
    setBubbles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        width: Math.random() * 12 + 4,
        height: Math.random() * 12 + 4,
        left: Math.random() * 95,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 4,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 z-[5] overflow-hidden rounded-full pointer-events-none">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-10px] block rounded-full bg-black/[0.15] dark:bg-white/[0.2]"
          style={{
            width: `${b.width}px`,
            height: `${b.height}px`,
            left: `${b.left}%`,
            animation: `bubble-rise ${b.duration}s ${b.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Segment bar colour logic ──────────────────────────────────────────────────
const SEGMENT_COUNT = 10;

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function lerpColor(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function getGradientEnds(pct) {
  if (pct > 0.5) return ['#16a34a', '#86efac'];
  if (pct > 0.2) return ['#ea580c', '#fcd34d'];
  return ['#dc2626', '#f97316'];
}

function segmentColor(pct, index, total) {
  const [start, end] = getGradientEnds(pct);
  const t = total > 1 ? index / (total - 1) : 0;
  return lerpColor(start, end, t);
}

function getStatusLabel(pct) {
  if (pct > 0.5) return { text: 'Healthy', color: '#22c55e' };
  if (pct > 0.2) return { text: 'Running low', color: '#f59e0b' };
  return { text: 'Almost out', color: '#ef4444' };
}


// ── Main component ────────────────────────────────────────────────────────────
export function CreditsWidget({ refreshKey = 0, onBuyClick }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    _getJobCredits()
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const balance = data?.balance ?? null;
  const totalAllocated = data?.totalAllocated ?? 0;
  // Fall back: if totalAllocated is 0 (pre-existing users), use balance itself as total
  // so the bar still renders at 100% (healthy) rather than disappearing
  const displayTotal = totalAllocated > 0 ? totalAllocated : (balance ?? 0);
  const showTotal = totalAllocated > 0;  // only show the "/ X" denominator when we know the real total
  const pct = displayTotal > 0 && balance !== null ? Math.min(1, balance / displayTotal) : 0;
  const filledSegments = Math.round(pct * SEGMENT_COUNT);
  const status = getStatusLabel(pct);

  const loadRazorpayScript = useCallback(() => {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('razorpay-checkout-js');
      if (existing) { existing.addEventListener('load', resolve); return; }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }, []);

  const handleBuy = useCallback(async () => {
    if (buying) return;
    setBuying(true);
    try {
      await loadRazorpayScript();
      const { data: orderData } = await _createJobCreditOrder();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderData.order.id,
        name: 'Designfolio AI Credits',
        description: '50 AI Credits',
        handler: () => {
          setOpen(false);
          onBuyClick?.();
        },
        theme: { color: '#ea580c' },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      console.error('[CreditsWidget] Failed to create credit order:', err.message);
    } finally {
      setBuying(false);
    }
  }, [buying, onBuyClick, loadRazorpayScript]);

  return (
    <div ref={containerRef} className="relative">
      {/* Badge trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        className={`group relative inline-flex cursor-pointer select-none items-center gap-2 overflow-hidden rounded-full px-4 h-9 text-sm font-medium text-foreground transition-all ${open
            ? 'border-2 border-[#D4D0C4] dark:border-[#38312E] bg-accent dark:bg-[#2A2522]'
            : 'border border-[#D4D0C4] dark:border-[#38312E] bg-background dark:bg-[#1C1917] hover:bg-accent dark:hover:bg-[#2A2522]'
          }`}
      >
        <Bubbles />
        <div className="relative z-10 flex-shrink-0 cursor-pointer">
          <FlaskConical className="w-3.5 h-3.5 opacity-70" />
        </div>
        <div className="relative z-10 whitespace-nowrap cursor-pointer">
          <span className='cursor-pointer'>AI Credits:</span>
          <span className="ml-1.5 font-semibold">{balance ?? '…'}</span>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+8px)] w-[268px] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#2A2520] shadow-xl shadow-black/[0.08] p-4 z-50"
          >
            {/* Balance */}
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-[32px] font-bold leading-none text-foreground tabular-nums">
                {balance ?? '…'}
              </span>
              {showTotal ? (
                <span className="text-[13px] text-foreground/50 font-medium">
                  / {totalAllocated} credits left
                </span>
              ) : (
                <span className="text-[13px] text-foreground/50 font-medium">credits left</span>
              )}
            </div>

            {/* Staggered segmented bar */}
            {balance !== null && (
              <>
                <div className="flex gap-[3px] mb-1.5">
                  {Array.from({ length: SEGMENT_COUNT }, (_, i) => {
                    const filled = i < filledSegments;
                    return (
                      <div key={i} className="flex-1 h-[6px] rounded-full overflow-hidden bg-black/[0.07] dark:bg-white/[0.08]">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: filled ? '100%' : '0%' }}
                          transition={{
                            delay: filled ? i * 0.04 : 0,
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          style={{ backgroundColor: segmentColor(pct, i, filledSegments) }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Status label */}
                <p className="flex items-center gap-1.5 text-[11px] font-medium mb-2" style={{ color: status.color }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                  {status.text}
                </p>
              </>
            )}

            {/* Divider */}
            <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-3" />

            {/* Usage hint */}
            <p className="text-[12px] text-foreground/55 leading-relaxed mb-3">
              Credits power mock interviews and scout chats.
            </p>

            {/* CTA */}
            <button
              className="credits-cta w-full flex items-center justify-center h-9 rounded-full text-[13px] font-semibold text-amber-50"
              onClick={handleBuy}
              disabled={buying}
            >
              <span className="credits-cta-inner">
                <Sparkles className="w-3.5 h-3.5" />
                {buying ? 'Opening checkout…' : 'Get 50 more credits'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
