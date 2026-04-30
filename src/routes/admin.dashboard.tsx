import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

/* ─── SVG Icons ─── */
function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconArrow() {
  return <ArrowUpRight size={13} strokeWidth={2.5} />;
}

/* ─── Animated divider ─── */
function Divider({ color, delay = 0.4 }: { color: string; delay?: number }) {
  return (
    <div className="relative h-px w-full" style={{ background: "rgba(45,45,58,0.09)" }}>
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

/* ─── Stat card (only 2 now) ─── */
const STAT_CONFIGS = [
  {
    key: "totalOrders",
    label: "Commandes",
    sublabel: "Total des commandes reçues",
    chapter: "01",
    accent: "var(--ek-mg)",
    accentRgb: "194,24,91",
    icon: <IconCart />,
    suffix: "",
    href: "/admin/orders",
  },
  {
    key: "totalSubmissions",
    label: "Rendez-vous",
    sublabel: "Demandes & messages reçus",
    chapter: "02",
    accent: "var(--ek-pp)",
    accentRgb: "123,31,162",
    icon: <IconMessage />,
    suffix: "",
    href: "/admin/submissions",
  },
];

function StatCard({
  config,
  value,
  loading,
  index,
}: {
  config: (typeof STAT_CONFIGS)[0];
  value: number | string;
  loading: boolean;
  index: number;
}) {
  const [hovered, setHovered] = React.useState(false);
  const display = loading ? "—" : `${value}${config.suffix}`;

  return (
    <motion.a
      href={config.href}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      className="no-underline block"
      style={{
        background: "white",
        borderRadius: 4,
        border: `1px solid ${hovered ? `rgba(${config.accentRgb},0.3)` : "rgba(45,45,58,0.1)"}`,
        boxShadow: hovered
          ? `0 16px 40px -8px rgba(${config.accentRgb},0.18), 4px 4px 0 rgba(${config.accentRgb},0.1)`
          : "3px 3px 0 rgba(45,45,58,0.06)",
        overflow: "hidden",
        transition: "border-color 0.25s, box-shadow 0.3s",
        textDecoration: "none",
      }}
    >
      {/* Accent top stripe */}
      <div style={{ height: 3, background: `rgba(${config.accentRgb}, 1)`, opacity: hovered ? 1 : 0.6, transition: "opacity 0.25s" }} />

      <div className="px-6 pt-5 pb-5">
        {/* Chapter label */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: config.accent }} />
          <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" as const, color: config.accent, fontWeight: 700 }}>
            {config.chapter} — {config.label}
          </span>
        </div>

        {/* Value */}
        <motion.div
          key={String(value)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(40px, 6vw, 56px)",
            lineHeight: 1,
            color: loading ? "rgba(45,45,58,0.15)" : config.accent,
            letterSpacing: "-2px",
          }}
        >
          {display}
        </motion.div>
        <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--ek-ink-lt)", marginTop: 6 }}>
          {config.sublabel}
        </div>

        {/* Divider + CTA */}
        <div className="mt-5">
          <Divider color={config.accent} delay={0.25 + index * 0.07} />
        </div>

        <div className="flex items-center justify-between mt-4">
          <span style={{ color: config.accent, opacity: 0.4 }}>{config.icon}</span>
          <motion.span
            animate={{ opacity: hovered ? 1 : 0.25, x: hovered ? 0 : -4 }}
            transition={{ duration: 0.2 }}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: hovered ? config.accent : "rgba(45,45,58,0.07)",
              color: hovered ? "white" : "var(--ek-ink-lt)",
              transition: "background 0.25s, color 0.25s",
            }}
          >
            <IconArrow />
          </motion.span>
        </div>
      </div>
    </motion.a>
  );
}

/* ─── Custom tooltip ─── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(45,45,58,0.1)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(45,45,58,0.1)",
        fontFamily: "var(--font-display)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--ek-ink-lt)", marginBottom: 6, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, display: "block" }} />
          <span style={{ fontSize: 12, color: "var(--ek-ink-lt)", fontWeight: 600 }}>{p.name}</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: p.color, marginLeft: "auto", paddingLeft: 12 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Quick action link ─── */
function ActionCard({
  href, icon, title, desc, accent, accentRgb, index,
}: {
  href: string; icon: React.ReactNode; title: string; desc: string;
  accent: string; accentRgb: string; index: number;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 no-underline"
      style={{
        background: hovered ? `rgba(${accentRgb},0.04)` : "transparent",
        border: `1px solid ${hovered ? `rgba(${accentRgb},0.25)` : "rgba(45,45,58,0.09)"}`,
        borderRadius: 4,
        padding: "13px 16px",
        transition: "background 0.25s, border-color 0.25s",
        textDecoration: "none",
      }}
    >
      <span style={{ color: accent, opacity: 0.7, flexShrink: 0 }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--ek-ink)", letterSpacing: "-0.2px" }}>
          {title}
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 12, color: "var(--ek-ink-lt)", marginTop: 1 }}>
          {desc}
        </div>
      </div>
      <motion.span
        animate={{ x: hovered ? 2 : 0, opacity: hovered ? 1 : 0.25 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: hovered ? accent : "rgba(45,45,58,0.08)", color: hovered ? "white" : "var(--ek-ink-lt)", transition: "background 0.25s, color 0.25s" }}
      >
        <IconArrow />
      </motion.span>
    </motion.a>
  );
}

/* ─── Build monthly chart data from raw rows ─── */
function buildChartData(
  orders: { created_at: string }[],
  submissions: { created_at: string }[]
) {
  const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const now = new Date();
  // last 6 months
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()] });
  }

  const count = (rows: { created_at: string }[], key: string) =>
    rows.filter((r) => {
      const d = new Date(r.created_at);
      return `${d.getFullYear()}-${d.getMonth()}` === key;
    }).length;

  return months.map((m) => ({
    month: m.label,
    Commandes: count(orders, m.key),
    "Rendez-vous": count(submissions, m.key),
  }));
}

/* ─── Main dashboard ─── */
function AdminDashboard() {
  const [stats, setStats] = React.useState({ totalOrders: 0, totalSubmissions: 0 });
  const [chartData, setChartData] = React.useState<{ month: string; Commandes: number; "Rendez-vous": number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, submissionsRes] = await Promise.all([
        supabase.from("ez_orders").select("total_amount, order_status, created_at"),
        supabase.from("ez_submissions").select("*, created_at"),
      ]);

      const orders = ordersRes.data ?? [];
      const submissions = submissionsRes.data ?? [];

      setStats({
        totalOrders: orders.length,
        totalSubmissions: submissions.length,
      });

      setChartData(buildChartData(orders, submissions));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statValues: Record<string, number | string> = {
    totalOrders: stats.totalOrders,
    totalSubmissions: stats.totalSubmissions,
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        color: "var(--ek-ink)",
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Dot-grid texture */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,45,58,0.065) 1px, transparent 0)",
          backgroundSize: "22px 22px", opacity: 0.45, zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, paddingBottom: 48 }}>

        {/* ─── Page header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[rgba(45,45,58,0.08)] pb-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--ek-mg)" }} />
              <span style={{ fontFamily: "var(--font-label)", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--ek-mg)", fontWeight: 600 }}>
                Chapitre 03 — Vue d'ensemble
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 0.93, letterSpacing: "-1.5px", color: "var(--ek-ink)" }}>
              <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ display: "block" }}>
                Tableau
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                style={{ display: "block", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, color: "var(--ek-mg)" }}
              >
                de bord
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: "var(--ek-ink-lt)", marginTop: 8, lineHeight: 1.5 }}
            >
              Vue d'ensemble de votre activité
            </motion.p>
          </div>

          {/* Tag chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="flex flex-wrap gap-2"
          >
            {[
              { t: "Commandes", c: "var(--ek-mg)" },
              { t: "Rendez-vous", c: "var(--ek-pp)" },
            ].map((tag, i) => (
              <motion.span
                key={tag.t}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.42 + i * 0.06 }}
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                  border: `1.5px solid ${tag.c}`, color: tag.c,
                  padding: "4px 12px", borderRadius: 100, letterSpacing: 0.3,
                }}
              >
                {tag.t}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* ─── 2 Stat cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {STAT_CONFIGS.map((cfg, i) => (
            <StatCard
              key={cfg.key}
              config={cfg}
              value={statValues[cfg.key]}
              loading={loading}
              index={i}
            />
          ))}
        </div>

        {/* ─── Combined area chart ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "white",
            borderRadius: 4,
            border: "1px solid rgba(45,45,58,0.1)",
            boxShadow: "3px 3px 0 rgba(45,45,58,0.06)",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {/* Chart header */}
          <div style={{ padding: "20px 24px 0" }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ek-mg)" }} />
                  <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--ek-mg)", fontWeight: 700 }}>
                    03 — Activité
                  </span>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", color: "var(--ek-ink)", lineHeight: 1.1 }}>
                  Commandes &{" "}
                  <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, color: "var(--ek-pp)" }}>
                    Rendez-vous
                  </span>
                </h2>
                <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 12.5, color: "var(--ek-ink-lt)", marginTop: 4 }}>
                  Évolution sur les 6 derniers mois
                </p>
              </div>

              {/* Legend pills */}
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { label: "Commandes", color: "#C2185B" },
                  { label: "Rendez-vous", color: "#7B1FA2" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, display: "block" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "var(--ek-ink-lt)" }}>
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Divider color="var(--ek-mg)" delay={0.5} />
            </div>
          </div>

          {/* Chart */}
          <div style={{ padding: "20px 12px 16px" }}>
            {loading ? (
              <div className="flex items-center justify-center" style={{ height: 240 }}>
                <motion.span
                  style={{ width: 22, height: 22, borderRadius: "50%", border: "2.5px solid rgba(194,24,91,0.2)", borderTopColor: "#C2185B", display: "block" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : chartData.every(d => d.Commandes === 0 && d["Rendez-vous"] === 0) ? (
              /* No data placeholder */
              <div className="flex flex-col items-center justify-center gap-2" style={{ height: 240 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "rgba(45,45,58,0.08)", letterSpacing: "-1px" }}>—</div>
                <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--ek-ink-lt)" }}>
                  Aucune donnée pour cette période
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCommandes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C2185B" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#C2185B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRdv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B1FA2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7B1FA2" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,45,58,0.06)" vertical={false} />

                  <XAxis
                    dataKey="month"
                    tick={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, fill: "rgba(45,45,58,0.4)" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, fill: "rgba(45,45,58,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(45,45,58,0.08)", strokeWidth: 1 }} />

                  <Area
                    type="monotone"
                    dataKey="Commandes"
                    stroke="#C2185B"
                    strokeWidth={2.5}
                    fill="url(#gradCommandes)"
                    dot={{ r: 3.5, fill: "#C2185B", strokeWidth: 0 }}
                    activeDot={{ r: 5.5, fill: "#C2185B", strokeWidth: 2, stroke: "white" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Rendez-vous"
                    stroke="#7B1FA2"
                    strokeWidth={2.5}
                    fill="url(#gradRdv)"
                    dot={{ r: 3.5, fill: "#7B1FA2", strokeWidth: 0 }}
                    activeDot={{ r: 5.5, fill: "#7B1FA2", strokeWidth: 2, stroke: "white" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* ─── Quick actions ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "white", borderRadius: 4, border: "1px solid rgba(45,45,58,0.1)", overflow: "hidden", boxShadow: "3px 3px 0 rgba(45,45,58,0.06)" }}
        >
          <div style={{ padding: "20px 22px 16px" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ek-mg)" }} />
              <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--ek-mg)", fontWeight: 700 }}>
                04 — Navigation
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", color: "var(--ek-ink)", lineHeight: 1.1 }}>
              Actions{" "}
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, color: "var(--ek-mg)" }}>rapides</span>
            </h2>
          </div>

          <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
            <ActionCard href="/admin/orders" icon={<IconCart />} title="Voir les commandes" desc="Gérer les commandes clients" accent="var(--ek-mg)" accentRgb="194,24,91" index={0} />
            <ActionCard href="/admin/submissions" icon={<IconMessage />} title="Voir les rendez-vous" desc="Répondre aux demandes" accent="var(--ek-pp)" accentRgb="123,31,162" index={1} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}