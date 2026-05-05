import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ShoppingBag, CalendarDays, ChevronDown, TrendingUp, MessageSquare, } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

const BRAND = {
  mg: { hex: "#C2185B", rgb: "194,24,91", bg: "#FFF0F5" },
  pp: { hex: "#7B1FA2", rgb: "123,31,162", bg: "#F8F0FF" },
  tl: { hex: "#00897B", rgb: "0,137,123", bg: "#E8F8F5" },
  gd: { hex: "#F9A825", rgb: "249,168,37", bg: "#FFF8EC" },
  ink: "#2D2D3A",
  inkLt: "#5A5A6A",
  canvas: "#FFFDF9",
};

const FH = "'Nunito', sans-serif";
const FE = "'Playfair Display', serif";
const FL = "'Cormorant Garamond', serif";
const FB = "'Quicksand', sans-serif";

type MetricKey = "totalOrders" | "totalSubmissions";

const METRICS: {
  key: MetricKey;
  chapter: string;
  label: string;
  sublabel: string;
  brand: typeof BRAND.mg;
  trendBrand: typeof BRAND.tl;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  href: string;
}[] = [
  {
    key: "totalOrders",
    chapter: "01",
    label: "Commandes",
    sublabel: "Total des commandes reçues",
    brand: BRAND.mg,
    trendBrand: BRAND.tl,
    Icon: ShoppingBag,
    href: "/admin/orders",
  },
  {
    key: "totalSubmissions",
    chapter: "02",
    label: "Rendez-vous",
    sublabel: "Demandes & messages reçus",
    brand: BRAND.pp,
    trendBrand: BRAND.gd,
    Icon: CalendarDays,
    href: "/admin/submissions",
  },
];

/* ─── Custom hook for breakpoints ─── */
function useBreakpoint() {
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 480,
    isTablet: width >= 480 && width < 768,
    isDesktop: width >= 768,
    width,
  };
}

function StatCard({ cfg, value, loading, index, trendPct,}: {
  cfg: typeof METRICS[number];
  value: number;
  loading: boolean;
  index: number;
  trendPct: number;
}) {
  const [hovered, setHovered] = React.useState(false);
  const { isMobile } = useBreakpoint();
  const { brand, trendBrand, Icon } = cfg;

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

      <div
        style={{
          position: "relative",
          padding: isMobile ? "18px 18px 16px" : "24px 24px 20px",
        }}
      >
        {/* chapter label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isMobile ? 14 : 18 }}>
          <div style={{ width: 18, height: 1.5, background: brand.hex, flexShrink: 0 }} />
          <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: brand.hex }}>
            {cfg.chapter} — {cfg.label}
          </span>
        </div>

        {/* icon + trend pill row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: isMobile ? 12 : 16, gap: 8 }}>
          <motion.div
            animate={{ rotate: hovered ? -6 : 0, scale: hovered ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            style={{
              width: isMobile ? 38 : 44,
              height: isMobile ? 38 : 44,
              borderRadius: 4,
              background: brand.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={isMobile ? 18 : 20} strokeWidth={1.8} color={brand.hex} />
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
            <span style={{ fontFamily: FH, fontSize: 10, fontWeight: 700, color: trendBrand.hex }}>
              +{trendPct}%
            </span>
          </div>
        </div>

        {/* big value */}
        <div style={{
          fontFamily: FH,
          fontWeight: 800,
          fontSize: isMobile ? "clamp(36px, 10vw, 48px)" : "clamp(40px, 6vw, 56px)",
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
              key={value}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: "inline-block" }}
            >{value}</motion.span>
          )}
        </div>

        <p style={{
          fontFamily: FE,
          fontStyle: "italic",
          fontSize: isMobile ? 12 : 13,
          color: BRAND.inkLt,
          marginTop: 8,
          marginBottom: isMobile ? 14 : 18,
        }}>
          {cfg.sublabel}
        </p>

        {/* footer */}
        <div style={{ height: 1, background: "rgba(45,45,58,0.08)", marginBottom: 12 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt }}>
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

function MetricDropdown({ selected, onChange }: { selected: MetricKey; onChange: (k: MetricKey) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();
  const cur = METRICS.find((m) => m.key === selected)!;

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: isMobile ? "8px 10px" : "10px 14px 10px 12px",
          background: "#fff",
          border: `1px solid rgba(${cur.brand.rgb},0.25)`,
          borderRadius: 4,
          cursor: "pointer",
          minWidth: isMobile ? 140 : 180,
          boxShadow: `0 2px 0 rgba(${cur.brand.rgb},0.06)`,
          transition: "border-color .25s",
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: cur.brand.hex,
          boxShadow: `0 0 0 3px rgba(${cur.brand.rgb},0.15)`,
          flexShrink: 0,
        }} />
        <span style={{
          flex: 1,
          textAlign: "left",
          fontFamily: FH,
          fontSize: isMobile ? 12 : 14,
          fontWeight: 700,
          color: BRAND.ink,
        }}>
          {cur.label}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={14} strokeWidth={2} color={cur.brand.hex} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              minWidth: 200,
              background: "#fff",
              border: "1px solid rgba(45,45,58,0.08)",
              borderRadius: 4,
              boxShadow: "0 16px 40px -8px rgba(45,45,58,0.18)",
              overflow: "hidden",
              zIndex: 50,
            }}
          >
            {METRICS.map((m) => {
              const active = m.key === selected;
              return (
                <button
                  key={m.key}
                  onClick={() => { onChange(m.key); setOpen(false); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: active ? m.brand.bg : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${active ? m.brand.hex : "transparent"}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background .2s",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget.style.background = "rgba(45,45,58,0.03)"); }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget.style.background = "transparent"); }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.brand.hex, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>{m.label}</div>
                    <div style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt, marginTop: 2 }}>
                      Chapitre {m.chapter}
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChartTooltip({ active, payload, label, brandHex }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(45,45,58,0.08)",
      borderRadius: 4,
      padding: "8px 12px",
      boxShadow: "0 8px 24px -8px rgba(45,45,58,0.15)",
      fontFamily: FB,
    }}>
      <div style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: BRAND.inkLt, marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandHex }} />
        <span style={{ fontFamily: FH, fontWeight: 800, fontSize: 16, color: BRAND.ink }}>{payload[0].value}</span>
      </div>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, accent, accentRgb, index }: { href: string; icon: React.ReactNode; title: string; desc: string; accent: string; accentRgb: string; index: number; }) 
{
  const [hovered, setHovered] = React.useState(false);
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
      <div style={{ width: 34, height: 34, borderRadius: 4, background: `rgba(${accentRgb},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0,}}>
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

function buildChartData(orders: { created_at: string }[], submissions: { created_at: string }[]) {
  const M = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: M[d.getMonth()] });
  }
  const count = (rows: { created_at: string }[], key: string) =>
    rows.filter((r) => {
      const d = new Date(r.created_at);
      return `${d.getFullYear()}-${d.getMonth()}` === key;
    }).length;
  return months.map((m) => ({
    month: m.label,
    totalOrders: count(orders, m.key),
    totalSubmissions: count(submissions, m.key),
  }));
}

function AdminDashboard() {
  const [stats, setStats] = React.useState({ totalOrders: 0, totalSubmissions: 0 });
  const [chartData, setChartData] = React.useState<{ month: string; totalOrders: number; totalSubmissions: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<MetricKey>("totalOrders");

  const { isMobile, isTablet } = useBreakpoint();

  // Responsive values
  const px = isMobile ? 16 : isTablet ? 24 : 56;
  const py = isMobile ? 20 : isTablet ? 28 : 48;
  const sectionGap = isMobile ? 28 : isTablet ? 36 : 56;
  const chartHeight = isMobile ? 200 : isTablet ? 250 : 320;

  React.useEffect(() => {
    (async () => {
      try {
        const [o, s] = await Promise.all([
          supabase.from("ez_orders").select("total_amount, order_status, created_at"),
          supabase.from("ez_submissions").select("*, created_at"),
        ]);
        const orders = o.data ?? [];
        const submissions = s.data ?? [];
        setStats({ totalOrders: orders.length, totalSubmissions: submissions.length });
        setChartData(buildChartData(orders, submissions));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cur = METRICS.find((m) => m.key === selected)!;
  const empty = chartData.every((d) => d[selected] === 0);

  const trendFor = (k: MetricKey) => {
    const last = chartData[chartData.length - 1]?.[k] ?? 0;
    const prev = chartData[chartData.length - 2]?.[k] ?? 0;
    if (!prev) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  };

  return (
    <div style={{
      position: "relative",
      background: BRAND.canvas,
      minHeight: "100vh",
      padding: `${py}px ${px}px`,
      fontFamily: FB,
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
              textTransform: "uppercase", color: BRAND.tl.hex,
            }}>
              Chapitre 03 — Vue d'ensemble
            </span>
          </div>

          <h1 style={{
            fontFamily: FH, fontWeight: 800,
            fontSize: isMobile ? "clamp(26px, 8vw, 34px)" : isTablet ? "clamp(30px, 5vw, 42px)" : "clamp(34px, 5vw, 58px)",
            lineHeight: 1.05, color: BRAND.ink,
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
            color: BRAND.inkLt, maxWidth: 520,
            lineHeight: 1.6, marginBottom: isMobile ? 16 : 20,
          }}>
            Vue d'ensemble de votre activité
          </p>

          {/* Tag chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              { t: "Commandes", c: BRAND.mg },
              { t: "Rendez-vous", c: BRAND.pp },
            ].map((tag, i) => (
              <motion.span
                key={tag.t}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                style={{
                  fontFamily: FL, fontSize: 9, fontWeight: 600,
                  letterSpacing: 2, textTransform: "uppercase",
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

        {/* ─── 2 STAT CARDS ─── */}
        <div style={{
          display: "grid",
          // On mobile: single column. Tablet+: 2 columns
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: isMobile ? 12 : isTablet ? 16 : 24,
          marginBottom: sectionGap,
        }}>
          {METRICS.map((cfg, i) => (
            <StatCard
              key={cfg.key}
              cfg={cfg}
              index={i}
              value={stats[cfg.key]}
              loading={loading}
              trendPct={Math.max(0, trendFor(cfg.key))}
            />
          ))}
        </div>

        {/* ─── CHART ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "#fff",
            border: "1px solid rgba(45,45,58,0.08)",
            borderRadius: 6,
            padding: isMobile ? "18px 14px 14px" : isTablet ? "24px 20px 18px" : "32px 32px 24px",
            boxShadow: "0 1px 2px rgba(45,45,58,0.04)",
            marginBottom: sectionGap,
          }}
        >
          {/* Chart header — stacks on mobile */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-start",
            justifyContent: "space-between",
            gap: isMobile ? 14 : 20,
            flexWrap: "wrap",
            marginBottom: isMobile ? 16 : 24,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ width: 18, height: 1.5, background: cur.brand.hex, flexShrink: 0 }} />
                <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: cur.brand.hex }}>
                  03 — Activité
                </span>
              </div>
              <h3 style={{
                fontFamily: FH, fontWeight: 800,
                fontSize: isMobile ? "clamp(17px, 5vw, 22px)" : isTablet ? "clamp(20px, 3.5vw, 26px)" : "clamp(24px, 3vw, 32px)",
                lineHeight: 1.1, color: BRAND.ink, letterSpacing: "-0.02em",
              }}>
                Évolution des{" "}
                <span style={{ fontFamily: FE, fontStyle: "italic", color: cur.brand.hex, fontWeight: 500 }}>
                  {cur.label.toLowerCase()}
                </span>
              </h3>
              <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 12, color: BRAND.inkLt, marginTop: 4 }}>
                Sur les 6 derniers mois
              </p>
            </div>

            {/* Dropdown — full width on mobile */}
            <div style={{ width: isMobile ? "100%" : "auto" }}>
              <MetricDropdown selected={selected} onChange={setSelected} />
            </div>
          </div>

          {/* Chart area */}
          <div style={{ width: "100%", height: chartHeight }}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: BRAND.inkLt, fontFamily: FE, fontStyle: "italic", fontSize: 13 }}>
                  Chargement…
                </motion.div>
              ) : empty ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ fontFamily: FH, fontSize: 40, fontWeight: 800, color: `rgba(${cur.brand.rgb}, 0.2)` }}>—</div>
                  <p style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.inkLt, fontSize: 13 }}>Aucune donnée pour cette période</p>
                </motion.div>
              ) : (
                <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }} style={{ width: "100%", height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 8,
                        right: isMobile ? 4 : 8,
                        left: isMobile ? -28 : -20,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient id={`grad-${selected}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={cur.brand.hex} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={cur.brand.hex} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,45,58,0.06)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontFamily: FH, fontSize: isMobile ? 10 : 12, fill: BRAND.inkLt }}
                        axisLine={false}
                        tickLine={false}
                        // On mobile show fewer labels
                        interval={isMobile ? 1 : 0}
                      />
                      <YAxis
                        tick={{ fontFamily: FH, fontSize: isMobile ? 10 : 12, fill: BRAND.inkLt }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={isMobile ? 28 : 36}
                      />
                      <Tooltip
                        content={<ChartTooltip brandHex={cur.brand.hex} />}
                        cursor={{ stroke: `rgba(${cur.brand.rgb},0.15)`, strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey={selected}
                        name={cur.label}
                        stroke={cur.brand.hex}
                        strokeWidth={isMobile ? 2 : 2.5}
                        fill={`url(#grad-${selected})`}
                        dot={{ r: isMobile ? 3 : 4, fill: "#fff", stroke: cur.brand.hex, strokeWidth: 2 }}
                        activeDot={{ r: isMobile ? 5 : 6, fill: cur.brand.hex, stroke: "#fff", strokeWidth: 2 }}
                        animationDuration={700}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── Quick actions ─── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 18, height: 1.5, background: BRAND.gd.hex, flexShrink: 0 }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: BRAND.gd.hex }}>
              04 — Navigation
            </span>
          </div>
          <h3 style={{
            fontFamily: FH, fontWeight: 800,
            fontSize: isMobile ? "clamp(18px, 5vw, 22px)" : isTablet ? "clamp(20px, 3vw, 24px)" : "clamp(22px, 2.6vw, 28px)",
            color: BRAND.ink, marginBottom: isMobile ? 14 : 20, letterSpacing: "-0.02em",
          }}>
            Actions{" "}
            <span style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.gd.hex, fontWeight: 500 }}>
              rapides
            </span>
          </h3>

          <div style={{
            display: "grid",
            // Mobile: 1 col. Tablet+: 2 cols
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: isMobile ? 10 : 12,
          }}>
            <ActionCard
              href="/admin/orders"
              icon={<ShoppingBag size={17} strokeWidth={1.8} />}
              title="Voir les commandes"
              desc="Gérer les commandes clients"
              accent={BRAND.mg.hex}
              accentRgb={BRAND.mg.rgb}
              index={0}
            />
            <ActionCard
              href="/admin/submissions"
              icon={<MessageSquare size={17} strokeWidth={1.8} />}
              title="Voir les rendez-vous"
              desc="Répondre aux demandes"
              accent={BRAND.pp.hex}
              accentRgb={BRAND.pp.rgb}
              index={1}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
