import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Heart, Target, Brain, ArrowRight,
  Star, Quote, Phone, Calendar, X, Send, CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { MagneticButton } from "@/components/site/motion/MagneticButton";
import { CountUp } from "@/components/site/motion/CountUp";
import { Marquee } from "@/components/site/motion/Marquee";
import { Doodle } from "@/components/site/motion/Doodle";

import hero from "@/assets/hero-children.jpg";
import classroom from "@/assets/about-classroom.jpg";
import poster from "@/assets/inscriptions-poster.jpg";
import activityArt from "@/assets/activity-art.jpg";
import activityNature from "@/assets/activity-nature.jpg";
import activityMontessori from "@/assets/activity-montessori.jpg";
import activityMusic from "@/assets/activity-music.jpg";
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EducazenKids  L'enseignement sur mesure | Agadir" },
      { name: "description", content: "Centre éducatif et psychosocial à Agadir. Accompagnement personnalisé pour enfants typiques, atypiques, HPI, TDAH, DYS, TSA. Inscriptions ouvertes 2026-2027." },
      { property: "og:title", content: "EducazenKids  L'enseignement sur mesure" },
      { property: "og:description", content: "Maternelle & Primaire  Méthodes Montessori, Freinet, Steiner adaptées." },
    ],
  }),
  component: HomePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

function HomePage() {
  return (
    <PageShell>
      <Hero />
      <MarqueeStrip />
      <StatsBand />
      <Pillars />
      <AboutSticky />
      <ActivitiesExpand />
      <MethodsTilt />
      <Testimonials />
      <InscriptionsCTA />
      <BlogTeaser />
    </PageShell>
  );
}

/* ---------- 1. HERO ---------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 15 });
  const sy = useSpring(my, { stiffness: 50, damping: 15 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 60);
      my.set(((e.clientY - rect.top) / rect.height - 0.5) * 60);
    };
    const el = ref.current;
    el?.addEventListener("mousemove", onMove);
    return () => el?.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section ref={ref} className="relative min-h-[95vh] flex items-center overflow-hidden paper-grain">
      <div className="absolute inset-0 bg-gradient-to-br from-magenta-bg via-rose to-lavender" />
      <motion.div style={{ x: sx, y: sy }} className="blob bg-magenta/40 -top-32 -right-20 w-[36rem] h-[36rem]" />
      <motion.div style={{ x: useTransform(sx, v => -v * 0.6), y: useTransform(sy, v => -v * 0.6) }} className="blob bg-purple/30 top-1/2 -left-32 w-[28rem] h-[28rem]" />
      <div className="blob bg-teal/25 bottom-10 right-1/3 w-72 h-72 animate-float-slow" />

      {/* Floating doodles */}
      <Doodle kind="star" color="oklch(0.79 0.16 78)" className="absolute top-32 left-[8%] w-12 h-12 animate-float-soft sticker-shadow" />
      <Doodle kind="spark" color="oklch(0.52 0.21 357)" className="absolute top-1/3 right-[8%] w-10 h-10" spin />
      <Doodle kind="heart" color="oklch(0.45 0.21 312)" className="absolute bottom-32 left-[15%] w-9 h-9 animate-float-soft sticker-shadow" delay={0.5} />
      <Doodle kind="sun" color="oklch(0.58 0.10 187)" className="absolute top-1/2 left-[5%] w-14 h-14 opacity-60" spin />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 z-10">
          <motion.div initial={{ opacity: 0, x: -20, rotate: -3 }} animate={{ opacity: 1, x: 0, rotate: -3 }} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sticker mb-8">
            <span className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
            <span className="font-label text-[10px] text-ink">Inscriptions Ouvertes 2026  2027</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="font-display font-bold text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] text-ink tracking-tight"
          >
            Offrez à votre enfant un{" "}
            <span className="relative inline-block">
              <span className="text-gradient-brand">avenir</span>
              <motion.svg
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1.4, ease: "easeInOut" }}
                viewBox="0 0 240 16" className="absolute -bottom-3 left-0 w-full h-4"
              >
                <motion.path d="M3 10 Q 60 2, 120 8 T 237 10" stroke="oklch(0.52 0.21 357)" strokeWidth="4" fill="none" strokeLinecap="round" />
              </motion.svg>
            </span>{" "}
            <br className="hidden md:block"/>
            plein de <span className="font-handwritten font-bold text-purple text-7xl md:text-8xl lg:text-[6.5rem]">réussite</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-8 font-body font-medium text-lg md:text-xl text-ink-light max-w-xl leading-relaxed"
          >
            Un enseignement sur mesure pour enfants typiques, atypiques, avec difficultés ou troubles d'apprentissage.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <MagneticButton as="a" href="/contact" className="group inline-flex items-center gap-2 rounded-full bg-gradient-hero px-8 py-4 font-display font-bold text-white shadow-glow transition-all hover:shadow-soft">
              S'inscrire maintenant
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton as="a" href="/a-propos" className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white/70 backdrop-blur px-8 py-4 font-display font-bold text-ink hover:border-magenta hover:text-magenta transition-colors">
              Découvrir le centre
            </MagneticButton>
          </motion.div>

          {/* Profile sticker badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-12 flex flex-wrap gap-3"
          >
            {[
              { label: "HPI", color: "magenta", rot: -4 },
              { label: "TDAH", color: "purple", rot: 3 },
              { label: "DYS", color: "teal", rot: -2 },
              { label: "Typique", color: "magenta", rot: -3 },
            ].map((b, i) => (
              <motion.span
                key={b.label}
                initial={{ opacity: 0, y: 20, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: b.rot }}
                transition={{ delay: 0.8 + i * 0.08, type: "spring" }}
                whileHover={{ rotate: 0, scale: 1.1 }}
                className={`bg-${b.color} text-white px-4 py-2 rounded-full font-display font-bold text-sm shadow-sticker cursor-default`}
              >
                {b.label}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Polaroid hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative"
        >
          <div className="relative max-w-md mx-auto">
            <TiltCard max={8}>
              <div className="bg-white p-4 pb-16 shadow-glow rounded-sm relative">
                <div className="washi-tape" style={{ top: "-10px", left: "20px", transform: "rotate(-8deg)" }} />
                <div className="washi-tape" style={{ top: "-10px", right: "20px", transform: "rotate(8deg)" }} />
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={hero} alt="Enfants joyeux peignant avec leurs mains" className="absolute inset-0 w-full h-full object-cover" width={1536} height={1280} />
                </div>
                <p className="absolute bottom-4 left-0 right-0 text-center font-handwritten text-2xl text-ink">
                  ✦ nos petits artistes ✦
                </p>
              </div>
            </TiltCard>

            {/* Floating sticker badges */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: -8 }} transition={{ delay: 1.0 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="absolute -left-8 top-12 bg-white rounded-2xl shadow-sticker p-4 flex items-center gap-3 max-w-[220px]"
            >
              <div className="rounded-xl bg-magenta-bg p-2.5"><Heart className="h-5 w-5 text-magenta" /></div>
              <div>
                <p className="text-xs font-label text-magenta">Bienveillance</p>
                <p className="text-sm font-display font-bold text-ink">+70 familles</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 6 }} animate={{ opacity: 1, y: 0, rotate: 6 }} transition={{ delay: 1.2 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="absolute -right-6 bottom-24 bg-white rounded-2xl shadow-sticker p-4 max-w-[200px]"
            >
              <div className="flex gap-0.5 mb-1">
                {[0,1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
              </div>
              <p className="text-sm text-ink font-handwritten leading-tight">"Mon enfant a retrouvé le goût d'apprendre."</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- 2. MARQUEE STRIP ---------- */
function MarqueeStrip() {
  const colors = ["text-magenta", "text-purple", "text-teal", "text-gold"];
  const words1 = ["Montessori", "Freinet", "Steiner", "HPI", "TDAH", "DYS", "Art-thérapie"];
  const words2 = ["Bienveillance", "Inclusivité", "Personnalisé", "Maternelle", "Primaire", "D.I.E.C", "Créativité", "Autonomie"];
  return (
    <section className="bg-white py-10 border-y border-border overflow-hidden">
      <Marquee className="mb-3">
        {words1.map((w, i) => (
          <span key={`a-${i}`} className={`font-display font-bold text-4xl md:text-6xl mx-6 ${colors[i % 4]}`}>
            {w} <span className="text-ink/30">✦</span>
          </span>
        ))}
      </Marquee>
      <Marquee reverse>
        {words2.map((w, i) => (
          <span key={`b-${i}`} className={`font-handwritten font-semibold text-5xl md:text-7xl mx-6 ${colors[(i + 2) % 4]} opacity-80`}>
            {w} <span className="text-ink/20">★</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ---------- 3. STATS BAND ---------- */
function StatsBand() {
  const stats = [
    { n: 6, suf: " ans", label: "d'expérience", color: "magenta", isInfinity: false },
    { n: 70, suf: "+", label: "familles accompagnées", color: "purple", isInfinity: false },
    { n: 13, suf: "", label: "pédagogues experts", color: "teal", isInfinity: false },
    { n: 0, suf: "", label: "méthodes pédagogiques", color: "gold", isInfinity: true },
  ];
  return (
    <section className="relative py-16 md:py-20 bg-canvas overflow-hidden">
      <Doodle kind="squiggle" color="oklch(0.52 0.21 357 / 0.3)" className="absolute top-10 left-1/4 w-32 h-6" />
      <Doodle kind="star" color="oklch(0.79 0.16 78 / 0.4)" className="absolute bottom-10 right-1/4 w-10 h-10" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="text-center group">
            <div className={`font-display font-bold text-5xl sm:text-6xl md:text-8xl text-${s.color} leading-none transition-transform group-hover:-rotate-3`}>
              {s.isInfinity ? <span>∞</span> : <CountUp to={s.n} suffix={s.suf} />}
            </div>
            <p className="mt-3 font-handwritten text-xl md:text-2xl text-ink-light">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 4. PILLARS  sticker cards ---------- */
function Pillars() {
  const pillars = [
    { icon: Sparkles, color: "magenta", title: "Inclusivité", desc: "Chaque enfant accueilli avec sa singularité  la diversité est notre richesse.", rot: -3 },
    { icon: Heart, color: "purple", title: "Bienveillance", desc: "Un cadre chaleureux où l'enfant reprend goût à l'apprentissage.", rot: 2 },
    { icon: Target, color: "teal", title: "Personnalisation", desc: "Plan d'Accompagnement Personnalisé (PAP) pour chaque élève.", rot: -2 },
    { icon: Brain, color: "gold", title: "Innovation", desc: "Module D.I.E.C alliant pédagogie moderne et art-thérapie.", rot: 3 },
  ];
  return (
    <section className="relative py-28 bg-warm overflow-hidden paper-grain">
      <Doodle kind="sun" color="oklch(0.79 0.16 78 / 0.4)" className="absolute top-20 right-10 w-20 h-20" spin />
      <Doodle kind="arrow" color="oklch(0.52 0.21 357 / 0.4)" className="absolute bottom-20 left-10 w-24 h-16" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div {...fadeUp} className="max-w-2xl mb-20">
          <p className="section-num mb-4">01  Notre identité</p>
          <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.02]">
            L'<span className="font-handwritten font-bold text-magenta">âme</span> d'EducazenKids
          </h2>
          <p className="mt-6 font-handwritten text-2xl text-ink-light">
            Quatre piliers qui guident chacune de nos actions, chaque jour.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: p.rot }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
              whileHover={{ rotate: 0, scale: 1.04, y: -8 }}
              className={`relative bg-${p.color}-bg rounded-3xl p-8 shadow-sticker cursor-pointer overflow-hidden`}
            >
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${p.color} text-white mb-6 shadow-soft`}>
                <p.icon className="h-8 w-8" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">{p.title}</h3>
              <p className="text-sm text-ink-light leading-relaxed">{p.desc}</p>
              <Doodle kind="spark" color={`var(--${p.color})`} className="absolute top-4 right-4 w-6 h-6 opacity-50" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. ABOUT  interactive image gallery ---------- */
function AboutSticky() {
  const panels = [
    {
      image: classroom,
      label: "Mission",
      color: "magenta" as const,
      title: <>Reprendre goût à <span className="text-magenta">l'apprentissage</span></>,
      text: "Chaque enfant mérite un espace où il peut grandir à son rythme, avec un accompagnement pensé pour sa singularité.",
    },
    {
      image: activityMontessori,
      label: "Vision",
      color: "purple" as const,
      title: <>La <span className="text-purple">référence</span> de l'éducation inclusive</>,
      text: "Devenir le modèle au Maroc  un lieu où chaque enfant, quelles que soient ses spécificités, trouve sa place.",
    },
    {
      image: activityArt,
      label: "Approche",
      color: "teal" as const,
      title: <>Une équipe <span className="text-teal">pluridisciplinaire</span></>,
      text: "Enseignants spécialisés, psychologues, art-thérapeutes et paramédicaux unis autour de chaque enfant.",
    },
  ];

  const [active, setActive] = useState(0);
  const current = panels[active];

  return (
    <section className="relative bg-gradient-to-b from-white via-cream to-white overflow-hidden py-20 md:py-28">
      <Doodle kind="squiggle" color="oklch(0.45 0.21 312 / 0.25)" className="absolute top-10 right-[10%] w-32 h-6 hidden md:block" />
      <Doodle kind="circle" color="oklch(0.58 0.10 187 / 0.15)" className="absolute bottom-32 left-[5%] w-32 h-32 hidden md:block" />
      <Doodle kind="star" color="oklch(0.79 0.16 78 / 0.4)" className="absolute top-32 left-[8%] w-10 h-10 hidden lg:block animate-float-soft" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <motion.div {...fadeUp} className="max-w-3xl mb-12 md:mb-16">
          <p className="section-num mb-5" style={{ color: "var(--purple)" }}>
            <span className="inline-block w-10 h-px bg-purple align-middle mr-3" />
            02  À propos
          </p>
          <h2 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            Un centre où chaque<br className="hidden md:block" /> enfant{" "}
            <span className="relative inline-block">
              <span className="font-handwritten text-purple">trouve sa place</span>
              <svg viewBox="0 0 240 12" className="absolute -bottom-2 left-0 w-full h-3" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 8 Q 60 2, 120 6 T 237 8" stroke="oklch(0.45 0.21 312 / 0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>.
          </h2>
          <p className="mt-6 font-handwritten text-xl md:text-2xl text-ink-light max-w-2xl">
            Trois engagements qui définissent notre quotidien.
          </p>
        </motion.div>

        {/* Interactive grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Image with crossfade */}
          <motion.div
            {...fadeUp}
            className="lg:col-span-7 relative aspect-[4/3] md:aspect-[16/11] lg:aspect-auto lg:min-h-[520px] rounded-[2rem] overflow-hidden shadow-glow"
          >
            {panels.map((p, i) => (
              <motion.div
                key={p.label}
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.05 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
                aria-hidden={i !== active}
              >
                <img
                  src={p.image}
                  alt={p.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-tr from-${p.color}/40 via-transparent to-${p.color}/10 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
              </motion.div>
            ))}
            {/* Floating label badge */}
            <motion.div
              key={`badge-${active}`}
              initial={{ opacity: 0, y: 12, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-6 left-6 bg-white rounded-full px-5 py-2.5 shadow-sticker"
            >
              <p className={`font-label text-[10px] text-${current.color}`}>{String(active + 1).padStart(2, "0")} / 03 · {current.label}</p>
            </motion.div>
          </motion.div>

          {/* Panel selector + content */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {panels.map((p, i) => {
              const isActive = i === active;
              return (
                <motion.button
                  key={p.label}
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group relative text-left rounded-3xl p-6 md:p-7 border-2 transition-all duration-300 ${
                    isActive
                      ? `bg-${p.color}-bg border-${p.color} shadow-soft`
                      : "bg-white/60 border-transparent hover:bg-white hover:border-canvas"
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl font-display font-bold text-sm transition-colors ${
                      isActive ? `bg-${p.color} text-white` : `bg-${p.color}-bg text-${p.color}`
                    }`}>
                      0{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-label text-[10px] mb-2 transition-colors text-${p.color}`}>{p.label}</p>
                      <h3 className={`font-display font-bold text-xl md:text-2xl leading-tight transition-colors ${
                        isActive ? "text-ink" : "text-ink/70 group-hover:text-ink"
                      }`}>
                        {p.title}
                      </h3>
                      <motion.div
                        initial={false}
                        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 font-body text-ink-light leading-relaxed text-sm md:text-base">
                          {p.text}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. ACTIVITIES  color expand strips ---------- */
function ActivitiesExpand() {
  const acts = [
    { img: activityMontessori, title: "Pédagogie Montessori", tag: "Maternelle", color: "magenta", desc: "Apprentissage par la manipulation et l'autonomie." },
    { img: activityArt, title: "Art-thérapie", tag: "Tout âge", color: "purple", desc: "Exprimer ses émotions à travers la création." },
    { img: activityMusic, title: "Éveil musical", tag: "3  8 ans", color: "teal", desc: "Découverte du rythme, du chant et des instruments." },
    { img: activityNature, title: "Découverte nature", tag: "Plein air", color: "gold", desc: "Apprendre dehors, observer, expérimenter." },
  ];
  return (
    <section className="relative py-28 bg-canvas overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="section-num mb-4" style={{ color: "var(--teal)" }}>03  Nos activités</p>
            <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.02]">
              Apprendre <span className="font-handwritten text-teal">en s'épanouissant</span>.
            </h2>
          </div>
          <Link to="/activites" className="group inline-flex items-center gap-2 font-display font-bold text-teal hover:gap-3 transition-all">
            Toutes les activités <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Hover-expand color strips */}
        <div className="hidden md:flex gap-3 h-[520px] rounded-3xl overflow-hidden shadow-glow">
          {acts.map((a) => (
            <motion.div
              key={a.title}
              className={`group relative flex-1 hover:flex-[3] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer overflow-hidden bg-${a.color}`}
            >
              <img src={a.img} alt={a.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-90 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <span className="font-label text-[10px] bg-white/20 backdrop-blur px-3 py-1 rounded-full self-start mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300">{a.tag}</span>
                <h3 className="font-display font-bold text-3xl lg:text-4xl leading-tight" style={{ writingMode: "horizontal-tb" }}>
                  {a.title}
                </h3>
                <p className="font-handwritten text-xl mt-2 opacity-0 group-hover:opacity-100 transition-opacity delay-300 max-w-md">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile fallback */}
        <div className="md:hidden grid grid-cols-1 gap-5">
          {acts.map((a) => (
            <div key={a.title} className={`relative h-64 rounded-3xl overflow-hidden bg-${a.color}`}>
              <img src={a.img} alt={a.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="font-label text-[10px] bg-white/20 px-3 py-1 rounded-full self-start mb-2">{a.tag}</span>
                <h3 className="font-display font-bold text-2xl">{a.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 7. METHODS  Tilt cards ---------- */
function MethodsTilt() {
  const methods = [
    { name: "Montessori", desc: "Autonomie, sensoriel, vie pratique.", color: "magenta", num: "01" },
    { name: "Freinet", desc: "Coopération, expression libre.", color: "purple", num: "02" },
    { name: "Steiner", desc: "Imaginaire, art, rythmes naturels.", color: "teal", num: "03" },
    { name: "D.I.E.C", desc: "Notre approche exclusive intégrée.", color: "gold", num: "04" },
  ];
  return (
    <section className="relative py-28 bg-gradient-to-br from-lavender via-magenta-bg to-cream overflow-hidden">
      <Doodle kind="circle" color="oklch(0.45 0.21 312 / 0.3)" className="absolute top-20 right-20 w-24 h-24" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div {...fadeUp} className="text-center mb-16">
          <p className="section-num mx-auto justify-center mb-4">04  Nos méthodes</p>
          <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.02]">
            Quatre <span className="font-handwritten text-magenta">approches</span>, une promesse.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methods.map((m, i) => (
            <motion.div key={m.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
              <TiltCard className="h-full">
                <div className={`bg-white rounded-3xl p-8 shadow-sticker h-full border-t-8 border-${m.color}`}>
                  <p className={`font-label text-xs text-${m.color} mb-4`}>{m.num}</p>
                  <h3 className="font-display font-bold text-3xl mb-3">{m.name}</h3>
                  <p className="text-ink-light leading-relaxed">{m.desc}</p>
                  <Doodle kind="star" color={`var(--${m.color})`} className="mt-6 w-8 h-8 opacity-60" />
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 8. TESTIMONIALS ---------- */
function Testimonials() {
  const tests = [
    { name: "Fatima B.", role: "Maman de Lina, 7 ans", text: "Ma fille a retrouvé son sourire et le plaisir d'aller à l'école.", color: "magenta" },
    { name: "Karim O.", role: "Papa de Yassine, 9 ans", text: "L'équipe a su comprendre les besoins spécifiques de mon fils HPI.", color: "purple" },
    { name: "Nadia M.", role: "Maman de Sara, 5 ans", text: "Un cadre bienveillant, des pédagogues passionnés. On adore.", color: "teal" },
    { name: "Hicham R.", role: "Papa de Adam, 8 ans", text: "L'art-thérapie a été une révélation pour Adam.", color: "gold" },
    { name: "Salma K.", role: "Maman de Inès, 6 ans", text: "Inès n'a plus peur d'aller à l'école le matin. Merci !", color: "magenta" },
  ];
  return (
    <section className="relative py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...fadeUp}>
          <p className="section-num mb-4">05  Témoignages</p>
          <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.02]">
            Ils nous font <span className="font-handwritten text-magenta">confiance</span>.
          </h2>
          <Quote className="h-20 w-20 text-magenta/30 mt-10" />
          <blockquote className="mt-6 font-handwritten text-3xl md:text-4xl text-ink leading-snug max-w-xl">
            "Depuis qu'il est ici, mon fils m'attend chaque matin avec son sac sur le dos. C'est le plus beau cadeau."
          </blockquote>
          <p className="mt-6 font-display font-bold text-ink">Mounia  Maman de Rayan, 8 ans</p>
        </motion.div>

        <div className="relative h-[480px] overflow-hidden rounded-3xl bg-gradient-soft">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-10 pointer-events-none" />
          <motion.div
            animate={{ y: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex flex-col gap-5 p-6"
          >
            {[...tests, ...tests].map((t, i) => (
              <div key={i} className={`bg-white rounded-2xl p-6 shadow-soft border-l-4 border-${t.color} ${i % 2 === 0 ? "rotate-1" : "-rotate-1"}`}>
                <div className="flex gap-0.5 mb-3">
                  {[0,1,2,3,4].map(j => <Star key={j} className="h-3 w-3 fill-gold text-gold" />)}
                </div>
                <p className="font-handwritten text-xl text-ink leading-snug">"{t.text}"</p>
                <p className="mt-3 text-xs font-label text-ink-light">{t.name} · {t.role}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 9. INSCRIPTIONS CTA ---------- */
function InscriptionsCTA() {
  const [open, setOpen] = useState(false);
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-magenta via-magenta-light to-purple overflow-hidden">
      <div className="blob bg-white/10 top-10 left-10 w-72 h-72" />
      <div className="blob bg-gold/30 bottom-10 right-10 w-96 h-96" />
      <Doodle kind="star" color="oklch(0.79 0.16 78 / 0.7)" className="absolute top-20 left-[15%] w-14 h-14 animate-float-soft" />
      <Doodle kind="spark" color="oklch(1 0 0 / 0.6)" className="absolute bottom-32 right-[20%] w-12 h-12" spin />
      <Doodle kind="heart" color="oklch(1 0 0 / 0.5)" className="absolute top-1/2 right-[10%] w-10 h-10 animate-float-soft" delay={0.4} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...fadeUp} className="text-white">
          <p className="font-label text-xs text-white/70 mb-4">06  Rentrée 2026  2027</p>
          <h2 className="font-display font-bold text-5xl sm:text-6xl md:text-8xl leading-[0.92]">
            Inscriptions<br/>
            <span className="font-handwritten font-bold">Ouvertes !</span>
          </h2>
          <p className="mt-6 md:mt-8 font-handwritten text-2xl md:text-3xl text-white/90 max-w-lg">
            Maternelle & Primaire  réservez la place de votre enfant.
          </p>
          <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
            <MagneticButton
              as="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 md:px-8 py-3.5 md:py-4 font-display font-bold text-magenta hover:scale-105 transition-transform shadow-glow"
            >
              <Calendar className="h-5 w-5" /> Demander un rendez-vous
            </MagneticButton>
            <MagneticButton as="a" href="tel:0660686993" className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 md:px-8 py-3.5 md:py-4 font-display font-bold text-white hover:bg-white/10 transition-colors">
              <Phone className="h-5 w-5" /> 06 60 68 69 93
            </MagneticButton>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9, rotate: 6 }} whileInView={{ opacity: 1, scale: 1, rotate: 3 }} viewport={{ once: true }} className="relative">
          <div className="relative max-w-md mx-auto">
            <div className="washi-tape" style={{ top: "-10px", left: "30%", transform: "rotate(-6deg)" }} />
            <div className="rounded-3xl overflow-hidden shadow-glow hover:rotate-0 transition-transform duration-500">
              <img src={poster} alt="Affiche inscriptions ouvertes" loading="lazy" className="w-full h-auto" width={640} height={853} />
            </div>
          </div>
        </motion.div>
      </div>

      <InscriptionModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

/* ---------- Inscription Modal ---------- */
function InscriptionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inscription-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-glow"
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 z-10 rounded-full bg-canvas hover:bg-magenta hover:text-white p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-br from-magenta-bg via-rose to-lavender p-6 md:p-8 rounded-t-3xl">
          <p className="font-label text-[10px] text-magenta mb-2">Inscriptions 2026  2027</p>
          <h3 id="inscription-modal-title" className="font-display font-bold text-3xl md:text-4xl text-ink leading-tight">
            Demander un <span className="font-handwritten text-magenta">rendez-vous</span>
          </h3>
          <p className="mt-2 font-handwritten text-lg text-ink-light">
            Remplissez le formulaire  nous vous recontactons sous 24h.
          </p>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-bg text-teal mb-4">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h4 className="font-display font-bold text-2xl mb-2">Demande envoyée !</h4>
            <p className="font-handwritten text-xl text-ink-light">Nous vous recontactons très vite.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label text-[10px] text-ink-light mb-1.5">Nom Du Tuteur *</label>
                <input required type="text" className="w-full rounded-xl border-2 border-canvas bg-canvas focus:bg-white focus:border-magenta px-4 py-3 outline-none transition" />
              </div>
              <div>
                <label className="block font-label text-[10px] text-ink-light mb-1.5">Prénom *</label>
                <input required type="text" className="w-full rounded-xl border-2 border-canvas bg-canvas focus:bg-white focus:border-magenta px-4 py-3 outline-none transition" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label text-[10px] text-ink-light mb-1.5">Tél WhatsApp *</label>
                <input required type="tel" placeholder="06 ..." className="w-full rounded-xl border-2 border-canvas bg-canvas focus:bg-white focus:border-magenta px-4 py-3 outline-none transition" />
              </div>
              <div>
                <label className="block font-label text-[10px] text-ink-light mb-1.5">Email *</label>
                <input required type="email" placeholder="vous@email.com" className="w-full rounded-xl border-2 border-canvas bg-canvas focus:bg-white focus:border-magenta px-4 py-3 outline-none transition" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label text-[10px] text-ink-light mb-1.5">Âge de l'enfant *</label>
                <input required type="number" min={2} max={15} className="w-full rounded-xl border-2 border-canvas bg-canvas focus:bg-white focus:border-magenta px-4 py-3 outline-none transition" />
              </div>
              <div>
                <label className="block font-label text-[10px] text-ink-light mb-1.5">Niveau souhaité</label>
                <select className="w-full rounded-xl border-2 border-canvas bg-canvas focus:bg-white focus:border-magenta px-4 py-3 outline-none transition">
                  <option>Maternelle</option>
                  <option>Primaire</option>
                  <option>Soutien scolaire</option>
                  <option>Autre</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-label text-[10px] text-ink-light mb-1.5">Informations à connaitre sur l’enfant (optionnel)</label>
              <textarea rows={3} placeholder="Particularités, questions..." className="w-full rounded-xl border-2 border-canvas bg-canvas focus:bg-white focus:border-magenta px-4 py-3 outline-none transition resize-none" />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-hero px-6 py-3.5 font-display font-bold text-white shadow-glow hover:scale-[1.02] transition-transform"
            >
              <Send className="h-4 w-4" /> Envoyer ma demande
            </button>
            <p className="text-xs text-ink-light text-center">
              En envoyant ce formulaire, vous acceptez d'être recontacté par EducazenKids.
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------- 10. BLOG TEASER ---------- */
function BlogTeaser() {
  const posts = [
    { img: blog1, cat: "Éducation", title: "5 façons d'aider votre enfant à reprendre confiance", date: "10 Avril 2026", color: "magenta" },
    { img: blog2, cat: "Famille", title: "Lire avec son enfant : un rituel qui change tout", date: "02 Avril 2026", color: "purple" },
    { img: blog3, cat: "Créativité", title: "L'art-thérapie pour les enfants atypiques", date: "25 Mars 2026", color: "teal" },
  ];
  return (
    <section className="py-28 bg-canvas">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div>
            <p className="section-num mb-4">07  Du blog</p>
            <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.02]">
              Conseils & <span className="font-handwritten text-purple">inspiration</span>
            </h2>
          </div>
          <Link to="/blog" className="group inline-flex items-center gap-2 font-display font-bold text-magenta hover:gap-3 transition-all">
            Tous les articles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((b, i) => (
            <motion.div key={b.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
              <TiltCard max={6}>
                <article className="group cursor-pointer">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-5 shadow-soft">
                    <img src={b.img} alt={b.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width={1024} height={768} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`font-label text-[10px] px-3 py-1 rounded-full bg-${b.color}-bg text-${b.color}`}>{b.cat}</span>
                    <span className="text-xs font-handwritten text-ink-light text-base">{b.date}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl leading-snug group-hover:text-magenta transition-colors">{b.title}</h3>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
