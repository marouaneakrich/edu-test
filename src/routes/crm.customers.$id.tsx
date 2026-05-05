import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Plus, DollarSign } from "lucide-react";

export const Route = createFileRoute("/crm/customers/$id")({
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [debt, setDebt] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
  });
  const [debtAdjustment, setDebtAdjustment] = useState({
    adjustment_type: "reduce",
    amount: 0,
    reason: "",
  });
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isAdjustingDebt, setIsAdjustingDebt] = useState(false);

  useEffect(() => {
    if (!showPaymentDialog) return;
    if (!customer) return;

    setNewPayment((prev) => ({
      ...prev,
      amount: prev.amount && prev.amount > 0 ? prev.amount : Number(customer.monthly_fee) || 0,
    }));
  }, [showPaymentDialog, customer]);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from("ez_crm_customers")
        .select("*")
        .eq("id", id)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("ez_crm_payments")
        .select("*")
        .eq("customer_id", id)
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Calculate activation status
      setIsActive((paymentsData?.length || 0) > 0);

      // Calculate debt dynamically
      await calculateDebt(customerData, paymentsData || []);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const calculateDebt = async (customerData: any, paymentsData: any[]) => {
    if (!customerData) return;

    const enrollmentDate = new Date(customerData.enrollment_date);
    const currentDate = new Date();
    const daysSinceEnrollment = Math.floor((currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
    const billingCycles = Math.floor(daysSinceEnrollment / 30);
    const expectedPayments = billingCycles * Number(customerData.monthly_fee);
    
    const actualPayments = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
    
    // Fetch adjustments
    const { data: adjustments } = await supabase
      .from("ez_crm_debt_adjustments")
      .select("amount, adjustment_type")
      .eq("customer_id", id);
    
    let adjustmentTotal = 0;
    adjustments?.forEach(adj => {
      if (adj.adjustment_type === "reduce") {
        adjustmentTotal -= Number(adj.amount);
      } else if (adj.adjustment_type === "clear") {
        adjustmentTotal = -expectedPayments + actualPayments; // Will set debt to 0
      }
    });

    const calculatedDebt = expectedPayments - actualPayments + adjustmentTotal;
    setDebt(calculatedDebt > 0 ? calculatedDebt : 0);
  };

  const updateCrmStage = async (newStage: string) => {
    try {
      const { error } = await supabase
        .from("ez_crm_customers")
        .update({ crm_stage: newStage })
        .eq("id", id);

      if (error) throw error;

      toast.success("Stade CRM mis à jour");
      fetchCustomerData();
    } catch (error) {
      console.error("Error updating CRM stage:", error);
      toast.error("Erreur lors de la mise à jour du stade");
    }
  };

  const recordPayment = async () => {
    setIsRecordingPayment(true);
    try {
      const receiptNumber = `EDU-${newPayment.payment_date.replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      const periodCovered = new Date(newPayment.payment_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

      const { error } = await supabase
        .from("ez_crm_payments")
        .insert({
          customer_id: id,
          amount: newPayment.amount,
          payment_date: newPayment.payment_date,
          payment_method: newPayment.payment_method,
          period_covered: periodCovered,
          receipt_number: receiptNumber,
          certificate_sent: false,
        });

      if (error) throw error;

      toast.success("Paiement enregistré avec succès");
      setShowPaymentDialog(false);
      setNewPayment({
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "cash",
      });
      fetchCustomerData();

      // Trigger certificate email
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-certificate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            customer,
            payment: {
              ...newPayment,
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

  const adjustDebt = async () => {
    setIsAdjustingDebt(true);
    try {
      const { error } = await supabase
        .from("ez_crm_debt_adjustments")
        .insert({
          customer_id: id,
          adjustment_type: debtAdjustment.adjustment_type,
          amount: debtAdjustment.amount,
          reason: debtAdjustment.reason,
        });

      if (error) throw error;

      toast.success("Ajustement de dette enregistré");
      setShowDebtDialog(false);
      setDebtAdjustment({
        adjustment_type: "reduce",
        amount: 0,
        reason: "",
      });
      fetchCustomerData();
    } catch (error) {
      console.error("Error adjusting debt:", error);
      toast.error("Erreur lors de l'ajustement de la dette");
    } finally {
      setIsAdjustingDebt(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client non trouvé</p>
        <Button onClick={() => (window.location.href = "/crm/customers")} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => (window.location.href = "/crm/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {customer.parent_name}
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            {customer.child_name} - {customer.child_profile}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-label text-sm font-medium">Stade CRM</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={customer.crm_stage} onValueChange={updateCrmStage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nouveau">Nouveau</SelectItem>
                <SelectItem value="contacte">Contacté</SelectItem>
                <SelectItem value="qualifie">Qualifié</SelectItem>
                <SelectItem value="converti">Converti</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-label text-sm font-medium">Activation</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
              {isActive ? "Actif" : "Inactif"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Basé sur les paiements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-label text-sm font-medium">Dette</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{debt.toFixed(0)} MAD</div>
            <p className="text-xs text-muted-foreground mt-2">
              Calculée dynamiquement
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Informations du client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <p className="font-body">{customer.email}</p>
            </div>
            <div>
              <Label>Téléphone</Label>
              <p className="font-body">{customer.phone}</p>
            </div>
            <div>
              <Label>Date d'inscription</Label>
              <p className="font-body">{new Date(customer.enrollment_date).toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <Label>Frais mensuels</Label>
              <p className="font-body">{customer.monthly_fee} MAD</p>
            </div>
            <div>
              <Label>Jour de paiement</Label>
              <p className="font-body">Le {customer.payment_day} de chaque mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-xl">Historique des paiements</CardTitle>
              <CardDescription className="font-body">
                {payments.length} paiement(s) enregistré(s)
              </CardDescription>
            </div>
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Enregistrer un paiement
                </Button>
              </DialogTrigger>
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
                      placeholder={customer.monthly_fee.toString()}
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
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun paiement enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Reçu</TableHead>
                  <TableHead>Certificat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.amount} MAD</TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{payment.period_covered}</TableCell>
                    <TableCell>{payment.receipt_number}</TableCell>
                    <TableCell>
                      <Badge className={payment.certificate_sent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {payment.certificate_sent ? "Envoyé" : "Non envoyé"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-xl">Ajustements de dette</CardTitle>
              <CardDescription className="font-body">
                Ajustements manuels de la dette
              </CardDescription>
            </div>
            <Dialog open={showDebtDialog} onOpenChange={setShowDebtDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajuster la dette
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold">
                    Ajuster la dette
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type d'ajustement</Label>
                    <Select
                      value={debtAdjustment.adjustment_type}
                      onValueChange={(value) => setDebtAdjustment({ ...debtAdjustment, adjustment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reduce">Réduire</SelectItem>
                        <SelectItem value="clear">Effacer (mettre à 0)</SelectItem>
                        <SelectItem value="adjust_expected">Ajuster attendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {debtAdjustment.adjustment_type !== "clear" && (
                    <div>
                      <Label>Montant (MAD)</Label>
                      <Input
                        type="number"
                        value={debtAdjustment.amount}
                        onChange={(e) => setDebtAdjustment({ ...debtAdjustment, amount: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Raison</Label>
                    <Input
                      value={debtAdjustment.reason}
                      onChange={(e) => setDebtAdjustment({ ...debtAdjustment, reason: e.target.value })}
                      placeholder="Remise, correction, etc."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={adjustDebt}
                      disabled={isAdjustingDebt || !debtAdjustment.reason}
                      className="flex-1"
                    >
                      {isAdjustingDebt ? "Ajustement..." : "Confirmer"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDebtDialog(false)}
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
          <p className="text-sm text-muted-foreground">
            Historique des ajustements de dette (bientôt disponible)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
