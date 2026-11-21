"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";

/** Counts up to `value` on first show and eases between values afterwards. */
export function CountUp({
  value,
  suffix = "",
  duration = 0.9,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const from = useRef(reduced ? value : 0);
  useEffect(() => {
    if (reduced) {
      from.current = value;
      setShown(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        from.current = latest;
        setShown(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, duration, reduced]);
  return (
    <>
      {shown.toLocaleString()}
      {suffix}
    </>
  );
}

/** A progress bar whose fill grows to its value. */
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className="bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
