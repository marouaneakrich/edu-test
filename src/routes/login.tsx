import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Eye, EyeOff, ArrowUpRight } from "lucide-react";
import logoHeader from "../assets/educazen.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});




function LoginPage() {
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [time, setTime] = React.useState(() => new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      window.location.href = "/admin-choice";
    }
  }, [isAuthenticated, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(identifier, password);
      // toast.success("Bienvenue !");
      window.location.href = "/admin-choice";
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Identifiants invalides";
      toast.error("Erreur de connexion", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden"  style={{ background: "var(--ek-canvas)", fontFamily: "var(--font-body)", color: "var(--ek-ink)" }}>
      <Toaster position="top-center" richColors />

      {/* Dot-grid paper texture */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,45,58,0.07) 1px, transparent 0)", backgroundSize: "22px 22px", opacity: 0.5, zIndex: 0, }} />

      {/* ─── Main layout ─── */}
      {/*
        Mobile  : single column — left editorial section collapses to a compact hero,
                  then the form section below it.
        Desktop : 12-col grid, left 7 / right 5.
      */}
      <main className="relative z-10 flex flex-col lg:grid lg:grid-cols-12 lg:min-h-[calc(100vh-73px)] lg:h-screen xxl:h-auto">

        {/* ══════ LEFT — editorial hero ══════ */}
        <section className="lg:col-span-7 relative px-4 sm:px-6 lg:px-12 pt-4 sm:pt-10 lg:pt-14 pb-8 sm:pb-10 lg:pb-0 border-b lg:border-b-0 lg:border-r overflow-hidden" style={{ borderColor: "rgba(45,45,58,0.08)" }} >

          <div>
            {/* Logo */}
        <motion.div
          initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="relative"
          style={{ width: "clamp(110px, 30vw, 160px)", paddingBottom: 20 }}
        >
          <img src={logoHeader} className="object-contain w-full" alt="Educazen Kids" />
        </motion.div>
          </div>
          {/* Chapter label */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6 sm:mb-8"
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--ek-mg)" }} />
            <span
              style={{
                fontFamily: "var(--font-label)",
                fontSize: 11,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "var(--ek-mg)",
                fontWeight: 600,
              }}
            >
              Chapitre 01 — Connexion
            </span>
          </motion.div>

          {/* Big headline — clamps tighter on mobile */}
          <h1
            className="relative"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(40px, 10vw, 104px)",
              lineHeight: 0.95,
              letterSpacing: "-2px",
            }}
          >
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="block">
              Chaque
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="block italic"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 500, color: "var(--ek-mg)" }}
            >
              enfant
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="block">
              est{" "}
              <span className="relative inline-block">
                unique
                <motion.span
                  className="absolute left-0 right-0"
                  style={{ bottom: "0.08em", height: "0.18em", background: "var(--ek-gd)", opacity: 0.45, zIndex: -1 }}
                  initial={{ scaleX: 0, transformOrigin: "left" }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
              .
            </motion.span>
          </h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 sm:mt-8 max-w-md"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "clamp(14px, 2vw, 17px)",
              lineHeight: 1.6,
              color: "var(--ek-ink-lt)",
            }}
          >
            Un espace pédagogique inclusif où chaque parcours d'apprentissage trouve sa voie.
          </motion.p>

          {/* Tag chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-5 sm:mt-8 flex flex-wrap gap-2"
          >
            {[
              { t: "HPI", c: "var(--ek-mg)" },
              { t: "TDAH", c: "var(--ek-pp)" },
              { t: "DYS", c: "var(--ek-tl)" },
              { t: "TSA", c: "var(--ek-gd)" },
              { t: "Normo-pensant", c: "var(--ek-ink)" },
            ].map((tag, i) => (
              <motion.span
                key={tag.t}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                whileHover={{ y: -2 }}
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  border: `1.5px solid ${tag.c}`,
                  color: tag.c,
                  letterSpacing: 0.5,
                }}
              >
                {tag.t}
              </motion.span>
            ))}
          </motion.div>

          {/* Rotating badge — visible only on lg+ so it doesn't overlap on mobile */}
          <motion.div
            initial={{ opacity: 0, rotate: -25, scale: 0.6 }}
            animate={{ opacity: 1, rotate: -8, scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 120 }}
            className="absolute hidden lg:flex items-center justify-center"
            style={{
              top: 80,
              right: 60,
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: "var(--ek-mg)",
              color: "white",
              boxShadow: "0 12px 30px -10px rgba(194,24,91,0.45)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg width="130" height="130" viewBox="0 0 130 130">
                <defs>
                  <path id="circlePath" d="M 65, 65 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" />
                </defs>
                <text
                  fill="white"
                  style={{ fontFamily: "var(--font-label)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600 }}
                >
                  <textPath href="#circlePath">Inclusivité · Créativité · Sérénité · Potentiel ·</textPath>
                </text>
              </svg>
            </motion.div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28 }}>✦</span>
          </motion.div>

          {/* Sticky-note card — lg+ only */}
          <motion.div
            initial={{ opacity: 0, rotate: 15, y: 20 }}
            animate={{ opacity: 1, rotate: 4, y: 0 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 100 }}
            className="absolute hidden lg:block"
            style={{
              bottom: 120,
              right: 80,
              padding: "16px 20px",
              background: "white",
              border: "1.5px solid var(--ek-ink)",
              borderRadius: 4,
              maxWidth: 220,
              boxShadow: "8px 8px 0 var(--ek-pp)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-label)",
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--ek-pp)",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Note de l'éditeur
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 13,
                lineHeight: 1.5,
                color: "var(--ek-ink)",
              }}
            >
              « L'éducation est un acte d'amour, donc un acte de courage. »
            </div>
          </motion.div>

          {/* Bottom meta row — lg+ only (would overlap form on mobile) */}
          <div
            className="absolute left-6 lg:left-12 right-6 lg:right-12 hidden lg:flex items-end justify-between"
            style={{ bottom: 32 }}
          >
            <div
              style={{
                fontFamily: "var(--font-label)",
                fontSize: 10,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "var(--ek-ink-lt)",
                opacity: 0.5,
              }}
            >
              Éd. Pédagogique · 2026
            </div>
            <div className="flex gap-1">
              {["var(--ek-mg)", "var(--ek-pp)", "var(--ek-tl)", "var(--ek-gd)"].map((c, i) => (
                <span key={i} className="block" style={{ width: 16, height: 4, background: c }} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════ RIGHT — login form ══════ */}
        <section className="lg:col-span-5 relative flex flex-col">
          {/* Status bar */}
          <div
            className="px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between border-b"
            style={{ borderColor: "rgba(45,45,58,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="block w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "var(--ek-tl)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-label)",
                  fontSize: 10,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: "var(--ek-ink-lt)",
                  fontWeight: 600,
                }}
              >
                Système actif · Sécurisé
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-label)",
                fontSize: 10,
                letterSpacing: 2,
                color: "var(--ek-ink-lt)",
                opacity: 0.5,
              }}
            >
              v1.0
            </span>
          </div>

          {/* Form area — centred vertically on desktop, normal flow on mobile */}
          <div className="flex-1 flex items-center px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              {/* Numbered heading */}
              <div className="flex items-baseline gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                  01
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    style={{
                      fontFamily: "var(--font-label)",
                      fontSize: 10,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      color: "var(--ek-ink-lt)",
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Espace administrateur
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "clamp(20px, 4vw, 26px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Connectez-vous
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-1">
                <UnderlineField
                  id="ek-id"
                  label="01 — Identifiant"
                  placeholder="admin@educazenkids.com"
                  value={identifier}
                  onChange={setIdentifier}
                  disabled={isLoading}
                  autoComplete="username"
                  delay={0.4}
                />

                <UnderlineField
                  id="ek-pw"
                  label="02 — Mot de passe"
                  placeholder="• • • • • • • •"
                  value={password}
                  onChange={setPassword}
                  disabled={isLoading}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  delay={0.5}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                      className="p-1.5 rounded transition-colors hover:bg-[var(--ek-mg-bg)] flex-shrink-0"
                      style={{ color: "var(--ek-ink-lt)" }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                {/* CTA button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: isLoading ? 1 : 1.005 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="ek-cta group relative mt-6 sm:mt-8 w-full overflow-hidden rounded-full disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ height: "clamp(44px, 6vw, 50px)", background: "var(--ek-ink)", color: "white" }}
                >
                  <span
                    className="ek-cta-fill absolute inset-0 transition-transform duration-500 ease-out"
                    style={{
                      background: "linear-gradient(90deg, var(--ek-mg), var(--ek-pp))",
                      transform: isLoading ? "translateX(0)" : "translateX(-101%)",
                    }}
                  />
                  <style>{`.ek-cta:hover .ek-cta-fill { transform: translateX(0) !important; }`}</style>

                  <span className="absolute inset-0 flex items-center justify-between px-5 sm:px-7">
                    <span
                      className="relative z-10 flex items-center gap-2 sm:gap-3"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(13px, 2.5vw, 15px)", letterSpacing: 0.3 }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isLoading ? (
                          <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            Vérification…
                          </motion.span>
                        ) : (
                          <motion.span key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            Entrer dans l'espace
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span
                      className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "white", color: "var(--ek-ink)" }}
                    >
                      {isLoading ? (
                        <motion.span
                          className="block rounded-full"
                          style={{ width: 14, height: 14, border: "2px solid rgba(45,45,58,0.2)", borderTopColor: "var(--ek-mg)" }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <ArrowUpRight size={12} strokeWidth={2.5} />
                      )}
                    </span>
                  </span>
                </motion.button>
              </form>

              {/* Footer aphorism */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4"
                style={{ borderColor: "rgba(45,45,58,0.08)" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 13,
                    color: "var(--ek-ink-lt)",
                  }}
                >
                  Apprendre. Grandir. S'épanouir.
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-label)",
                    fontSize: 9,
                    letterSpacing: 2.5,
                    textTransform: "uppercase",
                    color: "var(--ek-ink-lt)",
                    opacity: 0.5,
                    flexShrink: 0,
                  }}
                >
                  Accès restreint
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Rainbow footer band */}
          <div
            style={{
              height: 6,
              background: "linear-gradient(90deg, var(--ek-mg), var(--ek-pp), var(--ek-tl), var(--ek-gd))",
              flexShrink: 0,
            }}
          />
        </section>
      </main>
    </div>
  );
}

/* ─── Underline field ─── */
function UnderlineField({
  id, label, placeholder, value, onChange, disabled,
  type = "text", autoComplete, delay, rightSlot,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
  autoComplete?: string;
  delay: number;
  rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = React.useState(false);
  const active = focused || value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative pt-5 sm:pt-6 pb-3"
    >
      <label
        htmlFor={id}
        className="block mb-2"
        style={{
          fontFamily: "var(--font-label)",
          fontSize: 10,
          letterSpacing: 3,
          textTransform: "uppercase",
          fontWeight: 700,
          color: active ? "var(--ek-mg)" : "var(--ek-ink-lt)",
          transition: "color .2s",
        }}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          disabled={disabled}
          autoComplete={autoComplete}
          /* Prevent iOS zoom: font-size must be ≥ 16px on mobile */
          className="flex-1 min-w-0 bg-transparent outline-none border-0 py-2 disabled:opacity-50"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "max(16px, 12px)", /* 16px prevents iOS auto-zoom */
            fontWeight: 600,
            color: "var(--ek-ink)",
            letterSpacing: 0.2,
          }}
        />
        {rightSlot}
      </div>
      {/* Animated underline */}
      <div className="relative h-px" style={{ background: "rgba(45,45,58,0.15)" }}>
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            background: "linear-gradient(90deg, var(--ek-mg), var(--ek-pp))",
            height: 2,
            top: -0.5,
          }}
          initial={false}
          animate={{ width: active ? "100%" : "0%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}