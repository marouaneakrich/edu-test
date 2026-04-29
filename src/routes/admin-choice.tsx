import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, CreditCard, Settings } from "lucide-react";

export const Route = createFileRoute("/admin-choice")({
  component: AdminChoice,
});

function AdminChoice() {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">EducazenKids</h1>
          <p className="text-gray-600">Choisissez votre espace de travail</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Dashboard Card */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400"
            onClick={() => navigate({ to: "/admin/dashboard" })}
          >
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <LayoutDashboard className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-center">Dashboard</CardTitle>
              <CardDescription className="text-center">
                Gérez vos commandes et messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Commandes en ligne</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Messages et rendez-vous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Statistiques de vente</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CRM Card */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-400"
            onClick={() => navigate({ to: "/crm/dashboard" })}
          >
            <CardHeader>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-center">CRM</CardTitle>
              <CardDescription className="text-center">
                Gestion de la relation client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Suivi des prospects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Gestion des paiements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Certificats automatiques</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              window.location.href = "/login";
            }}
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
