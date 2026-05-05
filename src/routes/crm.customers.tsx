import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { Search, Edit, Eye, Plus, X, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/crm/customers")({
  component: CrmCustomers,
});

/* ─── Design tokens ─── */
const BRAND = {
  mg:  { hex: "#C2185B", rgb: "194,24,91",  bg: "#FFF0F5" },
  pp:  { hex: "#7B1FA2", rgb: "123,31,162", bg: "#F8F0FF" },
  tl:  { hex: "#00897B", rgb: "0,137,123",  bg: "#E8F8F5" },
  gd:  { hex: "#F9A825", rgb: "249,168,37", bg: "#FFF8EC" },
  bl:  { hex: "#1565C0", rgb: "21,101,192", bg: "#EEF3FB" },
  ink:   "#2D2D3A",
  inkLt: "#5A5A6A",
  canvas:"#FFFDF9",
  border:"rgba(45,45,58,0.09)",
};
const FH = "'Nunito', sans-serif";
const FE = "'Playfair Display', serif";
const FL = "'Cormorant Garamond', serif";

/* ─── Responsive hook ─── */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
}

/* ─── Stage config ─── */
const STAGE_CONFIG: Record<string, { label: string; color: string; rgb: string; bg: string }> = {
  nouveau:  { label: "Nouveau",  color: BRAND.bl.hex,  rgb: BRAND.bl.rgb,  bg: BRAND.bl.bg  },
  contacte: { label: "Contacté", color: BRAND.gd.hex,  rgb: BRAND.gd.rgb,  bg: BRAND.gd.bg  },
  qualifie: { label: "Qualifié", color: BRAND.pp.hex,  rgb: BRAND.pp.rgb,  bg: BRAND.pp.bg  },
  converti: { label: "Converti", color: BRAND.tl.hex,  rgb: BRAND.tl.rgb,  bg: BRAND.tl.bg  },
};

function StagePill({ stage }: { stage: string }) {
  const cfg = STAGE_CONFIG[stage] ?? { label: stage, color: BRAND.inkLt, rgb: "90,90,106", bg: "#F5F5F7" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: cfg.bg, border: `1px solid rgba(${cfg.rgb},0.2)`,
      fontFamily: FL, fontSize: 10, fontWeight: 600,
      letterSpacing: 1.5, textTransform: "uppercase" as const,
      color: cfg.color, whiteSpace: "nowrap" as const,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function ActivePill({ active }: { active: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: active ? BRAND.tl.bg : "#FFF0F0",
      border: `1px solid ${active ? `rgba(${BRAND.tl.rgb},0.2)` : "rgba(220,50,50,0.2)"}`,
      fontFamily: FL, fontSize: 10, fontWeight: 600,
      letterSpacing: 1.5, textTransform: "uppercase" as const,
      color: active ? BRAND.tl.hex : "#C62828",
      whiteSpace: "nowrap" as const,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: active ? BRAND.tl.hex : "#C62828", flexShrink: 0,
      }} />
      {active ? "payé" : "Impayé"}
    </span>
  );
}

/* ─── Styled select ─── */
function StyledSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, width: "100%", padding: "9px 12px",
          background: "#fff", border: `1px solid ${BRAND.border}`,
          borderRadius: 6, cursor: "pointer",
          fontFamily: FH, fontSize: 13, fontWeight: 600, color: BRAND.ink,
          boxShadow: "0 1px 2px rgba(45,45,58,0.04)",
          transition: "border-color .2s",
        }}
      >
        <span>{cur?.label ?? placeholder ?? "Sélectionner"}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} strokeWidth={2} color={BRAND.inkLt} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: "#fff", border: `1px solid ${BRAND.border}`,
              borderRadius: 6, boxShadow: "0 12px 32px -8px rgba(45,45,58,0.18)",
              overflow: "hidden", zIndex: 100,
            }}
          >
            {options.map(opt => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 8, padding: "10px 12px", border: "none",
                    background: active ? BRAND.mg.bg : "transparent",
                    cursor: "pointer", fontFamily: FH, fontSize: 13, fontWeight: active ? 700 : 500,
                    color: active ? BRAND.mg.hex : BRAND.ink, textAlign: "left" as const,
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget.style.background = "rgba(45,45,58,0.03)"); }}
                  onMouseLeave={e => { if (!active) (e.currentTarget.style.background = "transparent"); }}
                >
                  {opt.label}
                  {active && <Check size={13} strokeWidth={2.5} color={BRAND.mg.hex} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Styled input ─── */
function StyledInput({ value, onChange, placeholder, type = "text", icon }: {
  value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          color: BRAND.inkLt, display: "flex", pointerEvents: "none",
        }}>{icon}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: icon ? "9px 12px 9px 34px" : "9px 12px",
          background: "#fff", border: `1px solid ${BRAND.border}`,
          borderRadius: 6, fontFamily: FH, fontSize: 13, color: BRAND.ink,
          outline: "none", boxSizing: "border-box" as const,
          boxShadow: "0 1px 2px rgba(45,45,58,0.04)",
          transition: "border-color .2s",
        }}
        onFocus={e => (e.target.style.borderColor = `rgba(${BRAND.mg.rgb},0.4)`)}
        onBlur={e => (e.target.style.borderColor = BRAND.border)}
      />
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
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
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 6,
              border: "1px solid rgba(45,45,58,0.1)",
              boxShadow: "0 32px 80px rgba(45,45,58,0.18), 0 1px 2px rgba(45,45,58,0.04)",
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND.mg.hex}, ${BRAND.pp.hex}, ${BRAND.tl.hex}, ${BRAND.gd.hex})`, flexShrink: 0 }} />

            {/* Modal header */}
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
                  <div style={{ width: 18, height: 1.5, background: BRAND.mg.hex }} />
                  <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.mg.hex }}>
                    CRM
                  </span>
                </div>
                <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px", color: BRAND.ink }}>
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid rgba(45,45,58,0.1)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: BRAND.inkLt,
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BRAND.mg.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: "20px 24px 24px" }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Form field ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
      <label style={{ fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: BRAND.inkLt }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Primary button ─── */
function PrimaryBtn({ onClick, disabled, children, variant = "primary" }: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode; variant?: "primary" | "outline";
}) {
  const [hov, setHov] = useState(false);
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: "10px 16px", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
        border: isPrimary ? "none" : `1px solid ${BRAND.border}`,
        background: isPrimary ? (hov ? "#A3154D" : BRAND.mg.hex) : (hov ? "rgba(45,45,58,0.04)" : "#fff"),
        color: isPrimary ? "#fff" : BRAND.ink,
        fontFamily: FH, fontSize: 13, fontWeight: 700,
        opacity: disabled ? 0.55 : 1,
        transition: "background .2s",
        boxShadow: isPrimary ? `0 2px 0 rgba(${BRAND.mg.rgb},0.3)` : "0 1px 2px rgba(45,45,58,0.06)",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Icon action button ─── */
function IconBtn({ onClick, children, accentRgb, accentBg }: {
  onClick: () => void; children: React.ReactNode; accentRgb: string; accentBg: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 6,
        border: `1px solid ${hov ? `rgba(${accentRgb},0.25)` : BRAND.border}`,
        background: hov ? accentBg : "#fff",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background .2s, border-color .2s",
        color: hov ? `rgb(${accentRgb})` : BRAND.inkLt,
      }}
    >
      {children}
    </button>
  );
}

/* ─── Main component ─── */
function CrmCustomers() {
  const { isMobile, isTablet } = useBreakpoint();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOverdue, setFilterOverdue] = useState(false);

  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    parent_name: "", child_name: "", email: "", phone: "",
    child_profile: "", monthly_fee: 0, payment_day: 1, crm_stage: "nouveau",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [newPayment, setNewPayment] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
  });
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const recordPayment = async () => {
    if (!selectedCustomer) return;
    setIsRecordingPayment(true);
    try {
      const receiptNumber = `EDU-${newPayment.payment_date.replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      const periodCovered = new Date(newPayment.payment_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

      const { data, error } = await supabase
        .from("ez_crm_payments")
        .insert({
          customer_id: selectedCustomer.id,
          amount: newPayment.amount,
          payment_date: newPayment.payment_date,
          payment_method: newPayment.payment_method,
          period_covered: periodCovered,
          receipt_number: receiptNumber,
          certificate_sent: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Paiement enregistré avec succès");
      setShowPaymentDialog(false);
      setNewPayment({ amount: 0, payment_date: new Date().toISOString().split("T")[0], payment_method: "cash" });
      fetchCustomers();

      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-certificate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ customer: selectedCustomer, payment: { ...newPayment, id: data.id, receipt_number: receiptNumber, period_covered: periodCovered } }),
        });
      } catch (emailError) { console.error("Error sending certificate:", emailError); }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally { setIsRecordingPayment(false); }
  };

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("filter") === "overdue" && !filterOverdue) setFilterOverdue(true);

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    if (!showPaymentDialog || !selectedCustomer) return;
    setNewPayment(prev => ({
      ...prev,
      amount: prev.amount && prev.amount > 0 ? prev.amount : Number(selectedCustomer.monthly_fee) || 0,
    }));
  }, [showPaymentDialog, selectedCustomer]);

  const calculateCustomerDebt = async (customer: any) => {
    const enrollmentDate = new Date(customer.enrollment_date);
    const daysSinceEnrollment = Math.floor((new Date().getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
    const billingCycles = Math.floor(daysSinceEnrollment / 30);
    const expectedPayments = billingCycles * Number(customer.monthly_fee);

    const { data: payments } = await supabase.from("ez_crm_payments").select("amount").eq("customer_id", customer.id);
    const actualPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const { data: adjustments } = await supabase.from("ez_crm_debt_adjustments").select("amount, adjustment_type").eq("customer_id", customer.id);
    let adjustmentTotal = 0;
    adjustments?.forEach(adj => {
      if (adj.adjustment_type === "reduce") adjustmentTotal -= Number(adj.amount);
      else if (adj.adjustment_type === "clear") adjustmentTotal = -expectedPayments + actualPayments;
    });

    const debt = expectedPayments - actualPayments + adjustmentTotal;
    return debt > 0 ? debt : 0;
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("ez_crm_customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const customersWithStatus = await Promise.all(
        (data || []).map(async (customer) => {
          const { count: paymentCount } = await supabase.from("ez_crm_payments").select("*", { count: "exact", head: true }).eq("customer_id", customer.id);
          const debt = await calculateCustomerDebt(customer);
          return { ...customer, is_active: (paymentCount || 0) > 0, debt };
        })
      );
      setCustomers(customersWithStatus);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally { setLoading(false); }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.child_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "all" || customer.crm_stage === filterStage;
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" && customer.is_active) || (filterStatus === "inactive" && !customer.is_active);
    const matchesOverdue = !filterOverdue || customer.debt > 0;
    return matchesSearch && matchesStage && matchesStatus && matchesOverdue;
  });

  const px = isMobile ? 16 : isTablet ? 24 : 48;
  const py = isMobile ? 20 : 40;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 280, background: BRAND.canvas }}>
        <motion.span
          style={{ width: 20, height: 20, borderRadius: "50%", border: `2.5px solid rgba(${BRAND.mg.rgb},0.2)`, borderTopColor: BRAND.mg.hex, display: "block" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
        />
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: 14, color: BRAND.mg.hex }}>Chargement…</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", background: BRAND.canvas, minHeight: "100vh", padding: `${py}px ${px}px`, fontFamily: FH, boxSizing: "border-box" }}>
      {/* Dot-grid texture */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "radial-gradient(rgba(45,45,58,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px", pointerEvents: "none", opacity: 0.6, zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto" }}>

        {/* ─── Page header ─── */}
        <div style={{ marginBottom: isMobile ? 28 : 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 22, height: 1.5, background: BRAND.mg.hex, flexShrink: 0 }} />
            <span style={{ fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase" as const, color: BRAND.mg.hex }}>
              CRM — Gestion
            </span>
          </div>
          <h1 style={{
            fontFamily: FH, fontWeight: 800,
            fontSize: isMobile ? "clamp(26px, 8vw, 34px)" : "clamp(32px, 4vw, 46px)",
            lineHeight: 1.05, color: BRAND.ink, marginBottom: 10, letterSpacing: "-0.02em",
          }}>
            <span>Mes </span>
            <span style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.mg.hex, fontWeight: 500 }}>clients</span>
          </h1>
          <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: isMobile ? 13 : 15, color: BRAND.inkLt, lineHeight: 1.6 }}>
            Gérez vos clients et leur progression dans le pipeline de vente
          </p>
        </div>

        {/* ─── Filters bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{
            background: "#fff", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            boxShadow: "0 1px 2px rgba(45,45,58,0.04)",
            padding: isMobile ? "16px" : "20px 24px",
            marginBottom: isMobile ? 16 : 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 14, height: 1.5, background: BRAND.bl.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.bl.hex }}>
              Filtres & Recherche
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "2fr 1fr 1fr auto",
            gap: 10,
            alignItems: "end",
          }}>
            {/* Search */}
            <StyledInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher par nom, email, téléphone…"
              icon={<Search size={14} strokeWidth={2} />}
            />


            {/* Status filter */}
            <StyledSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: "all", label: "Tous les statuts" },
                { value: "active", label: "Payé" },
                { value: "inactive", label: "Impayé" },
              ]}
            />

            {/* Overdue toggle */}
            <button
              onClick={() => setFilterOverdue(v => !v)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 14px", borderRadius: 6, cursor: "pointer",
                background: filterOverdue ? BRAND.gd.bg : "#fff",
                border: `1px solid ${filterOverdue ? `rgba(${BRAND.gd.rgb},0.3)` : BRAND.border}`,
                fontFamily: FH, fontSize: 13, fontWeight: 700,
                color: filterOverdue ? BRAND.gd.hex : BRAND.inkLt,
                whiteSpace: "nowrap" as const,
                transition: "all .2s",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: filterOverdue ? BRAND.gd.hex : BRAND.inkLt, flexShrink: 0 }} />
              En retard
            </button>
          </div>

          {/* Results count */}
          <div style={{ marginTop: 12, fontFamily: FE, fontStyle: "italic", fontSize: 12, color: BRAND.inkLt }}>
            {filteredCustomers.length} client{filteredCustomers.length !== 1 ? "s" : ""} trouvé{filteredCustomers.length !== 1 ? "s" : ""}
          </div>
        </motion.div>

        {/* ─── Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          style={{
            background: "#fff", borderRadius: 8, border: `1px solid ${BRAND.border}`,
            boxShadow: "0 1px 2px rgba(45,45,58,0.04)",
            overflow: "hidden",
          }}
        >
          {/* Table header bar */}
          <div style={{
            padding: "16px 20px 14px",
            borderBottom: `1px solid ${BRAND.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 14, height: 1.5, background: BRAND.mg.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.mg.hex }}>
              Liste des clients
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
              <thead>
                <tr style={{ background: "rgba(45,45,58,0.025)" }}>
                  {["Parent", "Enfant", "Contact", "Profil", "Stade CRM", "Status", "Mensuel", "Dette", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left" as const,
                      fontFamily: FL, fontSize: 9, fontWeight: 600,
                      letterSpacing: 2, textTransform: "uppercase" as const,
                      color: BRAND.inkLt, whiteSpace: "nowrap" as const,
                      borderBottom: `1px solid ${BRAND.border}`,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "48px 20px", textAlign: "center" as const }}>
                      <div style={{ fontFamily: FH, fontWeight: 800, fontSize: 32, color: "rgba(45,45,58,0.12)", marginBottom: 8 }}>—</div>
                      <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 13, color: BRAND.inkLt }}>Aucun client trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, i) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      style={{
                        borderBottom: `1px solid ${BRAND.border}`,
                        transition: "background .15s",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(45,45,58,0.02)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>{customer.parent_name}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 600, color: BRAND.inkLt }}>{customer.child_name}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontFamily: FH, fontSize: 12, color: BRAND.ink }}>{customer.email}</div>
                        <div style={{ fontFamily: FH, fontSize: 11, color: BRAND.inkLt, marginTop: 2 }}>{customer.phone}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontFamily: FL, fontSize: 10, fontWeight: 600,
                          letterSpacing: 1.5, textTransform: "uppercase" as const,
                          color: BRAND.inkLt,
                        }}>{customer.child_profile}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StagePill stage={customer.crm_stage} />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <ActivePill active={customer.is_active} />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>{customer.monthly_fee}</span>
                        <span style={{ fontFamily: FL, fontSize: 10, color: BRAND.inkLt, marginLeft: 3 }}>MAD</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontFamily: FH, fontSize: 13, fontWeight: 700,
                          color: customer.debt > 0 ? BRAND.gd.hex : BRAND.tl.hex,
                        }}>{customer.debt.toFixed(0)}</span>
                        <span style={{ fontFamily: FL, fontSize: 10, color: BRAND.inkLt, marginLeft: 3 }}>MAD</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <IconBtn
                            onClick={() => { setSelectedCustomer(customer); setShowViewDialog(true); }}
                            accentRgb={BRAND.bl.rgb} accentBg={BRAND.bl.bg}
                          >
                            <Eye size={13} strokeWidth={2} />
                          </IconBtn>
                          <IconBtn
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setEditForm({
                                parent_name: customer.parent_name, child_name: customer.child_name,
                                email: customer.email, phone: customer.phone,
                                child_profile: customer.child_profile,
                                monthly_fee: Number(customer.monthly_fee),
                                payment_day: Number(customer.payment_day),
                                crm_stage: customer.crm_stage,
                              });
                              setShowEditDialog(true);
                            }}
                            accentRgb={BRAND.pp.rgb} accentBg={BRAND.pp.bg}
                          >
                            <Edit size={13} strokeWidth={2} />
                          </IconBtn>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ─── VIEW DIALOG ─── */}
      <Modal open={showViewDialog} onClose={() => setShowViewDialog(false)} title="Détails du client">
          {selectedCustomer && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 24 }}>
                {[
                  { label: "Parent", value: selectedCustomer.parent_name },
                  { label: "Enfant", value: selectedCustomer.child_name },
                  { label: "Email", value: selectedCustomer.email },
                  { label: "Téléphone", value: selectedCustomer.phone },
                  { label: "Profil", value: selectedCustomer.child_profile },
                  { label: "Stade CRM", value: null, node: <StagePill stage={selectedCustomer.crm_stage} /> },
                  { label: "Frais mensuels", value: `${selectedCustomer.monthly_fee} MAD` },
                  { label: "Jour de paiement", value: `Le ${selectedCustomer.payment_day} de chaque mois` },
                ].map(({ label, value, node }) => (
                  <div key={label}>
                    <div style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" as const, color: BRAND.inkLt, marginBottom: 4 }}>{label}</div>
                    {node ?? <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 600, color: BRAND.ink }}>{value}</div>}
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: BRAND.border, marginBottom: 16 }} />

              <div style={{ display: "flex", gap: 10 }}>
                <PrimaryBtn onClick={() => {
                  setNewPayment({ amount: selectedCustomer.monthly_fee || 0, payment_date: new Date().toISOString().split("T")[0], payment_method: "cash" });
                  setShowPaymentDialog(true);
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                    <Plus size={14} strokeWidth={2} /> Enregistrer un paiement
                  </span>
                </PrimaryBtn>
                <PrimaryBtn variant="outline" onClick={() => setShowViewDialog(false)}>Fermer</PrimaryBtn>
              </div>
            </>
          )}
      </Modal>

      {/* ─── PAYMENT DIALOG ─── */}
      <Modal open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} title="Enregistrer un paiement">
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16, marginBottom: 24 }}>
          <Field label="Montant (MAD)">
            <StyledInput
              type="number"
              value={newPayment.amount}
              onChange={v => setNewPayment({ ...newPayment, amount: Number(v) })}
              placeholder={selectedCustomer?.monthly_fee?.toString()}
            />
          </Field>
          <Field label="Date de paiement">
            <StyledInput
              type="date"
              value={newPayment.payment_date}
              onChange={v => setNewPayment({ ...newPayment, payment_date: v })}
            />
          </Field>
          <Field label="Mode de paiement">
            <StyledSelect
              value={newPayment.payment_method}
              onChange={v => setNewPayment({ ...newPayment, payment_method: v })}
              options={[
                { value: "cash", label: "Espèces" },
                { value: "virement", label: "Virement" },
                { value: "cheque", label: "Chèque" },
                { value: "bank", label: "Banque" },
              ]}
            />
          </Field>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <PrimaryBtn onClick={recordPayment} disabled={isRecordingPayment || newPayment.amount === 0}>
            {isRecordingPayment ? "Enregistrement…" : "Confirmer le paiement"}
          </PrimaryBtn>
          <PrimaryBtn variant="outline" onClick={() => setShowPaymentDialog(false)}>Annuler</PrimaryBtn>
        </div>
      </Modal>

      {/* ─── EDIT DIALOG ─── */}
      <Modal open={showEditDialog} onClose={() => setShowEditDialog(false)} title="Modifier le client">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", marginBottom: 24 }}>
          <Field label="Parent">
            <StyledInput value={editForm.parent_name} onChange={v => setEditForm({ ...editForm, parent_name: v })} />
          </Field>
          <Field label="Enfant">
            <StyledInput value={editForm.child_name} onChange={v => setEditForm({ ...editForm, child_name: v })} />
          </Field>
          <Field label="Email">
            <StyledInput type="email" value={editForm.email} onChange={v => setEditForm({ ...editForm, email: v })} />
          </Field>
          <Field label="Téléphone">
            <StyledInput value={editForm.phone} onChange={v => setEditForm({ ...editForm, phone: v })} />
          </Field>
          <Field label="Profil">
            <StyledSelect
              value={editForm.child_profile}
              onChange={v => setEditForm({ ...editForm, child_profile: v })}
              options={[
                { value: "typique", label: "Typique" },
                { value: "dys", label: "Dys" },
                { value: "autiste", label: "Autiste" },
                { value: "tdah", label: "TDAH" },
              ]}
            />
          </Field>
          <Field label="Stade CRM">
            <StyledSelect
              value={editForm.crm_stage}
              onChange={v => setEditForm({ ...editForm, crm_stage: v })}
              options={[
                { value: "nouveau", label: "Nouveau" },
                { value: "contacte", label: "Contacté" },
                { value: "qualifie", label: "Qualifié" },
                { value: "converti", label: "Converti" },
              ]}
            />
          </Field>
          <Field label="Frais mensuels (MAD)">
            <StyledInput type="number" value={editForm.monthly_fee} onChange={v => setEditForm({ ...editForm, monthly_fee: Number(v) })} />
          </Field>
          <Field label="Jour de paiement (1–31)">
            <StyledInput type="number" value={editForm.payment_day} onChange={v => setEditForm({ ...editForm, payment_day: Number(v) })} />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <PrimaryBtn
            onClick={async () => {
              if (!selectedCustomer) return;
              setIsSaving(true);
              try {
                const { error } = await supabase.from("ez_crm_customers").update({
                  parent_name: editForm.parent_name, child_name: editForm.child_name,
                  email: editForm.email, phone: editForm.phone,
                  child_profile: editForm.child_profile, monthly_fee: editForm.monthly_fee,
                  payment_day: editForm.payment_day, crm_stage: editForm.crm_stage,
                }).eq("id", selectedCustomer.id);
                if (error) throw error;
                toast.success("Client modifié avec succès");
                setShowEditDialog(false);
                fetchCustomers();
              } catch (error) {
                console.error("Error updating customer:", error);
                toast.error("Erreur lors de la modification du client");
              } finally { setIsSaving(false); }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
          </PrimaryBtn>
          <PrimaryBtn variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}