import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ArrowRight, Clock, Users } from "lucide-react";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { MagneticButton } from "@/components/site/motion/MagneticButton";
import { Doodle } from "@/components/site/motion/Doodle";
import art from "@/assets/activity-art.jpg";
import nature from "@/assets/activity-nature.jpg";
import montessori from "@/assets/activity-montessori.jpg";
import music from "@/assets/activity-music.jpg";

export const Route = createFileRoute("/activites")({
  head: () => ({
    meta: [
      { title: "Activités  EducazenKids | Ateliers & Pédagogies" },
      { name: "description", content: "Découvrez nos activités : Montessori, art-thérapie, éveil musical, découverte nature, formation parents et bien plus." },
      { property: "og:title", content: "Activités EducazenKids" },
      { property: "og:description", content: "Une palette d'ateliers pensés pour chaque enfant." },
    ],
  }),
  component: ActivitiesPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const ACTIVITIES = [
  { img: montessori, title: "Pédagogie Montessori", cat: "Maternelle", age: "3  6 ans", duration: "Hebdomadaire", desc: "Apprentissage par la manipulation et l'autonomie. Matériel sensoriel, vie pratique, langage et mathématiques.", color: "magenta", rot: -2 },
  { img: art, title: "Art-thérapie", cat: "Bien-être", age: "Tout âge", duration: "1h30/semaine", desc: "Exprimer ses émotions à travers la peinture, l'argile et la création. Un espace de liberté et de découverte de soi.", color: "purple", rot: 2 },
  { img: music, title: "Éveil musical", cat: "Créativité", age: "3  8 ans", duration: "1h/semaine", desc: "Découverte des instruments, du rythme et du chant. Stimuler la sensibilité musicale et la coordination.", color: "teal", rot: -1 },
  { img: nature, title: "Découverte nature", cat: "Plein air", age: "5  11 ans", duration: "Sortie mensuelle", desc: "Observer, expérimenter et comprendre le vivant. Un retour à l'essentiel par l'apprentissage en plein air.", color: "gold", rot: 1 },
];

const PROGRAMS = [
  { num: "01", title: "Soutien scolaire", desc: "Cours individuels ou en petit groupe avec enseignants spécialisés.", color: "magenta" },
  { num: "02", title: "Bilan psycho-éducatif", desc: "Évaluation complète pour comprendre les besoins de votre enfant.", color: "purple" },
  { num: "03", title: "Atelier DYS", desc: "Ateliers ciblés pour dyslexie, dyscalculie, dysorthographie.", color: "teal" },
  { num: "04", title: "Coaching parental", desc: "Accompagnement et formation pour les parents.", color: "gold" },
  { num: "05", title: "Stages vacances", desc: "Stages thématiques durant les vacances scolaires.", color: "magenta" },
  { num: "06", title: "Module D.I.E.C", desc: "Notre approche exclusive : Développement Intégré de l'Enfant.", color: "purple" },
];

function ActivitiesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="01  Nos activités"
        title={<>Apprendre <span className="font-handwritten text-teal">en s'épanouissant</span>.</>}
        subtitle="Une palette d'ateliers et de programmes pensés pour stimuler chaque facette de votre enfant."
        accent="teal"
      />

      {/* Activités principales  sticker polaroid cards */}
      <section className="relative py-24 bg-white overflow-hidden">
        <Doodle kind="star" color="oklch(0.58 0.10 187 / 0.3)" className="absolute top-10 right-10 w-12 h-12" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-10">
            {ACTIVITIES.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: a.rot }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 70 }}
                whileHover={{ rotate: 0, scale: 1.02 }}
              >
                <TiltCard max={5}>
                  <article className={`group rounded-3xl overflow-hidden bg-canvas shadow-sticker border-t-8 border-${a.color}`}>
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={a.img} alt={a.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" width={1024} height={640} />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className={`font-label text-[10px] px-3 py-1 rounded-full bg-${a.color}-bg text-${a.color}`}>{a.cat}</span>
                        <span className="text-xs text-ink-light flex items-center gap-1"><Users className="h-3 w-3" /> {a.age}</span>
                        <span className="text-xs text-ink-light flex items-center gap-1"><Clock className="h-3 w-3" /> {a.duration}</span>
                      </div>
                      <h3 className="font-display font-bold text-3xl mb-3">{a.title}</h3>
                      <p className="text-ink-light leading-relaxed">{a.desc}</p>
                    </div>
                  </article>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="relative py-24 bg-canvas overflow-hidden paper-grain">
        <Doodle kind="squiggle" color="oklch(0.45 0.21 312 / 0.3)" className="absolute top-20 left-10 w-32 h-6" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div {...fadeUp} className="max-w-2xl mb-16">
            <p className="section-num mb-4" style={{ color: "var(--purple)" }}>02  Programmes complémentaires</p>
            <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">Au-delà des cours, un <span className="font-handwritten text-purple">accompagnement</span> complet.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((p, i) => (
              <motion.div key={p.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className={`group bg-white rounded-3xl p-8 shadow-soft border-t-4 border-${p.color} hover:shadow-glow transition-shadow`}
              >
                <p className={`font-display font-bold text-5xl text-${p.color} mb-4`}>{p.num}</p>
                <h3 className="font-display font-bold text-xl mb-3 group-hover:text-magenta transition-colors">{p.title}</h3>
                <p className="text-sm text-ink-light leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <Doodle kind="heart" color="oklch(0.52 0.21 357 / 0.4)" className="absolute top-20 left-1/4 w-12 h-12 animate-float-soft" />
        <Doodle kind="spark" color="oklch(0.45 0.21 312 / 0.4)" className="absolute bottom-20 right-1/4 w-12 h-12" spin />
        <motion.div {...fadeUp} className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-6">
            Une activité qui vous <span className="font-handwritten text-magenta">intéresse</span> ?
          </h2>
          <p className="font-handwritten text-2xl text-ink-light mb-10">
            Contactez-nous pour planifier une visite ou un essai gratuit.
          </p>
          <MagneticButton as="a" href="/contact" className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-8 py-4 font-display font-bold text-white shadow-glow hover:scale-105 transition-transform">
            Prendre rendez-vous <ArrowRight className="h-5 w-5" />
          </MagneticButton>
        </motion.div>
      </section>
    </PageShell>
  );
}
