import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Edit, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/crm/customers")({
  component: CrmCustomers,
});

function CrmCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterActivation, setFilterActivation] = useState("all");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    parent_name: "",
    child_name: "",
    email: "",
    phone: "",
    child_profile: "",
    monthly_fee: 0,
    payment_day: 1,
    crm_stage: "nouveau",
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
      setNewPayment({
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "cash",
      });
      fetchCustomers();

      // Trigger certificate email with the actual payment ID
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-certificate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            customer: selectedCustomer,
            payment: {
              ...newPayment,
              id: data.id,
              receipt_number: receiptNumber,
              period_covered: periodCovered,
            },
          }),
        });
      } catch (emailError) {
        console.error("Error sending certificate:", emailError);
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // Check URL params for overdue filter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("filter") === "overdue" && !filterOverdue) {
    setFilterOverdue(true);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!showPaymentDialog) return;
    if (!selectedCustomer) return;

    setNewPayment((prev) => ({
      ...prev,
      amount: prev.amount && prev.amount > 0 ? prev.amount : Number(selectedCustomer.monthly_fee) || 0,
    }));
  }, [showPaymentDialog, selectedCustomer]);

  const calculateCustomerDebt = async (customer: any) => {
    const enrollmentDate = new Date(customer.enrollment_date);
    const currentDate = new Date();
    const daysSinceEnrollment = Math.floor((currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
    const billingCycles = Math.floor(daysSinceEnrollment / 30);
    const expectedPayments = billingCycles * Number(customer.monthly_fee);
    
    const { data: payments } = await supabase
      .from("ez_crm_payments")
      .select("amount")
      .eq("customer_id", customer.id);
    
    const actualPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    
    // Fetch adjustments
    const { data: adjustments } = await supabase
      .from("ez_crm_debt_adjustments")
      .select("amount, adjustment_type")
      .eq("customer_id", customer.id);
    
    let adjustmentTotal = 0;
    adjustments?.forEach(adj => {
      if (adj.adjustment_type === "reduce") {
        adjustmentTotal -= Number(adj.amount);
      } else if (adj.adjustment_type === "clear") {
        adjustmentTotal = -expectedPayments + actualPayments;
      }
    });

    const debt = expectedPayments - actualPayments + adjustmentTotal;
    return debt > 0 ? debt : 0;
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("ez_crm_customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch activation status and debt for each customer
      const customersWithStatus = await Promise.all(
        (data || []).map(async (customer) => {
          const { count: paymentCount } = await supabase
            .from("ez_crm_payments")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customer.id);

          const debt = await calculateCustomerDebt(customer);

          return {
            ...customer,
            is_active: (paymentCount || 0) > 0,
            debt,
          };
        })
      );

      setCustomers(customersWithStatus);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "nouveau":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "contacte":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "qualifie":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "converti":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActivationColor = (isActive: boolean) => {
    return isActive
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.child_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = filterStage === "all" || customer.crm_stage === filterStage;
    const matchesActivation =
      filterActivation === "all" ||
      (filterActivation === "active" && customer.is_active) ||
      (filterActivation === "inactive" && !customer.is_active);
    const matchesOverdue = !filterOverdue || customer.debt > 0;

    return matchesSearch && matchesStage && matchesActivation && matchesOverdue;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Clients
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            Gérez vos clients et leur progression dans le pipeline de vente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Filtres et recherche</CardTitle>
          <CardDescription className="font-body">
            Recherchez et filtrez les clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tous les stades</option>
                <option value="nouveau">Nouveau</option>
                <option value="contacte">Contacté</option>
                <option value="qualifié">Qualifié</option>
                <option value="converti">Converti</option>
              </select>
              <select
                value={filterActivation}
                onChange={(e) => setFilterActivation(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Parent
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Enfant
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Téléphone
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Profil
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Stade CRM
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Activation
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Mensuel
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Dette
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun client trouvé
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-body text-sm">{customer.parent_name}</td>
                      <td className="px-4 py-3 font-body text-sm">{customer.child_name}</td>
                      <td className="px-4 py-3 font-body text-sm">{customer.email}</td>
                      <td className="px-4 py-3 font-body text-sm">{customer.phone}</td>
                      <td className="px-4 py-3 font-body text-sm">{customer.child_profile}</td>
                      <td className="px-4 py-3">
                        <Badge className={getStageColor(customer.crm_stage)}>
                          {customer.crm_stage}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getActivationColor(customer.is_active)}>
                          {customer.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-body text-sm">{customer.monthly_fee} MAD</td>
                      <td className="px-4 py-3 font-body text-sm">{customer.debt.toFixed(0)} MAD</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowViewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setEditForm({
                                parent_name: customer.parent_name,
                                child_name: customer.child_name,
                                email: customer.email,
                                phone: customer.phone,
                                child_profile: customer.child_profile,
                                monthly_fee: Number(customer.monthly_fee),
                                payment_day: Number(customer.payment_day),
                                crm_stage: customer.crm_stage,
                              });
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Détails du client
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Parent</Label>
                <p className="font-body">{selectedCustomer?.parent_name}</p>
              </div>
              <div>
                <Label>Enfant</Label>
                <p className="font-body">{selectedCustomer?.child_name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="font-body">{selectedCustomer?.email}</p>
              </div>
              <div>
                <Label>Téléphone</Label>
                <p className="font-body">{selectedCustomer?.phone}</p>
              </div>
              <div>
                <Label>Profil</Label>
                <p className="font-body">{selectedCustomer?.child_profile}</p>
              </div>
              <div>
                <Label>Stade CRM</Label>
                <p className="font-body">{selectedCustomer?.crm_stage}</p>
              </div>
              <div>
                <Label>Frais mensuels</Label>
                <p className="font-body">{selectedCustomer?.monthly_fee} MAD</p>
              </div>
              <div>
                <Label>Jour de paiement</Label>
                <p className="font-body">Le {selectedCustomer?.payment_day} de chaque mois</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setNewPayment({
                    amount: selectedCustomer?.monthly_fee || 0,
                    payment_date: new Date().toISOString().split("T")[0],
                    payment_method: "cash",
                  });
                  setShowPaymentDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Enregistrer un paiement
              </Button>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Enregistrer un paiement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Montant (MAD)</Label>
              <Input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                placeholder={selectedCustomer?.monthly_fee?.toString()}
              />
            </div>
            <div>
              <Label>Date de paiement</Label>
              <Input
                type="date"
                value={newPayment.payment_date}
                onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Mode de paiement</Label>
              <Select
                value={newPayment.payment_method}
                onValueChange={(value) => setNewPayment({ ...newPayment, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="bank">Banque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={recordPayment}
                disabled={isRecordingPayment || newPayment.amount === 0}
                className="flex-1"
              >
                {isRecordingPayment ? "Enregistrement..." : "Confirmer"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Modifier le client
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Parent</Label>
                <Input
                  value={editForm.parent_name}
                  onChange={(e) => setEditForm({ ...editForm, parent_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Enfant</Label>
                <Input
                  value={editForm.child_name}
                  onChange={(e) => setEditForm({ ...editForm, child_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Profil</Label>
                <Select
                  value={editForm.child_profile}
                  onValueChange={(value) => setEditForm({ ...editForm, child_profile: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typique">Typique</SelectItem>
                    <SelectItem value="dys">Dys</SelectItem>
                    <SelectItem value="autiste">Autiste</SelectItem>
                    <SelectItem value="tdah">TDAH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stade CRM</Label>
                <Select
                  value={editForm.crm_stage}
                  onValueChange={(value) => setEditForm({ ...editForm, crm_stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nouveau">Nouveau</SelectItem>
                    <SelectItem value="contacte">Contacté</SelectItem>
                    <SelectItem value="qualifie">Qualifié</SelectItem>
                    <SelectItem value="converti">Converti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frais mensuels (MAD)</Label>
                <Input
                  type="number"
                  value={editForm.monthly_fee}
                  onChange={(e) => setEditForm({ ...editForm, monthly_fee: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Jour de paiement (1-31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={editForm.payment_day}
                  onChange={(e) => setEditForm({ ...editForm, payment_day: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={async () => {
                  if (!selectedCustomer) return;
                  setIsSaving(true);
                  try {
                    const { error } = await supabase
                      .from("ez_crm_customers")
                      .update({
                        parent_name: editForm.parent_name,
                        child_name: editForm.child_name,
                        email: editForm.email,
                        phone: editForm.phone,
                        child_profile: editForm.child_profile,
                        monthly_fee: editForm.monthly_fee,
                        payment_day: editForm.payment_day,
                        crm_stage: editForm.crm_stage,
                      })
                      .eq("id", selectedCustomer.id);

                    if (error) throw error;

                    toast.success("Client modifié avec succès");
                    setShowEditDialog(false);
                    fetchCustomers();
                  } catch (error) {
                    console.error("Error updating customer:", error);
                    toast.error("Erreur lors de la modification du client");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditDialog(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
