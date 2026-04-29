import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { Plus, Trash2, Edit } from "lucide-react";

export const Route = createFileRoute("/crm/settings")({
  component: CrmSettings,
});

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
  const [editingUser, setEditingUser] = useState<any>(null);
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
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Paramètres
        </h1>
        <p className="font-body text-muted-foreground mt-2">
          Configurez les frais mensuels et les permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Frais mensuels</CardTitle>
          <CardDescription className="font-body">
            Configurez les frais mensuels pour chaque profil d'enfant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="typique">Enfant typique (MAD)</Label>
              <Input
                id="typique"
                type="number"
                value={monthlyFees.typique}
                onChange={(e) => setMonthlyFees({ ...monthlyFees, typique: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dys">Enfant Dys (MAD)</Label>
              <Input
                id="dys"
                type="number"
                value={monthlyFees.dys}
                onChange={(e) => setMonthlyFees({ ...monthlyFees, dys: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="autiste">Enfant Autiste (MAD)</Label>
              <Input
                id="autiste"
                type="number"
                value={monthlyFees.autiste}
                onChange={(e) => setMonthlyFees({ ...monthlyFees, autiste: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tdah">Enfant TDAH (MAD)</Label>
              <Input
                id="tdah"
                type="number"
                value={monthlyFees.tdah}
                onChange={(e) => setMonthlyFees({ ...monthlyFees, tdah: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveFees} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Permissions des rôles</CardTitle>
          <CardDescription className="font-body">
            Configurez les permissions pour chaque rôle (bientôt disponible)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Cette fonctionnalité sera disponible dans une prochaine mise à jour.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-xl">Gestion des utilisateurs</CardTitle>
              <CardDescription className="font-body">
                Créez et gérez les comptes utilisateurs
              </CardDescription>
            </div>
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold">
                    Créer un utilisateur
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label>Mot de passe *</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Minimum 6 caractères
                    </p>
                  </div>
                  <div>
                    <Label>Nom d'utilisateur *</Label>
                    <Input
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="johndoe"
                    />
                  </div>
                  <div>
                    <Label>Nom d'affichage</Label>
                    <Input
                      value={newUser.display_name}
                      onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label>Rôle *</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="sales">Ventes</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateUser}
                      disabled={isCreatingUser}
                      className="flex-1"
                    >
                      {isCreatingUser ? "Création..." : "Créer"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowUserDialog(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom d'utilisateur</TableHead>
                <TableHead>Nom d'affichage</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.display_name || user.username}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-purple-bg text-purple">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
