import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import logoIcon from "../assets/icon.png";

export const Route = createFileRoute("/admin-choice")({
  component: AdminChoice,
});

/* ─── SVG icons ─── */
function IconDashboard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconCRM() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ─── Card data ─── */
const CARDS = [
  {
    id: "dashboard",
    route: "/admin/dashboard",
    chapter: "01",
    accent: "var(--ek-mg)",
    accentRgb: "194,24,91",
    accentBg: "#FFF0F5",
    titleLine1: "Tableau",
    titleLine2: "de bord",
    desc: "Pilotez vos commandes & communications en temps réel.",
    icon: <IconDashboard />,
    features: ["Commandes en ligne", "Messages et rendez-vous", "Statistiques de vente"],
    cta: "Accéder au dashboard",
  },
  {
    id: "crm",
    route: "/crm/dashboard",
    chapter: "02",
    accent: "var(--ek-pp)",
    accentRgb: "123,31,162",
    accentBg: "#F8F0FF",
    titleLine1: "Gestion",
    titleLine2: "clients",
    desc: "Accompagnez chaque famille avec soin et précision.",
    icon: <IconCRM />,
    features: ["Suivi des prospects", "Gestion des paiements", "Certificats automatiques"],
    cta: "Accéder au CRM",
  },
];

/* ─── Animated underline divider — same pattern as form fields ─── */
function Divider({ color, delay = 0.6 }: { color: string; delay?: number }) {
  return (
    <div className="relative h-px w-full" style={{ background: "rgba(45,45,58,0.1)" }}>
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{ background: color, height: 1.5, top: -0.25 }}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.7, ease: "easeOut", delay }}
      />
    </div>
  );
}

/* ─── Single workspace card ─── */
function WorkspaceCard({ card, index, onClick }: { card: (typeof CARDS)[0]; index: number; onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 + index * 0.13, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.995 }}
      className="relative cursor-pointer"
      style={{
        background: "white",
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${hovered ? `rgba(${card.accentRgb},0.35)` : "rgba(45,45,58,0.1)"}`,
        boxShadow: hovered
          ? `0 24px 60px -12px rgba(${card.accentRgb},0.2), 6px 6px 0 rgba(${card.accentRgb},0.1)`
          : "4px 4px 0 rgba(45,45,58,0.06)",
        transition: "border-color 0.25s, box-shadow 0.3s",
      }}
    >
      {/* Chapter label */}
      <div className="flex items-center gap-3 px-6 sm:px-7 pt-6 sm:pt-7">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: card.accent }} />
        <span style={{ fontFamily: "var(--font-label)", fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase" as const, color: card.accent, fontWeight: 700 }}>
          Chapitre {card.chapter} — Module
        </span>
      </div>

      {/* Editorial big title */}
      <div className="px-6 sm:px-7 pt-3 pb-0">
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(34px, 5.5vw, 58px)", lineHeight: 0.92, letterSpacing: "-1.5px", color: "var(--ek-ink)" }}>
          <span style={{ display: "block" }}>{card.titleLine1}</span>
          <span style={{ display: "block", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, color: card.accent }}>
            {card.titleLine2}
          </span>
        </h2>
        <p className="mt-3 mb-5" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(13px, 1.4vw, 14.5px)", color: "var(--ek-ink-lt)", lineHeight: 1.6, maxWidth: 260 }}>
          {card.desc}
        </p>
      </div>

      {/* Animated divider */}
      <div className="px-6 sm:px-7">
        <Divider color={card.accent} delay={0.5 + index * 0.1} />
      </div>

      {/* Features — numbered list matching login's label style */}
      <div className="px-6 sm:px-7 pt-4 pb-5 sm:pb-6 flex flex-col gap-3">
        {card.features.map((f, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + index * 0.1 + i * 0.06 }}
            className="flex items-center gap-3"
          >
            <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase" as const, color: card.accent, opacity: 0.45, minWidth: 18, textAlign: "right" as const }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--ek-ink-lt)" }}>
              {f}
            </span>
          </motion.div>
        ))}
      </div>

      {/* CTA bar — same pill + arrow as login submit */}
      <motion.div
        className="flex items-center justify-between px-6 sm:px-7 py-3.5"
        style={{
          borderTop: "1px solid rgba(45,45,58,0.07)",
          background: hovered ? card.accentBg : "transparent",
          transition: "background 0.3s",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12.5, letterSpacing: 0.3, color: card.accent }}>
          {card.cta}
        </span>
        <motion.span
          animate={{ x: hovered ? 3 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: card.accent, color: "white" }}
        >
          <ArrowUpRight size={12} strokeWidth={2.5} />
        </motion.span>
      </motion.div>

      {/* Ghost icon watermark */}
      <div
        className="absolute pointer-events-none"
        style={{ top: 18, right: 20, color: card.accent, opacity: hovered ? 0.055 : 0.03, transition: "opacity 0.3s", transform: "scale(3.5)", transformOrigin: "top right" }}
      >
        {card.icon}
      </div>
    </motion.div>
  );
}

/* ─── Main ─── */
function AdminChoice() {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3" style={{ background: "var(--ek-canvas)", fontFamily: "var(--font-display)" }}>
        <motion.span
          className="block rounded-full"
          style={{ width: 20, height: 20, border: "2.5px solid rgba(194,24,91,0.2)", borderTopColor: "var(--ek-mg)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <span style={{ fontWeight: 800, fontSize: 16, color: "var(--ek-mg)" }}>Chargement…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{ background: "var(--ek-canvas)", fontFamily: "var(--font-body)", color: "var(--ek-ink)" }}
    >
      {/* Dot-grid paper texture — identical to login */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,45,58,0.07) 1px, transparent 0)", backgroundSize: "22px 22px", opacity: 0.5, zIndex: 0 }}
      />

    
      {/* ─── Main — same 12-col split as login ─── */}
      <main className="relative z-10 min-h-[calc(100vh-57px)] sm:min-h-[calc(100vh-73px)]">

        {/* ══ RIGHT — module picker (mirrors login right form column) ══ */}
        <section className="relative">
       
          {/* Content */}
          <div className="flex-1 flex items-start lg:items-center px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-8">

            <div className="w-full">
              <div className="w-full flex justify-center">
                <div className="relative" style={{ width: "clamp(40px, 10vw, 60px)", paddingBottom: 20 }} >
                  <img src={logoIcon} className="object-contain w-full" alt="Educazen Kids" />
                </div>
              </div>
               
              {/* "01 / Connectez-vous" style intro */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 sm:gap-4">
                  
                  <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(40px, 8vw, 56px)",
                    fontWeight: 400,
                    color: "var(--ek-mg)",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  02
                </span>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontFamily: "var(--font-label)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--ek-ink-lt)", opacity: 0.7, marginBottom: 4 }}>
                      Espace de travail
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(18px, 3vw, 24px)", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
                      Choisissez votre module
                    </h2>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  style={{ borderColor: "rgba(45,45,58,0.08)" }}
                >
                  <button
                      onClick={async () => { await logout(); window.location.href = "/login"; }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ fontFamily: "var(--font-label)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--ek-ink-lt)", fontWeight: 600, border: "1px solid rgba(45,45,58,0.12)", background: "transparent", cursor: "pointer", transition: "color .2s, border-color .2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ek-mg)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(194,24,91,0.3)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ek-ink-lt)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(45,45,58,0.12)"; }}
                    >
                      <IconLogout />
                      Déconnexion
                    </button>
                </motion.div>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-8">
                {CARDS.map((card, i) => (
                  <WorkspaceCard key={card.id} card={card} index={i} onClick={() => navigate({ to: card.route as any })} />
                ))}
              </div>
            
            </div>

          </div>

          {/* Rainbow footer band — identical to login */}
          <div style={{ height: 6, background: "linear-gradient(90deg, var(--ek-mg), var(--ek-pp), var(--ek-tl), var(--ek-gd))", flexShrink: 0 }} />
        </section>
      </main>
    </div>
  );
}