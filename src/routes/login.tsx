import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      window.location.href = "/admin-choice";
    }
  }, [isAuthenticated, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(identifier, password);
      toast.success("Connexion réussie!", {
        description: "Bienvenue sur le tableau de bord admin",
      });
      window.location.href = "/admin-choice";
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Email ou mot de passe incorrect";
      toast.error("Erreur de connexion", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-gradient-brand">
            Educazen
          </h1>
          <p className="mt-2 font-body text-lg text-muted-foreground">
            Administration
          </p>
        </div>

        <div className="rounded-2xl border-2 border-border bg-card p-8 shadow-sticker">
          <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
            Connexion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email ou nom d'utilisateur</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="admin@educazenkids.com ou admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="font-body"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-hero font-display font-bold hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center font-body text-sm text-muted-foreground">
          Accès réservé aux administrateurs
        </p>
      </div>
    </div>
  );
}
