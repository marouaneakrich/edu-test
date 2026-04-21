import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { Doodle } from "./motion/Doodle";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 pt-20"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow, title, subtitle, accent = "magenta",
}: { eyebrow: string; title: React.ReactNode; subtitle?: string; accent?: "magenta" | "purple" | "teal" | "gold" }) {
  const bg: Record<string, string> = {
    magenta: "from-magenta-bg via-rose to-lavender",
    purple: "from-lavender via-purple-bg to-magenta-bg",
    teal: "from-mint via-teal-bg to-cream",
    gold: "from-cream via-gold-bg to-warm",
  };
  const accentColor: Record<string, string> = {
    magenta: "oklch(0.52 0.21 357)",
    purple: "oklch(0.45 0.21 312)",
    teal: "oklch(0.58 0.10 187)",
    gold: "oklch(0.79 0.16 78)",
  };
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${bg[accent]} py-24 md:py-32`}>
      <div className="blob bg-magenta/20 -top-20 -right-10 w-96 h-96 animate-float-slow" />
      <div className="blob bg-purple/15 -bottom-20 -left-10 w-[28rem] h-[28rem] animate-float-slow" style={{ animationDelay: "3s" }} />
      <Doodle kind="star" color={accentColor[accent]} className="absolute top-20 left-[10%] w-10 h-10 opacity-50 animate-float-soft" />
      <Doodle kind="heart" color={accentColor[accent]} className="absolute top-40 right-[12%] w-8 h-8 opacity-40 animate-float-soft" delay={0.3} />
      <Doodle kind="spark" color={accentColor[accent]} className="absolute bottom-20 left-[20%] w-12 h-12 opacity-40" spin />
      <Doodle kind="squiggle" color={accentColor[accent]} className="absolute bottom-32 right-[18%] w-24 h-6 opacity-40" delay={0.6} />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-10 text-center">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-num justify-center mx-auto mb-6">
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.02] text-ink"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-8 font-handwritten text-2xl md:text-3xl text-ink-light max-w-2xl mx-auto leading-snug"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
