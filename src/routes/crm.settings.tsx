import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/crm/settings")({
  component: CrmSettings,
});

const BRAND = {
  mg: { hex: "#C2185B", rgb: "194,24,91", bg: "#FFF0F5" },
  pp: { hex: "#7B1FA2", rgb: "123,31,162", bg: "#F8F0FF" },
  tl: { hex: "#00897B", rgb: "0,137,123", bg: "#E8F8F5" },
  gd: { hex: "#F9A825", rgb: "249,168,37", bg: "#FFF8EC" },
  ink: "#2D2D3A",
  inkLt: "#5A5A6A",
  canvas: "#FFFDF9",
  border: "rgba(45,45,58,0.09)",
};
const FH = "'Nunito', sans-serif";
const FE = "'Playfair Display', serif";
const FL = "'Cormorant Garamond', serif";

function CrmSettings() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [monthlyFees, setMonthlyFees] = useState({
    typique: 800,
    dys: 1500,
    autiste: 2500,
    tdah: 1800,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    username: "",
    display_name: "",
    role: "sales",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    if (roleLoading) return;

    if (isAdmin === false) {
      window.location.href = "/admin-choice";
      return;
    }

    if (isAdmin === true) {
      fetchSettings();
    }
  }, [isAdmin, roleLoading]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("ez_settings")
        .select("key, value")
        .in("key", ["monthly_fee_typique", "monthly_fee_dys", "monthly_fee_autiste", "monthly_fee_tdah"]);

      if (error) throw error;

      const fees: any = { ...monthlyFees };
      data?.forEach((setting) => {
        if (setting.key === "monthly_fee_typique") fees.typique = Number(setting.value);
        if (setting.key === "monthly_fee_dys") fees.dys = Number(setting.value);
        if (setting.key === "monthly_fee_autiste") fees.autiste = Number(setting.value);
        if (setting.key === "monthly_fee_tdah") fees.tdah = Number(setting.value);
      });

      setMonthlyFees(fees);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("ez_user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.username) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (newUser.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsCreatingUser(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Configuration Supabase manquante (URL/ANON KEY)");
      }

      const adminSafeSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      // Create auth user
      const { data: authData, error: authError } = await adminSafeSupabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user role
        const { error: roleError } = await supabase
          .from("ez_user_roles")
          .insert({
            user_id: authData.user.id,
            role: newUser.role,
            username: newUser.username,
            display_name: newUser.display_name || newUser.username,
            email: newUser.email,
          });

        if (roleError) throw roleError;

        toast.success("Utilisateur créé avec succès");
        setShowUserDialog(false);
        setNewUser({
          email: "",
          password: "",
          username: "",
          display_name: "",
          role: "sales",
        });
        fetchSettings();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Erreur lors de la création de l'utilisateur");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("ez_user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      // Also delete from auth (requires service role key, so we'll skip for now)
      toast.success("Utilisateur supprimé");
      fetchSettings();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleSaveFees = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "monthly_fee_typique", value: monthlyFees.typique.toString() },
        { key: "monthly_fee_dys", value: monthlyFees.dys.toString() },
        { key: "monthly_fee_autiste", value: monthlyFees.autiste.toString() },
        { key: "monthly_fee_tdah", value: monthlyFees.tdah.toString() },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("ez_settings")
          .update({ value: update.value })
          .eq("key", update.key);

        if (error) throw error;
      }

      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 280, background: BRAND.canvas }}>
        <motion.span
          style={{ width: 20, height: 20, borderRadius: "50%", border: `2.5px solid rgba(${BRAND.pp.rgb},0.2)`, borderTopColor: BRAND.pp.hex, display: "block" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
        />
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: 14, color: BRAND.pp.hex }}>Chargement…</span>
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 18, height: 1.5, background: BRAND.pp.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: BRAND.pp.hex }}>
              CRM — Paramètres
            </span>
          </div>
          <h1 style={{ fontFamily: FH, fontWeight: 800, fontSize: "clamp(26px, 4vw, 42px)", lineHeight: 1, color: BRAND.ink, letterSpacing: "-0.02em" }}>
            Configuration <span style={{ fontFamily: FE, fontStyle: "italic", color: BRAND.pp.hex, fontWeight: 500 }}>générale</span>
          </h1>
          <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 14, color: BRAND.inkLt, marginTop: 8 }}>
            Configurez les frais mensuels et les permissions
          </p>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${BRAND.border}`, borderRadius: 6, padding: 16, boxShadow: "0 10px 28px -24px rgba(45,45,58,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 16, height: 1.5, background: BRAND.pp.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: BRAND.pp.hex }}>
              Frais mensuels
            </span>
          </div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            {[
              { key: "typique", label: "Enfant typique (MAD)" },
              { key: "dys", label: "Enfant Dys (MAD)" },
              { key: "autiste", label: "Enfant Autiste (MAD)" },
              { key: "tdah", label: "Enfant TDAH (MAD)" },
            ].map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} style={{ display: "block", marginBottom: 6, fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.inkLt }}>
                  {field.label}
                </label>
                <input
                  id={field.key}
                  type="number"
                  value={(monthlyFees as any)[field.key]}
                  onChange={(e) => setMonthlyFees({ ...monthlyFees, [field.key]: Number(e.target.value) })}
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontFamily: FH, fontSize: 13, color: BRAND.ink, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button
              type="button"
              onClick={handleSaveFees}
              disabled={saving}
              style={{
                border: "none", background: `linear-gradient(135deg, ${BRAND.pp.hex}, ${BRAND.mg.hex})`, color: "#fff",
                borderRadius: 100, padding: "10px 18px", fontFamily: FH, fontWeight: 800, fontSize: 13,
                cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${BRAND.border}`, borderRadius: 6, padding: 16, boxShadow: "0 10px 28px -24px rgba(45,45,58,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 16, height: 1.5, background: BRAND.gd.hex }} />
            <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: BRAND.gd.hex }}>
              Permissions des rôles
            </span>
          </div>
          <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 13, color: BRAND.inkLt }}>
            Cette fonctionnalité sera disponible dans une prochaine mise à jour.
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 6, border: "1px solid rgba(45,45,58,0.1)", boxShadow: "0 16px 34px -20px rgba(45,45,58,0.3)", overflow: "hidden" }}>
          <div style={{ padding: 16, borderBottom: "1px solid rgba(45,45,58,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 16, height: 1.5, background: BRAND.tl.hex }} />
                <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: BRAND.tl.hex }}>
                  Gestion des utilisateurs
                </span>
              </div>
              <p style={{ fontFamily: FE, fontStyle: "italic", fontSize: 13, color: BRAND.inkLt }}>
                Créez et gérez les comptes utilisateurs
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUserDialog(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 100, padding: "10px 16px", background: BRAND.tl.hex, color: "#fff", fontFamily: FH, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Nouvel utilisateur
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
              <thead style={{ background: BRAND.canvas }}>
                <tr>
                  {["Email", "Nom d'utilisateur", "Nom d'affichage", "Rôle", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontFamily: FL, fontSize: 9, letterSpacing: 2.2, textTransform: "uppercase", color: "rgba(45,45,58,0.45)", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px 14px", textAlign: "center", fontFamily: FE, fontStyle: "italic", color: BRAND.inkLt }}>
                      Aucun utilisateur
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} style={{ borderTop: "1px solid rgba(45,45,58,0.06)" }}>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 13, color: BRAND.ink }}>{user.email || "N/A"}</td>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 13, color: BRAND.ink }}>{user.username}</td>
                      <td style={{ padding: "11px 14px", fontFamily: FH, fontSize: 13, color: BRAND.ink }}>{user.display_name || user.username}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: BRAND.pp.bg, border: `1px solid rgba(${BRAND.pp.rgb},0.2)`, color: BRAND.pp.hex, fontFamily: FL, fontSize: 10, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: BRAND.pp.hex }} />
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.user_id)}
                          style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${BRAND.border}`, background: "#fff", color: BRAND.inkLt, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={14} strokeWidth={2.2} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUserDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserDialog(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 200, background: "rgba(30,30,46,0.35)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff", borderRadius: 6, border: "1px solid rgba(45,45,58,0.1)",
                boxShadow: "0 32px 80px rgba(45,45,58,0.18), 0 1px 2px rgba(45,45,58,0.04)",
                width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND.mg.hex}, ${BRAND.pp.hex}, ${BRAND.tl.hex}, ${BRAND.gd.hex})`, flexShrink: 0 }} />
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(45,45,58,0.08)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 1.5, background: BRAND.pp.hex }} />
                    <span style={{ fontFamily: FL, fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: BRAND.pp.hex }}>
                      Nouvel utilisateur
                    </span>
                  </div>
                  <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px", color: BRAND.ink }}>
                    Créer un utilisateur
                  </h2>
                </div>
                <button onClick={() => setShowUserDialog(false)} style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid rgba(45,45,58,0.1)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: BRAND.inkLt }}>
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>

              <div style={{ overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontFamily: FL, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.inkLt, fontWeight: 600 }}>Email *</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@example.com" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontFamily: FH, fontSize: 13, color: BRAND.ink, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontFamily: FL, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.inkLt, fontWeight: 600 }}>Mot de passe *</label>
                  <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontFamily: FH, fontSize: 13, color: BRAND.ink, outline: "none", boxSizing: "border-box" }} />
                  <p style={{ marginTop: 4, fontFamily: FE, fontStyle: "italic", fontSize: 12, color: BRAND.inkLt }}>Minimum 6 caractères</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontFamily: FL, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.inkLt, fontWeight: 600 }}>Nom d'utilisateur *</label>
                  <input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="johndoe" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontFamily: FH, fontSize: 13, color: BRAND.ink, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontFamily: FL, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.inkLt, fontWeight: 600 }}>Nom d'affichage</label>
                  <input value={newUser.display_name} onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })} placeholder="John Doe" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6, fontFamily: FH, fontSize: 13, color: BRAND.ink, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontFamily: FL, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: BRAND.inkLt, fontWeight: 600 }}>Rôle *</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${BRAND.border}`, borderRadius: 6, background: "#fff", fontFamily: FH, fontSize: 13, color: BRAND.ink }}>
                    <option value="admin">Admin</option>
                    <option value="sales">Ventes</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <button onClick={handleCreateUser} disabled={isCreatingUser} style={{ flex: 1, border: "none", borderRadius: 100, padding: "10px 14px", background: `linear-gradient(135deg, ${BRAND.pp.hex}, ${BRAND.mg.hex})`, color: "#fff", fontFamily: FH, fontWeight: 800, fontSize: 13, cursor: isCreatingUser ? "not-allowed" : "pointer", opacity: isCreatingUser ? 0.7 : 1 }}>
                    {isCreatingUser ? "Création..." : "Créer"}
                  </button>
                  <button onClick={() => setShowUserDialog(false)} style={{ flex: 1, borderRadius: 100, padding: "10px 14px", border: "1px solid rgba(45,45,58,0.15)", background: "#fff", color: BRAND.inkLt, fontFamily: FH, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
