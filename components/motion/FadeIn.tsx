"use client";

import { motion, useInView, type Variants } from "framer-motion";
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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  if (isMobile && (direction === "left" || direction === "right")) {
    return { y: Math.min(distance, 20) };
  }
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
};

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 36,
  duration = 0.65,
  once = true,
  className,
  as = "div",
}: FadeInProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "0px" });
  const MotionTag = motion[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, ...offset(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </MotionTag>
  );
}
