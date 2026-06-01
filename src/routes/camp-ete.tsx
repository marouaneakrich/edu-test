import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Check, AlertCircle, Mail, Phone, MapPin } from "lucide-react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { Doodle } from "@/components/site/motion/Doodle";
import { toast } from "sonner";

export const Route = createFileRoute("/camp-ete")({
  head: () => ({
    meta: [
      { title: "Camp d'été EducazenKids 2026 | Inscription" },
      { name: "description", content: "Inscrivez votre enfant au camp d'été EducazenKids 2026. Activités créatives, apprentissage en plein air et environnement sécurisé." },
      { property: "og:title", content: "Camp d'été EducazenKids" },
      { property: "og:description", content: "Rejoignez notre camp d'été inclusif pour enfants de 4-12 ans." },
    ],
  }),
  component: SummerCampPage,
});

interface FormData {
  // Parent/Guardian
  parentName: string;
  email: string;
  phone: string;
  address: string;
  // Child
  numberOfChildren: number;
  dateOfBirth: string;
  specialNeeds: string;
  allergies: string;
  medicalConditions: string;
  // Camp Preferences
  selectedWeeks: string[];
  campType: "fulltime" | "parttime";
  activities: string[];
  specialRequests: string;
  // Health & Safety
  emergencyContactName: string;
  emergencyPhone: string;
  insurance: string;
  medications: string;
  photoConsent: boolean;
  termsAccepted: boolean;
  // Additional (removed from form)
}

interface FormErrors {
  [key: string]: string;
}

const BENEFITS = [
  { title: "Activités créatives", desc: "Art, musique, danse et expression artistique pour développer la créativité", color: "magenta", num: "01" },
  { title: "Apprentissage en plein air", desc: "Découverte de la nature, écologie et exploration en toute sécurité", color: "purple", num: "02" },
  { title: "Approche personnalisée", desc: "Adaptation pour chaque enfant, y compris ceux avec besoins spéciaux", color: "teal", num: "03" },
  { title: "Environnement sécurisé", desc: "Encadrement professionnel, protocoles de santé stricts et bien-être prioritaire", color: "gold", num: "04" },
];

const SCHEDULE = {
  "4-6 ans": ["09:00 - Accueil et jeux libres", "10:00 - Activité créative", "11:30 - Récréation", "12:00 - Déjeuner", "13:00 - Sieste/repos", "14:30 - Activité ludique", "16:00 - Goûter"],
  "7-9 ans": ["09:00 - Accueil", "09:30 - Activité STEM ou Nature", "11:00 - Jeux de groupe", "12:00 - Déjeuner", "13:00 - Activité artistique", "14:30 - Sport/Plein air", "16:00 - Goûter"],
  "10-12 ans": ["09:00 - Accueil", "09:30 - Projet collectif", "11:00 - Ateliers spécialisés", "12:00 - Déjeuner", "13:00 - Sport/Aventure", "14:30 - Code/Innovation", "16:00 - Débriefing/Jeux"],
};

const PRICING = [
  { name: "1 Semaine", duration: "5 jours", price: "1,200 MAD", includes: ["5 jours de camp", "Repas du midi", "Goûter quotidien", "Activités variées", "Certificat de participation"] },
  { name: "2 Semaines", duration: "10 jours", price: "2,100 MAD", includes: ["10 jours de camp", "Repas du midi", "Goûter quotidien", "Activités variées", "Excursion éducative", "Projet final"], special: true },
  { name: "Mois complet", duration: "20 jours", price: "3,800 MAD", includes: ["20 jours de camp", "Repas du midi", "Goûter quotidien", "Toutes les activités", "2 excursions", "Projet final + Exposition"] },
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
  { value: "art", label: "Art & Peinture" },
  { value: "sports", label: "Sports & Jeux" },
  { value: "nature", label: "Nature & Écologie" },
  { value: "stem", label: "STEM & Programmation" },
  { value: "music", label: "Musique & Danse" },
  { value: "theatre", label: "Théâtre & Expression" },
];

const CAMP_WEEKS = [
  { value: "week1", label: "Semaine 1: 23-27 juin" },
  { value: "week2", label: "Semaine 2: 30 juin - 4 juillet" },
  { value: "week3", label: "Semaine 3: 7-11 juillet" },
  { value: "week4", label: "Semaine 4: 14-18 juillet" },
  { value: "week5", label: "Semaine 5: 21-25 juillet" },
];

// HEAR_ABOUT_OPTIONS removed — not used on this form

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
    // hearAbout/promoCode removed
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.parentName.trim()) newErrors.parentName = "Nom requis";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email valide requis";
    if (!formData.phone.trim() || !/^[0-9+\s\-()]{8,}$/.test(formData.phone))
      newErrors.phone = "Téléphone valide requis";

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);
    toast.success("Inscription envoyée avec succès!");

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
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
        // hearAbout/promoCode removed
      });
      setSubmitted(false);
    }, 3000);
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

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6 },
  };

  return (
    <PageShell>
      <div className="font-body">
      <PageHero
        eyebrow="Camp d'été 2026"
        title={<>Rejoignez notre <span className="font-handwritten text-magenta">aventure</span> estivale</>}
        subtitle="Activités créatives, apprentissage ludique et environnement inclusif pour enfants de 4-12 ans (23 juin - 25 juillet)."
        accent="magenta"
      />

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
                    <p className={`font-label text-xs text-${benefit.color} mb-4`}>{benefit.num}</p>
                    <p className="text-4xl mb-4">{benefit.icon}</p>
                    <h3 className="font-display font-bold text-3xl mb-3">{benefit.title}</h3>
                    <p className="text-ink-light leading-relaxed">{benefit.desc}</p>
                    <Doodle kind="star" color={`var(--${benefit.color})`} className="mt-6 w-8 h-8 opacity-60" />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Program Overview */}
      <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-12 text-ink">Vue d'ensemble du <span className="font-handwritten text-magenta">programme</span></h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {Object.entries(SCHEDULE).map(([ageGroup, schedule], idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="p-8 rounded-2xl bg-white border-l-4 border-magenta shadow-soft hover:shadow-md transition-all"
              >
                <h3 className="font-display font-bold text-2xl md:text-3xl mb-4 text-ink">
                  {ageGroup}
                </h3>
                <div className="space-y-2">
                  {schedule.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-sm text-ink-light font-body flex items-start gap-2"
                    >
                      <span className="text-magenta font-bold mt-1">•</span>
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="rounded-3xl bg-white border-t-4 border-teal p-8 shadow-soft">
            <h3 className="font-display font-bold text-2xl md:text-3xl mb-6 flex items-center gap-2 text-ink">
                Activités proposées
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ACTIVITIES_OPTIONS.map((activity) => (
                <div key={activity.value} className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-magenta" />
                  <span className="font-body text-ink-light">{activity.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10 bg-gradient-to-b from-white to-cream">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-12 text-ink">Tarifs & <span className="font-handwritten text-magenta">Forfaits</span></h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {PRICING.map((package_, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`relative p-8 rounded-2xl border-2 transition-all ${
                  package_.special
                    ? "border-magenta bg-gradient-to-br from-magenta/5 to-purple/5 shadow-xl scale-105 md:scale-110"
                    : "border-border bg-white shadow-soft hover:shadow-md"
                }`}
              >
                {package_.special && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block bg-gradient-to-r from-magenta to-purple text-white px-4 py-1 rounded-full text-sm font-bold">
                      Plus populaire
                    </span>
                  </div>
                )}

                <h3 className="font-display font-bold text-2xl md:text-3xl mb-2 text-ink">{package_.name}</h3>
                <p className="font-label text-ink-light mb-4">{package_.duration}</p>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-purple mb-6">
                  {package_.price}
                </div>

                <div className="space-y-3 mb-6">
                  {package_.includes.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-body text-ink-light">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" })}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    package_.special
                      ? "bg-gradient-to-r from-magenta to-purple text-white hover:shadow-lg"
                      : "bg-card border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  Inscrire maintenant
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10">
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
        </div>
      </motion.section>

      {/* Registration Form Section */}
      <motion.section
        {...fadeInUp}
        id="form-section"
        className="py-16 px-6 lg:px-10 bg-gradient-to-r from-ink to-purple "
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-2 text-white">Formulaire d'<span className="font-handwritten text-magenta">inscription</span></h2>
          <p className="text-center font-body text-white mb-10">
            Remplissez tous les champs pour inscrire votre enfant au camp d'été
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border-2 border-teal bg-gradient-to-br from-teal/10 to-teal/5 p-12 text-center shadow-soft"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} className="mb-6">
                <div className="inline-block p-4 rounded-full bg-teal/20">
                  <Check className="w-12 h-12 text-teal" />
                </div>
              </motion.div>
              <h3 className="font-display font-bold text-3xl md:text-4xl mb-3 text-teal">Inscription confirmée!</h3>
              <p className="font-body text-ink-light mb-6">
                Merci d'avoir inscrit {formData.numberOfChildren} enfant{formData.numberOfChildren > 1 ? 's' : ''} au camp d'été EducazenKids.
                <br />
                Un email de confirmation a été envoyé à {formData.email}.
              </p>
              <p className="text-sm font-label text-ink-light">
                Notre équipe vous contactera sous peu pour finaliser les détails.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-8 shadow-lg border border-border">
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
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(val) => setFormData({ ...formData, email: val })}
                    error={errors.email}
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
                    label="Adresse (optionnel)"
                    type="text"
                    value={formData.address}
                    onChange={(val) => setFormData({ ...formData, address: val })}
                  />
                </div>
              </FormSection>

              {/* Child Information Section */}
              <FormSection title="Informations de l'enfant">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="font-label text-sm font-semibold mb-2 text-ink">
                      Nombre d'enfants
                      <span className="text-magenta">*</span>
                    </label>
                    <div className="inline-flex items-center w-32 border-2 border-border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, numberOfChildren: Math.max(1, formData.numberOfChildren - 1) })}
                        className="px-3 py-2 bg-white hover:bg-magenta/5 flex items-center justify-center text-lg"
                        aria-label="Réduire"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center font-body text-lg bg-white px-2">{formData.numberOfChildren}</div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, numberOfChildren: formData.numberOfChildren + 1 })}
                        className="px-3 py-2 bg-white hover:bg-magenta/5 flex items-center justify-center text-lg"
                        aria-label="Augmenter"
                      >
                        +
                      </button>
                    </div>
                    {errors.numberOfChildren && <p className="text-destructive text-xs font-label mt-1">{errors.numberOfChildren}</p>}
                  </div>

                  <FormField
                    label="Date de naissance"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(val) => setFormData({ ...formData, dateOfBirth: val })}
                    error={errors.dateOfBirth}
                    required={formData.numberOfChildren === 1}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label="Profil de besoins spéciaux"
                    value={formData.specialNeeds}
                    onChange={(val) => setFormData({ ...formData, specialNeeds: val })}
                    options={SPECIAL_NEEDS_OPTIONS}
                  />
                </div>

                <FormTextarea
                  label="Allergies/restrictions alimentaires (optionnel)"
                  value={formData.allergies}
                  onChange={(val) => setFormData({ ...formData, allergies: val })}
                  placeholder="Ex: arachides, produits laitiers, gluten..."
                />

                <FormTextarea
                  label="Conditions médicales (optionnel)"
                  value={formData.medicalConditions}
                  onChange={(val) => setFormData({ ...formData, medicalConditions: val })}
                  placeholder="Ex: asthme, épilepsie, etc."
                />
              </FormSection>

              {/* Camp Preferences Section */}
              <FormSection title="Préférences du camp">
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-4">Sélectionnez la/les semaine(s) *</label>
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
                        <span className="font-medium text-foreground group-hover:text-magenta transition-colors">
                          {week.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.selectedWeeks && <p className="text-destructive text-sm mt-2">{errors.selectedWeeks}</p>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-4">Type de camp *</label>
                  <div className="flex gap-6">
                    {[
                      { value: "fulltime", label: "Temps complet (8h30-16h30)" },
                      { value: "parttime", label: "Mi-temps (8h30-12h30)" },
                    ].map((type) => (
                      <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="campType"
                          value={type.value}
                          checked={formData.campType === type.value}
                          onChange={(e) => setFormData({ ...formData, campType: e.target.value as "fulltime" | "parttime" })}
                          className="w-4 h-4 accent-magenta cursor-pointer"
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-4">Activités intéressées *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ACTIVITIES_OPTIONS.map((activity) => (
                      <label key={activity.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.activities.includes(activity.value)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.activities, activity.value]
                              : formData.activities.filter((a) => a !== activity.value);
                            setFormData({ ...formData, activities: updated });
                          }}
                          className="w-4 h-4 rounded border-2 border-border accent-magenta cursor-pointer"
                        />
                        <span className="text-sm group-hover:text-magenta transition-colors">{activity.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.activities && <p className="text-destructive text-sm mt-2">{errors.activities}</p>}
                </div>

                <FormTextarea
                  label="Demandes spéciales (optionnel)"
                  value={formData.specialRequests}
                  onChange={(val) => setFormData({ ...formData, specialRequests: val })}
                  placeholder="Partagez toute information utile pour adapter l'expérience de votre enfant..."
                />
              </FormSection>

              {/* Health & Safety Section */}
              <FormSection title="Santé & Sécurité">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Assurance (optionnel)"
                    type="text"
                    value={formData.insurance}
                    onChange={(val) => setFormData({ ...formData, insurance: val })}
                    placeholder="Ex: Nom et numéro de police"
                  />
                  <FormTextarea
                    label="Médicaments (optionnel)"
                    value={formData.medications}
                    onChange={(val) => setFormData({ ...formData, medications: val })}
                    placeholder="Listez les médicaments avec dosages si applicable"
                  />
                </div>
              </FormSection>

              {/* Consent Section */}
              <FormSection title="Consentements">
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.photoConsent}
                      onChange={(e) => setFormData({ ...formData, photoConsent: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-border accent-magenta cursor-pointer mt-1"
                    />
                    <span className="text-sm group-hover:text-magenta transition-colors">
                      Autoriser la prise de photos et vidéos pendant le camp pour le portfolio/site web
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-border accent-magenta cursor-pointer mt-1"
                    />
                    <span className="text-sm group-hover:text-magenta transition-colors">
                      J'accepte les conditions générales et la politique de confidentialité d'EducazenKids *
                    </span>
                  </label>

                  {errors.termsAccepted && <p className="text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.termsAccepted}
                  </p>}
                </div>
              </FormSection>

              {/* Additional Info Section removed per request */}

              {/* Submit Button */}
              <motion.div
                className="flex gap-4 pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-magenta to-purple text-white hover:shadow-xl disabled:opacity-50 transition-all"
                >
                  {loading ? "Envoi en cours..." : "S'inscrire maintenant"}
                </button>
              </motion.div>

              <p className="text-xs text-muted-foreground text-center">
                * Champs obligatoires. Nous ne partagerons pas vos données avec des tiers.
              </p>
            </form>
          )}
        </div>
      </motion.section>

      {/* Contact Footer */}
      <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10 bg-gradient-to-br from-purple-bg via-pink-100 to-teal-bg">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-ink">Des <span className="font-handwritten text-magenta">questions?</span></h2>
            <p className="font-body text-ink-light mb-8 max-w-2xl mx-auto text-lg">
              Notre équipe est disponible pour répondre à toutes vos questions sur le camp d'été EducazenKids.
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
      <h3 className="font-display font-bold text-2xl mb-6 pb-4 border-b-2 border-border text-ink">{title}</h3>
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
    <div className="flex flex-col mb-4">
      <label className="font-label text-sm font-semibold mb-4 text-ink">
        {label}
        {required && <span className="text-magenta">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`px-4 py-3 rounded-lg border-2 font-body transition-colors focus:outline-none focus:ring-2 focus:ring-magenta/50 ${
          error ? "border-destructive bg-destructive/5" : "border-border hover:border-magenta/50"
        }`}
      />
      {error && <p className="text-destructive text-xs font-label mt-1">{error}</p>}
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
    <div className="flex flex-col mb-4">
      <label className="font-label text-sm font-semibold mb-4 text-ink">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`px-4 py-3 rounded-lg border-2 font-body transition-colors focus:outline-none focus:ring-2 focus:ring-magenta/50 resize-none ${
          error ? "border-destructive bg-destructive/5" : "border-border hover:border-magenta/50"
        }`}
      />
      {error && <p className="text-destructive text-xs font-label mt-1">{error}</p>}
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
    <div className="flex flex-col mb-4">
      <label className="font-label text-sm font-semibold mb-4 text-ink">
        {label}
        {required && <span className="text-magenta">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-lg border-2 border-border hover:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/50 transition-colors bg-white appearance-none cursor-pointer font-body"
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
