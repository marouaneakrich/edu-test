import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CreditCard,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Search,
  X,
  ClockAlert,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/crm/dashboard")({
  component: CrmDashboard,
});

/* ─── Design tokens (matches admin dashboard) ─── */
const BRAND = {
  mg: { hex: "#C2185B", rgb: "194,24,91",   bg: "#FFF0F5" },
  pp: { hex: "#7B1FA2", rgb: "123,31,162",  bg: "#F8F0FF" },
  tl: { hex: "#00897B", rgb: "0,137,123",   bg: "#E8F8F5" },
  gd: { hex: "#F9A825", rgb: "249,168,37",  bg: "#FFF8EC" },
  bl: { hex: "#1565C0", rgb: "21,101,192",  bg: "#EEF3FB" },
  ink:    "#2D2D3A",
  inkLt:  "#5A5A6A",
  canvas: "#FFFDF9",
};

const FH = "'Nunito', sans-serif";        // headings / numbers
const FE = "'Playfair Display', serif";   // italic subtext
const FL = "'Cormorant Garamond', serif"; // labels / caps

/* ─── Responsive hook ─── */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 480, isTablet: w >= 480 && w < 768, isDesktop: w >= 768, width: w };
}

/* ─── Stat card configs ─── */
const STAT_CONFIGS = [
  {
    key: "totalCustomers",
    chapter: "01",
    label: "Total Clients",
    sublabel: (s: Stats) => `${s.activeCustomers} actifs`,
    brand: BRAND.mg,
    trendBrand: BRAND.tl,
    Icon: Users,
    href: "/crm/customers",
  },
  {
    key: "paidThisMonth",
    chapter: "02",
    label: "Payés ce mois",
    sublabel: (s: Stats) => `${s.unpaidThisMonth} en attente`,
    brand: BRAND.tl,
    trendBrand: BRAND.gd,
    Icon: CreditCard,
    href: "/crm/payments",
  },
  {
    key: "totalDebt",
    chapter: "03",
    label: "Dette totale",
    sublabel: () => "Calculée dynamiquement",
    brand: BRAND.gd,
    trendBrand: BRAND.pp,
    Icon: AlertCircle,
    href: "/crm/customers",
    suffix: " MAD",
    format: (v: number) => v.toFixed(0),
  },
  {
    key: "collectRate",
    chapter: "04",
    label: "Taux de collecte",
    sublabel: () => "Ce mois",
    brand: BRAND.pp,
    trendBrand: BRAND.mg,
    Icon: TrendingUp,
    href: "/crm/payments",
    suffix: "%",
    format: (v: number) => v.toFixed(0),
  },
] as const;

type StatKey = "totalCustomers" | "paidThisMonth" | "totalDebt" | "collectRate";

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  paidThisMonth: number;
  unpaidThisMonth: number;
  totalDebt: number;
  collectRate: number;
}

interface RevenuePoint {
  month: string;
  revenue: number;
}

interface ParentCustomer {
  id: string;
  parent_name: string;
  child_name: string;
  email: string;
  phone: string;
  crm_stage: string;
  monthly_fee?: number;
  child_profile?: string;
}

/* ─── Individual stat card ─── */
function StatCard({
  cfg,
  stats,
  loading,
  index,
}: {
  cfg: (typeof STAT_CONFIGS)[number];
  stats: Stats;
  loading: boolean;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { isMobile } = useBreakpoint();
  const { brand, trendBrand, Icon } = cfg;

  const rawValue = stats[cfg.key as StatKey];
  const display = loading
    ? "—"
    : "format" in cfg && cfg.format
    ? `${cfg.format(rawValue)}${cfg.suffix ?? ""}`
    : `${rawValue}${"suffix" in cfg ? cfg.suffix ?? "" : ""}`;

  return (
    <motion.a
      href={cfg.href}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      style={{
        position: "relative",
        display: "block",
        background: "#fff",
        borderRadius: 6,
        border: `1px solid ${hovered ? `rgba(${brand.rgb},0.28)` : "rgba(45,45,58,0.08)"}`,
        boxShadow: hovered
          ? `0 24px 48px -16px rgba(${brand.rgb},0.22)`
          : "0 1px 2px rgba(45,45,58,0.04)",
        overflow: "hidden",
        textDecoration: "none",
        transition: "border-color .3s, box-shadow .35s",
      }}
    >
      {/* Hover radial bg */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 80% at 100% 0%, ${brand.bg} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top gradient stripe */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, delay: 0.2 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${brand.hex}, ${trendBrand.hex})`,
          transformOrigin: "left",
        }}
      />

      <div style={{ position: "relative", padding: isMobile ? "18px 18px 16px" : "22px 22px 18px" }}>
        {/* Chapter label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isMobile ? 14 : 16 }}>
          <div style={{ width: 18, height: 1.5, background: brand.hex, flexShrink: 0 }} />
          <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: brand.hex }}>
            {cfg.chapter} — {cfg.label}
          </span>
        </div>

        {/* Icon + trend row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: isMobile ? 12 : 14, gap: 8 }}>
          <motion.div
            animate={{ rotate: hovered ? -6 : 0, scale: hovered ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            style={{
              width: isMobile ? 36 : 42,
              height: isMobile ? 36 : 42,
              borderRadius: 4,
              background: brand.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={isMobile ? 17 : 20} strokeWidth={1.8} color={brand.hex} />
          </motion.div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 9px",
            borderRadius: 100,
            background: `rgba(${trendBrand.rgb},0.1)`,
            border: `1px solid rgba(${trendBrand.rgb},0.18)`,
            flexShrink: 0,
          }}>
            <TrendingUp size={10} strokeWidth={2.2} color={trendBrand.hex} />
            <span style={{ fontFamily: FH, fontSize: 10, fontWeight: 700, color: trendBrand.hex }}>Actif</span>
          </div>
        </div>

        {/* Big value */}
        <div style={{
          fontFamily: FH,
          fontWeight: 800,
          fontSize: isMobile ? "clamp(32px, 9vw, 44px)" : "clamp(36px, 5vw, 48px)",
          lineHeight: 1,
          color: BRAND.ink,
          letterSpacing: "-0.02em",
        }}>
          {loading ? (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ display: "inline-block" }}
            >—</motion.span>
          ) : (
            <motion.span
              key={display}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: "inline-block" }}
            >{display}</motion.span>
          )}
        </div>

        <p style={{
          fontFamily: FE,
          fontStyle: "italic",
          fontSize: isMobile ? 12 : 13,
          color: BRAND.inkLt,
          marginTop: 8,
          marginBottom: isMobile ? 14 : 16,
        }}>
          {cfg.sublabel(stats)}
        </p>

        {/* Footer */}
        <div style={{ height: 1, background: "rgba(45,45,58,0.08)", marginBottom: 12 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: BRAND.inkLt }}>
            Voir le détail
          </span>
          <motion.div
            animate={{ x: hovered ? 3 : 0, y: hovered ? -3 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: hovered ? brand.hex : brand.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .25s",
              flexShrink: 0,
            }}
          >
            <ArrowUpRight size={13} strokeWidth={2} color={hovered ? "#fff" : brand.hex} />
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

/* ─── Quick action card ─── */
function ActionCard({
  href, icon, title, desc, accent, accentRgb, index,
}: {
  href: string; icon: React.ReactNode; title: string; desc: string;
  accent: string; accentRgb: string; index: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ x: 3 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
        background: hovered ? `rgba(${accentRgb},0.04)` : "transparent",
        border: `1px solid ${hovered ? `rgba(${accentRgb},0.25)` : "rgba(45,45,58,0.09)"}`,
        borderRadius: 4,
        padding: "12px 14px",
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 4,
        background: `rgba(${accentRgb},0.1)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>{title}</div>
        <div style={{ fontFamily: FE, fontStyle: "italic", fontSize: 11, color: BRAND.inkLt, marginTop: 2 }}>{desc}</div>
      </div>
      <ArrowUpRight size={15} strokeWidth={1.8} color={accent} style={{ flexShrink: 0 }} />
    </motion.a>
  );
}

function ActionButtonCard({
  onClick, icon, title, desc, accent, accentRgb, index,
}: {
  onClick: () => void; icon: React.ReactNode; title: string; desc: string;
  accent: string; accentRgb: string; index: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ x: 3 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
        background: hovered ? `rgba(${accentRgb},0.04)` : "transparent",
        border: `1px solid ${hovered ? `rgba(${accentRgb},0.25)` : "rgba(45,45,58,0.09)"}`,
        borderRadius: 4,
        padding: "12px 14px",
        transition: "background 0.25s, border-color 0.25s",
        width: "100%",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 4,
        background: `rgba(${accentRgb},0.1)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" as const }}>
        <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>{title}</div>
        <div style={{ fontFamily: FE, fontStyle: "italic", fontSize: 11, color: BRAND.inkLt, marginTop: 2 }}>{desc}</div>
      </div>
      <ArrowUpRight size={15} strokeWidth={1.8} color={accent} style={{ flexShrink: 0 }} />
    </motion.button>
  );
}

function PaymentModal({
  open,
  onClose,
  parents,
  searchTerm,
  onSearchTermChange,
  selectedParentId,
  onSelectParent,
  payment,
  onPaymentChange,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  parents: ParentCustomer[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedParentId: string | null;
  onSelectParent: (id: string) => void;
  payment: { amount: number; payment_date: string };
  onPaymentChange: (next: { amount: number; payment_date: string }) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(30,30,46,0.35)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 6,
              border: "1px solid rgba(45,45,58,0.1)",
              boxShadow: "0 32px 80px -16px rgba(45,45,58,0.18), 0 1px 2px rgba(45,45,58,0.04)",
              width: "100%",
              maxWidth: 920,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND.mg.hex}, ${BRAND.pp.hex}, ${BRAND.tl.hex}, ${BRAND.gd.hex})`, flexShrink: 0 }} />
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid rgba(45,45,58,0.08)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              flexShrink: 0,
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 1.5, background: BRAND.tl.hex }} />
                  <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.tl.hex }}>
                    Enregistrer un paiement
                  </span>
                </div>
                <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px", color: BRAND.ink }}>
                  Sélectionner un parent
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: "1px solid rgba(45,45,58,0.1)", background: "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: BRAND.inkLt, flexShrink: 0, transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = BRAND.tl.bg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ position: "relative" }}>
                <Search size={15} color={BRAND.inkLt} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  placeholder="Rechercher par parent, enfant, email ou téléphone"
                  style={{
                    width: "100%",
                    border: "1px solid rgba(45,45,58,0.12)",
                    borderRadius: 6,
                    padding: "10px 12px 10px 34px",
                    fontFamily: FH,
                    fontSize: 13,
                    color: BRAND.ink,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{
                border: "1px solid rgba(45,45,58,0.1)",
                borderRadius: 6,
                overflow: "hidden",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: BRAND.canvas }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: FL, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt }}>Choix</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: FL, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt }}>Parent</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: FL, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt }}>Enfant</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: FL, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt }}>Contact</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: FL, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "20px 12px", textAlign: "center", fontFamily: FE, fontStyle: "italic", color: BRAND.inkLt }}>
                          Aucun parent trouvé
                        </td>
                      </tr>
                    ) : (
                      parents.map((parent) => {
                        const selected = selectedParentId === parent.id;
                        return (
                          <tr
                            key={parent.id}
                            onClick={() => onSelectParent(parent.id)}
                            style={{
                              borderTop: "1px solid rgba(45,45,58,0.07)",
                              cursor: "pointer",
                              background: selected ? "rgba(0,137,123,0.07)" : "#fff",
                            }}
                          >
                            <td style={{ padding: "10px 12px" }}>
                              <input type="radio" checked={selected} onChange={() => onSelectParent(parent.id)} />
                            </td>
                            <td style={{ padding: "10px 12px", fontFamily: FH, fontWeight: 700, fontSize: 13, color: BRAND.ink }}>{parent.parent_name}</td>
                            <td style={{ padding: "10px 12px", fontFamily: FH, fontSize: 13, color: BRAND.ink }}>{parent.child_name}</td>
                            <td style={{ padding: "10px 12px", fontFamily: FH, fontSize: 12, color: BRAND.inkLt }}>{parent.email || parent.phone || "—"}</td>
                            <td style={{ padding: "10px 12px", fontFamily: FH, fontWeight: 700, fontSize: 12, color: BRAND.pp.hex, textTransform: "capitalize" }}>
                              {parent.crm_stage || "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                <input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => onPaymentChange({ ...payment, amount: Number(e.target.value) })}
                  placeholder="Montant"
                  style={{ width: "100%", border: "1px solid rgba(45,45,58,0.12)", borderRadius: 6, padding: "10px 12px", fontFamily: FH, fontSize: 13, boxSizing: "border-box" }}
                />
                <input
                  type="date"
                  value={payment.payment_date}
                  onChange={(e) => onPaymentChange({ ...payment, payment_date: e.target.value })}
                  style={{ width: "100%", border: "1px solid rgba(45,45,58,0.12)", borderRadius: 6, padding: "10px 12px", fontFamily: FH, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ border: "1px solid rgba(45,45,58,0.12)", background: "#fff", borderRadius: 6, padding: "9px 14px", fontFamily: FH, fontWeight: 700, cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving || !selectedParentId || payment.amount <= 0}
                  style={{
                    border: "1px solid rgba(0,137,123,0.2)",
                    background: BRAND.tl.hex,
                    color: "#fff",
                    borderRadius: 6,
                    padding: "9px 14px",
                    fontFamily: FH,
                    fontWeight: 700,
                    cursor: saving ? "wait" : "pointer",
                    opacity: saving || !selectedParentId || payment.amount <= 0 ? 0.6 : 1,
                  }}
                >
                  {saving ? "Enregistrement..." : "Enregistrer le paiement"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RevenueChartCard({
  data,
  totalRevenue,
  loading,
  isMobile,
}: {
  data: RevenuePoint[];
  totalRevenue: number;
  loading: boolean;
  isMobile: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid rgba(45,45,58,0.1)",
        padding: isMobile ? 14 : 18,
        boxShadow: "0 8px 24px -18px rgba(21,101,192,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 18, height: 1.5, background: BRAND.bl.hex, flexShrink: 0 }} />
        <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.bl.hex }}>
          Revenu total
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontFamily: FH,
          fontWeight: 800,
          fontSize: isMobile ? "clamp(24px, 7vw, 32px)" : "clamp(28px, 4vw, 38px)",
          color: BRAND.ink,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {loading ? "—" : `${totalRevenue.toFixed(0)} MAD`}
        </div>
        <div style={{ fontFamily: FE, fontStyle: "italic", fontSize: 12, color: BRAND.inkLt, marginTop: 6 }}>
          Evolution des 6 derniers mois
        </div>
      </div>

      <div style={{ width: "100%", height: isMobile ? 210 : 250 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND.bl.hex} stopOpacity={0.42} />
                <stop offset="100%" stopColor={BRAND.bl.hex} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,45,58,0.08)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: BRAND.inkLt, fontFamily: FH }}
              tickLine={false}
              axisLine={{ stroke: "rgba(45,45,58,0.12)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: BRAND.inkLt, fontFamily: FH }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value: number) => [`${Number(value).toFixed(0)} MAD`, "Revenu"]}
              labelStyle={{ fontFamily: FH, color: BRAND.ink }}
              contentStyle={{
                borderRadius: 6,
                border: "1px solid rgba(45,45,58,0.1)",
                background: "#fff",
                boxShadow: "0 12px 30px -20px rgba(45,45,58,0.45)",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={BRAND.bl.hex}
              strokeWidth={2.4}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ─── Main component ─── */
function CrmDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    activeCustomers: 0,
    paidThisMonth: 0,
    unpaidThisMonth: 0,
    totalDebt: 0,
    collectRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [parents, setParents] = useState<ParentCustomer[]>([]);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
  });
  const { isMobile, isTablet } = useBreakpoint();

  const px = isMobile ? 16 : isTablet ? 24 : 48;
  const py = isMobile ? 20 : isTablet ? 28 : 40;
  const sectionGap = isMobile ? 28 : isTablet ? 36 : 48;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (!showPaymentModal) return;
    fetchParentsForPayment();
  }, [showPaymentModal]);

  useEffect(() => {
    if (!selectedParentId) return;
    const selectedParent = parents.find((p) => p.id === selectedParentId);
    if (selectedParent && selectedParent.monthly_fee) {
      setPaymentForm((prev) => ({
        ...prev,
        amount: selectedParent.monthly_fee || 0,
      }));
    }
  }, [selectedParentId, parents]);

  /* ── Same logic as original ── */
  const fetchParentsForPayment = async () => {
    const { data, error } = await supabase
      .from("ez_crm_customers")
      .select("id, parent_name, child_name, email, phone, crm_stage, monthly_fee, child_profile")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erreur lors du chargement des parents");
      return;
    }
    setParents((data || []) as ParentCustomer[]);
  };

  const savePaymentFromDashboard = async () => {
    if (!selectedParentId) return;
    setIsSavingPayment(true);
    try {
      const selectedParent = parents.find((p) => p.id === selectedParentId);
      if (!selectedParent) {
        toast.error("Parent introuvable");
        return;
      }

      const receiptNumber = `EDU-${paymentForm.payment_date.replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      const periodCovered = new Date(paymentForm.payment_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

      const { error } = await supabase
        .from("ez_crm_payments")
        .insert({
          customer_id: selectedParentId,
          amount: paymentForm.amount,
          payment_date: paymentForm.payment_date,
          payment_method: "cash",
          period_covered: periodCovered,
          receipt_number: receiptNumber,
          certificate_sent: false,
        });

      if (error) throw error;

      toast.success("Paiement enregistré avec succès");
      setShowPaymentModal(false);
      setSelectedParentId(null);
      setPaymentSearch("");
      setPaymentForm({
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
      });
      await fetchDashboardStats();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const filteredParents = parents.filter((parent) => {
    const q = paymentSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      parent.parent_name?.toLowerCase().includes(q) ||
      parent.child_name?.toLowerCase().includes(q) ||
      parent.email?.toLowerCase().includes(q) ||
      parent.phone?.toLowerCase().includes(q)
    );
  });

  const fetchDashboardStats = async () => {
    try {
      const { count: totalCustomers } = await supabase
        .from("ez_crm_customers")
        .select("*", { count: "exact", head: true });

      const { data: customersWithPayments } = await supabase
        .from("ez_crm_customers")
        .select("id");

      let activeCustomers = 0;
      if (customersWithPayments) {
        for (const customer of customersWithPayments) {
          const { count: paymentCount } = await supabase
            .from("ez_crm_payments")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customer.id);
          if (paymentCount && paymentCount > 0) activeCustomers++;
        }
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: paymentsThisMonth } = await supabase
        .from("ez_crm_payments")
        .select("amount, customer_id")
        .gte("payment_date", firstDayOfMonth.toISOString().split("T")[0]);

      const paidThisMonth = paymentsThisMonth?.length || 0;

      let totalDebt = 0;
      if (customersWithPayments) {
        for (const customer of customersWithPayments) {
          const { data: customerData } = await supabase
            .from("ez_crm_customers")
            .select("enrollment_date, monthly_fee")
            .eq("id", customer.id)
            .single();

          if (customerData) {
            const enrollmentDate = new Date(customerData.enrollment_date);
            const currentDate = new Date();
            const daysSinceEnrollment = Math.floor(
              (currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const billingCycles = Math.floor(daysSinceEnrollment / 30);
            const expectedPayments = billingCycles * Number(customerData.monthly_fee);

            const { data: customerPayments } = await supabase
              .from("ez_crm_payments")
              .select("amount")
              .eq("customer_id", customer.id);

            const actualPayments =
              customerPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

            const { data: adjustments } = await supabase
              .from("ez_crm_debt_adjustments")
              .select("amount, adjustment_type")
              .eq("customer_id", customer.id);

            let adjustmentTotal = 0;
            adjustments?.forEach((adj) => {
              if (adj.adjustment_type === "reduce") {
                adjustmentTotal -= Number(adj.amount);
              } else if (adj.adjustment_type === "clear") {
                adjustmentTotal = -expectedPayments + actualPayments;
              }
            });

            const debt = expectedPayments - actualPayments + adjustmentTotal;
            if (debt > 0) totalDebt += debt;
          }
        }
      }

      const collectRate =
        activeCustomers > 0 ? (paidThisMonth / activeCustomers) * 100 : 0;

      const { data: allPayments } = await supabase
        .from("ez_crm_payments")
        .select("amount, payment_date")
        .order("payment_date", { ascending: true });

      const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });
      const monthBuckets = new Map<string, number>();
      const timeline: { key: string; label: string }[] = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        timeline.push({ key, label: monthFormatter.format(d).replace(".", "") });
        monthBuckets.set(key, 0);
      }

      allPayments?.forEach((payment) => {
        if (!payment.payment_date) return;
        const d = new Date(payment.payment_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthBuckets.has(key)) {
          monthBuckets.set(key, (monthBuckets.get(key) || 0) + Number(payment.amount || 0));
        }
      });

      setRevenueData(
        timeline.map(({ key, label }) => ({
          month: label,
          revenue: monthBuckets.get(key) || 0,
        }))
      );

      setStats({
        totalCustomers: totalCustomers || 0,
        activeCustomers,
        paidThisMonth,
        unpaidThisMonth: activeCustomers - paidThisMonth,
        totalDebt,
        collectRate,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "relative",
      background: BRAND.canvas,
      minHeight: "100vh",
      padding: `${py}px ${px}px`,
      fontFamily: FH,
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* Dot-grid texture */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(45,45,58,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        pointerEvents: "none",
        opacity: 0.6,
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" }}>

        {/* ─── Page header ─── */}
        <div style={{ marginBottom: sectionGap }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ width: 22, height: 1.5, background: BRAND.tl.hex, flexShrink: 0 }} />
            <span style={{
              fontFamily: FL, fontSize: 10, fontWeight: 600,
              letterSpacing: isMobile ? 3 : 5,
              textTransform: "uppercase" as const,
              color: BRAND.tl.hex,
            }}>
              Vue d'ensemble — CRM
            </span>
          </div>

          <h1 style={{
            fontFamily: FH,
            fontWeight: 800,
            fontSize: isMobile ? "clamp(26px, 8vw, 34px)" : isTablet ? "clamp(30px, 5vw, 42px)" : "clamp(34px, 5vw, 52px)",
            lineHeight: 1.05,
            color: BRAND.ink,
            marginBottom: isMobile ? 10 : 14,
            letterSpacing: "-0.02em",
          }}>
            <span>Tableau </span>
            <span style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.mg.hex, fontWeight: 500 }}>
              de bord
            </span>
          </h1>

          <p style={{
            fontFamily: FE, fontStyle: "italic",
            fontSize: isMobile ? 13 : 15,
            color: BRAND.inkLt,
            maxWidth: 520,
            lineHeight: 1.6,
            marginBottom: isMobile ? 16 : 20,
          }}>
            Vue d'ensemble de votre gestion de la relation client
          </p>

          {/* Tag chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { t: "Clients", c: BRAND.mg },
              { t: "Paiements", c: BRAND.tl },
              { t: "Dette", c: BRAND.gd },
              { t: "Collecte", c: BRAND.pp },
            ].map((tag, i) => (
              <motion.span
                key={tag.t}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                style={{
                  fontFamily: FL, fontSize: 9, fontWeight: 600,
                  letterSpacing: 2, textTransform: "uppercase" as const,
                  padding: "4px 10px", borderRadius: 100,
                  border: `1px solid rgba(${tag.c.rgb},0.2)`,
                  color: tag.c.hex, background: tag.c.bg,
                }}
              >
                {tag.t}
              </motion.span>
            ))}
          </div>
        </div>

        {/* ─── 4 Stat cards ─── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? 12 : isTablet ? 16 : 20,
          marginBottom: sectionGap,
        }}>
          {STAT_CONFIGS.map((cfg, i) => (
            <StatCard key={cfg.key} cfg={cfg} stats={stats} loading={loading} index={i} />
          ))}
        </div>
        

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 14 : 18,
            alignItems: "stretch",
          }}
        >
          <div style={{ flex: isMobile ? "1 1 auto" : "1.15 1 0" }}>
            <RevenueChartCard
              data={revenueData}
              totalRevenue={revenueData.reduce((sum, point) => sum + point.revenue, 0)}
              loading={loading}
              isMobile={isMobile}
            />
          </div>

          {/* ─── Quick actions ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              flex: "1 1 0",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid rgba(45,45,58,0.1)",
              padding: isMobile ? 14 : 18,
              boxShadow: "0 8px 24px -18px rgba(45,45,58,0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 18, height: 1.5, background: BRAND.gd.hex, flexShrink: 0 }} />
              <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.gd.hex }}>
                Actions rapides
              </span>
            </div>

            <h3 style={{
              fontFamily: FH,
              fontWeight: 800,
              fontSize: isMobile ? "clamp(18px, 5vw, 22px)" : "clamp(20px, 3vw, 26px)",
              color: BRAND.ink,
              marginBottom: isMobile ? 14 : 20,
              letterSpacing: "-0.02em",
            }}>
              Navigation{" "}
              <span style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.gd.hex, fontWeight: 500 }}>
                rapide
              </span>
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: isMobile ? 10 : 12,
            }}>
              <ActionCard
                href="/crm/customers"
                icon={<Users size={17} strokeWidth={1.8} />}
                title="Gérer les clients"
                desc="Voir et modifier les informations des clients"
                accent={BRAND.mg.hex}
                accentRgb={BRAND.mg.rgb}
                index={0}
              />
              <ActionButtonCard
                onClick={() => setShowPaymentModal(true)}
                icon={<CreditCard size={17} strokeWidth={1.8} />}
                title="Enregistrer un paiement"
                desc="Sélectionner un parent et enregistrer"
                accent={BRAND.tl.hex}
                accentRgb={BRAND.tl.rgb}
                index={1}
              />
              <ActionCard
                href="/crm/customers?filter=overdue"
                icon={<ClockAlert size={17} strokeWidth={1.8} />}
                title="Clients en retard"
                desc="Voir les clients avec des paiements en retard"
                accent={BRAND.gd.hex}
                accentRgb={BRAND.gd.rgb}
                index={2}
              />
            </div>
          </motion.div>
        </div>

        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          parents={filteredParents}
          searchTerm={paymentSearch}
          onSearchTermChange={setPaymentSearch}
          selectedParentId={selectedParentId}
          onSelectParent={setSelectedParentId}
          payment={paymentForm}
          onPaymentChange={setPaymentForm}
          onSave={savePaymentFromDashboard}
          saving={isSavingPayment}
        />
      </div>
    </div>
  );
}