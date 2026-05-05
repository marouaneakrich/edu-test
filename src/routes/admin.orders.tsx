import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase, type EzOrder } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Eye, X, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

/* ─── Brand tokens (mirrored from dashboard) ─── */
const BRAND = {
  mg: { hex: "#C2185B", rgb: "194,24,91",   bg: "#FFF0F5" },
  pp: { hex: "#7B1FA2", rgb: "123,31,162",  bg: "#F8F0FF" },
  tl: { hex: "#00897B", rgb: "0,137,123",   bg: "#E8F8F5" },
  gd: { hex: "#F9A825", rgb: "249,168,37",  bg: "#FFF8EC" },
  ink:    "#2D2D3A",
  inkLt:  "#5A5A6A",
  canvas: "#FFFDF9",
};

const FH = "'Nunito', sans-serif";          // headings / numbers
const FE = "'Playfair Display', serif";     // italic subtitles
const FL = "'Cormorant Garamond', serif";   // tiny labels / caps
const FB = "'Quicksand', sans-serif";       // body

/* ─── Responsive hook ─── */
function useBreakpoint() {
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: width < 480, isTablet: width >= 480 && width < 768, isDesktop: width >= 768, width };
}

/* ─── Status config ─── */
const STATUS = {
  pending:    { label: "En attente",  color: BRAND.gd.hex, bg: BRAND.gd.bg, rgb: BRAND.gd.rgb },
  processing: { label: "En cours",    color: BRAND.pp.hex, bg: BRAND.pp.bg, rgb: BRAND.pp.rgb },
  delivered:  { label: "Livré",       color: BRAND.tl.hex, bg: BRAND.tl.bg, rgb: BRAND.tl.rgb },
} as const;
type StatusKey = keyof typeof STATUS;

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status as StatusKey] ?? { label: status, color: BRAND.inkLt, bg: "#F7F6FC", rgb: "90,90,106" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: FH, fontWeight: 700, fontSize: 11, letterSpacing: 0.3,
      color: s.color, background: s.bg,
      border: `1px solid rgba(${s.rgb},0.3)`,
      padding: "3px 10px", borderRadius: 100,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ─── Status select ─── */
function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const s = STATUS[value as StatusKey] ?? STATUS.pending;

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: FH, fontWeight: 700, fontSize: 11,
          color: s.color, background: s.bg,
          border: `1px solid rgba(${s.rgb},0.3)`,
          padding: "4px 10px", borderRadius: 100, cursor: "pointer",
          transition: "opacity 0.15s",
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
        {s.label}
        <ChevronDown size={10} strokeWidth={2.5} style={{ opacity: 0.6, flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
              background: "white", borderRadius: 6,
              border: "1px solid rgba(45,45,58,0.08)",
              boxShadow: "0 16px 40px -8px rgba(45,45,58,0.18)",
              minWidth: 148, overflow: "hidden",
            }}
          >
            {Object.entries(STATUS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { onChange(key); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px",
                  background: key === value ? cfg.bg : "transparent",
                  border: "none",
                  borderLeft: `3px solid ${key === value ? cfg.color : "transparent"}`,
                  cursor: "pointer",
                  fontFamily: FH, fontWeight: 700, fontSize: 12,
                  color: cfg.color, transition: "background 0.15s", textAlign: "left",
                }}
                onMouseEnter={e => { if (key !== value) (e.currentTarget.style.background = "rgba(45,45,58,0.03)"); }}
                onMouseLeave={e => { if (key !== value) (e.currentTarget.style.background = "transparent"); }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                {cfg.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Order detail modal ─── */
function OrderModal({ order, onClose }: { order: EzOrder; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(30,30,46,0.35)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 6,
          border: "1px solid rgba(45,45,58,0.1)",
          boxShadow: `0 32px 80px rgba(45,45,58,0.18), 0 1px 2px rgba(45,45,58,0.04)`,
          width: "100%", maxWidth: 600, maxHeight: "90vh",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}
      >
        {/* top gradient stripe */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND.mg.hex}, ${BRAND.pp.hex}, ${BRAND.tl.hex}, ${BRAND.gd.hex})`, flexShrink: 0 }} />

        {/* Modal header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(45,45,58,0.08)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12, flexShrink: 0,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 18, height: 1.5, background: BRAND.mg.hex }} />
              <span style={{ fontFamily: FL, fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: BRAND.mg.hex, fontWeight: 600 }}>
                Détail commande
              </span>
            </div>
            <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px", color: BRAND.ink }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={order.order_status} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 6,
              border: "1px solid rgba(45,45,58,0.1)", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: BRAND.inkLt, flexShrink: 0, transition: "background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BRAND.mg.bg; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Client info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Client",        value: order.customer_name },
              { label: "Email",         value: order.customer_email },
              { label: "Téléphone",     value: order.customer_phone },
              { label: "Adresse",       value: `${order.customer_address}, ${order.customer_city}` },
              { label: "Montant total", value: `${order.total_amount} MAD` },
              { label: "Date",          value: new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "12px 14px", background: BRAND.canvas, borderRadius: 4, border: "1px solid rgba(45,45,58,0.07)" }}>
                <div style={{ fontFamily: FL, fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 600, marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 13, color: BRAND.ink, lineHeight: 1.3 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Items */}
          {Array.isArray(order.items) && order.items.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 16, height: 1.5, background: BRAND.mg.hex }} />
                <span style={{ fontFamily: FL, fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: BRAND.mg.hex, fontWeight: 600 }}>
                  Articles commandés
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(order.items as { product_name: string; quantity: number; subtotal: number }[]).map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", background: "white",
                    border: "1px solid rgba(45,45,58,0.08)", borderRadius: 4, gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 13.5, color: BRAND.ink, letterSpacing: "-0.2px" }}>
                        {item.product_name}
                      </div>
                      <div style={{ fontFamily: FE, fontStyle: "italic", fontSize: 12, color: BRAND.inkLt, marginTop: 2 }}>
                        Qté : {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontFamily: FH, fontWeight: 800, fontSize: 14, color: BRAND.mg.hex, flexShrink: 0 }}>
                      {item.subtotal} MAD
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div style={{ padding: "12px 14px", background: BRAND.mg.bg, border: `1px solid rgba(${BRAND.mg.rgb},0.15)`, borderRadius: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 14, height: 1.5, background: BRAND.mg.hex }} />
                <span style={{ fontFamily: FL, fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: BRAND.mg.hex, fontWeight: 600 }}>Notes</span>
              </div>
              <div style={{ fontFamily: FE, fontStyle: "italic", fontSize: 13, color: BRAND.ink, lineHeight: 1.6 }}>
                {order.notes}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main page ─── */
function AdminOrders() {
  const [orders, setOrders]               = React.useState<EzOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = React.useState<EzOrder[]>([]);
  const [loading, setLoading]             = React.useState(true);
  const [searchTerm, setSearchTerm]       = React.useState("");
  const [statusFilter, setStatusFilter]   = React.useState<string>("all");
  const [selectedOrder, setSelectedOrder] = React.useState<EzOrder | null>(null);

  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? 16 : isTablet ? 24 : 56;
  const py = isMobile ? 20 : isTablet ? 28 : 48;
  const sectionGap = isMobile ? 24 : isTablet ? 32 : 48;

  React.useEffect(() => { fetchOrders(); }, []);

  React.useEffect(() => {
    let f = orders;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(o => o.customer_name.toLowerCase().includes(q) || o.customer_email.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") f = f.filter(o => o.order_status === statusFilter);
    setFilteredOrders(f);
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("ez_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch { toast.error("Erreur lors du chargement des commandes"); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("ez_orders").update({ order_status: newStatus }).eq("id", orderId);
      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchOrders();
    } catch { toast.error("Erreur lors de la mise à jour"); }
  };

  const exportToCSV = () => {
    const headers = ["ID","Client","Email","Téléphone","Adresse","Total","Statut","Date"];
    const rows = filteredOrders.map(o => [o.id, o.customer_name, o.customer_email, o.customer_phone, o.customer_address, o.total_amount.toString(), o.order_status, new Date(o.created_at).toLocaleDateString("fr-FR")]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: BRAND.canvas }}>
        <motion.span
          style={{ display: "block", width: 24, height: 24, borderRadius: "50%", border: `2.5px solid rgba(${BRAND.mg.rgb},0.2)`, borderTopColor: BRAND.mg.hex }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  /* ── Responsive table vs cards ── */
  const showTable = !isMobile;

  return (
    <div style={{ position: "relative", background: BRAND.canvas, minHeight: "100vh", padding: `${py}px ${px}px`, fontFamily: FB, overflow: "hidden", boxSizing: "border-box" }}>

      {/* Dot-grid texture */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(rgba(45,45,58,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none", opacity: 0.6, zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" }}>

        {/* ─── Page header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-end",
            justifyContent: "space-between",
            gap: isMobile ? 16 : 20,
            borderBottom: "1px solid rgba(45,45,58,0.08)",
            paddingBottom: isMobile ? 20 : 28,
            marginBottom: sectionGap,
          }}
        >
          <div>
            {/* chapter eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 22, height: 1.5, background: BRAND.mg.hex, flexShrink: 0 }} />
              <span style={{ fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: BRAND.mg.hex }}>
                Chapitre 04 — Commandes
              </span>
            </div>

            {/* h1 */}
            <h1 style={{
              fontFamily: FH, fontWeight: 800,
              fontSize: isMobile ? "clamp(26px, 8vw, 34px)" : isTablet ? "clamp(30px, 5vw, 42px)" : "clamp(34px, 5vw, 58px)",
              lineHeight: 1.05, color: BRAND.ink,
              marginBottom: isMobile ? 10 : 14, letterSpacing: "-0.02em",
            }}>
              <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ display: "block" }}>
                Gestion des
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ display: "block", fontFamily: FE, fontStyle: "italic", fontWeight: 500, color: BRAND.mg.hex }}>
                commandes
              </motion.span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
              style={{ fontFamily: FE, fontStyle: "italic", fontSize: isMobile ? 13 : 15, color: BRAND.inkLt, lineHeight: 1.6 }}>
              {filteredOrders.length} commande{filteredOrders.length !== 1 ? "s" : ""} affichée{filteredOrders.length !== 1 ? "s" : ""}
            </motion.p>
          </div>

          {/* Export button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={exportToCSV}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: BRAND.ink, color: "white",
              fontFamily: FH, fontWeight: 700, fontSize: 13,
              padding: "10px 20px", borderRadius: 100, border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(30,30,46,0.18)",
              letterSpacing: 0.2, flexShrink: 0,
              width: isMobile ? "100%" : "auto",
              justifyContent: isMobile ? "center" : "flex-start",
            }}
          >
            <Download size={14} strokeWidth={2.5} />
            Exporter CSV
          </motion.button>
        </motion.div>

        {/* ─── Filters bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 10 : 12, marginBottom: isMobile ? 16 : 20 }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} strokeWidth={2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(45,45,58,0.35)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%", height: 40, paddingLeft: 36, paddingRight: 14,
                fontFamily: FH, fontSize: 13, fontWeight: 600,
                color: BRAND.ink, background: "white",
                border: "1px solid rgba(45,45,58,0.1)", borderRadius: 6,
                outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = BRAND.mg.hex; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${BRAND.mg.rgb},0.09)`; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(45,45,58,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Status filter pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {[
              { key: "all", label: "Tous", color: BRAND.ink, bg: "white", rgb: "45,45,58" },
              ...Object.entries(STATUS).map(([k, v]) => ({ key: k, label: v.label, color: v.color, bg: v.bg, rgb: v.rgb })),
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                style={{
                  fontFamily: FH, fontWeight: 700, fontSize: 11,
                  color: statusFilter === f.key ? f.color : "rgba(45,45,58,0.4)",
                  background: statusFilter === f.key ? f.bg : "transparent",
                  border: `1px solid ${statusFilter === f.key ? `rgba(${f.rgb},0.3)` : "rgba(45,45,58,0.1)"}`,
                  padding: "5px 13px", borderRadius: 100, cursor: "pointer",
                  transition: "all 0.18s", letterSpacing: 0.3,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Table / Cards ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "white", borderRadius: 6,
            border: "1px solid rgba(45,45,58,0.08)",
            boxShadow: "0 1px 2px rgba(45,45,58,0.04)",
          }}
        >
          {filteredOrders.length === 0 ? (
            <div style={{ padding: "56px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: FH, fontWeight: 800, fontSize: 40, color: `rgba(${BRAND.mg.rgb},0.12)`, marginBottom: 10 }}>—</div>
              <div style={{ fontFamily: FE, fontStyle: "italic", fontSize: 14, color: BRAND.inkLt }}>
                Aucune commande trouvée
              </div>
            </div>
          ) : showTable ? (
            /* ── DESKTOP / TABLET TABLE ── */
            <>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isTablet
                  ? "1fr 90px 120px 80px 40px"
                  : "1fr 1fr 100px 130px 90px 48px",
                padding: "10px 20px",
                background: BRAND.canvas,
                borderBottom: "1px solid rgba(45,45,58,0.08)",
              }}>
                {(isTablet
                  ? ["Client", "Total", "Statut", "Date", ""]
                  : ["Client", "Email", "Total", "Statut", "Date", ""]
                ).map((h, i) => (
                  <div key={i} style={{ fontFamily: FL, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.4)", fontWeight: 600, padding: "0 4px" }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {filteredOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.3 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isTablet
                      ? "1fr 90px 120px 80px 40px"
                      : "1fr 1fr 100px 130px 90px 48px",
                    padding: "13px 20px",
                    borderBottom: "1px solid rgba(45,45,58,0.06)",
                    alignItems: "center",
                    transition: "background 0.15s",
                    cursor: "default",
                  }}
                  whileHover={{ backgroundColor: `rgba(${BRAND.mg.rgb},0.02)` }}
                >
                  {/* Name */}
                  <div style={{ padding: "0 4px" }}>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 13.5, color: BRAND.ink, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.customer_name}
                    </div>
                    {isTablet && (
                      <div style={{ fontFamily: FB, fontSize: 11, color: BRAND.inkLt, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.customer_email}
                      </div>
                    )}
                  </div>

                  {/* Email (desktop only) */}
                  {!isTablet && (
                    <div style={{ padding: "0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FB, fontSize: 12.5, color: BRAND.inkLt }}>
                      {order.customer_email}
                    </div>
                  )}

                  {/* Total */}
                  <div style={{ padding: "0 4px", fontFamily: FH, fontWeight: 800, fontSize: 13.5, color: BRAND.mg.hex, letterSpacing: "-0.3px" }}>
                    {order.total_amount} <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.6 }}>MAD</span>
                  </div>

                  {/* Status select */}
                  <div style={{ padding: "0 4px" }}>
                    <StatusSelect value={order.order_status} onChange={(val) => updateOrderStatus(order.id, val)} />
                  </div>

                  {/* Date */}
                  <div style={{ padding: "0 4px", fontFamily: FB, fontSize: 12, color: BRAND.inkLt }}>
                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </div>

                  {/* Eye */}
                  <div style={{ padding: "0 4px", display: "flex", justifyContent: "center" }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        width: 30, height: 30, borderRadius: 6,
                        border: "1px solid rgba(45,45,58,0.1)", background: "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "rgba(45,45,58,0.4)", transition: "border-color 0.15s, color 0.15s, background 0.15s",
                      }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLElement; b.style.borderColor = `rgba(${BRAND.mg.rgb},0.3)`; b.style.color = BRAND.mg.hex; b.style.background = BRAND.mg.bg; }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLElement; b.style.borderColor = "rgba(45,45,58,0.1)"; b.style.color = "rgba(45,45,58,0.4)"; b.style.background = "transparent"; }}
                    >
                      <Eye size={13} strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            /* ── MOBILE CARDS ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {filteredOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid rgba(45,45,58,0.07)",
                    display: "flex", flexDirection: "column", gap: 10,
                  }}
                >
                  {/* Card top row: name + eye */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 14, color: BRAND.ink, letterSpacing: "-0.2px" }}>
                        {order.customer_name}
                      </div>
                      <div style={{ fontFamily: FB, fontSize: 12, color: BRAND.inkLt, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.customer_email}
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                        border: `1px solid rgba(${BRAND.mg.rgb},0.2)`, background: BRAND.mg.bg,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: BRAND.mg.hex,
                      }}
                    >
                      <Eye size={14} strokeWidth={2} />
                    </motion.button>
                  </div>

                  {/* Card bottom row: total + status + date */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: FH, fontWeight: 800, fontSize: 15, color: BRAND.mg.hex, letterSpacing: "-0.3px" }}>
                      {order.total_amount} <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.6 }}>MAD</span>
                    </span>
                    <StatusSelect value={order.order_status} onChange={(val) => updateOrderStatus(order.id, val)} />
                    <span style={{ fontFamily: FB, fontSize: 11, color: BRAND.inkLt }}>
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer */}
          {filteredOrders.length > 0 && (
            <div style={{
              padding: "12px 20px",
              background: BRAND.canvas,
              borderTop: "1px solid rgba(45,45,58,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: FL, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 600 }}>
                {filteredOrders.length} résultat{filteredOrders.length !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {[BRAND.mg.hex, BRAND.pp.hex, BRAND.tl.hex, BRAND.gd.hex].map((c, i) => (
                  <span key={i} style={{ display: "block", width: 14, height: 3, background: c, borderRadius: 2 }} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Modal ─── */}
      <AnimatePresence>
        {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </AnimatePresence>
    </div>
  );
}