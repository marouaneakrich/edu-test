import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: "button" | "a" | "div";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function MagneticButton({ 
  children, 
  className, 
  strength = 0.35, 
  as = "button", 
  href, 
  onClick, 
  type = "button", 
  disabled = false 
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const Tag = as;
  return (
    <motion.div
      ref={ref}
      onMouseMove={disabled ? undefined : onMove}
      onMouseLeave={disabled ? undefined : onLeave}
      style={{ x: sx, y: sy, display: "inline-block" }}
    >
      <Tag 
        href={href} 
        onClick={onClick} 
        type={as === "button" ? type : undefined} 
        className={className}
        disabled={as === "button" ? disabled : undefined}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
