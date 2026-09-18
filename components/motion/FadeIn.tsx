"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "li" | "span";
};

const offset = (direction: string, distance: number) => {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
    case "right":
      return { y: Math.min(distance, 12) };
    default:
      return {};
  }
};

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 16,
  duration = 0.4,
  once = true,
  className = "",
  as = "div",
}: FadeInProps) {
  const ref = useRef(null);
  // Trigger 80px before entering viewport so scrolling is completely fluid and un-interrupted
  const inView = useInView(ref, { once, margin: "80px 0px 0px 0px" });
  const MotionTag = motion[as] as typeof motion.div;
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, ...offset(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <MotionTag
      ref={ref}
      className={`${className} transform-gpu`}
      variants={variants}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate={prefersReducedMotion || inView ? "visible" : "hidden"}
    >
      {children}
    </MotionTag>
  );
}
