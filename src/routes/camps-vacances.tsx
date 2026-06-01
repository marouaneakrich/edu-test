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

const HEAR_OPTIONS = ["Bouche à oreille", "Réseaux sociaux", "École", "Affiche", "Autre"];

export default function HolidayCampsPage() {
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
  const [expanded, setExpanded] = useState<number | null>(null);

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

    // TODO: send to API
  };

  const toggleActivity = (value: string) => {
    setFormData((prev) => ({ ...prev, activities: prev.activities.includes(value) ? prev.activities.filter((a) => a !== value) : [...prev.activities, value] }));
  };

  return (
    <PageShell>
      <div className="font-body">
        <PageHero
          eyebrow="Camps de Vacances"
          title={<>Camps de Vacances Scolaires <span className="font-handwritten text-magenta">EducazenKids</span></>}
          subtitle="Programmes pendant les congés scolaires: Automne, Hiver, Printemps et Ramadan. Inscription ouverte pour enfants de 4-12 ans."
          accent="magenta"
        />

        {/* Holiday Cards */}
        <motion.section className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-4xl mb-8">Nos Camps de Vacances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOLIDAYS.map((h) => (
                <TiltCard key={h.key} className="p-6 bg-white rounded-2xl border-2 border-border shadow-soft">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold text-2xl">{h.name}</h3>
                      <span className="text-sm font-label text-ink-light">{h.dates}</span>
                    </div>
                    <p className="text-sm text-ink-light mb-2">Durée: {h.duration}</p>
                    <p className="text-sm text-ink-light mb-3">4-12 ans</p>
                    <p className="mb-4 font-medium">Thème: {h.theme}</p>
                    <div className="flex-1">
                      <ul className="list-disc pl-5 text-sm text-ink-light space-y-1">
                        {h.activities.map((a) => (<li key={a}>{a}</li>))}
                      </ul>
                    </div>
                    <div className="mt-6">
                      <button onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-2 rounded-xl bg-gradient-to-r from-magenta to-purple text-white font-bold">S'inscrire</button>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Why Choose Section */}
        <motion.section className="py-16 px-6 lg:px-10 bg-gradient-to-br from-cream to-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-4xl mb-8">Pourquoi choisir nos Camps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border-2 border-border shadow-soft">
                  <h4 className="font-display font-semibold mb-2">{b.split(' ')[0]}</h4>
                  <p className="text-sm text-ink-light">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Comparison Table */}
        <motion.section className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-4xl mb-6">Comparatif des Congés</h2>
            <div className="overflow-auto bg-white rounded-2xl border-2 border-border p-4 shadow-soft">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr className="text-sm text-ink-light">
                    <th className="px-4 py-2">Congé</th>
                    <th className="px-4 py-2">Thème</th>
                    <th className="px-4 py-2">Activités principales</th>
                    <th className="px-4 py-2">Idéal pour</th>
                  </tr>
                </thead>
                <tbody>
                  {HOLIDAYS.map((h) => (
                    <tr key={h.key} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold">{h.name}</td>
                      <td className="px-4 py-3">{h.theme}</td>
                      <td className="px-4 py-3">{h.activities.join(', ')}</td>
                      <td className="px-4 py-3">{h.suited}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* Pricing */}
        <motion.section className="py-16 px-6 lg:px-10 bg-gradient-to-b from-white to-cream">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display font-bold text-4xl mb-8">Tarifs</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {PACKAGES.map((p) => (
                <div key={p.name} className="p-6 bg-white rounded-2xl border-2 border-border shadow-soft">
                  <h3 className="font-display font-bold mb-2">{p.name}</h3>
                  <div className="text-2xl font-bold mb-3">{p.price}</div>
                  <p className="text-sm text-ink-light">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display font-bold text-4xl mb-8">FAQ</h2>
            <div className="space-y-4">
              {FAQ.map((f, i) => (
                <div key={i} className="border-2 border-border rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full p-4 text-left bg-white flex items-center justify-between">
                    <span className="font-display font-semibold">{f.q}</span>
                    <ChevronDown className="w-5 h-5 text-magenta" />
                  </button>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-cream text-ink-light">
                        {f.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Form */}
        <motion.section id="form-section" className="py-16 px-6 lg:px-10 bg-gradient-to-r from-ink to-purple text-white">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display font-bold text-4xl mb-2">Formulaire d'inscription</h2>
            <p className="mb-6">Veuillez remplir le formulaire pour inscrire votre enfant.</p>

            {submitted ? (
              <div className="rounded-3xl p-8 bg-teal/10 text-center">
                <Check className="w-12 h-12 text-teal mx-auto mb-4" />
                <h3 className="font-display font-bold text-2xl">Inscription reçue</h3>
                <p className="text-sm text-ink-light">Nous vous contacterons rapidement pour confirmer.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl text-ink space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Nom complet du parent*</label>
                    <input value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.parentName ? 'border-destructive' : 'border-border'}`} />
                    {errors.parentName && <p className="text-destructive text-xs mt-1">{errors.parentName}</p>}
                  </div>

                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Email*</label>
                    <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-destructive' : 'border-border'}`} />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Téléphone*</label>
                    <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.phone ? 'border-destructive' : 'border-border'}`} />
                    {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Adresse</label>
                    <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 border-border`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Nom de l'enfant*</label>
                    <input value={formData.childName} onChange={(e) => setFormData({ ...formData, childName: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.childName ? 'border-destructive' : 'border-border'}`} />
                    {errors.childName && <p className="text-destructive text-xs mt-1">{errors.childName}</p>}
                  </div>

                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Date de naissance*</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.dateOfBirth ? 'border-destructive' : 'border-border'}`} />
                    {errors.dateOfBirth && <p className="text-destructive text-xs mt-1">{errors.dateOfBirth}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Profil spécial</label>
                    <select value={formData.specialProfile} onChange={(e) => setFormData({ ...formData, specialProfile: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border">
                      {SPECIAL_PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Allergies / Régime</label>
                    <input value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                  </div>
                </div>

                <div>
                  <label className="font-label text-sm font-semibold mb-2 block">Médicaments (optionnel)</label>
                  <input value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Quel congé?*</label>
                    <select value={formData.holiday} onChange={(e) => setFormData({ ...formData, holiday: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border">
                      {HOLIDAYS.map((h) => <option key={h.key} value={h.key}>{h.name}</option>)}
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
                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Sélectionnez les jours</label>
                    <input type="text" placeholder="Choisissez les dates" value={formData.specificDates} onChange={(e) => setFormData({ ...formData, specificDates: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.fullTime} onChange={() => setFormData({ ...formData, fullTime: true })} className="accent-magenta" />
                    <span className="ml-2">Temps plein</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={!formData.fullTime} onChange={() => setFormData({ ...formData, fullTime: false })} className="accent-magenta" />
                    <span className="ml-2">Part-time (matin ou après-midi)</span>
                  </label>

                  <label className="ml-auto flex items-center gap-2">
                    <input type="checkbox" checked={formData.withLunch} onChange={(e) => setFormData({ ...formData, withLunch: e.target.checked })} className="accent-magenta" />
                    <span className="ml-2">Avec déjeuner</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {ACT_OPTIONS.map((a) => (
                    <label key={a.value} className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.activities.includes(a.value)} onChange={() => toggleActivity(a.value)} className="accent-magenta" />
                      <span>{a.label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="font-label text-sm font-semibold mb-2 block">Demandes spéciales</label>
                  <textarea value={formData.specialRequests} onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Contact d'urgence*</label>
                    <input value={formData.emergencyName} onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.emergencyName ? 'border-destructive' : 'border-border'}`} />
                    {errors.emergencyName && <p className="text-destructive text-xs mt-1">{errors.emergencyName}</p>}
                  </div>

                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Téléphone d'urgence*</label>
                    <input value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} className={`w-full px-4 py-3 rounded-lg border-2 ${errors.emergencyPhone ? 'border-destructive' : 'border-border'}`} />
                    {errors.emergencyPhone && <p className="text-destructive text-xs mt-1">{errors.emergencyPhone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Assurance (optionnel)</label>
                    <input value={formData.insurance} onChange={(e) => setFormData({ ...formData, insurance: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                  </div>

                  <div>
                    <label className="font-label text-sm font-semibold mb-2 block">Code promo</label>
                    <input value={formData.promoCode} onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-border" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked={formData.photoConsent} onChange={(e) => setFormData({ ...formData, photoConsent: e.target.checked })} className="accent-magenta mt-1" />
                    <span>Autorise photos/vidéos</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })} className="accent-magenta mt-1" />
                    <span>J'accepte les conditions *</span>
                  </label>
                  {errors.termsAccepted && <p className="text-destructive text-xs mt-1 ml-4">{errors.termsAccepted}</p>}
                </div>

                <div className="flex gap-4 mt-4">
                  <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-magenta to-purple text-white font-bold">{loading ? 'Envoi...' : "Soumettre l'inscription"}</button>
                  <a href="/" className="py-3 px-6 rounded-xl bg-white text-ink font-semibold">Retour</a>
                </div>

                <p className="text-xs text-ink-light mt-2">Nous respectons la confidentialité des données.</p>
              </form>
            )}
          </div>
        </motion.section>

        {/* Footer Contact */}
        <motion.section className="py-16 px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl bg-white p-8 text-center shadow-soft">
              <h3 className="font-display font-bold text-2xl mb-2">Contact</h3>
              <p className="mb-4">06 60 68 69 93 • contact@educazenkids.ma</p>
              <a href="/" className="text-magenta font-semibold">Retour à l'accueil</a>
            </div>
          </div>
        </motion.section>
      </div>
    </PageShell>
  );
}
