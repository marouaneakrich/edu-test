import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { MagneticButton } from "@/components/site/motion/MagneticButton";
import { Doodle } from "@/components/site/motion/Doodle";
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";
import art from "@/assets/activity-art.jpg";
import nature from "@/assets/activity-nature.jpg";
import montessori from "@/assets/activity-montessori.jpg";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog  EducazenKids | Conseils & inspirations" },
      { name: "description", content: "Articles, conseils et ressources pour parents : éducation bienveillante, troubles d'apprentissage, créativité, parentalité." },
      { property: "og:title", content: "Blog EducazenKids" },
      { property: "og:description", content: "Inspiration et conseils pour accompagner votre enfant." },
    ],
  }),
  component: BlogPage,
});

const POSTS = [
  { img: blog1, cat: "Éducation", date: "10 Avril 2026", read: "5 min", title: "5 façons d'aider votre enfant à reprendre confiance en lui", excerpt: "La confiance en soi se construit jour après jour. Voici cinq leviers concrets pour accompagner votre enfant.", color: "magenta" },
  { img: blog2, cat: "Famille", date: "02 Avril 2026", read: "4 min", title: "Lire avec son enfant : un rituel qui change tout", excerpt: "Au-delà des mots, lire ensemble crée un lien unique et stimule l'imagination.", color: "purple" },
  { img: blog3, cat: "Créativité", date: "25 Mars 2026", read: "6 min", title: "L'art-thérapie pour les enfants atypiques", excerpt: "Pour les enfants HPI, TDAH ou TSA, l'art devient un langage.", color: "teal" },
  { img: art, cat: "Pédagogie", date: "18 Mars 2026", read: "7 min", title: "Montessori à la maison : par où commencer ?", excerpt: "Quelques principes simples pour intégrer la pédagogie Montessori au quotidien.", color: "gold" },
  { img: nature, cat: "Bien-être", date: "10 Mars 2026", read: "5 min", title: "L'apprentissage en plein air : pourquoi c'est essentiel", excerpt: "La nature est un terrain d'apprentissage extraordinaire.", color: "magenta" },
  { img: montessori, cat: "Conseils", date: "01 Mars 2026", read: "4 min", title: "Comment gérer les écrans avec un enfant TDAH", excerpt: "Les écrans peuvent être un défi pour les enfants TDAH. Nos recommandations équilibrées.", color: "purple" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

function BlogPage() {
  const [featured, ...rest] = POSTS;
  return (
    <PageShell>
      <PageHero
        eyebrow="Le blog"
        title={<>Conseils, idées<br/><span className="font-handwritten text-purple">& inspirations</span></>}
        subtitle="Pour accompagner les parents et les éducateurs, nous partageons régulièrement des articles."
        accent="purple"
      />

      {/* Featured  bigger À la une */}
      <section className="relative py-20 md:py-28 bg-white overflow-hidden">
        <Doodle kind="star" color="oklch(0.45 0.21 312 / 0.3)" className="absolute top-10 right-10 w-12 h-12" />
        <Doodle kind="spark" color="oklch(0.52 0.21 357 / 0.4)" className="absolute bottom-20 left-10 w-10 h-10 hidden md:block" spin />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div {...fadeUp} className="mb-10 md:mb-14 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="section-num mb-3">À la une</p>
              <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">L'article <span className="font-handwritten text-magenta">phare</span></h2>
            </div>
          </motion.div>
          <motion.article {...fadeUp} className="group grid lg:grid-cols-5 gap-8 lg:gap-14 items-center cursor-pointer">
            <TiltCard max={5} className="lg:col-span-3">
              <div className="relative bg-white p-4 md:p-5 pb-14 md:pb-16 shadow-glow rounded-sm">
                <div className="washi-tape" style={{ top: "-10px", left: "30%", transform: "rotate(-6deg)" }} />
                <div className="washi-tape" style={{ top: "-10px", right: "20%", transform: "rotate(8deg)" }} />
                <div className="aspect-[4/3] md:aspect-[16/10] overflow-hidden">
                  <img src={featured.img} alt={featured.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" width={1600} height={1000} />
                </div>
                <p className="absolute bottom-4 left-0 right-0 text-center font-handwritten text-2xl text-ink">à la une ✦</p>
              </div>
            </TiltCard>
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 md:gap-4 mb-5 text-sm text-ink-light flex-wrap">
                <span className={`font-label text-[10px] px-3 py-1 rounded-full bg-${featured.color}-bg text-${featured.color}`}>{featured.cat}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {featured.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.read}</span>
              </div>
              <h3 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] group-hover:text-magenta transition-colors">{featured.title}</h3>
              <p className="mt-6 md:mt-8 font-handwritten text-2xl md:text-3xl text-ink-light leading-snug">{featured.excerpt}</p>
              <span className="mt-8 md:mt-10 inline-flex items-center gap-2 font-display font-bold text-magenta text-lg group-hover:gap-3 transition-all">
                Lire l'article <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 bg-canvas">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.h2 {...fadeUp} className="font-display font-bold text-3xl md:text-5xl mb-12">Tous les <span className="font-handwritten text-magenta">articles</span></motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((p, i) => (
              <motion.div key={p.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <TiltCard max={5}>
                  <article className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-glow transition-shadow h-full">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width={1024} height={640} />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4 text-xs text-ink-light flex-wrap">
                        <span className={`font-label px-2.5 py-1 rounded-full bg-${p.color}-bg text-${p.color}`}>{p.cat}</span>
                        <span>{p.date}</span>
                        <span>·</span>
                        <span>{p.read}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg leading-snug group-hover:text-magenta transition-colors">{p.title}</h3>
                      <p className="mt-3 text-sm text-ink-light leading-relaxed line-clamp-3">{p.excerpt}</p>
                    </div>
                  </article>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <Doodle kind="heart" color="oklch(0.52 0.21 357 / 0.4)" className="absolute top-10 left-1/5 w-12 h-12 animate-float-soft" />
        <Doodle kind="spark" color="oklch(0.45 0.21 312 / 0.5)" className="absolute bottom-10 right-1/5 w-10 h-10" spin />
        <motion.div {...fadeUp} className="mx-auto max-w-2xl px-6 text-center">
          <p className="section-num mx-auto justify-center mb-4">Newsletter</p>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-6">
            Restez <span className="font-handwritten text-magenta">inspirés</span>.
          </h2>
          <p className="font-handwritten text-2xl text-ink-light mb-10">
            Nos meilleurs conseils dans votre boîte mail, une fois par mois.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" required placeholder="votre@email.com" className="flex-1 rounded-full bg-white px-6 py-4 border-2 border-transparent focus:border-magenta outline-none font-body" />
            <MagneticButton type="submit" className="rounded-full bg-gradient-hero px-6 py-4 font-display font-bold text-white shadow-soft hover:scale-105 transition-transform">
              S'abonner
            </MagneticButton>
          </form>
        </motion.div>
      </section>
    </PageShell>
  );
}
