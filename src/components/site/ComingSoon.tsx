import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Doodle } from "./motion/Doodle";
import logo from "@/assets/educazen.png";

export function ComingSoon() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden paper-grain px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-magenta-bg via-rose to-lavender" />
      <div className="blob bg-magenta/40 -top-32 -right-20 w-[36rem] h-[36rem]" />
      <div className="blob bg-purple/30 top-1/2 -left-32 w-[28rem] h-[28rem]" />
      <div className="blob bg-teal/25 bottom-10 right-1/3 w-72 h-72 animate-float-slow" />

      <Doodle
        kind="star"
        color="oklch(0.79 0.16 78)"
        className="absolute top-24 left-[10%] w-12 h-12 animate-float-soft sticker-shadow"
      />
      <Doodle
        kind="spark"
        color="oklch(0.52 0.21 357)"
        className="absolute top-1/3 right-[10%] w-10 h-10"
        spin
      />
      <Doodle
        kind="heart"
        color="oklch(0.45 0.21 312)"
        className="absolute bottom-28 left-[15%] w-9 h-9 animate-float-soft sticker-shadow"
        delay={0.5}
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.img
          src={logo}
          alt="EducazenKids"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-10 h-20 w-auto md:h-24"
        />

        <motion.div
          initial={{ opacity: 0, x: -20, rotate: -3 }}
          animate={{ opacity: 1, x: 0, rotate: -3 }}
          className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sticker mb-8"
        >
          <span className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
          <span className="font-label text-[10px] text-ink">Rentrée 2026 2027</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="font-display font-bold text-5xl md:text-7xl leading-[0.95] text-ink tracking-tight"
        >
          Bientôt{" "}
          <span className="font-handwritten font-bold text-magenta text-6xl md:text-8xl">
            en ligne
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 font-body font-medium text-lg md:text-xl text-ink-light max-w-xl mx-auto leading-relaxed"
        >
          Notre nouveau site arrive très bientôt. En attendant, contactez-nous pour toute
          information ou inscription.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="tel:0660686993"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-7 py-3.5 font-display font-bold text-white shadow-glow hover:scale-105 transition-transform"
          >
            <Phone className="h-4 w-4" /> (AR) 06 60 68 69 93
          </a>
          <a
            href="tel:0766682725"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white/70 backdrop-blur px-7 py-3.5 font-display font-bold text-ink hover:border-magenta hover:text-magenta transition-colors"
          >
            <Phone className="h-4 w-4" /> (FR) 07 66 68 27 25
          </a>
        </motion.div>
      </div>
    </section>
  );
}
