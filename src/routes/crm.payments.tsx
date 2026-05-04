import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/crm/payments")({
  component: CrmPayments,
});

const BRAND = {
  mg: { hex: "#C2185B", rgb: "194,24,91", bg: "#FFF0F5" },
  pp: { hex: "#7B1FA2", rgb: "123,31,162", bg: "#F8F0FF" },
  tl: { hex: "#00897B", rgb: "0,137,123", bg: "#E8F8F5" },
  gd: { hex: "#F9A825", rgb: "249,168,37", bg: "#FFF8EC" },
  bl: { hex: "#1565C0", rgb: "21,101,192", bg: "#EEF3FB" },
  ink: "#2D2D3A",
  inkLt: "#5A5A6A",
  canvas: "#FFFDF9",
  border: "rgba(45,45,58,0.09)",
};

const FH = "'Nunito', sans-serif";
const FE = "'Playfair Display', serif";
const FL = "'Cormorant Garamond', serif";

function CrmPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterfacture, setFilterfacture] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("ez_crm_payments")
        .select(`
          *,
          ez_crm_customers (
            parent_name,
            child_name,
            email
          )
        `)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  const getMethodConfig = (method: string) => {
    switch (method) {
      case "cash":
        return { label: "Espèces", color: BRAND.tl.hex, bg: BRAND.tl.bg, rgb: BRAND.tl.rgb };
      case "virement":
        return { label: "Virement", color: BRAND.bl.hex, bg: BRAND.bl.bg, rgb: BRAND.bl.rgb };
      case "cheque":
        return { label: "Chèque", color: BRAND.pp.hex, bg: BRAND.pp.bg, rgb: BRAND.pp.rgb };
      case "bank":
        return { label: "Banque", color: BRAND.gd.hex, bg: BRAND.gd.bg, rgb: BRAND.gd.rgb };
      default:
        return { label: method || "N/A", color: BRAND.inkLt, bg: "#F5F5F7", rgb: "90,90,106" };
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const customer = payment.ez_crm_customers;
    const matchesSearch =
      customer?.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = filterMethod === "all" || payment.payment_method === filterMethod;
    const matchesfacture =
      filterfacture === "all" ||
      (filterfacture === "sent" && payment.facture_sent) ||
      (filterfacture === "not_sent" && !payment.facture_sent);

    return matchesSearch && matchesMethod && matchesfacture;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 280, background: BRAND.canvas }}>
        <motion.span
          style={{ width: 20, height: 20, borderRadius: "50%", border: `2.5px solid rgba(${BRAND.tl.rgb},0.2)`, borderTopColor: BRAND.tl.hex, display: "block" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
        />
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: 14, color: BRAND.tl.hex }}>Chargement…</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", background: BRAND.canvas, minHeight: "100vh", padding: "24px", fontFamily: FH, boxSizing: "border-box" }}>
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "radial-gradient(rgba(45,45,58,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px", pointerEvents: "none", opacity: 0.6, zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 18, height: 1.5, background: BRAND.tl.hex }} />
              <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: BRAND.tl.hex }}>
                CRM — Paiements
              </span>
            </div>
            <h1 style={{ fontFamily: FH, fontWeight: 800, fontSize: "clamp(26px, 4vw, 42px)", lineHeight: 1, color: BRAND.ink, letterSpacing: "-0.02em" }}>
              Historique des <span style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.tl.hex, fontWeight: 500 }}>paiements</span>
            </h1>
            <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 14, color: BRAND.inkLt, marginTop: 8 }}>
            Historique et gestion des paiements clients
            </p>
        </div>
          <button
            type="button"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(45,45,58,0.12)", background: "#fff", color: BRAND.ink,
              borderRadius: 100, padding: "10px 18px", fontFamily: FH, fontWeight: 800, fontSize: 13,
              cursor: "pointer",
            }}
          >
            <Download size={14} strokeWidth={2.5} />
          Exporter
          </button>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${BRAND.border}`, borderRadius: 6, padding: 16, boxShadow: "0 10px 28px -24px rgba(45,45,58,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 16, height: 1.5, background: BRAND.pp.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: BRAND.pp.hex }}>
              Filtres et recherche
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} strokeWidth={2} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: BRAND.inkLt }} />
              <input
                placeholder="Rechercher par client, reçu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 34px", border: `1px solid ${BRAND.border}`,
                  borderRadius: 6, fontFamily: FH, fontSize: 13, color: BRAND.ink, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                style={{
                  padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6,
                  background: "#fff", fontFamily: FH, fontSize: 13, color: BRAND.ink,
                }}
              >
                <option value="all">Tous les modes</option>
                <option value="cash">Espèces</option>
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
                <option value="bank">Banque</option>
              </select>
              <select
                value={filterfacture}
                onChange={(e) => setFilterfacture(e.target.value)}
                style={{
                  padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6,
                  background: "#fff", fontFamily: FH, fontSize: 13, color: BRAND.ink,
                }}
              >
                <option value="all">Tous les factures</option>
                <option value="sent">Envoyé</option>
                <option value="not_sent">Non envoyé</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 6, border: "1px solid rgba(45,45,58,0.1)", boxShadow: "0 16px 34px -20px rgba(45,45,58,0.3)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead style={{ background: BRAND.canvas }}>
                <tr>
                  {["Client", "Enfant", "Montant", "Date", "Mode", "Période", "Reçu", "facture"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: FL, fontSize: 9, letterSpacing: 2.2, textTransform: "uppercase", color: "rgba(45,45,58,0.45)", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "34px 14px", textAlign: "center", fontFamily: FE, fontStyle: "italic", color: BRAND.inkLt }}>
                      Aucun paiement trouvé
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} style={{ borderTop: "1px solid rgba(45,45,58,0.06)" }}>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>
                        {payment.ez_crm_customers?.parent_name}
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 13, color: BRAND.ink }}>
                        {payment.ez_crm_customers?.child_name}
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 13, fontWeight: 800, color: BRAND.tl.hex }}>
                        {Number(payment.amount).toFixed(0)} MAD
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 12.5, color: BRAND.inkLt }}>
                        {new Date(payment.payment_date).toLocaleDateString("fr-FR")}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {(() => {
                          const methodCfg = getMethodConfig(payment.payment_method);
                          return (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100,
                              background: methodCfg.bg, border: `1px solid rgba(${methodCfg.rgb},0.2)`,
                              color: methodCfg.color, fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase",
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: methodCfg.color }} />
                              {methodCfg.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 12.5, color: BRAND.inkLt }}>
                        {payment.period_covered}
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 12.5, color: BRAND.ink }}>
                        {payment.receipt_number}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100,
                          background: payment.facture_sent ? BRAND.tl.bg : "#F5F5F7",
                          border: `1px solid ${payment.facture_sent ? `rgba(${BRAND.tl.rgb},0.2)` : "rgba(90,90,106,0.16)"}`,
                          color: payment.facture_sent ? BRAND.tl.hex : BRAND.inkLt,
                          fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase",
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: payment.facture_sent ? BRAND.tl.hex : BRAND.inkLt }} />
                          {payment.facture_sent ? "Envoyé" : "Non envoyé"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
