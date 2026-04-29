import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/crm/payments")({
  component: CrmPayments,
});

function CrmPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterCertificate, setFilterCertificate] = useState("all");

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

  const getMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800 border-green-200";
      case "virement":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cheque":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "bank":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    const matchesCertificate =
      filterCertificate === "all" ||
      (filterCertificate === "sent" && payment.certificate_sent) ||
      (filterCertificate === "not_sent" && !payment.certificate_sent);

    return matchesSearch && matchesMethod && matchesCertificate;
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
            Paiements
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            Historique et gestion des paiements clients
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Filtres et recherche</CardTitle>
          <CardDescription className="font-body">
            Recherchez et filtrez les paiements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par client, reçu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tous les modes</option>
                <option value="cash">Espèces</option>
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
                <option value="bank">Banque</option>
              </select>
              <select
                value={filterCertificate}
                onChange={(e) => setFilterCertificate(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tous les certificats</option>
                <option value="sent">Envoyé</option>
                <option value="not_sent">Non envoyé</option>
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
                    Client
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Enfant
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Période
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Reçu
                  </th>
                  <th className="px-4 py-3 text-left font-label text-sm font-medium text-muted-foreground">
                    Certificat
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun paiement trouvé
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-body text-sm">
                        {payment.ez_crm_customers?.parent_name}
                      </td>
                      <td className="px-4 py-3 font-body text-sm">
                        {payment.ez_crm_customers?.child_name}
                      </td>
                      <td className="px-4 py-3 font-body text-sm font-medium">
                        {payment.amount} MAD
                      </td>
                      <td className="px-4 py-3 font-body text-sm">
                        {new Date(payment.payment_date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getMethodColor(payment.payment_method)}>
                          {payment.payment_method}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-body text-sm">
                        {payment.period_covered}
                      </td>
                      <td className="px-4 py-3 font-body text-sm">
                        {payment.receipt_number}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={payment.certificate_sent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {payment.certificate_sent ? "Envoyé" : "Non envoyé"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
