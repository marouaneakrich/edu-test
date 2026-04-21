import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { Heart, Users, BookOpen } from "lucide-react";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { CountUp } from "@/components/site/motion/CountUp";
import { Doodle } from "@/components/site/motion/Doodle";
import classroom from "@/assets/about-classroom.jpg";
import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";
import team3 from "@/assets/team-3.jpg";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos  EducazenKids | Notre histoire" },
      { name: "description", content: "Découvrez la mission, la vision et l'équipe pluridisciplinaire d'EducazenKids  centre éducatif et psychosocial à Agadir." },
      { property: "og:title", content: "À propos d'EducazenKids" },
      { property: "og:description", content: "Notre mission : permettre à chaque enfant de reprendre goût à l'apprentissage." },
    ],
  }),
  component: AboutPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="01  Notre histoire"
        title={<>L'<span className="font-handwritten text-magenta">enseignement</span><br/>sur mesure.</>}
        subtitle="Un centre où chaque enfant  quel que soit son profil  trouve sa place et s'épanouit."
        accent="magenta"
      />

      {/* Mission / Vision */}
      <section className="relative py-24 bg-canvas overflow-hidden paper-grain">
        <Doodle kind="star" color="oklch(0.52 0.21 357 / 0.3)" className="absolute top-10 right-10 w-12 h-12" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-2 gap-8">
          {[
            { letter: "M", label: "Notre Mission", text: "Permettre à chaque enfant de reprendre goût à l'apprentissage, faire émerger ses compétences et vivre une expérience éducative unique.", bg: "bg-magenta-bg", color: "text-magenta", rot: -2 },
            { letter: "V", label: "Notre Vision", text: "Devenir la référence de l'éducation inclusive au Maroc  un modèle où chaque enfant trouve sa place et s'épanouit.", bg: "bg-lavender", color: "text-purple", rot: 2 },
          ].map((m, i) => (
            <motion.div
              key={m.letter}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: m.rot }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 80 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              className={`relative overflow-hidden p-12 rounded-3xl shadow-sticker ${m.bg}`}
            >
              <span className={`absolute -bottom-10 -right-4 font-display font-bold text-[200px] leading-none opacity-[0.08] ${m.color}`}>
                {m.letter}
              </span>
              <p className={`font-label text-xs ${m.color} mb-4`}>{m.label}</p>
              <p className="font-handwritten text-3xl text-ink leading-snug relative z-10">{m.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Histoire */}
      <section className="py-24 bg-warm">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp} className="relative">
            <TiltCard max={6}>
              <div className="bg-white p-4 pb-14 shadow-glow rounded-sm relative">
                <div className="washi-tape" style={{ top: "-10px", left: "20px", transform: "rotate(-6deg)" }} />
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={classroom} alt="Notre classe" loading="lazy" className="w-full h-full object-cover" width={1280} height={1024} />
                </div>
                <p className="absolute bottom-3 left-0 right-0 text-center font-handwritten text-xl text-ink">notre maison ✦ Agadir</p>
              </div>
            </TiltCard>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="absolute -bottom-6 -left-6 bg-magenta rounded-3xl p-6 shadow-glow text-white -rotate-6">
              <p className="font-display font-bold text-5xl"><CountUp to={2020} /></p>
              <p className="text-sm">Année de fondation</p>
            </motion.div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
            <p className="section-num mb-4">02  Notre histoire</p>
            <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] mb-6">Né d'une <span className="font-handwritten text-magenta">conviction</span> profonde.</h2>
            <div className="space-y-5 text-ink-light leading-relaxed">
              <p>EducazenKids est né de la conviction qu'aucun enfant ne devrait être laissé pour compte. Que ce soit un enfant à haut potentiel, atteint de TDAH, de troubles DYS, du spectre autistique, ou simplement un enfant qui a perdu confiance  chacun mérite une approche pensée pour lui.</p>
              <p>Notre équipe pluridisciplinaire  enseignants spécialisés, psychologues, art-thérapeutes, paramédicaux  travaille main dans la main pour construire un Plan d'Accompagnement Personnalisé adapté à chaque élève.</p>
              <p>Au cœur de notre approche : les méthodes Montessori, Freinet et Steiner, enrichies par notre module exclusif <strong className="text-magenta">D.I.E.C</strong>.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Valeurs section removed  already shown on the homepage as "Pillars" to avoid repetition */}

      {/* Pôles */}
      <section className="py-24 bg-teal-bg">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div {...fadeUp} className="mb-16">
            <p className="section-num mb-4" style={{ color: "var(--teal)" }}>04  Nos pôles d'action</p>
            <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight max-w-2xl">Trois pôles, un <span className="font-handwritten text-teal">accompagnement</span> complet.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Apprentissage Scolaire", desc: "De la maternelle au collège  Montessori, Freinet, Steiner adaptés.", color: "magenta" },
              { icon: Users, title: "Formation Parents", desc: "Ateliers et formations  la réussite se construit ensemble.", color: "purple" },
              { icon: Heart, title: "Pôle Psychosocial", desc: "Équipe pluridisciplinaire et paramédicale dédiée.", color: "teal" },
            ].map((p, i) => (
              <motion.div key={p.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
                <TiltCard className="h-full">
                  <div className="bg-white rounded-3xl p-10 shadow-sticker h-full">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${p.color} text-white mb-6`}>
                      <p.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-display font-bold text-2xl mb-3">{p.title}</h3>
                    <p className="text-ink-light leading-relaxed">{p.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe  polaroids */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-num mx-auto justify-center mb-4">05  Notre équipe</p>
            <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">Des professionnels <span className="font-handwritten text-magenta">passionnés</span>.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { img: team1, name: "Salma El Amrani", role: "Directrice pédagogique", rot: -3 },
              { img: team2, name: "Karim Bensouda", role: "Psychologue clinicien", rot: 2 },
              { img: team3, name: "Leïla Mansouri", role: "Art-thérapeute", rot: -2 },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: p.rot }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring" }}
                whileHover={{ rotate: 0, scale: 1.04 }}
                className="bg-white p-4 pb-14 shadow-sticker rounded-sm relative cursor-pointer"
              >
                <div className="washi-tape" style={{ top: "-10px", left: "30%", transform: "rotate(-6deg)" }} />
                <div className="aspect-[4/5] overflow-hidden mb-4">
                  <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover" width={768} height={896} />
                </div>
                <p className="absolute bottom-2 left-0 right-0 text-center font-handwritten text-xl text-ink">{p.name}</p>
                <p className="absolute -bottom-3 left-0 right-0 text-center font-label text-[10px] text-magenta">{p.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-hero text-white relative overflow-hidden">
        <Doodle kind="spark" color="oklch(1 0 0 / 0.3)" className="absolute top-10 left-1/4 w-12 h-12" spin />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: 70, suf: "+", l: "Familles accompagnées" },
            { n: 6, suf: "", l: "Années d'expérience" },
            { n: 13, suf: "+", l: "Pédagogues experts" },
            { n: 98, suf: "%", l: "Parents satisfaits" },
          ].map((s, i) => (
            <motion.div key={s.l} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <p className="font-display font-bold text-5xl md:text-7xl"><CountUp to={s.n} suffix={s.suf} /></p>
              <p className="font-handwritten text-2xl text-white/80 mt-2">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
