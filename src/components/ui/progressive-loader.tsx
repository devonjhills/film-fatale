"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── ProgressiveLoader ─────────────────────────────────────────────────────

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ProgressiveLoader({
  children,
  delay = 0,
  className,
}: ProgressiveLoaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggeredList ─────────────────────────────────────────────────────────

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 50,
  className,
}: StaggeredListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay / 1000 } },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── InViewAnimation ───────────────────────────────────────────────────────

type AnimationType = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";

const animationMap: Record<
  AnimationType,
  { hidden: Record<string, number>; visible: Record<string, number> }
> = {
  fadeUp: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slideLeft: { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
};

interface InViewAnimationProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  startVisible?: boolean;
}

export function InViewAnimation({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 400,
  className,
  startVisible = false,
}: InViewAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const anim = animationMap[animation];

  return (
    <motion.div
      ref={ref}
      initial={startVisible ? "visible" : "hidden"}
      animate={startVisible || isInView ? "visible" : "hidden"}
      variants={{
        hidden: anim.hidden,
        visible: {
          ...anim.visible,
          transition: {
            duration: duration / 1000,
            delay: delay / 1000,
            ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export default ProgressiveLoader;
