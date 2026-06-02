import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Check, AlertCircle, Mail, Phone, MapPin, ArrowRight, Star, Users, Shield, Clock } from "lucide-react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { Doodle } from "@/components/site/motion/Doodle";
import { toast } from "sonner";
import heroImg from "@/assets/camp-hero.jpg";
import artImg from "@/assets/camp-art.jpg";
import natureImg from "@/assets/camp-nature.jpg";
import sportsImg from "@/assets/camp-sports.jpg";
import musicImg from "@/assets/camp-music.jpg";
import groupImg from "@/assets/camp-group.jpg";
import {
  Sparkles, Heart, Target, Brain
} from "lucide-react";
import { MagneticButton } from "@/components/site/motion/MagneticButton";

export const Route = createFileRoute("/camp-ete")({
  head: () => ({
    meta: [
      { title: "Summer Camp EducazenKids 2026 | Inscription" },
      { name: "description", content: "Inscrivez votre enfant au Summer Camp EducazenKids 2026. Activités créatives, apprentissage en plein air et environnement sécurisé." },
      { property: "og:title", content: "Summer Camp EducazenKids" },
      { property: "og:description", content: "Rejoignez notre Summer Camp inclusif pour enfants de 4-12 ans." },
    ],
  }),
  component: SummerCampPage,
});

interface FormData {
  parentName: string;
  email: string;
  phone: string;
  address: string;
  numberOfChildren: number;
  dateOfBirth: string;
  specialNeeds: string;
  allergies: string;
  medicalConditions: string;
  selectedWeeks: string[];
  campType: "fulltime" | "parttime";
  activities: string[];
  specialRequests: string;
  emergencyContactName: string;
  emergencyPhone: string;
  insurance: string;
  medications: string;
  photoConsent: boolean;
  termsAccepted: boolean;
}

interface FormErrors { [key: string]: string; }

const BENEFITS = [
  { icon: Sparkles, title: "Activités créatives", desc: "Art, musique, danse et expression artistique pour développer la créativité", color: "magenta", num: "01" },
  { icon: Brain, title: "Apprentissage en plein air", desc: "Découverte de la nature, écologie et exploration en toute sécurité", color: "purple", num: "02" },
  { icon: Target, title: "Approche personnalisée", desc: "Adaptation pour chaque enfant, y compris ceux avec besoins spéciaux", color: "teal", num: "03" },
  { icon: Heart, title: "Environnement sécurisé", desc: "Encadrement professionnel, protocoles de santé stricts et bien-être prioritaire", color: "gold", num: "04" },
];

const FAQ_DATA = [
  {
    q: "Quel est l'âge minimum pour le camp?",
    a: "Le camp accueille les enfants de 4 à 12 ans. Nous avons des groupes par tranche d'âge pour adapter les activités à chaque niveau de développement.",
  },
  {
    q: "Votre camp peut-il accueillir les enfants en situation de handicap?",
    a: "Oui! EducazenKids est un centre d'éducation inclusif. Nous accueillons les enfants HPI, TDAH, DYS, TSA et autres. Notre équipe est formée à l'accompagnement personnalisé.",
  },
  {
    q: "Que se passe-t-il en cas d'urgence médicale?",
    a: "Nous avons un protocole strict de sécurité. L'équipe est formée aux premiers secours, et nous avons accès aux services d'urgence. Les numéros de contact parental sont toujours à portée de main.",
  },
  {
    q: "Comment gérez-vous les régimes alimentaires spéciaux?",
    a: "Nous respectons tous les régimes spéciaux et allergies. Veuillez les indiquer dans le formulaire. Notre chef cuisine adapte les repas selon les besoins de chaque enfant.",
  },
  {
    q: "Peut-on faire une semaine partagée entre deux enfants?",
    a: "Oui, bien sûr! Vous pouvez inscrire plusieurs enfants et choisir différentes semaines. Des réductions sont disponibles pour les familles avec plusieurs enfants.",
  },
  {
    q: "Y a-t-il une flexibilité pour les arrivées/départs tardifs?",
    a: "Oui, nous proposons une arrivée flexible de 8h30 à 9h et un départ jusqu'à 16h30. Des frais supplémentaires s'appliquent pour les services avant/après les horaires standards.",
  },
];

const SPECIAL_NEEDS_OPTIONS = [
  { value: "typical", label: "Développement typique" },
  { value: "hpi", label: "HPI (Haut potentiel intellectuel)" },
  { value: "tdah", label: "TDAH" },
  { value: "dys", label: "DYS (Dyslexie, Dysorthographie, etc.)" },
  { value: "tsa", label: "TSA (Trouble du spectre autistique)" },
  { value: "other", label: "Autre" },
];

const ACTIVITIES_OPTIONS = [
  { label: "Art & Peinture", img: artImg, tag: "Créativité" },
  { label: "Nature & Écologie", img: natureImg, tag: "Aventure" },
  { label: "Sport & Jeux", img: sportsImg, tag: "Énergie" },
  { label: "Musique & Chant", img: musicImg, tag: "Expression" },
];

const CAMP_WEEKS = [
  { value: "week1", label: "Semaine 1: 23-27 juin" },
  { value: "week2", label: "Semaine 2: 30 juin - 4 juillet" },
  { value: "week3", label: "Semaine 3: 7-11 juillet" },
  { value: "week4", label: "Semaine 4: 14-18 juillet" },
  { value: "week5", label: "Semaine 5: 21-25 juillet" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const scrollToForm = () => {
  document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" });
};

function SummerCampPage() {
  const [formData, setFormData] = useState<FormData>({
    parentName: "",
    email: "",
    phone: "",
    address: "",
    numberOfChildren: 1,
    dateOfBirth: "",
    specialNeeds: "typical",
    allergies: "",
    medicalConditions: "",
    selectedWeeks: [],
    campType: "fulltime",
    activities: [],
    specialRequests: "",
    emergencyContactName: "",
    emergencyPhone: "",
    insurance: "",
    medications: "",
    photoConsent: false,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.parentName.trim()) newErrors.parentName = "Nom requis";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email valide requis";
    if (!formData.phone.trim() || !/^[0-9+\s\-()]{8,}$/.test(formData.phone)) newErrors.phone = "Téléphone valide requis";
    if (!formData.numberOfChildren || formData.numberOfChildren < 1) newErrors.numberOfChildren = "Spécifiez au moins 1 enfant";
    if (formData.numberOfChildren === 1 && !formData.dateOfBirth) newErrors.dateOfBirth = "Date de naissance requise pour l'enfant";
    if (formData.selectedWeeks.length === 0) newErrors.selectedWeeks = "Sélectionnez au moins une semaine";
    if (formData.activities.length === 0) newErrors.activities = "Sélectionnez au moins une activité";
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = "Contact d'urgence requis";
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = "Téléphone d'urgence requis";
    if (!formData.termsAccepted) newErrors.termsAccepted = "Vous devez accepter les conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);
    toast.success("Inscription envoyée avec succès!");

    setTimeout(() => {
      setFormData({
        parentName: "",
        email: "",
        phone: "",
        numberOfChildren: 1,
        campType: "fulltime",
        activities: [],
        emergencyContactName: "",
        emergencyPhone: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <PageShell>
      <div className="font-body">
        <PageHero
          eyebrow="Summer Camp 2026"
          title={<>Rejoignez notre <span className="font-handwritten text-magenta">aventure</span> estivale</>}
          subtitle="Activités créatives, apprentissage ludique et environnement inclusif pour enfants de 4-12 ans (23 juin - 25 juillet)."
          accent="magenta"
        />

        {/* Hero CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-magenta py-4 px-6"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <p className="font-label text-sm font-semibold">
                <span className="font-bold">Places limitées!</span> — Inscriptions ouvertes jusqu'au 15 juin 2026
              </p>
            </div>
            <MagneticButton
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToForm}
              className="flex items-center gap-2 bg-white text-magenta font-bold px-6 py-2.5 rounded-full text-sm shadow hover:shadow-md transition-all whitespace-nowrap"
            >
              Inscrire mon enfant <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.section className="relative py-28 bg-gradient-to-br from-lavender via-magenta-bg to-cream overflow-hidden">
          <Doodle kind="circle" color="oklch(0.45 0.21 312 / 0.3)" className="absolute top-20 right-20 w-24 h-24" />
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <p className="section-num mx-auto justify-center mb-4">03  Pourquoi choisir notre camp?</p>
              <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.02]">
                Quatre <span className="font-handwritten text-magenta">atouts</span> pour l'été.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((benefit, i) => (
                <motion.div key={benefit.title} {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.1 }}>
                  <TiltCard className="h-full">
                    <div className={`bg-white rounded-3xl p-8 shadow-sticker h-full border-t-8 border-${benefit.color}`}>
                        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${benefit.color} text-white mb-6 shadow-soft`}>
                          <benefit.icon className="h-8 w-8" />
                        </div>
                      <p className={`font-label text-xs text-${benefit.color} mb-4`}>{benefit.num}</p>
                      <h3 className="font-display font-bold text-3xl mb-3">{benefit.title}</h3>
                      <p className="text-ink-light leading-relaxed">{benefit.desc}</p>
                      <Doodle kind="star" color={`var(--${benefit.color})`} className="mt-6 w-8 h-8 opacity-60" />
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>

            {/* CTA after benefits */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.5 }}
              className="mt-14 text-center"
            >
              <MagneticButton
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToForm}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-magenta to-purple text-white font-bold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Réserver une place maintenant <ArrowRight className="w-5 h-5" />
              </MagneticButton>
              <p className="mt-3 text-sm text-ink-light font-label">Inscription en moins de 3 minutes · Aucun paiement immédiat</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Program Overview */}
        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="section-num mx-auto justify-center mb-4">02 — Le programme</p>
               <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.02]">
                Quatre univers, mille<span className="font-handwritten text-magenta"> souvenirs.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ACTIVITIES_OPTIONS.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8, rotate: i % 2 === 0 ? -2 : 2 }}
                  className="bg-white p-4 pb-14 shadow-glow rounded-sm relative"
                  style={{ rotate: `${i % 2 === 0 ? 1 : -1}deg` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={a.img}
                      alt={a.label}
                      loading="lazy"
                      width={1024}
                      height={1280}
                      className="w-full aspect-[4/5] object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-xs font-bold uppercase tracking-wider text-magenta">
                      {a.tag}
                    </span>
                  </div>
                  <p className="absolute bottom-3 left-0 right-0 text-center font-label text-md">
                    {a.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA after activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 rounded-3xl bg-gradient-to-r from-ink to-purple p-10 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="text-white text-center md:text-left">
                <p className="font-label text-sm text-white/60 uppercase tracking-widest mb-1">Votre enfant va adorer</p>
                <h3 className="font-display font-bold text-3xl md:text-4xl">Prêt à vivre l'aventure?</h3>
                <p className="text-white/70 mt-2 font-body">Inscrivez-le en quelques minutes. Places limitées à 20 enfants par groupe.</p>
              </div>
              <MagneticButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToForm}
                className="flex-shrink-0 flex items-center gap-3 bg-magenta text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl hover:bg-magenta/90 transition-all"
              >
                Je veux inscrire mon enfant <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </motion.div>
          </div>
        </motion.section>

        {/* Registration Form Section */}
        <motion.section {...fadeInUp} id="form-section" className="py-16 px-6 lg:px-10 bg-gradient-to-r from-ink to-purple">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-2 text-white">
              Formulaire d'<span className="font-handwritten text-magenta">inscription</span>
            </h2>
            <p className="text-center font-body text-white/70 mb-10">
              Remplissez tous les champs pour inscrire votre enfant au Summer Camp
            </p>

            {/* SINGLE PRICE CARD ABOVE FORM */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative mb-10 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-purple-bg via-pink-100 to-teal-bg from-ink to-purple text-cream overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-magenta/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-gold text-ink text-xs font-bold uppercase tracking-wider mb-4">
                    Offre 2026
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl text-ink font-black mb-2">
                    Forfait Summer Camp
                  </h3>
                  <p className="text-ink/80 mb-6">Choisissez vos semaines, payez à la semaine.</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl md:text-6xl text-ink font-black">1 200</span>
                    <span className="text-lg text-ink/80">MAD / semaine</span>
                  </div>
                  <p className="text-xs text-ink/60 mt-2">Réduction famille dès le 2e enfant</p>
                </div>
                <ul className="space-y-3">
                  {[
                    "5 jours d'activités encadrées",
                    "Repas du midi et goûter inclus",
                    "Encadrement inclusif (HPI/TDAH/DYS)",
                    "Excursion éducative",
                    "Certificat de participation",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-ink" strokeWidth={3} />
                      </span>
                      <span className="text-sm text-ink/95">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>


            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border-2 border-teal bg-gradient-to-br from-teal/10 to-teal/5 p-12 text-center shadow-soft">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} className="mb-6">
                  <div className="inline-block p-4 rounded-full bg-teal/20">
                    <Check className="w-12 h-12 text-teal" />
                  </div>
                </motion.div>
                <h3 className="font-display font-bold text-3xl md:text-4xl mb-3 text-teal">Inscription confirmée!</h3>
                <p className="font-body text-ink-light mb-6">
                  Merci d'avoir inscrit {formData.numberOfChildren} enfant{formData.numberOfChildren > 1 ? 's' : ''} au Summer Camp EducazenKids.
                  <br />
                  Un email de confirmation a été envoyé à {formData.email}.
                </p>
                <p className="text-sm font-label text-ink-light">
                  Notre équipe vous contactera sous peu pour finaliser les détails.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl p-8 shadow-soft">
                {/* Parent/Guardian Section */}
                <FormSection title="Informations du parent/tuteur">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Nom complet"
                      type="text"
                      value={formData.parentName}
                      onChange={(val) => setFormData({ ...formData, parentName: val })}
                      error={errors.parentName}
                      required
                    />
                    <FormField
                      label="Téléphone"
                      type="tel"
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                      error={errors.phone}
                      required
                    />
                    <FormField
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(val) => setFormData({ ...formData, email: val })}
                      error={errors.email}
                      required
                    />
                    <div className="flex flex-col">
                      <label className="font-label text-sm font-semibold mb-3 text-ink">
                        Nombre d'enfants
                        <span className="text-magenta ml-1">*</span>
                      </label>
                      <div className="inline-flex items-center w-28 rounded-xl overflow-hidden border-2 border-border bg-white">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, numberOfChildren: Math.max(1, formData.numberOfChildren - 1) })}
                          className="px-4 py-2 bg-white hover:bg-cream transition-colors flex items-center justify-center text-lg font-semibold text-ink"
                          aria-label="Réduire"
                        >
                          −
                        </button>
                        <div className="flex-1 text-center font-body text-lg bg-white px-2 text-ink">{formData.numberOfChildren}</div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, numberOfChildren: formData.numberOfChildren + 1 })}
                          className="px-4 py-2 bg-white hover:bg-cream transition-colors flex items-center justify-center text-lg font-semibold text-ink"
                          aria-label="Augmenter"
                        >
                          +
                        </button>
                      </div>
                      {errors.numberOfChildren && <p className="text-red-500 text-xs font-label mt-2">{errors.numberOfChildren}</p>}
                    </div>
                  </div>
                </FormSection>

                {/* Camp Preferences Section */}
                <FormSection title="Préférences du camp">
                  <div className="mb-6">
                    <label className="block font-label text-sm font-semibold mb-4 text-ink">
                      Sélectionnez la/les semaine(s)
                      <span className="text-magenta ml-1">*</span>
                    </label>
                    <div className="space-y-3">
                      {CAMP_WEEKS.map((week) => (
                        <label key={week.value} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.selectedWeeks.includes(week.value)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...formData.selectedWeeks, week.value]
                                : formData.selectedWeeks.filter((w) => w !== week.value);
                              setFormData({ ...formData, selectedWeeks: updated });
                            }}
                            className="w-5 h-5 rounded border-2 border-border accent-magenta cursor-pointer"
                          />
                          <span className="font-body text-ink-light group-hover:text-magenta transition-colors">
                            {week.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.selectedWeeks && <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.selectedWeeks}
                    </p>}
                  </div>
                </FormSection>

                {/* Health & Safety Section */}
                <FormSection title="Informations supplémentaires & urgences">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Nom du contact d'urgence"
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(val) => setFormData({ ...formData, emergencyContactName: val })}
                      error={errors.emergencyContactName}
                      required
                    />
                    <FormField
                      label="Téléphone d'urgence"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(val) => setFormData({ ...formData, emergencyPhone: val })}
                      error={errors.emergencyPhone}
                      required
                    />
                  </div>
                </FormSection>

                {/* Trust signal above submit */}
                <div className="flex flex-wrap items-center justify-center gap-4 py-2 border-y border-border">
                  {[
                    { icon: Shield, text: "Données 100% sécurisées" },
                    { icon: Clock, text: "Réponse sous 24h" },
                    { icon: Users, text: "Aucun paiement immédiat" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-ink-light text-xs font-label">
                      <item.icon className="w-3.5 h-3.5 text-teal" />
                      {item.text}
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <motion.div
                  className="pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex-1 py-5 rounded-xl font-bold text-xl bg-gradient-to-r from-magenta to-purple text-white hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        Confirmer l'inscription <ArrowRight/>
                      </>
                    )}
                  </motion.button>
                </motion.div>

                <p className="text-xs text-center text-ink-light mt-4">
                  <span className="text-magenta">*</span> Champs obligatoires. Nous ne partagerons pas vos données avec des tiers.
                </p>
              </form>
            )}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section {...fadeInUp} className="relative py-28 bg-gradient-to-br from-lavender via-magenta-bg to-cream overflow-hidden">
          <Doodle kind="circle" color="oklch(0.45 0.21 312 / 0.3)" className="absolute top-20 right-20 w-24 h-24" />
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-12 text-ink">Questions <span className="font-handwritten text-magenta">fréquentes</span></h2>

            <div className="space-y-4">
              {FAQ_DATA.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-2 border-border rounded-xl overflow-hidden hover:border-magenta transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between bg-white hover:bg-cream transition-colors"
                  >
                    <span className="font-display font-semibold text-lg text-ink pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: expandedFaq === idx ? 180 : 0 }} className="flex-shrink-0">
                      <ChevronDown className="w-5 h-5 text-magenta" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 py-4 bg-gradient-to-r from-cream to-white border-t border-border text-muted-foreground"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* CTA after FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <p className="font-label text-ink-light mb-4 text-sm">Vous avez encore des questions? Nous sommes là pour vous.</p>
              <MagneticButton
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 bg-ink text-white font-bold px-8 py-3.5 rounded-full hover:bg-ink/80 transition-all shadow"
              >
                Inscrire mon enfant maintenant <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </motion.div>
          </div>
        </motion.section>

        {/* Contact Footer */}
        <motion.section {...fadeInUp} className=" relative z-0 py-16 px-6 lg:px-10 bg-gradient-to-br from-teal-bg via-mint to-cream overflow-hidden">
          <div className="blob bg-teal/20 top-10 left-10 w-96 h-96 animate-float-slow" />
          <div className="blob bg-magenta/15 bottom-10 right-10 w-80 h-80 animate-float-slow" style={{ animationDelay: "3s" }} />
       
          <div className="mx-auto max-w-6xl relative z-2">
            <Doodle kind="star" color="oklch(0.79 0.16 78 / 0.6)" className="absolute top-0 left-1/4 w-10 h-10 animate-float-soft" />
            <Doodle kind="heart" color="oklch(0.52 0.21 357 / 0.5)" className="absolute bottom-10 right-1/4 w-10 h-10 animate-float-soft" delay={0.4} />
            <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-ink">Des <span className="font-handwritten text-magenta">questions?</span></h2>
              <p className="font-body text-ink-light mb-8 max-w-2xl mx-auto text-lg">
                Notre équipe est disponible pour répondre à toutes vos questions sur le Summer Camp EducazenKids.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <motion.a
                  href="tel:+212660686993"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center gap-3 p-4 rounded-xl bg-magenta/10 hover:bg-magenta/20 transition-colors"
                >
                  <Phone className="w-6 h-6 text-magenta" />
                  <div className="text-left">
                    <p className="font-label text-xs text-ink-light">Appel direct</p>
                    <p className="font-display font-bold text-ink">06 60 68 69 93</p>
                  </div>
                </motion.a>

                <motion.a
                  href="mailto:contact@educazenkids.ma"
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center gap-3 p-4 rounded-xl bg-teal/10 hover:bg-teal/20 transition-colors"
                >
                  <Mail className="w-6 h-6 text-teal" />
                  <div className="text-left">
                    <p className="font-label text-xs text-ink-light">Email</p>
                    <p className="font-display font-bold text-ink">contact@educazenkids.ma</p>
                  </div>
                </motion.a>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm font-body text-ink-light">
                <MapPin className="w-4 h-4" />
                <span>EducazenKids • Agadir, Maroc</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </PageShell>
  );
}

// Form Helper Components
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <h3 className="font-display font-bold text-2xl mb-6 pb-3 border-b-2 border-border text-ink">{title}</h3>
      {children}
    </motion.div>
  );
}

function FormField({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="font-label text-sm font-semibold mb-3 text-ink">
        {label}
        {required && <span className="text-magenta ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`px-4 py-3 rounded-xl border-2 font-body transition-all focus:outline-none focus:ring-2 focus:ring-magenta/50 focus:border-magenta ${
          error ? "border-red-400 bg-red-50" : "border-border hover:border-magenta/50"
        }`}
      />
      {error && <p className="text-red-500 text-xs font-label mt-2 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>}
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  error,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="font-label text-sm font-semibold mb-3 text-ink">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`px-4 py-3 rounded-xl border-2 font-body transition-all focus:outline-none focus:ring-2 focus:ring-magenta/50 focus:border-magenta resize-none ${
          error ? "border-red-400 bg-red-50" : "border-border hover:border-magenta/50"
        }`}
      />
      {error && <p className="text-red-500 text-xs font-label mt-2 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>}
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="font-label text-sm font-semibold mb-3 text-ink">
        {label}
        {required && <span className="text-magenta ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-xl border-2 border-border hover:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/50 focus:border-magenta transition-all bg-white appearance-none cursor-pointer font-body text-ink"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}