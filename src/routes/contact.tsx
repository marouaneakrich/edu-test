import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { MagneticButton } from "@/components/site/motion/MagneticButton";
import { Doodle } from "@/components/site/motion/Doodle";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact  EducazenKids | Prendre rendez-vous" },
      { name: "description", content: "Contactez EducazenKids à Agadir. Inscriptions, rendez-vous, informations  notre équipe vous répond rapidement." },
      { property: "og:title", content: "Contact EducazenKids" },
      { property: "og:description", content: "Une question, une inscription ? Écrivez-nous." },
    ],
  }),
  component: ContactPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function ContactPage() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Contactez-nous"
        title={<>Parlons de votre <span className="font-handwritten text-magenta">enfant</span>.</>}
        subtitle="Notre équipe est là pour répondre à vos questions et planifier une visite à votre convenance."
        accent="magenta"
      />

      {/* Cards contact  sticker */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-3 gap-6">
          {[
            { icon: Phone, title: "Téléphone", lines: ["(AR) 06 60 68 69 93", "(FR) 07 66 68 27 25"], color: "magenta", href: "tel:0660686993", rot: -2 },
            { icon: Mail, title: "Email", lines: ["contact@educazenkids.ma"], color: "purple", href: "mailto:contact@educazenkids.ma", rot: 2 },
            { icon: MapPin, title: "Adresse", lines: ["Immeuble MOUHIB, 4 avenue Alfarabi, Quartier el Houda 80000 AGADIR"], color: "teal", href: "#map", rot: -1 },
          ].map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: c.rot }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileHover={{ rotate: 0, y: -8, scale: 1.04 }}
              className={`group rounded-3xl bg-${c.color}-bg p-8 shadow-sticker block`}
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-${c.color} text-white shadow-soft mb-5`}>
                <c.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">{c.title}</h3>
              {c.lines.map((l) => (
                <p key={l} className="text-ink-light font-medium">{l}</p>
              ))}
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form + Hours */}
      <section className="relative py-20 bg-canvas overflow-hidden paper-grain">
        <Doodle kind="star" color="oklch(0.52 0.21 357 / 0.3)" className="absolute top-10 right-10 w-12 h-12" />
        <Doodle kind="squiggle" color="oklch(0.45 0.21 312 / 0.3)" className="absolute bottom-20 left-10 w-32 h-6" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-5 gap-12">
          <motion.form
            {...fadeUp}
            onSubmit={onSubmit}
            className="lg:col-span-3 bg-white rounded-3xl p-8 md:p-12 shadow-sticker relative"
          >
            <Doodle kind="spark" color="oklch(0.52 0.21 357 / 0.5)" className="absolute -top-4 -right-4 w-12 h-12" spin />
            <p className="section-num mb-4">Formulaire</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl mb-8 leading-tight">Envoyez-nous un <span className="font-handwritten text-magenta">message</span></h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Prénom" name="firstName" required />
              <Field label="Nom" name="lastName" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Téléphone" name="phone" type="tel" />
              <div className="sm:col-span-2">
                <Field label="Sujet" name="subject" required />
              </div>
              <div className="sm:col-span-2">
                <label className="font-label text-[10px] text-magenta block mb-2">Votre message</label>
                <textarea name="message" rows={5} required className="w-full rounded-2xl bg-canvas border-2 border-transparent focus:border-magenta outline-none px-5 py-4 text-ink resize-none font-body" />
              </div>
            </div>
            <MagneticButton type="submit" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-8 py-4 font-display font-bold text-white shadow-glow hover:scale-105 transition-transform">
              {sent ? <><CheckCircle2 className="h-5 w-5" /> Message envoyé !</> : <>Envoyer <Send className="h-5 w-5" /></>}
            </MagneticButton>
          </motion.form>

          <motion.aside {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-gradient-hero p-8 text-white shadow-glow -rotate-1 hover:rotate-0 transition-transform">
              <Clock className="h-8 w-8 mb-5" />
              <h3 className="font-display font-bold text-2xl mb-5">Horaires d'ouverture</h3>
              <ul className="space-y-3 font-handwritten text-xl text-white/90">
                <li className="flex justify-between"><span>Lundi  Vendredi</span><strong className="font-display font-bold">8h  18h</strong></li>
                <li className="flex justify-between"><span>Samedi</span><strong className="font-display font-bold">9h  13h</strong></li>
                <li className="flex justify-between"><span>Dimanche</span><strong className="font-display font-bold">Fermé</strong></li>
              </ul>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sticker rotate-1 hover:rotate-0 transition-transform">
              <p className="section-num mb-3">FAQ rapide</p>
              <h4 className="font-display font-bold text-lg mb-2">Comment se passe une première visite ?</h4>
              <p className="text-sm text-ink-light leading-relaxed">Nous prenons le temps de rencontrer parents et enfant, faisons le tour du centre, puis discutons d'un éventuel plan d'accompagnement personnalisé.</p>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="relative h-[480px] bg-gradient-to-br from-teal-bg via-mint to-cream overflow-hidden">
        <div className="blob bg-teal/20 top-10 left-10 w-96 h-96 animate-float-slow" />
        <div className="blob bg-magenta/15 bottom-10 right-10 w-80 h-80 animate-float-slow" style={{ animationDelay: "3s" }} />
        <Doodle kind="star" color="oklch(0.79 0.16 78 / 0.6)" className="absolute top-10 left-1/4 w-10 h-10 animate-float-soft" />
        <Doodle kind="heart" color="oklch(0.52 0.21 357 / 0.5)" className="absolute bottom-10 right-1/4 w-10 h-10 animate-float-soft" delay={0.4} />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div>
            <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-magenta text-white shadow-glow mb-6">
              <MapPin className="h-12 w-12" />
              <span className="absolute inset-0 rounded-full animate-pulse-ring" />
            </div>
            <h3 className="font-display font-bold text-3xl md:text-5xl mb-2">EducazenKids</h3>
            <p className="font-handwritten text-2xl text-ink-light">Agadir, Maroc ✦</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="font-label text-[10px] text-magenta block mb-2">{label}{required && " *"}</label>
      <input name={name} type={type} required={required} className="w-full rounded-2xl bg-canvas border-2 border-transparent focus:border-magenta outline-none px-5 py-3.5 text-ink font-body" />
    </div>
  );
}
