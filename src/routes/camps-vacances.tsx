import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Check, Mail, Phone, MapPin } from "lucide-react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { Doodle } from "@/components/site/motion/Doodle";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/camps-vacances")({
  head: () => ({
    meta: [
      { title: "Camps de Vacances EducazenKids | Inscription" },
      { name: "description", content: "Inscrivez votre enfant aux camps scolaires EducazenKids à Agadir (Automne, Hiver, Printemps, Ramadan)." },
      { property: "og:title", content: "Camps de Vacances EducazenKids" },
      { property: "og:description", content: "Camps scolaires inclusifs pour enfants de 4-12 ans à Agadir." },
    ],
  }),
  component: HolidayCampsPage,
});

//TYPES
interface FormData {
  parentName: string;
  email: string;
  phone: string;
  address: string;
  numberOfChildren: number;
  childName: string;
  dateOfBirth: string;
  specialNeeds: string;
  allergies: string;
  medicalConditions: string;
  selectedPeriods: string[];
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

interface FormErrors {
  [key: string]: string;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// ---------------- CONSTANTS ---------------- 

const HOLIDAYS = [
  { 
    key: "autumn", 
    name: "Vacances d'Automne", 
    dates: "Oct - Nov", 
    duration: "1 semaine", 
    theme: "Couleurs d'Automne", 
    color: "gold",
    activities: ["Arts créatifs", "Découverte de la nature", "Bricolage & récupération", "Jeux de société"] 
  },
  { 
    key: "winter", 
    name: "Vacances d'Hiver", 
    dates: "Déc - Jan", 
    duration: "2 semaines", 
    theme: "Magie d'Hiver", 
    color: "purple",
    activities: ["Sports d'hiver adaptés", "Bricolage de Noël", "Atelier cuisine", "Contes et légendes"] 
  },
  { 
    key: "spring", 
    name: "Vacances de Printemps", 
    dates: "Mars - Avril", 
    duration: "1 semaine", 
    theme: "Réveil de la Nature", 
    color: "teal",
    activities: ["Jardinage", "Arts & nature", "Exploration", "Chasse aux œufs"] 
  },
  { 
    key: "ramadan", 
    name: "Vacances Ramadan", 
    dates: "Adapté", 
    duration: "Flexible", 
    theme: "Créativité & Spiritualité", 
    color: "magenta",
    activities: ["Arts calmes", "Lecture et contes", "Méditation", "Activités spirituelles douces"] 
  },
];

const ACTIVITIES_OPTIONS = [
  { value: "arts", label: "Arts Créatifs" },
  { value: "science", label: "Sciences" },
  { value: "sports", label: "Sports" },
];

const SPECIAL_NEEDS_OPTIONS = [
  { value: "typical", label: "Développement typique" },
  { value: "hpi", label: "HPI" },
  { value: "tdah", label: "TDAH" },
  { value: "dys", label: "DYS" },
  { value: "tsa", label: "TSA" },
  { value: "other", label: "Autre" },
];

const CAMP_PERIODS = [
  { value: "autumn", label: "Automne" },
  { value: "winter", label: "Hiver" },
  { value: "spring", label: "Printemps" },
  { value: "ramadan", label: "Ramadan" },
];

const PACKAGES = [
  { name: "Par semaine", price: "950", span:"MAD/semaine", desc: "Semaine complète avec déjeuner" },
  { name: "Mi-temps", price: "600", span:"MAD/semaine", desc: "Matinée ou après-midi" },
  { name: "Période complète", price: "Sur devis", desc: "Prix pour la période entière du congé" },
  { name: "Sans déjeuner", price: "-150", span:"MAD/semaine", desc: "Option sans repas" },
];

const FAQ = [
  { q: "Quelles activités pendant le Ramadan?", a: "Activités calmes et créatives, horaires adaptés et respect du rythme des enfants. Les sorties extérieures sont limitées et les activités physiques sont modulées." },
  { q: "Puis-je inscrire pour quelques jours seulement?", a: "Oui — nous proposons des inscriptions à la journée ou à la semaine selon les congés. Indiquez les dates spécifiques dans le formulaire." },
  { q: "Le déjeuner est-il fourni?", a: "Oui, nous proposons des repas adaptés et prenons en compte les allergies et régimes. Indiquez vos besoins dans le champ 'Allergies'. Option sans déjeuner disponible." },
  { q: "Quelles sont les heures d'arrivée/départ?", a: "Accueil: 8h30 – 9h00. Fin standard: 16h30. Options mi-temps et accueil prolongé sur demande." },
  { q: "Et pour les enfants avec besoins spécifiques?", a: "Nous adaptons les activités et proposons un accompagnement personnalisé. Précisez le profil dans le formulaire et nous reviendrons pour un échange préalable." },
];

const BENEFITS = [
  "Encadrement professionnel avec éducateurs spécialisés",
  "Activités ludiques et éducatives adaptées à chaque âge",
  "Programme inclusif pour tous les profils d'enfants",
  "Locaux sécurisés et matériel de qualité"
];

export default function HolidayCampsPage() {
  const [formData, setFormData] = useState<FormData>({
    parentName: "",
    email: "",
    phone: "",
    address: "",
    numberOfChildren: 1,
    childName: "",
    dateOfBirth: "",
    specialNeeds: "typical",
    allergies: "",
    medicalConditions: "",
    selectedPeriods: [],
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
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const validate = () => {
    const e: FormErrors = {};

    if (!formData.parentName.trim()) e.parentName = "Nom requis";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Email invalide";
    if (!formData.phone.match(/^[0-9+\s\-()]{8,}$/))
      e.phone = "Téléphone invalide";
    if (!formData.childName.trim()) e.childName = "Nom de l'enfant requis";
    if (!formData.dateOfBirth) e.dateOfBirth = "Date de naissance requise";
    if (!formData.emergencyContactName.trim())
      e.emergencyContactName = "Contact d'urgence requis";
    if (!formData.emergencyPhone.trim())
      e.emergencyPhone = "Téléphone d'urgence requis";
    if (formData.selectedPeriods.length === 0)
      e.selectedPeriods = "Choisissez une période";
    if (formData.activities.length === 0)
      e.activities = "Choisissez au moins une activité";
    if (!formData.termsAccepted)
      e.termsAccepted = "Vous devez accepter les conditions";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));

    setLoading(false);
    setSubmitted(true);
    toast.success("Inscription envoyée avec succès");

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <PageShell>
      <div className="font-body">
        <PageHero
          eyebrow="Camps de vacances scolaires"
          title={<>Camps de Vacances Scolaires <span className="font-handwritten text-magenta">EducazenKids</span></>}
          subtitle="Automne, Hiver (très populaire), Printemps et Ramadan programmes inclusifs pour 4-12 ans à Agadir."
          accent="magenta"
        />

        <motion.section {...fadeInUp} className="py-28 bg-gradient-to-br from-lavender via-magenta-bg to-cream overflow-hidden relative">
          <Doodle kind="circle" color="oklch(0.45 0.21 312 / 0.3)" className="absolute top-20 right-20 w-24 h-24" />
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div className="text-center mb-12" {...fadeInUp}>
              <p className="section-num mx-auto justify-center mb-4">Nos périodes</p>
              <h2 className="font-display font-bold text-5xl md:text-6xl md:text-7xl leading-[1.02]">Quatre <span className="font-handwritten text-magenta">périodes</span> dans l'année</h2>
              <p className="text-ink-light mt-4">Choisissez la période qui convient à votre enfant activités adaptées, encadrement expert.</p>
            </motion.div>

            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              whileInView="visible" 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {HOLIDAYS.map((h, i) => (
                <motion.div 
                  key={h.key} 
                  variants={itemVariants} 
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="h-full"
                >
                  <div className={`relative bg-${h.color || 'white'}-bg rounded-3xl p-6 shadow-sticker h-full cursor-pointer ${h.key === 'winter' ? 'ring-2 ring-magenta ring-offset-2' : ''}`}>
                    {/* Decorative doodle */}
                    <Doodle kind="spark" color={`var(--${h.color || 'magenta'})`} className="absolute top-4 right-4 w-6 h-6 opacity-50" />
                    
                    {/* Popular badge for winter */}
                    {h.key === 'winter' && (
                      <div className="absolute -top-2 -right-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-magenta to-purple text-white font-bold text-xs shadow-lg">
                          Le + populaire
                          <Doodle kind="star" className="w-3 h-3 ml-1" color="white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Dates badge */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-${h.color || 'magenta'}/10 text-${h.color || 'magenta'} text-xs font-semibold mb-4`}>
                      {h.dates}
                    </div>
                    
                    <h3 className="font-display font-bold text-2xl mb-2 text-ink">{h.name}</h3>
                    <p className="text-sm text-ink-light mb-3 flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-magenta"></span>
                      Durée: {h.duration} • 4-12 ans
                    </p>
                    
                    {/* Theme with colored badge */}
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-ink-light uppercase tracking-wide">Thème</span>
                      <p className={`font-display font-semibold text-lg text-${h.color || 'magenta'}`}>{h.theme}</p>
                    </div>
                    
                    {/* Activities list */}
                    <div className="mb-12">
                      <span className="text-xs font-semibold text-ink-light uppercase tracking-wide mb-2 block">Activités phares</span>
                      <ul className="space-y-1.5">
                        {h.activities.map((a, idx) => (
                          <li key={idx} className="text-sm text-ink-light flex items-center gap-2">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${h.color || 'magenta'}`}></span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Button */}
                    <Button
                      onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })} 
                      className="absolute bottom-4 left-6 group inline-flex items-center gap-2 rounded-full bg-gradient-hero px-10 py-2 font-display font-bold text-white shadow-glow transition-all hover:shadow-soft cursor-pointer"
                    >
                      S'inscrire
                    </Button>
                  </div>
                  <Doodle kind="spark" color={`var(--${h.color})`} className="absolute top-4 right-4 w-6 h-6 opacity-50" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-8">Pourquoi choisir <span className="font-handwritten text-magenta">nos</span> camps</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => {
                const colors = ["magenta", "purple", "teal", "gold"];
                const color = colors[i % colors.length];
                const num = String(i + 1).padStart(2, "0");
                return (
                  <motion.div key={i} variants={itemVariants} {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.06 }}>
                    <TiltCard className="h-full">
                      <div className={`bg-white rounded-3xl p-8 shadow-sticker h-full border-t-8 border-${color}`}>
                        <p className={`font-label text-xs text-${color} mb-4`}>{num}</p>
                        <h3 className="font-display font-bold text-3xl mb-3">{b.split(' ')[0]}</h3>
                        <p className="text-ink-light leading-relaxed">{b}</p>
                        <Doodle kind="star" color={`var(--${color})`} className="mt-6 w-8 h-8 opacity-60" />
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10 bg-gradient-to-b from-white to-cream">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-12">Tarifs & <span className="font-handwritten text-magenta">Forfaits</span></h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
              {PACKAGES.map((pkg, _idx) => (
                <motion.div
                  key={pkg.name}
                  variants={itemVariants}
                  className={`relative p-8 rounded-2xl border-2 transition-all grid grid-cols-1 justify-between${
                    pkg.name === 'Période complète'
                      ? 'border-magenta bg-gradient-to-br from-magenta/5 to-purple/5 shadow-xl scale-105 md:scale-110'
                      : 'border-border bg-white shadow-soft hover:shadow-md'
                  }`}
                >
                  {pkg.name === 'Période complète' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block bg-gradient-to-r from-magenta to-purple text-white px-4 py-1 rounded-full text-sm font-bold">Plus populaire</span>
                    </div>
                  )}

                  <h3 className="font-display font-semibold text-md text-ink">{pkg.name}</h3>
                  <p className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-purple mb-6 ${ pkg.name === 'Période complète' ? 'text-2xl' : 'text-5xl'} `}>{pkg.price} <span className="text-sm font-semibold">{pkg.span}</span></p>
                  <p className="text-ink-light mb-10">{pkg.desc}</p>

                  <button onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })} className={`w-full py-2 rounded-lg font-semibold transition-all ${pkg.name === 'Période complète' ? 'bg-gradient-to-r from-magenta to-purple text-white hover:shadow-lg' : 'bg-card border border-border text-foreground hover:bg-accent'}`}>
                    S'inscrire
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-12">Questions <span className="font-handwritten text-magenta">fréquentes</span></h2>
            <div className="space-y-4">
              {FAQ.map((faq, idx) => (
                <div key={idx} className="border-2 border-border rounded-xl overflow-hidden hover:border-magenta transition-colors">
                  <button onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)} className="w-full p-6 text-left flex items-center justify-between bg-white">
                    <span className="font-display font-semibold text-lg text-ink pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-magenta transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-6 py-4 bg-cream text-ink-light">
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeInUp} id="form-section" className="py-16 px-6 lg:px-10 bg-gradient-to-r from-ink to-purple">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-2 text-white">Formulaire d'<span className="font-handwritten text-magenta">inscription</span></h2>
            <p className="text-center font-body text-white mb-10">Inscrivez votre enfant pour la période choisie. Champs obligatoires marqués d'un *</p>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border-2 border-teal bg-gradient-to-br from-teal/10 to-teal/5 p-12 text-center shadow-soft">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} className="mb-6">
                  <div className="inline-block p-4 rounded-full bg-teal/20">
                    <Check className="w-12 h-12 text-teal" />
                  </div>
                </motion.div>
                <h3 className="font-display font-bold text-3xl md:text-4xl mb-3 text-teal">Inscription confirmée!</h3>
                <p className="font-body text-ink-light mb-6">Merci — nous avons bien reçu votre demande d'inscription. Un email de confirmation suivra.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl p-8 shadow-xl">
                {/* ================= PARENT ================= */}
                <FormSection title="Informations du parent/tuteur">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Nom complet"
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
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                      error={errors.phone}
                      required
                    />
                    <FormField
                      label="Adresse"
                      value={formData.address}
                      onChange={(val) => setFormData({ ...formData, address: val })}
                    />
                  </div>
                </FormSection>

                {/* ================= CHILD ================= */}
                <FormSection title="Informations de l'enfant">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="font-label text-sm font-semibold mb-3 text-ink">
                        Nombre d'enfants
                        <span className="text-magenta ml-1">*</span>
                      </label>
                      <div className="inline-flex items-center w-32 rounded-xl overflow-hidden border-2 border-border bg-white">
                        <button type="button" onClick={() =>
                          setFormData({
                            ...formData,
                            numberOfChildren: Math.max(1, formData.numberOfChildren - 1),
                          })
                        } className="px-4 py-2 bg-white hover:bg-cream transition-colors flex items-center justify-center text-lg font-semibold text-ink"
                          aria-label="Réduire">−</button>
                        <span className="text-xl font-bold w-8 text-center">{formData.numberOfChildren}</span>
                        <button type="button" onClick={() =>
                          setFormData({
                            ...formData,
                            numberOfChildren: formData.numberOfChildren + 1,
                          })
                        } className="px-4 py-2 bg-white hover:bg-cream transition-colors flex items-center justify-center text-lg font-semibold text-ink"
                          aria-label="Augmenter">+</button>
                      </div>
                      {errors.numberOfChildren && <p className="text-red-500 text-xs font-label mt-2">{errors.numberOfChildren}</p>}
                    </div>

                    <FormField
                      label="Date de naissance"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(val) => setFormData({ ...formData, dateOfBirth: val })}
                      error={errors.dateOfBirth}
                      required={formData.numberOfChildren === 1} // Required if only 1 child, optional if multiple
                    />
                  </div>


                    
                  <div className="mt-6">

                    <FormSelect
                      label="Profil spécial"
                      value={formData.specialNeeds}
                      onChange={(val) => setFormData({ ...formData, specialNeeds: val })}
                      options={SPECIAL_NEEDS_OPTIONS}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 mt-6">

                    <FormTextarea
                      label="Allergies"
                      value={formData.allergies}
                      onChange={(val) => setFormData({ ...formData, allergies: val })}
                      placeholder="Indiquez toutes les allergies alimentaires ou autres"
                    />

                    <FormTextarea
                      label="Conditions médicales"
                      value={formData.medicalConditions}
                      onChange={(val) => setFormData({ ...formData, medicalConditions: val })}
                      placeholder="Médicaments, traitements, etc."
                    />
                  </div>
                </FormSection>

                {/* ================= PERIODS ================= */}
                <FormSection title="Périodes de vacances">
                  <div className="grid grid-cols-2 gap-3">
                    {CAMP_PERIODS.map((p) => (
                      <label key={p.value} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-cream">
                        <input
                          type="checkbox"
                          checked={formData.selectedPeriods.includes(p.value)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.selectedPeriods, p.value]
                              : formData.selectedPeriods.filter((v) => v !== p.value);
                            setFormData({ ...formData, selectedPeriods: updated });
                          }}
                          className="w-4 h-4"
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                  {errors.selectedPeriods && <p className="text-destructive text-xs mt-2">{errors.selectedPeriods}</p>}
                </FormSection>

                {/* ================= CAMP TYPE ================= */}
                <FormSection title="Type de camp">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.campType === "fulltime"}
                        onChange={() => setFormData({ ...formData, campType: "fulltime" })}
                      />
                      Temps complet
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.campType === "parttime"}
                        onChange={() => setFormData({ ...formData, campType: "parttime" })}
                      />
                      Mi-temps
                    </label>
                  </div>
                </FormSection>

                {/* ================= ACTIVITIES ================= */}
                <FormSection title="Activités préférées">
                  <div className="grid grid-cols-2 gap-3">
                    {ACTIVITIES_OPTIONS.map((a) => (
                      <label key={a.value} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-cream">
                        <input
                          type="checkbox"
                          checked={formData.activities.includes(a.value)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.activities, a.value]
                              : formData.activities.filter((v) => v !== a.value);
                            setFormData({ ...formData, activities: updated });
                          }}
                          className="w-4 h-4"
                        />
                        {a.label}
                      </label>
                    ))}
                  </div>
                  {errors.activities && <p className="text-destructive text-xs mt-2">{errors.activities}</p>}
                </FormSection>

                {/* ================= EMERGENCY ================= */}
                <FormSection title="Contact d'urgence">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Nom complet"
                      value={formData.emergencyContactName}
                      onChange={(val) => setFormData({ ...formData, emergencyContactName: val })}
                      error={errors.emergencyContactName}
                      required
                    />
                    <FormField
                      label="Téléphone"
                      value={formData.emergencyPhone}
                      onChange={(val) => setFormData({ ...formData, emergencyPhone: val })}
                      error={errors.emergencyPhone}
                      required
                    />
                  </div>
                </FormSection>

                {/* ================= CONSENT ================= */}
                <FormSection title="Consentements">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.photoConsent}
                        onChange={(e) => setFormData({ ...formData, photoConsent: e.target.checked })}
                        className="w-4 h-4"
                      />
                      J'autorise la prise de photos/vidéos lors des activités
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                        className="w-4 h-4"
                      />
                      J'accepte les conditions générales *
                    </label>
                    {errors.termsAccepted && <p className="text-destructive text-xs">{errors.termsAccepted}</p>}
                  </div>
                </FormSection>

                {/* ================= SUBMIT ================= */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-magenta to-purple text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Envoi en cours..." : "S'inscrire au camp"}
                </button>
              </form>
            )}
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10 bg-gradient-to-br from-purple-bg via-pink-100 to-teal-bg">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-ink">Des <span className="font-handwritten text-magenta">questions?</span></h2>
              <p className="font-body text-ink-light mb-8 max-w-2xl mx-auto text-lg">Notre équipe est disponible pour répondre à toutes vos questions.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <motion.a href="tel:+212660686993" whileHover={{ scale: 1.05 }} className="flex items-center justify-center gap-3 p-4 rounded-xl bg-magenta/10 hover:bg-magenta/20 transition-colors">
                  <Phone className="w-6 h-6 text-magenta" />
                  <div className="text-left"><p className="font-label text-xs text-ink-light">Appel direct</p><p className="font-display font-bold text-ink">06 60 68 69 93</p></div>
                </motion.a>
                <motion.a href="mailto:contact@educazenkids.ma" whileHover={{ scale: 1.05 }} className="flex items-center justify-center gap-3 p-4 rounded-xl bg-teal/10 hover:bg-teal/20 transition-colors">
                  <Mail className="w-6 h-6 text-teal" />
                  <div className="text-left"><p className="font-label text-xs text-ink-light">Email</p><p className="font-display font-bold text-ink">contact@educazenkids.ma</p></div>
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
    <div className="flex flex-col">
      <label className="font-label text-sm font-semibold mb-2 text-ink">
        {label}
        {required && <span className="text-magenta ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`px-4 py-3 rounded-lg border-2 font-body transition-colors focus:outline-none focus:ring-2 focus:ring-magenta/50 ${
          error ? "border-red-500 bg-red-50" : "border-border hover:border-magenta/50"
        }`}
      />
      {error && <p className="text-red-500 text-xs font-label mt-1">{error}</p>}
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
      <label className="font-label text-sm font-semibold mb-2 text-ink">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`px-4 py-3 rounded-lg border-2 font-body transition-colors focus:outline-none focus:ring-2 focus:ring-magenta/50 resize-none ${
          error ? "border-red-500 bg-red-50" : "border-border hover:border-magenta/50"
        }`}
      />
      {error && <p className="text-red-500 text-xs font-label mt-1">{error}</p>}
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
      <label className="font-label text-sm font-semibold mb-2 text-ink">
        {label}
        {required && <span className="text-magenta ml-1">*</span>}
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