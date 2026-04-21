import { motion } from "framer-motion";

type DoodleKind = "star" | "heart" | "squiggle" | "sun" | "arrow" | "scribble" | "spark" | "circle";

interface Props {
  kind: DoodleKind;
  className?: string;
  color?: string;
  spin?: boolean;
  delay?: number;
}

const drawProps = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 1.2, delay, ease: "easeInOut" as const },
});

export function Doodle({ kind, className, color = "currentColor", spin, delay = 0 }: Props) {
  const stroke = { stroke: color, strokeWidth: 3, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const wrap = spin ? { animate: { rotate: 360 }, transition: { duration: 18, repeat: Infinity, ease: "linear" as const } } : {};

  switch (kind) {
    case "star":
      return (
        <motion.svg viewBox="0 0 40 40" className={className} {...wrap}>
          <motion.path {...drawProps(delay)} d="M20 4 L24 16 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 16 Z" {...stroke} />
        </motion.svg>
      );
    case "heart":
      return (
        <motion.svg viewBox="0 0 40 40" className={className}>
          <motion.path {...drawProps(delay)} d="M20 34 C 8 24, 4 16, 10 10 C 16 4, 20 12, 20 12 C 20 12, 24 4, 30 10 C 36 16, 32 24, 20 34 Z" {...stroke} />
        </motion.svg>
      );
    case "squiggle":
      return (
        <motion.svg viewBox="0 0 120 20" className={className}>
          <motion.path {...drawProps(delay)} d="M2 10 Q 15 2, 30 10 T 60 10 T 90 10 T 118 10" {...stroke} />
        </motion.svg>
      );
    case "sun":
      return (
        <motion.svg viewBox="0 0 50 50" className={className} {...wrap}>
          <motion.circle {...drawProps(delay)} cx="25" cy="25" r="8" {...stroke} />
          {[0,45,90,135,180,225,270,315].map((a) => (
            <motion.line key={a} {...drawProps(delay + 0.1)}
              x1={25 + Math.cos(a*Math.PI/180)*14} y1={25 + Math.sin(a*Math.PI/180)*14}
              x2={25 + Math.cos(a*Math.PI/180)*22} y2={25 + Math.sin(a*Math.PI/180)*22}
              {...stroke} />
          ))}
        </motion.svg>
      );
    case "arrow":
      return (
        <motion.svg viewBox="0 0 100 60" className={className}>
          <motion.path {...drawProps(delay)} d="M5 30 Q 30 5, 60 30 T 92 30 M 80 18 L 92 30 L 80 42" {...stroke} />
        </motion.svg>
      );
    case "scribble":
      return (
        <motion.svg viewBox="0 0 60 30" className={className}>
          <motion.path {...drawProps(delay)} d="M5 15 Q 12 2, 18 15 T 30 15 T 42 15 T 55 15" {...stroke} />
        </motion.svg>
      );
    case "spark":
      return (
        <motion.svg viewBox="0 0 40 40" className={className} {...wrap}>
          <motion.path {...drawProps(delay)} d="M20 2 L22 18 L38 20 L22 22 L20 38 L18 22 L2 20 L18 18 Z" {...stroke} fill={color} />
        </motion.svg>
      );
    case "circle":
      return (
        <motion.svg viewBox="0 0 60 60" className={className}>
          <motion.path {...drawProps(delay)} d="M30 6 C 50 6, 54 30, 30 54 C 6 54, 6 30, 30 6" {...stroke} />
        </motion.svg>
      );
  }
}
