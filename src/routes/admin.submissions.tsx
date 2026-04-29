import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase, EzSubmission } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Download, Eye, Reply, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/admin/submissions")({
  component: AdminSubmissions,
});

function AdminSubmissions() {
  const [submissions, setSubmissions] = React.useState<EzSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = React.useState<EzSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = React.useState<EzSubmission | null>(null);
  const [replyMessage, setReplyMessage] = React.useState("");
  const [replySubject, setReplySubject] = React.useState("");
  const [isSendingReply, setIsSendingReply] = React.useState(false);
  const [showConversionDialog, setShowConversionDialog] = React.useState(false);
  const [conversionSubmission, setConversionSubmission] = React.useState<EzSubmission | null>(null);
  const [addToCrm, setAddToCrm] = React.useState(false);
  const [customerPaid, setCustomerPaid] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);

  React.useEffect(() => {
    fetchSubmissions();
  }, []);

  React.useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sub.subject && sub.subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((sub) => sub.form_type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, typeFilter, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("ez_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      console.log("Updating submission status:", { submissionId, newStatus });
      const { data, error } = await supabase
        .from("ez_submissions")
        .update({ status: newStatus })
        .eq("id", submissionId)
        .select();

      console.log("Update response:", { data, error });

      if (error) throw error;

      toast.success("Statut mis à jour");
      fetchSubmissions();
    } catch (error) {
      console.error("Error updating submission status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleConversionClick = (submission: EzSubmission) => {
    setConversionSubmission(submission);
    setAddToCrm(false);
    setCustomerPaid(false);
    setShowConversionDialog(true);
  };

  const handleConfirmConversion = async () => {
    if (!conversionSubmission || !addToCrm) {
      toast.error("Veuillez cocher 'Ajouter ce client au CRM'");
      return;
    }

    setIsConverting(true);

    try {
      // Fetch monthly fee from settings based on child profile
      const { data: settingsData } = await supabase
        .from("ez_settings")
        .select("value")
        .eq("key", `monthly_fee_${conversionSubmission.child_profile?.toLowerCase().replace("enfant ", "").replace(" ", "_")}`)
        .single();

      const monthlyFee = settingsData ? Number(settingsData.value) : 800;

      // Identity resolution
      let existingCustomer = null;
      
      // 1. Check by submission_id
      const { data: bySubmissionId } = await supabase
        .from("ez_crm_customers")
        .select("*")
        .eq("submission_id", conversionSubmission.id)
        .single();

      if (bySubmissionId) {
        existingCustomer = bySubmissionId;
      } else {
        // 2. Check by lowercase phone
        const { data: byPhone } = await supabase
          .from("ez_crm_customers")
          .select("*")
          .eq("phone", conversionSubmission.phone?.toLowerCase())
          .single();

        if (byPhone) {
          existingCustomer = byPhone;
        } else {
          // 3. Check by lowercase email
          const { data: byEmail } = await supabase
            .from("ez_crm_customers")
            .select("*")
            .eq("email", conversionSubmission.email?.toLowerCase())
            .single();

          if (byEmail) {
            existingCustomer = byEmail;
          }
        }
      }

      const enrollmentDate = new Date().toISOString().split("T")[0];
      const paymentDay = new Date().getDate();

      if (existingCustomer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from("ez_crm_customers")
          .update({
            crm_stage: "converti",
            monthly_fee: monthlyFee,
            enrollment_date: enrollmentDate,
            payment_day: paymentDay,
          })
          .eq("id", existingCustomer.id);

        if (updateError) throw updateError;
      } else {
        // Create new customer
        const { error: createError } = await supabase
          .from("ez_crm_customers")
          .insert({
            submission_id: conversionSubmission.id,
            parent_name: `${conversionSubmission.first_name} ${conversionSubmission.last_name}`,
            email: conversionSubmission.email?.toLowerCase(),
            phone: conversionSubmission.phone?.toLowerCase(),
            child_name: `Enfant de ${conversionSubmission.child_age || "X"} ans`,
            child_profile: conversionSubmission.child_profile || "Enfant typique",
            crm_stage: "converti",
            enrollment_date: enrollmentDate,
            monthly_fee: monthlyFee,
            payment_day: paymentDay,
          });

        if (createError) throw createError;
      }

      // If customer paid, create payment record
      if (customerPaid) {
        const customerId = existingCustomer?.id || (await supabase.from("ez_crm_customers").select("id").eq("submission_id", conversionSubmission.id).single()).data?.id;
        
        if (customerId) {
          const receiptNumber = `EDU-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
          const periodCovered = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

          const { error: paymentError } = await supabase
            .from("ez_crm_payments")
            .insert({
              customer_id: customerId,
              amount: monthlyFee,
              payment_date: enrollmentDate,
              payment_method: "cash",
              period_covered: periodCovered,
              receipt_number: receiptNumber,
              certificate_sent: false,
            });

          if (paymentError) throw paymentError;

          toast.success("Client ajouté au CRM et paiement enregistré");
        }
      } else {
        toast.success("Client ajouté au CRM");
      }

      setShowConversionDialog(false);
      fetchSubmissions();
    } catch (error) {
      console.error("Error during conversion:", error);
      toast.error("Erreur lors de la conversion");
    } finally {
      setIsConverting(false);
    }
  };

  const sendReply = async () => {
    if (!selectedSubmission || !replyMessage || !replySubject) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsSendingReply(true);

    try {
      const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réponse de EducazenKids</title>
</head>
<body style="margin:0; padding:0; background:#f8eaf2; font-family:Arial, Helvetica, sans-serif; color:#262338;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:radial-gradient(circle at top left, #fdeff6 0%, #f8eaf2 35%, #f6f0fb 100%); padding:24px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px; background:#fffafc; border:1px solid #f3dce9; border-radius:30px; overflow:hidden; box-shadow:0 18px 50px rgba(104, 42, 88, 0.12);">
          <tr>
            <td style="padding:24px 28px 18px; background:linear-gradient(180deg, #fdeef6 0%, #fff7fb 100%);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px; letter-spacing:4px; color:#d11f8b; font-weight:700; text-transform:uppercase;">EducazenKids</td>
                  <td align="right" style="font-size:12px; color:#8a3a73; font-weight:700; background:#fff2fa; border:1px solid #f4d3e3; padding:8px 12px; border-radius:999px;">RÉPONSE REÇUE</td>
                </tr>
              </table>
              <h1 style="margin:14px 0 10px; font-size:42px; line-height:1.05; color:#262338; font-weight:900; letter-spacing:-0.8px;">
                Réponse à votre <span style="color:#d11f8b;">demande</span>
              </h1>
              <p style="margin:0; font-size:17px; line-height:1.6; color:#5e5a67; font-weight:700; max-width:560px;">
                Bonjour ${selectedSubmission.first_name}, voici notre réponse à votre message.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 10px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:1px solid #f4e4ee; border-radius:24px; box-shadow:0 8px 20px rgba(42, 22, 39, 0.04);">
                <tr>
                  <td style="padding:22px;">
                    <div style="font-size:12px; letter-spacing:3px; color:#6d6475; text-transform:uppercase; font-weight:700; margin-bottom:14px;">Notre réponse</div>
                    <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:16px 15px; color:#463d4e; line-height:1.8; white-space:pre-line;">${replyMessage}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 28px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 14px;">
                    <div style="background:linear-gradient(90deg, #ff2f9e 0%, #8d1fb0 100%); border-radius:22px; padding:16px 20px; text-align:center; box-shadow:0 12px 24px rgba(141,31,176,0.18);">
                      <a href="https://tanstack-start-app.educazenkid.workers.dev/" style="display:inline-block; color:#ffffff; text-decoration:none; font-size:16px; font-weight:800; letter-spacing:0.2px;">Découvrir EducazenKids</a>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-size:12px; line-height:1.7; color:#7a7080; text-align:center;">
                Si vous avez d'autres questions, répondez simplement à cet email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px; text-align:center;">
              <div style="display:inline-block; background:#fff2fa; border:1px solid #f4d3e3; border-radius:999px; padding:10px 16px; font-size:12px; color:#8a3a73; font-weight:700;">
                Merci de votre confiance.
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#1f1a2b; padding:22px 28px; text-align:center;">
              <div style="font-size:24px; font-weight:900; letter-spacing:-0.4px; margin-bottom:8px;">
                <span style="color:#ffffff;">educa</span><span style="color:#39d0c8;">zen</span><span style="color:#ff4aa2;">kids</span>
              </div>
              <p style="margin:0; font-size:12px; line-height:1.7; color:#c9c2d5;">L'enseignement sur mesure, dans un cadre bienveillant où chaque enfant trouve sa place.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          toEmail: selectedSubmission.email,
          subject: replySubject,
          message: replyMessage,
          html: htmlTemplate,
          fromName: "EducazenKids",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      toast.success("Réponse envoyée avec succès");
      setReplyMessage("");
      setReplySubject("");
      setSelectedSubmission(null);
      updateSubmissionStatus(selectedSubmission.id, "contacted");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSendingReply(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Type", "Nom", "Email", "Sujet", "Statut", "Date"];
    const rows = filteredSubmissions.map((sub) => [
      sub.id,
      sub.form_type === "contact" ? "Contact" : "Rendez-vous",
      `${sub.first_name} ${sub.last_name}`,
      sub.email,
      sub.subject || "-",
      sub.status,
      new Date(sub.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `messages_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    return "bg-transparent text-foreground border-border";
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Nouveau";
      case "contacted":
        return "Contacté";
      case "converted":
        return "Converti";
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
          <h1 className="font-display text-3xl font-bold text-foreground">Rendez-vous</h1>
          <p className="font-body text-muted-foreground">Gérer les contacts et demandes de rendez-vous</p>
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
                placeholder="Rechercher par nom, email ou sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-body"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[140px] font-body">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="appointment">Rendez-vous</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[140px] font-body">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="contacted">Contacté</SelectItem>
                  <SelectItem value="converted">Converti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border-2 border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-soft">
                  <TableHead className="font-label text-xs font-semibold">Nom</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Email</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Type</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Statut</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Date</TableHead>
                  <TableHead className="font-label text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center font-body text-muted-foreground">
                      Aucun message trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-display font-medium">
                        {sub.first_name} {sub.last_name}
                      </TableCell>
                      <TableCell className="font-body">{sub.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-purple-bg text-purple">
                          {sub.form_type === "contact" ? "Contact" : "Rendez-vous"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={sub.status}
                          onValueChange={(value) => updateSubmissionStatus(sub.id, value)}
                        >
                          <SelectTrigger className={`w-[140px] ${getStatusColor(sub.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nouveau</SelectItem>
                            <SelectItem value="contacted">Contacté</SelectItem>
                            <SelectItem value="converted">Converti</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="font-body">
                        {new Date(sub.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(sub)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="font-display text-xl font-bold">
                                  Détails du message
                                </DialogTitle>
                              </DialogHeader>
                              {selectedSubmission && (
                                <div className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Nom</p>
                                      <p className="font-display font-medium">
                                        {selectedSubmission.first_name} {selectedSubmission.last_name}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Email</p>
                                      <p className="font-body">{selectedSubmission.email}</p>
                                    </div>
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Téléphone</p>
                                      <p className="font-body">{selectedSubmission.phone || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Type</p>
                                      <p className="font-body">
                                        {selectedSubmission.form_type === "contact" ? "Contact" : "Rendez-vous"}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedSubmission.subject && (
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Sujet</p>
                                      <p className="font-display font-medium">{selectedSubmission.subject}</p>
                                    </div>
                                  )}
                                  {selectedSubmission.message && (
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Message</p>
                                      <p className="font-body">{selectedSubmission.message}</p>
                                    </div>
                                  )}
                                  {selectedSubmission.child_age && (
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Âge de l'enfant</p>
                                      <p className="font-body">{selectedSubmission.child_age} ans</p>
                                    </div>
                                  )}
                                  {selectedSubmission.child_profile && (
                                    <div>
                                      <p className="font-label text-xs text-muted-foreground">Profil de l'enfant</p>
                                      <p className="font-body">{selectedSubmission.child_profile}</p>
                                    </div>
                                  )}
                                  {selectedSubmission.status === "converted" && (
                                    <div className="pt-4 border-t">
                                      <Button
                                        onClick={() => handleConversionClick(selectedSubmission)}
                                        className="w-full bg-gradient-hero hover:opacity-90"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Confirmer la conversion CRM
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(sub)}>
                                <Reply className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-display text-xl font-bold">
                                  Répondre à {selectedSubmission?.first_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="font-label text-xs text-muted-foreground">Sujet</label>
                                  <Input
                                    value={replySubject}
                                    onChange={(e) => setReplySubject(e.target.value)}
                                    placeholder="Sujet de votre réponse"
                                    className="font-body"
                                  />
                                </div>
                                <div>
                                  <label className="font-label text-xs text-muted-foreground">Message</label>
                                  <Textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Écrivez votre réponse ici..."
                                    rows={6}
                                    className="font-body"
                                  />
                                </div>
                                <Button
                                  onClick={sendReply}
                                  disabled={isSendingReply}
                                  className="w-full bg-gradient-hero hover:opacity-90"
                                >
                                  {isSendingReply ? "Envoi en cours..." : "Envoyer la réponse"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Dialog */}
      <Dialog open={showConversionDialog} onOpenChange={setShowConversionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Confirmer la conversion CRM
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addToCrm"
                checked={addToCrm}
                onChange={(e) => setAddToCrm(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="addToCrm" className="font-body text-sm">
                Ajouter ce client au CRM
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customerPaid"
                checked={customerPaid}
                onChange={(e) => setCustomerPaid(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="customerPaid" className="font-body text-sm">
                Le client a payé
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleConfirmConversion}
                disabled={isConverting || !addToCrm}
                className="flex-1 bg-gradient-hero hover:opacity-90"
              >
                {isConverting ? "Conversion en cours..." : "Confirmer"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConversionDialog(false)}
                className="flex-1"
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
