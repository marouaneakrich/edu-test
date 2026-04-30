import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase, EzOrder } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Eye, X, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

/* ─── Status config ─── */
const STATUS = {
  pending:    { label: "En attente",  color: "#F9A825", bg: "#FFF8EC", rgb: "249,168,37" },
  processing: { label: "En cours",    color: "#7B1FA2", bg: "#F8F0FF", rgb: "123,31,162" },
  delivered:  { label: "Livré",       color: "#00897B", bg: "#E8F8F5", rgb: "0,137,123"  },
} as const;
type StatusKey = keyof typeof STATUS;

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status as StatusKey] ?? { label: status, color: "#8A8AAA", bg: "#F7F6FC", rgb: "138,138,170" };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
        letterSpacing: 0.3,
        color: s.color, background: s.bg,
        border: `1px solid rgba(${s.rgb},0.3)`,
        padding: "3px 10px", borderRadius: 100,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "block", flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ─── Status select dropdown ─── */
function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const s = STATUS[value as StatusKey] ?? STATUS.pending;

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
          color: s.color, background: s.bg,
          border: `1px solid rgba(${(STATUS[value as StatusKey] ?? STATUS.pending).rgb},0.3)`,
          padding: "4px 10px", borderRadius: 100, cursor: "pointer",
          transition: "opacity 0.15s",
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "block" }} />
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
              background: "white", borderRadius: 10,
              border: "1px solid rgba(45,45,58,0.1)",
              boxShadow: "0 8px 24px rgba(45,45,58,0.12)",
              minWidth: 140, overflow: "hidden",
            }}
          >
            {Object.entries(STATUS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { onChange(key); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 14px", background: key === value ? cfg.bg : "transparent",
                  border: "none", cursor: "pointer",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                  color: cfg.color, transition: "background 0.15s", textAlign: "left",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "block", flexShrink: 0 }} />
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          background: "white", borderRadius: 4,
          border: "1px solid rgba(45,45,58,0.1)",
          boxShadow: "0 32px 80px rgba(45,45,58,0.18), 6px 6px 0 rgba(194,24,91,0.08)",
          width: "100%", maxWidth: 600, maxHeight: "90vh",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}
      >
        {/* Modal top stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#C2185B,#7B1FA2,#00897B,#F9A825)", flexShrink: 0 }} />

        {/* Modal header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(45,45,58,0.08)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C2185B" }} />
              <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#C2185B", fontWeight: 700 }}>
                Détail commande
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, letterSpacing: "-0.5px", color: "var(--ek-ink)" }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <div style={{ marginTop: 4 }}>
              <StatusBadge status={order.order_status} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(45,45,58,0.1)",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--ek-ink-lt)", flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Client info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Client", value: order.customer_name },
              { label: "Email", value: order.customer_email },
              { label: "Téléphone", value: order.customer_phone },
              { label: "Adresse", value: `${order.customer_address}, ${order.customer_city}` },
              { label: "Montant total", value: `${order.total_amount} MAD` },
              { label: "Date", value: new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "12px 14px", background: "#F7F6FC", borderRadius: 4, border: "1px solid rgba(45,45,58,0.07)" }}>
                <div style={{ fontFamily: "var(--font-label)", fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 700, marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ek-ink)", lineHeight: 1.3 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Items */}
          {Array.isArray(order.items) && order.items.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#C2185B", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C2185B" }} />
                Articles commandés
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(order.items as { product_name: string; quantity: number; subtotal: number }[]).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "white", border: "1px solid rgba(45,45,58,0.09)", borderRadius: 4, gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--ek-ink)", letterSpacing: "-0.2px" }}>
                        {item.product_name}
                      </div>
                      <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 12, color: "var(--ek-ink-lt)", marginTop: 2 }}>
                        Qté : {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 14, color: "#C2185B", flexShrink: 0 }}>
                      {item.subtotal} MAD
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div style={{ padding: "12px 14px", background: "#FFF0F5", border: "1px solid rgba(194,24,91,0.15)", borderRadius: 4 }}>
              <div style={{ fontFamily: "var(--font-label)", fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "#C2185B", fontWeight: 700, marginBottom: 5 }}>
                Notes
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--ek-ink)", lineHeight: 1.6 }}>
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
  const [orders, setOrders] = React.useState<EzOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = React.useState<EzOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedOrder, setSelectedOrder] = React.useState<EzOrder | null>(null);

  React.useEffect(() => { fetchOrders(); }, []);

  React.useEffect(() => {
    let filtered = orders;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter(o => o.order_status === statusFilter);
    setFilteredOrders(filtered);
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
    const headers = ["ID", "Client", "Email", "Téléphone", "Adresse", "Total", "Statut", "Date"];
    const rows = filteredOrders.map(o => [o.id, o.customer_name, o.customer_email, o.customer_phone, o.customer_address, o.total_amount.toString(), o.order_status, new Date(o.created_at).toLocaleDateString("fr-FR")]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.span
          className="block w-6 h-6 rounded-full border-[2.5px] border-[rgba(194,24,91,0.2)] border-t-[#C2185B]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "var(--font-body)", color: "var(--ek-ink)", minHeight: "100%", position: "relative" }}
    >
      {/* Dot-grid texture */}
      <div
        aria-hidden
        style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,45,58,0.065) 1px, transparent 0)", backgroundSize: "22px 22px", opacity: 0.45, zIndex: 0 }}
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
                Chapitre 04 — Commandes
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 0.93, letterSpacing: "-1.5px", color: "var(--ek-ink)" }}>
              <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ display: "block" }}>
                Gestion des
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ display: "block", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, color: "var(--ek-mg)" }}>
                commandes
              </motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: "var(--ek-ink-lt)", marginTop: 8, lineHeight: 1.5 }}>
              {filteredOrders.length} commande{filteredOrders.length !== 1 ? "s" : ""} affichée{filteredOrders.length !== 1 ? "s" : ""}
            </motion.p>
          </div>

          {/* Export button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={exportToCSV}
            className="flex items-center gap-2 flex-shrink-0"
            style={{
              background: "var(--ek-ink)", color: "white",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
              padding: "10px 20px", borderRadius: 100, border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(30,30,46,0.18)",
              transition: "box-shadow 0.2s",
              letterSpacing: 0.2,
            }}
          >
            <Download size={14} strokeWidth={2.5} />
            Exporter CSV
          </motion.button>
        </motion.div>

        {/* ─── Filters bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mb-5"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14} strokeWidth={2}
              style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(45,45,58,0.35)", pointerEvents: "none" }}
            />
            <input
              type="text"
              placeholder="Rechercher par nom ou email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%", height: 40, paddingLeft: 36, paddingRight: 14,
                fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                color: "var(--ek-ink)", background: "white",
                border: "1px solid rgba(45,45,58,0.12)", borderRadius: 10,
                outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#C2185B"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(194,24,91,0.09)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(45,45,58,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: "all", label: "Tous", color: "var(--ek-ink)", bg: "white", rgb: "45,45,58" },
              ...Object.entries(STATUS).map(([k, v]) => ({ key: k, label: v.label, color: v.color, bg: v.bg, rgb: v.rgb })),
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                  color: statusFilter === f.key ? f.color : "rgba(45,45,58,0.4)",
                  background: statusFilter === f.key ? f.bg : "transparent",
                  border: `1px solid ${statusFilter === f.key ? `rgba(${f.rgb},0.3)` : "rgba(45,45,58,0.1)"}`,
                  padding: "5px 12px", borderRadius: 100, cursor: "pointer",
                  transition: "all 0.18s",
                  letterSpacing: 0.3,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Table card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "white", borderRadius: 4, border: "1px solid rgba(45,45,58,0.1)", boxShadow: "3px 3px 0 rgba(45,45,58,0.06)", overflow: "hidden" }}
        >
          {/* Table header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 100px 130px 90px 48px",
              gap: 0,
              padding: "10px 20px",
              background: "#F7F6FC",
              borderBottom: "1px solid rgba(45,45,58,0.08)",
            }}
          >
            {["Client", "Email", "Total", "Statut", "Date", ""].map((h, i) => (
              <div key={i} style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.4)", fontWeight: 700, padding: "0 4px" }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filteredOrders.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, color: "rgba(45,45,58,0.08)", letterSpacing: "-1px" }}>—</div>
              <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13.5, color: "var(--ek-ink-lt)", marginTop: 8 }}>
                Aucune commande trouvée
              </div>
            </div>
          ) : (
            filteredOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.35 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 100px 130px 90px 48px",
                  gap: 0,
                  padding: "13px 20px",
                  borderBottom: "1px solid rgba(45,45,58,0.06)",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                whileHover={{ backgroundColor: "rgba(194,24,91,0.02)" }}
              >
                {/* Name */}
                <div style={{ padding: "0 4px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--ek-ink)", letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.customer_name}
                  </div>
                </div>

                {/* Email */}
                <div style={{ padding: "0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--ek-ink-lt)" }}>
                  {order.customer_email}
                </div>

                {/* Total */}
                <div style={{ padding: "0 4px", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 13.5, color: "#C2185B", letterSpacing: "-0.3px" }}>
                  {order.total_amount} <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.6 }}>MAD</span>
                </div>

                {/* Status select */}
                <div style={{ padding: "0 4px" }}>
                  <StatusSelect
                    value={order.order_status}
                    onChange={(val) => updateOrderStatus(order.id, val)}
                  />
                </div>

                {/* Date */}
                <div style={{ padding: "0 4px", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ek-ink-lt)" }}>
                  {new Date(order.created_at).toLocaleDateString("fr-FR")}
                </div>

                {/* Eye button */}
                <div style={{ padding: "0 4px", display: "flex", justifyContent: "center" }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: "1px solid rgba(45,45,58,0.12)", background: "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(45,45,58,0.4)", transition: "border-color 0.15s, color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLElement; b.style.borderColor = "rgba(194,24,91,0.3)"; b.style.color = "#C2185B"; b.style.background = "#FFF0F5"; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLElement; b.style.borderColor = "rgba(45,45,58,0.12)"; b.style.color = "rgba(45,45,58,0.4)"; b.style.background = "transparent"; }}
                  >
                    <Eye size={13} strokeWidth={2} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}

          {/* Footer count */}
          {filteredOrders.length > 0 && (
            <div style={{ padding: "12px 20px", background: "#F7F6FC", borderTop: "1px solid rgba(45,45,58,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 700 }}>
                {filteredOrders.length} résultat{filteredOrders.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-1">
                {["#C2185B", "#7B1FA2", "#00897B", "#F9A825"].map((c, i) => (
                  <span key={i} style={{ display: "block", width: 12, height: 3, background: c, borderRadius: 2 }} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Order detail modal ─── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}