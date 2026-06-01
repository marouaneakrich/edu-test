import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Check, AlertCircle, Mail, Phone, MapPin } from "lucide-react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { TiltCard } from "@/components/site/motion/TiltCard";
import { Doodle } from "@/components/site/motion/Doodle";
import { toast } from "sonner";

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

// Types
interface FormData {
  parentName: string;
  email: string;
  phone: string;
  address: string;
  childName: string;
  dateOfBirth: string;
  specialProfile: string;
  allergies: string;
  medications: string;
  holiday: string;
  durationOption: string;
  specificDates: string;
  fullTime: boolean;
  withLunch: boolean;
  activities: string[];
  specialRequests: string;
  emergencyName: string;
  emergencyPhone: string;
  insurance: string;
  photoConsent: boolean;
  termsAccepted: boolean;
  hearAbout: string;
  promoCode: string;
}

interface FormErrors { [key: string]: string }

// Holiday definitions (approximate dates for Moroccan school holidays)
const HOLIDAYS = [
  { key: "automne", name: "Automne", dates: "Début novembre", duration: "1-2 semaines", theme: "Découverte & Nature", activities: ["Nature", "Arts"], suited: "Tous, idéal pour explorateurs" },
  { key: "hiver", name: "Hiver (Noël)", dates: "Mi-décembre – Début janvier", duration: "3-4 semaines", theme: "Créativité & Projets", activities: ["Ateliers créatifs", "Projets STEM"], suited: "Tous, parfait pour projets longs" },
  { key: "printemps", name: "Printemps", dates: "Fin mars – Début avril", duration: "2-3 semaines", theme: "Sciences & Jeux", activities: ["STEM", "Sports"], suited: "Tous, idéal pour curiosité" },
  { key: "ramadan", name: "Ramadan", dates: "Pendant le Ramadan", duration: "1-2 semaines (variable)", theme: "Rythme adapté & activités calmes", activities: ["Ateliers calmes", "Arts"], suited: "Enfants bénéficiant d'un rythme doux" },
];

const BENEFITS = [
  "Options d'inscription flexibles (période complète, semaines, jours)",
  "Encadrement expert et activités personnalisées",
  "Inclusif: Développement typique, HPI, TDAH, DYS, TSA",
  "Environnement sécurisé axé sur l'apprentissage créatif",
];

const PACKAGES = [
  { name: "Période complète", price: "Sur devis", desc: "Prix pour la période entière du congé" },
  { name: "Par semaine", price: "950 MAD / semaine", desc: "Semaine complète avec déjeuner" },
  { name: "Mi-temps", price: "600 MAD / semaine", desc: "Matinée ou après-midi" },
  { name: "Sans déjeuner", price: "-150 MAD / semaine", desc: "Option sans repas" },
];

const FAQ = [
  { q: "Quelles activités pendant le Ramadan?", a: "Activités calmes et créatives, horaires adaptés et respect du rythme des enfants. Les sorties extérieures sont limitées et les activités physiques sont modulées." },
  { q: "Puis-je inscrire pour quelques jours seulement?", a: "Oui — nous proposons des inscriptions à la journée ou à la semaine selon les congés. Indiquez les dates spécifiques dans le formulaire." },
  { q: "Le déjeuner est-il fourni?", a: "Oui, nous proposons des repas adaptés et prenons en compte les allergies et régimes. Indiquez vos besoins dans le champ 'Allergies'. Option sans déjeuner disponible." },
  { q: "Quelles sont les heures d'arrivée/départ?", a: "Accueil: 8h30 – 9h00. Fin standard: 16h30. Options mi-temps et accueil prolongé sur demande." },
  { q: "Et pour les enfants avec besoins spécifiques?", a: "Nous adaptons les activités et proposons un accompagnement personnalisé. Précisez le profil dans le formulaire et nous reviendrons pour un échange préalable." },
];

const SPECIAL_PROFILES = [
  { value: "typical", label: "Développement typique" },
  { value: "hpi", label: "HPI" },
  { value: "tdah", label: "TDAH" },
  { value: "dys", label: "DYS" },
  { value: "tsa", label: "TSA" },
  { value: "other", label: "Autre" },
];

const ACT_OPTIONS = [
  { value: "art", label: "Art & Peinture" },
  { value: "sports", label: "Sports & Jeux" },
  { value: "nature", label: "Nature & Écologie" },
  { value: "stem", label: "STEM & Programmation" },
  { value: "music", label: "Musique & Danse" },
  { value: "theatre", label: "Théâtre & Expression" },
];


export default function HolidayCampsPage() {
  // Reuse a similar structure and helpers as camp-ete for consistent styling
  const [formData, setFormData] = useState<FormData>({
    parentName: "",
    email: "",
    phone: "",
    address: "",
    childName: "",
    dateOfBirth: "",
    specialProfile: "typical",
    allergies: "",
    medications: "",
    holiday: "hiver",
    durationOption: "full",
    specificDates: "",
    fullTime: true,
    withLunch: true,
    activities: [],
    specialRequests: "",
    emergencyName: "",
    emergencyPhone: "",
    insurance: "",
    photoConsent: false,
    termsAccepted: false,
    hearAbout: "",
    promoCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6 } } as any;

  const validate = () => {
    const e: FormErrors = {};
    if (!formData.parentName.trim()) e.parentName = "Nom requis";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email valide requis";
    if (!formData.phone || !/^[0-9+\s\-()]{8,}$/.test(formData.phone)) e.phone = "Téléphone valide requis";
    if (!formData.childName.trim()) e.childName = "Nom de l'enfant requis";
    if (!formData.dateOfBirth) e.dateOfBirth = "Date de naissance requise";
    if (!formData.emergencyName.trim()) e.emergencyName = "Contact d'urgence requis";
    if (!formData.emergencyPhone.trim()) e.emergencyPhone = "Téléphone d'urgence requis";
    if (!formData.termsAccepted) e.termsAccepted = "Vous devez accepter les conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success("Inscription envoyée ! Nous vous contacterons sous peu.");
    setTimeout(() => setSubmitted(false), 4000);
  };

  const toggleActivity = (value: string) => {
    setFormData((prev) => ({ ...prev, activities: prev.activities.includes(value) ? prev.activities.filter((a) => a !== value) : [...prev.activities, value] }));
  };

  return (
    <PageShell>
      <div className="font-body">
        <PageHero
          eyebrow="Camps de vacances scolaires"
          title={<>Camps de Vacances Scolaires <span className="font-handwritten text-magenta">EducazenKids</span></>}
          subtitle="Automne, Hiver (très populaire), Printemps et Ramadan — programmes inclusifs pour 4-12 ans à Agadir."
          accent="magenta"
        />

        <motion.section {...fadeInUp} className="py-28 bg-gradient-to-br from-lavender via-magenta-bg to-cream overflow-hidden">
          <Doodle kind="circle" color="oklch(0.45 0.21 312 / 0.3)" className="absolute top-20 right-20 w-24 h-24" />
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div className="text-center mb-12">
              <p className="section-num mx-auto justify-center mb-4">Nos périodes</p>
              <h2 className="font-display font-bold text-5xl md:text-6xl">Quatre <span className="font-handwritten text-magenta">périodes</span> dans l'année</h2>
              <p className="text-ink-light mt-4">Choisissez la période qui convient à votre enfant — activités adaptées, encadrement expert.</p>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOLIDAYS.map((h, i) => (
                <motion.div key={h.key} variants={itemVariants} transition={{ delay: i * 0.06 }}>
                  <TiltCard className="h-full">
                    <div className="bg-white rounded-3xl p-6 shadow-sticker h-full border-t-8 border-magenta">
                      <p className="font-label text-xs text-magenta mb-3">{h.dates}</p>
                      <h3 className="font-display font-bold text-2xl mb-2">{h.name}</h3>
                      <p className="text-ink-light mb-3">Durée: {h.duration} • 4-12 ans</p>
                      <p className="mb-4 font-medium">Thème: <span className="text-magenta">{h.theme}</span></p>
                      <ul className="text-ink-light mb-6 list-disc pl-5 space-y-1">
                        {h.activities.map((a) => <li key={a}>{a}</li>)}
                      </ul>
                      <div className="mt-auto flex gap-3">
                        <button onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-magenta to-purple text-white">S'inscrire</button>
                        {h.key === 'hiver' && <span className="inline-flex items-center px-3 rounded-lg bg-magenta/10 text-magenta font-bold text-sm">Le + populaire</span>}
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-8">Pourquoi choisir <span className="font-handwritten text-magenta">nos</span> camps</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => (
                <motion.div key={i} variants={itemVariants} className="p-6 bg-white rounded-2xl border-t-4 border-teal shadow-soft">
                  <h3 className="font-display font-bold text-2xl mb-2">{b.split(' ')[0]}</h3>
                  <p className="text-ink-light">{b}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10 bg-gradient-to-b from-white to-cream">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-8">Comparaison des <span className="font-handwritten text-magenta">périodes</span></h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left rounded-2xl overflow-hidden border-2 border-border">
                <thead className="bg-cream">
                  <tr>
                    <th className="p-4">Période</th>
                    <th className="p-4">Thème</th>
                    <th className="p-4">Activités principales</th>
                    <th className="p-4">Convient pour</th>
                  </tr>
                </thead>
                <tbody>
                  {HOLIDAYS.map((c) => (
                    <tr key={c.key} className="border-t border-border">
                      <td className="p-4 font-semibold">{c.name}</td>
                      <td className="p-4">{c.theme}</td>
                      <td className="p-4">{c.activities.join(', ')}</td>
                      <td className="p-4">{c.suited}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeInUp} className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-5xl md:text-6xl text-center mb-8">Tarifs & <span className="font-handwritten text-magenta">Forfaits</span></h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-8" variants={containerVariants} initial="hidden" whileInView="visible">
              {PACKAGES.map((pkg) => (
                <motion.div key={pkg.name} variants={itemVariants} className={`relative p-8 rounded-2xl border-2 ${pkg.name === 'Période complète' ? 'border-magenta bg-gradient-to-br from-magenta/5 to-purple/5 shadow-xl' : 'bg-white border-border shadow-soft'}`}>
                  <h3 className="font-display font-bold text-2xl mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold mb-4">{pkg.price}</p>
                  <p className="text-ink-light mb-6">{pkg.desc}</p>
                  <button onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })} className={`w-full py-3 rounded-lg font-semibold ${pkg.name === 'Période complète' ? 'bg-gradient-to-r from-magenta to-purple text-white' : 'bg-card border border-border text-foreground'}`}>S'inscrire</button>
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
                    <ChevronDown className="w-5 h-5 text-magenta" />
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

        <motion.section {...fadeInUp} id="form-section" className="py-16 px-6 lg:px-10 bg-gradient-to-r from-ink to-purple ">
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
              <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-8 shadow-lg border border-border">
                {/* Parent info */}
                <div>
                  <h3 className="font-display font-bold text-2xl mb-4">Informations du parent/tuteur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Nom complet *</label>
                      <input value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.parentName ? 'border-destructive' : 'border-border'}`} />
                      {errors.parentName && <p className="text-destructive text-xs mt-1">{errors.parentName}</p>}
                    </div>

                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Email *</label>
                      <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-destructive' : 'border-border'}`} />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Téléphone *</label>
                      <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.phone ? 'border-destructive' : 'border-border'}`} />
                      {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Adresse</label>
                      <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 border-border`} />
                    </div>
                  </div>
                </div>

                {/* Child info */}
                <div>
                  <h3 className="font-display font-bold text-2xl mb-4">Informations de l'enfant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Nom complet de l'enfant *</label>
                      <input value={formData.childName} onChange={(e) => setFormData({ ...formData, childName: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.childName ? 'border-destructive' : 'border-border'}`} />
                      {errors.childName && <p className="text-destructive text-xs mt-1">{errors.childName}</p>}
                    </div>

                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Date de naissance *</label>
                      <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.dateOfBirth ? 'border-destructive' : 'border-border'}`} />
                      {errors.dateOfBirth && <p className="text-destructive text-xs mt-1">{errors.dateOfBirth}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Profil de besoins spéciaux</label>
                      <select value={formData.specialProfile} onChange={(e) => setFormData({ ...formData, specialProfile: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border">
                        {SPECIAL_PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Allergies / Régimes</label>
                      <input value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" placeholder="Ex: arachides, lactose..." />
                    </div>
                  </div>
                </div>

                {/* Camp preferences */}
                <div>
                  <h3 className="font-display font-bold text-2xl mb-4">Préférences du camp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Quelle période ?</label>
                      <select value={formData.holiday} onChange={(e) => setFormData({ ...formData, holiday: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border">
                        {HOLIDAYS.map((h) => <option key={h.key} value={h.key}>{h.name} — {h.dates}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Durée</label>
                      <select value={formData.durationOption} onChange={(e) => setFormData({ ...formData, durationOption: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border">
                        <option value="full">Période complète</option>
                        <option value="week">Semaine individuelle</option>
                        <option value="days">Jours spécifiques</option>
                      </select>
                    </div>
                  </div>

                  {formData.durationOption === 'days' && (
                    <div className="mt-4">
                      <label className="font-label text-sm font-semibold mb-2 block">Sélectionnez les jours</label>
                      <input type="text" placeholder="Choisissez les dates" value={formData.specificDates} onChange={(e) => setFormData({ ...formData, specificDates: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                    </div>
                  )}

                  <div className="mt-4 flex gap-4 items-center">
                    <label className="inline-flex items-center gap-2"><input type="radio" name="time" checked={formData.fullTime} onChange={() => setFormData({ ...formData, fullTime: true })} className="accent-magenta" /> Temps complet (8h30-16h30)</label>
                    <label className="inline-flex items-center gap-2"><input type="radio" name="time" checked={!formData.fullTime} onChange={() => setFormData({ ...formData, fullTime: false })} className="accent-magenta" /> Mi-temps</label>
                    <label className="inline-flex items-center gap-2 ml-auto"><input type="checkbox" checked={formData.withLunch} onChange={(e) => setFormData({ ...formData, withLunch: e.target.checked })} className="accent-magenta" /> Avec déjeuner</label>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ACT_OPTIONS.map((a) => (
                      <label key={a.value} className="flex items-center gap-2"><input type="checkbox" checked={formData.activities.includes(a.value)} onChange={() => toggleActivity(a.value)} className="accent-magenta" /> <span>{a.label}</span></label>
                    ))}
                  </div>
                </div>

                {/* Health & Safety */}
                <div>
                  <h3 className="font-display font-bold text-2xl mb-4">Santé & Sécurité</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Nom du contact d'urgence *</label>
                      <input value={formData.emergencyName} onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.emergencyName ? 'border-destructive' : 'border-border'}`} />
                      {errors.emergencyName && <p className="text-destructive text-xs mt-1">{errors.emergencyName}</p>}
                    </div>
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Téléphone d'urgence *</label>
                      <input value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.emergencyPhone ? 'border-destructive' : 'border-border'}`} />
                      {errors.emergencyPhone && <p className="text-destructive text-xs mt-1">{errors.emergencyPhone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Assurance (optionnel)</label>
                      <input value={formData.insurance} onChange={(e) => setFormData({ ...formData, insurance: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                    </div>
                    <div>
                      <label className="font-label text-sm font-semibold mb-2 block">Médicaments (optionnel)</label>
                      <input value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                    </div>
                  </div>
                </div>

                {/* Consent */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.photoConsent} onChange={(e) => setFormData({ ...formData, photoConsent: e.target.checked })} className="w-5 h-5 mt-1" />
                    <span className="ml-2">Autoriser photos/vidéos pour portfolio/site</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })} className="w-5 h-5 mt-1" />
                    <span className="ml-2">J'accepte les conditions générales d'EducazenKids *</span>
                  </label>
                  {errors.termsAccepted && <p className="text-destructive text-sm flex items-center gap-2 mt-2"><AlertCircle className="w-4 h-4" />{errors.termsAccepted}</p>}
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" disabled={loading} className="flex-1 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-magenta to-purple text-white">{loading ? 'Envoi en cours...' : "S'inscrire maintenant"}</button>
                </div>
                <p className="text-xs text-muted-foreground text-center">* Champs obligatoires. Nous ne partagerons pas vos données avec des tiers.</p>
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
