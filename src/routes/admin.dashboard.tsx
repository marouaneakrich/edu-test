import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, MessageSquare, TrendingUp, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    totalSubmissions: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, submissionsRes] = await Promise.all([
        supabase.from("ez_orders").select("total_amount, order_status"),
        supabase.from("ez_submissions").select("*"),
      ]);

      if (ordersRes.data) {
        const totalRevenue = ordersRes.data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const pendingOrders = ordersRes.data.filter((order) => order.order_status === "pending").length;

        setStats({
          totalOrders: ordersRes.data.length,
          totalSubmissions: submissionsRes.data?.length || 0,
          totalRevenue,
          pendingOrders,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: React.ElementType; color: string }) => (
    <Card className="border-2 shadow-sticker overflow-hidden">
      <CardHeader className="bg-gradient-soft pb-3">
        <CardTitle className="font-label text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="font-display text-3xl font-bold text-foreground">{loading ? "..." : value}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="font-body text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Commandes totales" value={stats.totalOrders} icon={ShoppingCart} color="text-magenta" />
        <StatCard title="Messages reçus" value={stats.totalSubmissions} icon={MessageSquare} color="text-purple" />
        <StatCard title="Revenu total" value={`${stats.totalRevenue} MAD`} icon={TrendingUp} color="text-teal" />
        <StatCard title="Commandes en attente" value={stats.pendingOrders} icon={Clock} color="text-gold" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 shadow-sticker">
          <CardHeader>
            <CardTitle className="font-display text-xl font-bold text-foreground">
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/orders" className="flex items-center gap-3 rounded-lg border-2 border-border p-4 hover:bg-accent transition-colors">
              <ShoppingCart className="h-5 w-5 text-magenta" />
              <div>
                <p className="font-display font-medium text-foreground">Voir les commandes</p>
                <p className="font-body text-sm text-muted-foreground">Gérer les commandes clients</p>
              </div>
            </a>
            <a href="/admin/submissions" className="flex items-center gap-3 rounded-lg border-2 border-border p-4 hover:bg-accent transition-colors">
              <MessageSquare className="h-5 w-5 text-purple" />
              <div>
                <p className="font-display font-medium text-foreground">Voir les messages</p>
                <p className="font-body text-sm text-muted-foreground">Répondre aux demandes</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sticker">
          <CardHeader>
            <CardTitle className="font-display text-xl font-bold text-foreground">
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-muted-foreground">
              Bienvenue sur le tableau de bord d'administration Educazen. Utilisez le menu latéral pour naviguer entre les différentes sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
