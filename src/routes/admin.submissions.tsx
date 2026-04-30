import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase, EzSubmission } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Eye, Reply, CheckCircle, X, ChevronDown, Send } from "lucide-react";

export const Route = createFileRoute("/admin/submissions")({
  component: AdminSubmissions,
});

/* ─── Status config ─── */
const STATUS = {
  new:       { label: "Nouveau",  color: "#C2185B", bg: "#FFF0F5", rgb: "194,24,91"  },
  contacted: { label: "Contacté", color: "#7B1FA2", bg: "#F8F0FF", rgb: "123,31,162" },
  converted: { label: "Converti", color: "#00897B", bg: "#E8F8F5", rgb: "0,137,123"  },
} as const;
type StatusKey = keyof typeof STATUS;

const FORM_TYPE = {
  contact:     { label: "Contact",     color: "#7B1FA2", bg: "#F8F0FF", rgb: "123,31,162" },
  appointment: { label: "Rendez-vous", color: "#00897B", bg: "#E8F8F5", rgb: "0,137,123"  },
} as const;

/* ─── Shared badge ─── */
function Chip({ label, color, bg, rgb }: { label: string; color: string; bg: string; rgb: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: 0.3,
      color, background: bg, border: `1px solid rgba(${rgb},0.28)`,
      padding: "3px 10px", borderRadius: 100,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "block", flexShrink: 0 }} />
      {label}
    </span>
  );
}

/* ─── Status dropdown ─── */
function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const s = STATUS[value as StatusKey] ?? STATUS.new;

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
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
          color: s.color, background: s.bg,
          border: `1px solid rgba(${s.rgb},0.28)`,
          padding: "4px 10px", borderRadius: 100, cursor: "pointer", transition: "opacity 0.15s",
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
              background: "white", borderRadius: 10, border: "1px solid rgba(45,45,58,0.1)",
              boxShadow: "0 8px 24px rgba(45,45,58,0.12)", minWidth: 140, overflow: "hidden",
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

/* ─── Reusable modal shell ─── */
function Modal({ onClose, children, maxWidth = 580 }: { onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(30,30,46,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: "white", borderRadius: 4, border: "1px solid rgba(45,45,58,0.1)", boxShadow: "0 32px 80px rgba(45,45,58,0.18), 6px 6px 0 rgba(123,31,162,0.08)", width: "100%", maxWidth, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg,#C2185B,#7B1FA2,#00897B,#F9A825)", flexShrink: 0 }} />
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Modal header ─── */
function ModalHeader({ chapter, title, badge, onClose }: { chapter: string; title: React.ReactNode; badge?: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(45,45,58,0.08)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7B1FA2" }} />
          <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#7B1FA2", fontWeight: 700 }}>{chapter}</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, letterSpacing: "-0.5px", color: "var(--ek-ink)", marginBottom: badge ? 6 : 0 }}>{title}</h2>
        {badge}
      </div>
      <button
        onClick={onClose}
        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(45,45,58,0.1)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ek-ink-lt)", flexShrink: 0, transition: "background 0.15s" }}
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ─── Info tile ─── */
function InfoTile({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ padding: "11px 13px", background: "#F7F6FC", borderRadius: 4, border: "1px solid rgba(45,45,58,0.07)" }}>
      <div style={{ fontFamily: "var(--font-label)", fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ek-ink)", lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

/* ─── Detail modal ─── */
function DetailModal({ sub, onClose, onConvert }: { sub: EzSubmission; onClose: () => void; onConvert: () => void }) {
  const ft = FORM_TYPE[sub.form_type as keyof typeof FORM_TYPE] ?? FORM_TYPE.contact;
  const st = STATUS[sub.status as StatusKey] ?? STATUS.new;

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        chapter="Détail — Rendez-vous"
        title={`${sub.first_name} ${sub.last_name}`}
        badge={<div style={{ display: "flex", gap: 6 }}><Chip {...ft} /><Chip {...st} /></div>}
        onClose={onClose}
      />
      <div style={{ overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InfoTile label="Email" value={sub.email} />
          <InfoTile label="Téléphone" value={sub.phone} />
          <InfoTile label="Type" value={ft.label} />
          <InfoTile label="Date" value={new Date(sub.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
          {sub.child_age && <InfoTile label="Âge de l'enfant" value={`${sub.child_age} ans`} />}
          {sub.child_profile && <InfoTile label="Profil de l'enfant" value={sub.child_profile} />}
        </div>

        {sub.subject && (
          <div style={{ padding: "11px 13px", background: "#F7F6FC", borderRadius: 4, border: "1px solid rgba(45,45,58,0.07)" }}>
            <div style={{ fontFamily: "var(--font-label)", fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 700, marginBottom: 4 }}>Sujet</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--ek-ink)" }}>{sub.subject}</div>
          </div>
        )}

        {sub.message && (
          <div style={{ padding: "13px 14px", background: "white", borderRadius: 4, border: "1px solid rgba(45,45,58,0.09)" }}>
            <div style={{ fontFamily: "var(--font-label)", fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.35)", fontWeight: 700, marginBottom: 8 }}>Message</div>
            <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13.5, color: "var(--ek-ink)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{sub.message}</p>
          </div>
        )}

        {sub.status === "converted" && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { onClose(); onConvert(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 20px", borderRadius: 100,
              background: "linear-gradient(135deg,#00897B,#00695C)",
              color: "white", border: "none", cursor: "pointer",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5,
              boxShadow: "0 4px 16px rgba(0,137,123,0.25)", marginTop: 4,
            }}
          >
            <CheckCircle size={15} strokeWidth={2.5} />
            Confirmer la conversion CRM
          </motion.button>
        )}
      </div>
    </Modal>
  );
}

/* ─── Reply modal ─── */
function ReplyModal({ sub, onClose, onSent }: { sub: EzSubmission; onClose: () => void; onSent: () => void }) {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const send = async () => {
    if (!message || !subject) { toast.error("Veuillez remplir tous les champs"); return; }
    setSending(true);
    try {
      const htmlTemplate = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f8eaf2;font-family:Arial,sans-serif;color:#262338;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:radial-gradient(circle at top left,#fdeff6 0%,#f8eaf2 35%,#f6f0fb 100%);padding:24px 14px;"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;background:#fffafc;border:1px solid #f3dce9;border-radius:30px;overflow:hidden;box-shadow:0 18px 50px rgba(104,42,88,0.12);"><tr><td style="padding:24px 28px 18px;background:linear-gradient(180deg,#fdeef6 0%,#fff7fb 100%);"><h1 style="margin:14px 0 10px;font-size:36px;line-height:1.05;color:#262338;font-weight:900;letter-spacing:-0.8px;">Réponse à votre <span style="color:#d11f8b;">demande</span></h1><p style="margin:0;font-size:16px;line-height:1.6;color:#5e5a67;">Bonjour ${sub.first_name}, voici notre réponse à votre message.</p></td></tr><tr><td style="padding:22px 28px;"><div style="background:#fbf7f9;border:1px solid #f3e6ee;border-radius:18px;padding:20px;color:#463d4e;line-height:1.8;white-space:pre-line;">${message}</div></td></tr><tr><td style="padding:0 28px 28px;text-align:center;"><div style="background:linear-gradient(90deg,#ff2f9e 0%,#8d1fb0 100%);border-radius:22px;padding:14px 20px;"><a href="https://educazenkids.eiden-group.workers.dev/" style="color:#fff;text-decoration:none;font-size:15px;font-weight:800;">Découvrir EducazenKids</a></div></td></tr><tr><td style="background:#1f1a2b;padding:20px 28px;text-align:center;"><div style="font-size:22px;font-weight:900;"><span style="color:#fff;">educa</span><span style="color:#39d0c8;">zen</span><span style="color:#ff4aa2;">kids</span></div></td></tr></table></td></tr></table></body></html>`;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ toEmail: sub.email, subject, message, html: htmlTemplate, fromName: "EducazenKids" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Réponse envoyée avec succès");
      onSent();
    } catch {
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <ModalHeader chapter="Réponse — Email" title={<>Répondre à <span style={{ color: "#7B1FA2", fontStyle: "italic" }}>{sub.first_name}</span></>} onClose={onClose} />
      <div style={{ overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* To field */}
        <div style={{ padding: "10px 13px", background: "#F8F0FF", borderRadius: 4, border: "1px solid rgba(123,31,162,0.15)" }}>
          <div style={{ fontFamily: "var(--font-label)", fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "#7B1FA2", fontWeight: 700, marginBottom: 3 }}>Destinataire</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ek-ink)" }}>{sub.email}</div>
        </div>

        {/* Subject */}
        <div>
          <div style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.4)", fontWeight: 700, marginBottom: 6 }}>Sujet</div>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Sujet de votre réponse…"
            style={{
              width: "100%", height: 40, padding: "0 13px",
              fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--ek-ink)",
              background: "white", border: "1px solid rgba(45,45,58,0.12)", borderRadius: 8,
              outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#7B1FA2"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123,31,162,0.09)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(45,45,58,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Message */}
        <div>
          <div style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(45,45,58,0.4)", fontWeight: 700, marginBottom: 6 }}>Message</div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écrivez votre réponse ici…"
            rows={6}
            style={{
              width: "100%", padding: "11px 13px", resize: "vertical",
              fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--ek-ink)",
              background: "white", border: "1px solid rgba(45,45,58,0.12)", borderRadius: 8,
              outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box", lineHeight: 1.6,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#7B1FA2"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123,31,162,0.09)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(45,45,58,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={send}
          disabled={sending}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 20px", borderRadius: 100,
            background: sending ? "rgba(45,45,58,0.15)" : "linear-gradient(135deg,#7B1FA2,#C2185B)",
            color: sending ? "var(--ek-ink-lt)" : "white", border: "none", cursor: sending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5,
            boxShadow: sending ? "none" : "0 4px 16px rgba(123,31,162,0.25)",
            transition: "all 0.2s",
          }}
        >
          {sending ? (
            <motion.span className="block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          ) : <Send size={14} strokeWidth={2.5} />}
          {sending ? "Envoi en cours…" : "Envoyer la réponse"}
        </motion.button>
      </div>
    </Modal>
  );
}

/* ─── Conversion modal ─── */
function ConversionModal({ sub, onClose, onConfirm, loading }: { sub: EzSubmission; onClose: () => void; onConfirm: (paid: boolean) => void; loading: boolean }) {
  const [addToCrm, setAddToCrm] = React.useState(false);
  const [paid, setPaid] = React.useState(false);

  const CheckBox = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
          border: `2px solid ${checked ? "#00897B" : "rgba(45,45,58,0.2)"}`,
          background: checked ? "#00897B" : "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.18s",
        }}
      >
        {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="1,6 4.5,9.5 11,2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, color: "var(--ek-ink)" }}>{label}</span>
    </label>
  );

  return (
    <Modal onClose={onClose} maxWidth={460}>
      <ModalHeader chapter="Conversion CRM" title={<>Convertir <span style={{ color: "#00897B", fontStyle: "italic" }}>{sub.first_name}</span></>} onClose={onClose} />
      <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: "12px 14px", background: "#E8F8F5", border: "1px solid rgba(0,137,123,0.2)", borderRadius: 4 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "#00897B", lineHeight: 1.6 }}>
            Ce client sera ajouté ou mis à jour dans le CRM avec le statut <strong>Converti</strong>.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
          <CheckBox checked={addToCrm} onChange={setAddToCrm} label="Ajouter ce client au CRM" />
          <CheckBox checked={paid} onChange={setPaid} label="Le client a déjà payé" />
        </div>

        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onConfirm(paid)}
            disabled={loading || !addToCrm}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 0", borderRadius: 100, border: "none",
              background: loading || !addToCrm ? "rgba(45,45,58,0.1)" : "linear-gradient(135deg,#00897B,#00695C)",
              color: loading || !addToCrm ? "rgba(45,45,58,0.35)" : "white",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5,
              cursor: loading || !addToCrm ? "not-allowed" : "pointer",
              boxShadow: loading || !addToCrm ? "none" : "0 4px 16px rgba(0,137,123,0.22)",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <motion.span className="block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
            ) : <CheckCircle size={14} strokeWidth={2.5} />}
            {loading ? "Conversion…" : "Confirmer"}
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 100,
              border: "1px solid rgba(45,45,58,0.15)", background: "white",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
              color: "var(--ek-ink-lt)", cursor: "pointer", transition: "all 0.18s",
            }}
          >
            Annuler
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Icon button ─── */
function IconBtn({ onClick, children, hoverAccent = "#7B1FA2", hoverBg = "#F8F0FF", title }: { onClick: () => void; children: React.ReactNode; hoverAccent?: string; hoverBg?: string; title?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
      onClick={onClick} title={title}
      style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(45,45,58,0.12)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(45,45,58,0.4)", transition: "all 0.15s" }}
      onMouseEnter={e => { const b = e.currentTarget as HTMLElement; b.style.borderColor = hoverAccent; b.style.color = hoverAccent; b.style.background = hoverBg; }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLElement; b.style.borderColor = "rgba(45,45,58,0.12)"; b.style.color = "rgba(45,45,58,0.4)"; b.style.background = "transparent"; }}
    >
      {children}
    </motion.button>
  );
}

/* ─── Main page ─── */
function AdminSubmissions() {
  const [submissions, setSubmissions] = React.useState<EzSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = React.useState<EzSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [detailSub, setDetailSub] = React.useState<EzSubmission | null>(null);
  const [replySub, setReplySub] = React.useState<EzSubmission | null>(null);
  const [convSub, setConvSub] = React.useState<EzSubmission | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);

  React.useEffect(() => { fetchSubmissions(); }, []);

  React.useEffect(() => {
    let f = submissions;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(s => s.first_name.toLowerCase().includes(q) || s.last_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.subject && s.subject.toLowerCase().includes(q)));
    }
    if (typeFilter !== "all") f = f.filter(s => s.form_type === typeFilter);
    if (statusFilter !== "all") f = f.filter(s => s.status === statusFilter);
    setFilteredSubmissions(f);
  }, [submissions, searchTerm, typeFilter, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase.from("ez_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch { toast.error("Erreur lors du chargement"); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("ez_submissions").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchSubmissions();
    } catch { toast.error("Erreur lors de la mise à jour"); }
  };

  const handleConfirmConversion = async (paid: boolean) => {
    if (!convSub) return;
    setIsConverting(true);
    try {
      const { data: settingsData } = await supabase.from("ez_settings").select("value").eq("key", `monthly_fee_${convSub.child_profile?.toLowerCase().replace("enfant ", "").replace(" ", "_")}`).single();
      const monthlyFee = settingsData ? Number(settingsData.value) : 800;

      let existing = null;
      const { data: byId } = await supabase.from("ez_crm_customers").select("*").eq("submission_id", convSub.id).single();
      if (byId) { existing = byId; }
      else {
        const { data: byPhone } = await supabase.from("ez_crm_customers").select("*").eq("phone", convSub.phone?.toLowerCase()).single();
        if (byPhone) { existing = byPhone; }
        else {
          const { data: byEmail } = await supabase.from("ez_crm_customers").select("*").eq("email", convSub.email?.toLowerCase()).single();
          if (byEmail) { existing = byEmail; }
        }
      }

      const enrollmentDate = new Date().toISOString().split("T")[0];
      const paymentDay = new Date().getDate();

      if (existing) {
        await supabase.from("ez_crm_customers").update({ crm_stage: "converti", monthly_fee: monthlyFee, enrollment_date: enrollmentDate, payment_day: paymentDay }).eq("id", existing.id);
      } else {
        await supabase.from("ez_crm_customers").insert({ submission_id: convSub.id, parent_name: `${convSub.first_name} ${convSub.last_name}`, email: convSub.email?.toLowerCase(), phone: convSub.phone?.toLowerCase(), child_name: `Enfant de ${convSub.child_age || "X"} ans`, child_profile: convSub.child_profile || "Enfant typique", crm_stage: "converti", enrollment_date: enrollmentDate, monthly_fee: monthlyFee, payment_day: paymentDay });
      }

      if (paid) {
        const customerId = existing?.id || (await supabase.from("ez_crm_customers").select("id").eq("submission_id", convSub.id).single()).data?.id;
        if (customerId) {
          const receiptNumber = `EDU-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
          await supabase.from("ez_crm_payments").insert({ customer_id: customerId, amount: monthlyFee, payment_date: enrollmentDate, payment_method: "cash", period_covered: new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }), receipt_number: receiptNumber, certificate_sent: false });
          toast.success("Client ajouté au CRM et paiement enregistré");
        }
      } else {
        toast.success("Client ajouté au CRM");
      }

      setConvSub(null);
      fetchSubmissions();
    } catch { toast.error("Erreur lors de la conversion"); }
    finally { setIsConverting(false); }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Type", "Nom", "Email", "Sujet", "Statut", "Date"];
    const rows = filteredSubmissions.map(s => [s.id, s.form_type === "contact" ? "Contact" : "Rendez-vous", `${s.first_name} ${s.last_name}`, s.email, s.subject || "-", s.status, new Date(s.created_at).toLocaleDateString("fr-FR")]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rendez_vous_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.span className="block w-6 h-6 rounded-full border-[2.5px] border-[rgba(123,31,162,0.2)] border-t-[#7B1FA2]" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-body)", color: "var(--ek-ink)", minHeight: "100%", position: "relative" }}>
      {/* Dot-grid */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,45,58,0.065) 1px, transparent 0)", backgroundSize: "22px 22px", opacity: 0.45, zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, paddingBottom: 48 }}>

        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[rgba(45,45,58,0.08)] pb-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--ek-pp)" }} />
              <span style={{ fontFamily: "var(--font-label)", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--ek-pp)", fontWeight: 600 }}>
                Chapitre 05 — Rendez-vous
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 0.93, letterSpacing: "-1.5px", color: "var(--ek-ink)" }}>
              <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ display: "block" }}>Gestion des</motion.span>
              <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ display: "block", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, color: "var(--ek-pp)" }}>
                rendez-vous
              </motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: "var(--ek-ink-lt)", marginTop: 8, lineHeight: 1.5 }}>
              {filteredSubmissions.length} demande{filteredSubmissions.length !== 1 ? "s" : ""} affichée{filteredSubmissions.length !== 1 ? "s" : ""}
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={exportToCSV}
            className="flex items-center gap-2 flex-shrink-0"
            style={{ background: "var(--ek-ink)", color: "white", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, padding: "10px 20px", borderRadius: 100, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(30,30,46,0.18)", letterSpacing: 0.2 }}
          >
            <Download size={14} strokeWidth={2.5} />
            Exporter CSV
          </motion.button>
        </motion.div>

        {/* ─── Filters ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mb-5"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} strokeWidth={2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(45,45,58,0.35)", pointerEvents: "none" }} />
            <input
              type="text" placeholder="Rechercher par nom, email ou sujet…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", height: 40, paddingLeft: 36, paddingRight: 14, fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--ek-ink)", background: "white", border: "1px solid rgba(45,45,58,0.12)", borderRadius: 10, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#7B1FA2"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123,31,162,0.09)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(45,45,58,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: "all",         label: "Tous",         color: "var(--ek-ink)", bg: "white",   rgb: "45,45,58" },
              { key: "contact",     label: "Contact",      color: "#7B1FA2",       bg: "#F8F0FF", rgb: "123,31,162" },
              { key: "appointment", label: "Rendez-vous",  color: "#00897B",       bg: "#E8F8F5", rgb: "0,137,123" },
            ].map(f => (
              <button key={f.key} onClick={() => setTypeFilter(f.key)} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: typeFilter === f.key ? f.color : "rgba(45,45,58,0.4)", background: typeFilter === f.key ? f.bg : "transparent", border: `1px solid ${typeFilter === f.key ? `rgba(${f.rgb},0.3)` : "rgba(45,45,58,0.1)"}`, padding: "5px 12px", borderRadius: 100, cursor: "pointer", transition: "all 0.18s", letterSpacing: 0.3 }}>
                {f.label}
              </button>
            ))}
            <span style={{ width: 1, height: 20, background: "rgba(45,45,58,0.1)", margin: "0 2px" }} />
            {[
              { key: "all",       label: "Tous statuts", color: "var(--ek-ink)", bg: "white",   rgb: "45,45,58" },
              { key: "new",       ...STATUS.new },
              { key: "contacted", ...STATUS.contacted },
              { key: "converted", ...STATUS.converted },
            ].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: statusFilter === f.key ? f.color : "rgba(45,45,58,0.4)", background: statusFilter === f.key ? f.bg : "transparent", border: `1px solid ${statusFilter === f.key ? `rgba(${f.rgb},0.3)` : "rgba(45,45,58,0.1)"}`, padding: "5px 12px", borderRadius: 100, cursor: "pointer", transition: "all 0.18s", letterSpacing: 0.3 }}>
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Table ─── */}
        {/* ─── Table ─── */}
<div className="w-full overflow-x-auto">
  <motion.div
    className="min-w-[720px]"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    style={{
      background: "white",
      borderRadius: 4,
      border: "1px solid rgba(45,45,58,0.1)",
      boxShadow: "3px 3px 0 rgba(45,45,58,0.06)",
      overflow: "hidden"
    }}
  >
    {/* Header */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 110px 130px 90px 80px",
        padding: "10px 20px",
        background: "#F7F6FC",
        borderBottom: "1px solid rgba(45,45,58,0.08)"
      }}
    >
      {["Nom", "Email", "Type", "Statut", "Date", "Actions"].map((h, i) => (
        <div
          key={i}
          style={{
            fontFamily: "var(--font-label)",
            fontSize: 9,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            color: "rgba(45,45,58,0.4)",
            fontWeight: 700,
            padding: "0 4px"
          }}
        >
          {h}
        </div>
      ))}
    </div>

    {/* Rows */}
    {filteredSubmissions.length === 0 ? (
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: 32,
          color: "rgba(45,45,58,0.08)",
          letterSpacing: "-1px"
        }}>
          —
        </div>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 13.5,
          color: "var(--ek-ink-lt)",
          marginTop: 8
        }}>
          Aucune demande trouvée
        </div>
      </div>
    ) : filteredSubmissions.map((sub, i) => {
      const ft = FORM_TYPE[sub.form_type as keyof typeof FORM_TYPE] ?? FORM_TYPE.contact;

      return (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.35 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 110px 130px 90px 80px",
            padding: "13px 20px",
            borderBottom: "1px solid rgba(45,45,58,0.06)",
            alignItems: "center",
            transition: "background 0.15s"
          }}
          whileHover={{ backgroundColor: "rgba(123,31,162,0.02)" }}
        >
          {/* Name */}
          <div style={{
            padding: "0 4px",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 13.5,
            color: "var(--ek-ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {sub.first_name} {sub.last_name}
          </div>

          {/* Email */}
          <div style={{
            padding: "0 4px",
            fontFamily: "var(--font-body)",
            fontSize: 12.5,
            color: "var(--ek-ink-lt)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {sub.email}
          </div>

          {/* Type */}
          <div style={{ padding: "0 4px" }}>
            <Chip {...ft} />
          </div>

          {/* Status */}
          <div style={{ padding: "0 4px" }}>
            <StatusSelect
              value={sub.status}
              onChange={v => updateStatus(sub.id, v)}
            />
          </div>

          {/* Date */}
          <div style={{
            padding: "0 4px",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--ek-ink-lt)"
          }}>
            {new Date(sub.created_at).toLocaleDateString("fr-FR")}
          </div>

          {/* Actions */}
          <div style={{ padding: "0 4px", display: "flex", gap: 6 }}>
            <IconBtn onClick={() => setDetailSub(sub)} title="Voir les détails">
              <Eye size={13} strokeWidth={2} />
            </IconBtn>

            <IconBtn
              onClick={() => setReplySub(sub)}
              title="Répondre"
              hoverAccent="#7B1FA2"
              hoverBg="#F8F0FF"
            >
              <Reply size={13} strokeWidth={2} />
            </IconBtn>

            {sub.status === "converted" && (
              <IconBtn
                onClick={() => setConvSub(sub)}
                title="Convertir CRM"
                hoverAccent="#00897B"
                hoverBg="#E8F8F5"
              >
                <CheckCircle size={13} strokeWidth={2} />
              </IconBtn>
            )}
          </div>
        </motion.div>
      );
    })}

    {/* Footer */}
    {filteredSubmissions.length > 0 && (
      <div style={{
        padding: "12px 20px",
        background: "#F7F6FC",
        borderTop: "1px solid rgba(45,45,58,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <span style={{
          fontFamily: "var(--font-label)",
          fontSize: 9,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(45,45,58,0.35)",
          fontWeight: 700
        }}>
          {filteredSubmissions.length} résultat{filteredSubmissions.length !== 1 ? "s" : ""}
        </span>

        <div className="flex gap-1">
          {["#C2185B", "#7B1FA2", "#00897B", "#F9A825"].map((c, i) => (
            <span key={i} style={{ width: 12, height: 3, background: c, borderRadius: 2 }} />
          ))}
        </div>
      </div>
    )}
  </motion.div>
</div>
      </div>

      {/* ─── Modals ─── */}
      <AnimatePresence>
        {detailSub && (
          <DetailModal
            sub={detailSub}
            onClose={() => setDetailSub(null)}
            onConvert={() => setConvSub(detailSub)}
          />
        )}
        {replySub && (
          <ReplyModal
            sub={replySub}
            onClose={() => setReplySub(null)}
            onSent={() => { setReplySub(null); updateStatus(replySub.id, "contacted"); }}
          />
        )}
        {convSub && (
          <ConversionModal
            sub={convSub}
            onClose={() => setConvSub(null)}
            onConfirm={handleConfirmConversion}
            loading={isConverting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}