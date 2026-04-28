import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase, EzOrder } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const [orders, setOrders] = React.useState<EzOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = React.useState<EzOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedOrder, setSelectedOrder] = React.useState<EzOrder | null>(null);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  React.useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.order_status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("ez_orders").select("*").order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log("Updating order status:", { orderId, newStatus });
      const { data, error } = await supabase
        .from("ez_orders")
        .update({ order_status: newStatus })
        .eq("id", orderId)
        .select();

      console.log("Update response:", { data, error });

      if (error) throw error;

      toast.success("Statut mis à jour");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Client", "Email", "Téléphone", "Adresse", "Total", "Statut", "Date"];
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.customer_address,
      order.total_amount.toString(),
      order.order_status,
      new Date(order.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gold-bg text-gold border-gold";
      case "processing":
        return "bg-purple-bg text-purple border-purple";
      case "delivered":
        return "bg-teal-bg text-teal border-teal";
      default:
        return "bg-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "processing":
        return "En cours";
      case "delivered":
        return "Livré";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Commandes</h1>
          <p className="font-body text-muted-foreground">Gérer toutes les commandes clients</p>
        </div>
        <Button onClick={exportToCSV} className="gap-2 bg-gradient-hero hover:opacity-90">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      <Card className="border-2 shadow-sticker">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-body"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] font-body">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border-2 border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-soft">
                  <TableHead className="font-label text-xs font-semibold">Client</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Email</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Total</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Statut</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Date</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center font-body text-muted-foreground">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-display font-medium">{order.customer_name}</TableCell>
                      <TableCell className="font-body">{order.customer_email}</TableCell>
                      <TableCell className="font-display font-bold">{order.total_amount} MAD</TableCell>
                      <TableCell>
                        <Select
                          value={order.order_status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className={`w-[140px] ${getStatusColor(order.order_status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="processing">En cours</SelectItem>
                            <SelectItem value="delivered">Livré</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="font-body">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="font-display text-xl font-bold">
                                Détails de la commande #{order.id.slice(0, 8)}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="font-label text-xs text-muted-foreground">Client</p>
                                    <p className="font-display font-medium">{selectedOrder.customer_name}</p>
                                  </div>
                                  <div>
                                    <p className="font-label text-xs text-muted-foreground">Email</p>
                                    <p className="font-body">{selectedOrder.customer_email}</p>
                                  </div>
                                  <div>
                                    <p className="font-label text-xs text-muted-foreground">Téléphone</p>
                                    <p className="font-body">{selectedOrder.customer_phone}</p>
                                  </div>
                                  <div>
                                    <p className="font-label text-xs text-muted-foreground">Adresse</p>
                                    <p className="font-body">
                                      {selectedOrder.customer_address}, {selectedOrder.customer_city}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-label text-xs text-muted-foreground mb-2">Articles</p>
                                  <div className="space-y-2">
                                    {Array.isArray(selectedOrder.items) &&
                                      selectedOrder.items.map((item: { product_name: string; quantity: number; subtotal: number }, index: number) => (
                                        <div
                                          key={index}
                                          className="flex justify-between rounded-lg border-2 border-border p-3"
                                        >
                                          <div>
                                            <p className="font-display font-medium">{item.product_name}</p>
                                            <p className="font-body text-sm text-muted-foreground">
                                              Quantité: {item.quantity}
                                            </p>
                                          </div>
                                          <p className="font-display font-bold">{item.subtotal} MAD</p>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                                {selectedOrder.notes && (
                                  <div>
                                    <p className="font-label text-xs text-muted-foreground">Notes</p>
                                    <p className="font-body">{selectedOrder.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
