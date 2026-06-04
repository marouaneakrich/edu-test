import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/crm/camps")({
  component: CrmCamps,
});

const BRAND = {
  mg: { hex: "#C2185B", rgb: "194,24,91", bg: "#FFF0F5" },
  pp: { hex: "#7B1FA2", rgb: "123,31,162", bg: "#F8F0FF" },
  tl: { hex: "#00897B", rgb: "0,137,123", bg: "#E8F8F5" },
  gd: { hex: "#F9A825", rgb: "249,168,37", bg: "#FFF8EC" },
  pk: { hex: "#D11F8B", rgb: "209,31,139", bg: "#FFF0F8" },
  bl: { hex: "#1565C0", rgb: "21,101,192", bg: "#EEF3FB" },
  ink: "#2D2D3A",
  inkLt: "#5A5A6A",
  canvas: "#FFFDF9",
  border: "rgba(45,45,58,0.09)",
};
const FH = "'Nunito', sans-serif";
const FE = "'Playfair Display', serif";
const FL = "'Cormorant Garamond', serif";

const CAMP_TYPES: Record<string, { label: string; color: string; rgb: string; bg: string }> = {
  camp_ete: { label: "Summer Camp", color: BRAND.pk.hex, rgb: BRAND.pk.rgb, bg: BRAND.pk.bg },
};

const CAMP_WEEK_LABELS: Record<string, string> = {
  week1: "Sem 1: 23-27 juin",
  week2: "Sem 2: 30 juin-4 juil",
  week3: "Sem 3: 7-11 juil",
  week4: "Sem 4: 14-18 juil",
  week5: "Sem 5: 21-25 juil",
  tous: "Toutes",
};

function Chip({ label, color, bg, rgb }: { label: string; color: string; bg: string; rgb: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: FH, fontWeight: 700, fontSize: 10, letterSpacing: 0.3,
      color, background: bg, border: `1px solid rgba(${rgb},0.28)`,
      padding: "3px 10px", borderRadius: 100,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "12px 14px", background: BRAND.canvas, borderRadius: 4, border: "1px solid rgba(45,45,58,0.07)" }}>
      <div style={{ fontFamily: FL, fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: 13, color: BRAND.ink, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
}

function StyledInput({ value, onChange, placeholder, icon }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: React.ReactNode;
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
        type="text"
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
        onFocus={e => (e.target.style.borderColor = `rgba(${BRAND.pk.rgb},0.4)`)}
        onBlur={e => (e.target.style.borderColor = BRAND.border)}
      />
    </div>
  );
}

function IconBtn({ onClick, children, hoverAccent, hoverBg }: {
  onClick: () => void; children: React.ReactNode;
  hoverAccent?: string; hoverBg?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
      onClick={onClick}
      style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${BRAND.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: BRAND.inkLt, transition: "all 0.15s" }}
      onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = hoverAccent ?? BRAND.pk.hex; b.style.color = hoverAccent ?? BRAND.pk.hex; b.style.background = hoverBg ?? BRAND.pk.bg; }}
      onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = BRAND.border; b.style.color = BRAND.inkLt; b.style.background = "transparent"; }}
    >
      {children}
    </motion.button>
  );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(30,30,46,0.35)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 6,
              border: "1px solid rgba(45,45,58,0.1)",
              boxShadow: "0 32px 80px rgba(45,45,58,0.18)",
              width: "100%", maxWidth: 640, maxHeight: "90vh",
              overflow: "hidden", display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND.pk.hex}, ${BRAND.pp.hex}, ${BRAND.tl.hex})`, flexShrink: 0 }} />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CrmCamps() {
  const { isMobile } = useBreakpoint();
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedCamp, setSelectedCamp] = useState<any>(null);

  const fetchCamps = async () => {
    try {
      const { data, error } = await supabase
        .from("ez_submissions")
        .select("*")
        .eq("form_type", "camp_ete")
        .eq("status", "converted")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCamps(data || []);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCamps(); }, []);

  const filtered = camps.filter(s => {
    const q = searchTerm.toLowerCase();
    return !q || s.last_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone?.toLowerCase().includes(q);
  });

  const px = isMobile ? 16 : 48;
  const py = isMobile ? 20 : 40;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 280 }}>
        <motion.span style={{ width: 20, height: 20, borderRadius: "50%", border: `2.5px solid rgba(${BRAND.pk.rgb},0.2)`, borderTopColor: BRAND.pk.hex, display: "block" }}
          animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }} />
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: 14, color: BRAND.pk.hex }}>Chargement…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: `${py}px ${px}px`, fontFamily: FH, boxSizing: "border-box" }}>
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "radial-gradient(rgba(45,45,58,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px", pointerEvents: "none", opacity: 0.6, zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? 28 : 40, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 22, height: 1.5, background: BRAND.pk.hex, flexShrink: 0 }} />
              <span style={{ fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase" as const, color: BRAND.pk.hex }}>
                CRM — Camps
              </span>
            </div>
            <h1 style={{
              fontFamily: FH, fontWeight: 800,
              fontSize: isMobile ? "clamp(26px, 8vw, 34px)" : "clamp(32px, 4vw, 46px)",
              lineHeight: 1.05, color: BRAND.ink, marginBottom: 10, letterSpacing: "-0.02em",
            }}>
              <span>Inscriptions aux </span>
              <span style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.pk.hex, fontWeight: 500 }}>camps</span>
            </h1>
            <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: isMobile ? 13 : 15, color: BRAND.inkLt, lineHeight: 1.6 }}>
              Gérez les inscriptions au Summer Camp et aux camps de vacances
            </p>
          </div>
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{
          background: "#fff", borderRadius: 8, border: `1px solid ${BRAND.border}`,
          boxShadow: "0 1px 2px rgba(45,45,58,0.04)", padding: "20px 24px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 14, height: 1.5, background: BRAND.bl.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.bl.hex }}>
              Filtres & Recherche
            </span>
          </div>
          <StyledInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher par nom, email, téléphone…" icon={<Search size={14} strokeWidth={2} />} />
          <div style={{ marginTop: 12, fontFamily: FE, fontStyle: "italic", fontSize: 12, color: BRAND.inkLt }}>
            {filtered.length} inscription{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
          background: "#fff", borderRadius: 8, border: `1px solid ${BRAND.border}`,
          boxShadow: "0 1px 2px rgba(45,45,58,0.04)", overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 14, height: 1.5, background: BRAND.pk.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.pk.hex }}>
              Liste des inscriptions
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
              <thead>
                <tr style={{ background: "rgba(45,45,58,0.025)" }}>
                  {["Parent", "Email", "Téléphone", "Type", "Semaines", "Statut", "Date", "Actions"].map(h => (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "48px 20px", textAlign: "center" as const }}>
                      <div style={{ fontFamily: FH, fontWeight: 800, fontSize: 32, color: "rgba(45,45,58,0.12)", marginBottom: 8 }}>—</div>
                      <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 13, color: BRAND.inkLt }}>Aucune inscription trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => {
                    const ct = CAMP_TYPES[s.form_type] ?? { label: s.form_type, color: "#666", rgb: "100,100,100", bg: "#f5f5f5" };
                    const fd = s.form_data as Record<string, unknown> | undefined;
                    const weeks = Array.isArray(fd?.selectedWeeks)
                      ? (fd.selectedWeeks as string[]).map((w: string) => CAMP_WEEK_LABELS[w] || w).join(", ")
                      : "-";
                    return (
                      <motion.tr key={s.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}
                        style={{ borderBottom: `1px solid ${BRAND.border}`, transition: "background .15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(45,45,58,0.02)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 700, color: BRAND.ink }}>{s.last_name}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: FH, fontSize: 12, color: BRAND.ink }}>{s.email}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: FH, fontSize: 12, color: BRAND.inkLt }}>{s.phone || "-"}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <Chip {...ct} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: FH, fontSize: 11, color: BRAND.inkLt, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{weeks}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontFamily: FH, fontWeight: 700, fontSize: 10,
                            padding: "3px 10px", borderRadius: 100,
                            background: s.status === "converted" ? "#E8F8F5" : "#FFF0F5",
                            border: `1px solid ${s.status === "converted" ? "rgba(0,137,123,0.3)" : "rgba(194,24,91,0.3)"}`,
                            color: s.status === "converted" ? "#00897B" : "#C2185B",
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.status === "converted" ? "#00897B" : "#C2185B", flexShrink: 0 }} />
                            {s.status === "converted" ? "Converti" : "Nouveau"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: FH, fontSize: 11, color: BRAND.inkLt }}>{new Date(s.created_at).toLocaleDateString("fr-FR")}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <IconBtn onClick={() => setSelectedCamp(s)} hoverAccent={BRAND.pk.hex} hoverBg={BRAND.pk.bg}>
                            <Eye size={13} strokeWidth={2} />
                          </IconBtn>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selectedCamp} onClose={() => setSelectedCamp(null)}>
        {selectedCamp && (() => {
          const s = selectedCamp;
          const fd = s.form_data as Record<string, unknown> | undefined;
          const weeks = Array.isArray(fd?.selectedWeeks)
            ? (fd.selectedWeeks as string[]).map((w: string) => CAMP_WEEK_LABELS[w] || w).join(", ")
            : "-";
          const activities = Array.isArray(fd?.activities) ? (fd.activities as string[]).join(", ") : "-";
          return (
            <>
              <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: BRAND.pk.hex }}>
                      Détail — Summer Camp
                    </span>
                    <Chip {...CAMP_TYPES[s.form_type] ?? CAMP_TYPES.camp_ete} />
                  </div>
                  <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px", color: BRAND.ink }}>{s.last_name}</h2>
                </div>
                <button onClick={() => setSelectedCamp(null)} style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: `1px solid ${BRAND.border}`, background: "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", color: BRAND.inkLt, flexShrink: 0,
                }}>
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
              <div style={{ overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <InfoTile label="Parent" value={s.last_name} />
                  <InfoTile label="Email" value={s.email} />
                  <InfoTile label="Téléphone" value={s.phone || "-"} />
                  <InfoTile label="Adresse" value={fd?.address as string || "-"} />
                  <InfoTile label="Date de naissance" value={fd?.dateOfBirth as string || "-"} />
                  <InfoTile label="Nombre d'enfants" value={String(fd?.numberOfChildren ?? "1")} />
                  <InfoTile label="Semaines" value={weeks} />
                  <InfoTile label="Activités" value={activities} />
                  <InfoTile label="Type de camp" value={fd?.campType === "fulltime" ? "Temps plein" : "Temps partiel"} />
                  <InfoTile label="Besoins spéciaux" value={fd?.specialNeeds as string || "-"} />
                  <InfoTile label="Allergies" value={fd?.allergies as string || "-"} />
                  <InfoTile label="Conditions médicales" value={fd?.medicalConditions as string || "-"} />
                  <InfoTile label="Médicaments" value={fd?.medications as string || "-"} />
                  <InfoTile label="Assurance" value={fd?.insurance as string || "-"} />
                  <InfoTile label="Contact urgence" value={fd?.emergencyContactName as string || "-"} />
                  <InfoTile label="Tél urgence" value={fd?.emergencyPhone as string || "-"} />
                  <InfoTile label="Photo" value={fd?.photoConsent ? "Oui" : "Non"} />
                </div>
                {(fd?.specialRequests as string) && (
                  <div style={{ padding: "13px 14px", background: "white", borderRadius: 4, border: "1px solid rgba(45,45,58,0.09)" }}>
                    <div style={{ fontFamily: FL, fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 600, marginBottom: 8 }}>Demandes spéciales</div>
                    <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 13.5, color: BRAND.ink, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{fd?.specialRequests as string}</p>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Modal>
    </div>
  );
}
