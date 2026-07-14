import { useEffect, useRef, useState } from "react";

/**
 * Count-up animated number.
 * Extracted from DashboardPage for reuse across all screens.
 *
 * Round 2: on every value CHANGE after the initial mount (e.g. XP gain),
 * briefly pulses (scale + accent glow) via the `.xk-num-pulse` class so
 * stat updates read as "alive", not just a static count-up on load.
 */
export default function AnimatedNumber({ value, duration = 1100 }) {
  const [display, setDisplay] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const ref = useRef({ raf: 0, from: 0, mounted: false });

  useEffect(() => {
    const from = ref.current.from;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * e;
      setDisplay(v);
      if (p < 1) ref.current.raf = requestAnimationFrame(tick);
      else ref.current.from = value;
    };
    cancelAnimationFrame(ref.current.raf);
    ref.current.raf = requestAnimationFrame(tick);

    if (ref.current.mounted && value !== from) {
      setPulsing(true);
      const pt = setTimeout(() => setPulsing(false), 480);
      return () => clearTimeout(pt);
    }
    ref.current.mounted = true;

    const fb = setTimeout(() => {
      setDisplay(value);
      ref.current.from = value;
    }, duration + 400);
    return () => {
      cancelAnimationFrame(ref.current.raf);
      clearTimeout(fb);
    };
  }, [value, duration]);

  return (
    <span className={pulsing ? "xk-num-pulse" : ""}>
      {Math.round(display).toLocaleString("az")}
    </span>
  );
}
