import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { Doodle } from "./motion/Doodle";

export function Footer() {
  return (
    <footer className="relative bg-ink text-white overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="blob bg-magenta -top-40 -left-20 w-96 h-96" />
        <div className="blob bg-purple -bottom-40 -right-20 w-[28rem] h-[28rem]" />
      </div>
      <Doodle kind="star" color="oklch(0.79 0.16 78 / 0.4)" className="absolute top-20 right-1/4 w-10 h-10" />
      <Doodle kind="spark" color="oklch(0.62 0.24 358 / 0.4)" className="absolute bottom-32 left-1/3 w-8 h-8" spin />
      <Doodle kind="circle" color="oklch(0.58 0.10 187 / 0.3)" className="absolute top-1/2 right-10 w-14 h-14" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-16">
          <Link to="/" className="logo-style text-5xl md:text-7xl block leading-none">
            <span className="text-magenta-light">educa</span><span className="text-purple">zen</span><span className="text-teal">kids</span>
          </Link>
          <p className="mt-5 font-handwritten text-2xl text-white/70 max-w-xl">
            L'enseignement sur mesure  un cadre bienveillant où chaque enfant trouve sa place. ✦
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h4 className="font-label text-xs text-magenta-light mb-5">Navigation</h4>
            <ul className="space-y-3">
              {[
                ["/", "Accueil"],
                ["/a-propos", "À propos"],
                ["/activites", "Activités"],
                ["/blog", "Blog"],
                ["/boutique", "Boutique"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-semibold">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs text-magenta-light mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3"><Phone className="h-4 w-4 mt-1 text-magenta-light" /><span>٠٦ ٦٠ ٦٨ ٦٩ ٩٣<br/>07 66 68 27 25</span></li>
              <li className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5 text-magenta-light" /><span>contact@educazenkids.ma</span></li>
              <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-magenta-light" /><span>Agadir, Maroc</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs text-magenta-light mb-5">Suivez-nous</h4>
            <div className="flex flex-wrap gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-3 hover:bg-magenta hover:scale-110 hover:-rotate-6 transition-all">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-3 hover:bg-magenta hover:scale-110 hover:rotate-6 transition-all">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full bg-white/10 p-3 hover:bg-magenta hover:scale-110 hover:-rotate-6 transition-all">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="rounded-full bg-white/10 p-3 hover:bg-magenta hover:scale-110 hover:rotate-6 transition-all">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.79a8.16 8.16 0 0 0 4.77 1.52V6.86a4.85 4.85 0 0 1-1.84-.17z" />
                </svg>
              </a>
            </div>
            <p className="mt-6 text-xs text-white/50 font-handwritten text-lg">Ouvert du lundi au vendredi<br/>8h00  18h00</p>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/50 font-label">
          <span>© 2026 EducazenKids  Tous droits réservés</span>
          <span>Dévelopé par Eiden-group</span>
        </div>
      </div>
      <div className="h-1.5 bg-gradient-brand" />
    </footer>
  );
}
