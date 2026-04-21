import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
}

export function Marquee({ children, reverse, className }: Props) {
  return (
    <div className={`flex overflow-hidden ${className ?? ""}`}>
      <div className={`flex shrink-0 whitespace-nowrap items-center ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {children}
        {children}
      </div>
    </div>
  );
}
