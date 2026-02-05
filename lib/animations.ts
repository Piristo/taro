import { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const softScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export const drawer: Variants = {
  hidden: { y: 120, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] },
  },
  exit: { y: 120, opacity: 0, transition: { duration: 0.35 } },
};

export const glowPulse: Variants = {
  hidden: { boxShadow: "0 0 0 rgba(0,0,0,0)" },
  show: {
    boxShadow: "0 0 30px rgba(218, 165, 32, 0.2)",
    transition: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
  },
};
