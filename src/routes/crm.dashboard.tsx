import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, AlertCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/crm/dashboard")({
  component: CrmDashboard,
});

function CrmDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    paidThisMonth: 0,
    unpaidThisMonth: 0,
    totalDebt: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total customers
      const { count: totalCustomers } = await supabase
        .from("ez_crm_customers")
        .select("*", { count: "exact", head: true });

      // Fetch customers with payments (active)
      const { data: customersWithPayments } = await supabase
        .from("ez_crm_customers")
        .select("id");

      let activeCustomers = 0;
      if (customersWithPayments) {
        for (const customer of customersWithPayments) {
          const { count: paymentCount } = await supabase
            .from("ez_crm_payments")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customer.id);
          
          if (paymentCount && paymentCount > 0) {
            activeCustomers++;
          }
        }
      }

      // Fetch payments this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: paymentsThisMonth } = await supabase
        .from("ez_crm_payments")
        .select("amount, customer_id")
        .gte("payment_date", firstDayOfMonth.toISOString().split("T")[0]);

      const paidThisMonth = paymentsThisMonth?.length || 0;
      const totalPaidAmount = paymentsThisMonth?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Calculate debt (dynamic)
      let totalDebt = 0;
      if (customersWithPayments) {
        for (const customer of customersWithPayments) {
          const { data: customerData } = await supabase
            .from("ez_crm_customers")
            .select("enrollment_date, monthly_fee")
            .eq("id", customer.id)
            .single();

          if (customerData) {
            const enrollmentDate = new Date(customerData.enrollment_date);
            const currentDate = new Date();
            const daysSinceEnrollment = Math.floor((currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
            const billingCycles = Math.floor(daysSinceEnrollment / 30);
            const expectedPayments = billingCycles * Number(customerData.monthly_fee);
            
            const { data: customerPayments } = await supabase
              .from("ez_crm_payments")
              .select("amount")
              .eq("customer_id", customer.id);
            
            const actualPayments = customerPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            
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
                adjustmentTotal = -expectedPayments + actualPayments; // Will set debt to 0
              }
            });

            const debt = expectedPayments - actualPayments + adjustmentTotal;
            if (debt > 0) {
              totalDebt += debt;
            }
          }
        }
      }

      setStats({
        totalCustomers: totalCustomers || 0,
        activeCustomers,
        paidThisMonth,
        unpaidThisMonth: activeCustomers - paidThisMonth,
        totalDebt,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
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
          Tableau de bord CRM
        </h1>
        <p className="font-body text-muted-foreground mt-2">
          Vue d'ensemble de votre gestion de la relation client
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-label text-sm font-medium">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {stats.activeCustomers} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-label text-sm font-medium">
              Payés ce mois
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{stats.paidThisMonth}</div>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {stats.unpaidThisMonth} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-label text-sm font-medium">
              Dette totale
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{stats.totalDebt.toFixed(0)} MAD</div>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Calculée dynamiquement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-label text-sm font-medium">
              Taux de collecte
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">
              {stats.activeCustomers > 0 
                ? ((stats.paidThisMonth / stats.activeCustomers) * 100).toFixed(0)
                : 0}%
            </div>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => (window.location.href = "/crm/customers")}>
          <CardHeader>
            <CardTitle className="font-display text-lg">Gérer les clients</CardTitle>
            <CardDescription className="font-body">
              Voir et modifier les informations des clients
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => (window.location.href = "/crm/payments")}>
          <CardHeader>
            <CardTitle className="font-display text-lg">Enregistrer un paiement</CardTitle>
            <CardDescription className="font-body">
              Ajouter un nouveau paiement client
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => (window.location.href = "/crm/customers?filter=overdue")}>
          <CardHeader>
            <CardTitle className="font-display text-lg">Clients en retard</CardTitle>
            <CardDescription className="font-body">
              Voir les clients avec des paiements en retard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
