import * as React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ShoppingCart, MessageSquare, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAuthenticated, loading, logout, user } = useAdminAuth();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, loading]);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const ordersSubscription = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ez_orders",
        },
        (payload) => {
          const newOrder = payload.new as { customer_name: string; total_amount: number };
          toast.success("Nouvelle commande reçue!", {
            description: `De ${newOrder.customer_name} - ${newOrder.total_amount} MAD`,
            action: {
              label: "Voir",
              onClick: () => {
                window.location.href = "/admin/orders";
              },
            },
          });
        }
      )
      .subscribe();

    const submissionsSubscription = supabase
      .channel("submissions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ez_submissions",
        },
        (payload) => {
          const newSubmission = payload.new as { first_name: string; last_name: string };
          toast.success("Nouveau message reçu!", {
            description: `De ${newSubmission.first_name} ${newSubmission.last_name}`,
            action: {
              label: "Voir",
              onClick: () => {
                window.location.href = "/admin/submissions";
              },
            },
          });
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      submissionsSubscription.unsubscribe();
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnexion réussie");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 font-body text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="inset" className="border-r-2 border-border">
          <SidebarHeader className="border-b-2 border-border bg-gradient-soft">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center shadow-glow">
                <img src="https://eiden-group.com/wp-content/uploads/2026/04/icon.png" alt="EducazenKids Icon" className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground">
                  EducazenKids
                </h1>
                <p className="font-body text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="font-label text-xs text-muted-foreground">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Tableau de bord</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/orders">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Commandes</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/submissions">
                        <MessageSquare className="h-4 w-4" />
                        <span>Rendez-vous</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t-2 border-border bg-gradient-soft">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-2 py-2">
              <p className="font-body text-xs text-muted-foreground">
                Connecté en tant que
              </p>
              <p className="font-body text-sm font-medium text-foreground">
                {user?.email}
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 items-center gap-4 border-b-2 border-border bg-background px-6">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-display text-xl font-bold text-foreground">
              Administration
            </h2>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
