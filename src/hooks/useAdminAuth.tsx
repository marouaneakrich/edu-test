import * as React from "react";
import { supabase } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  email: string;
}

export function useAdminAuth() {
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
          });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (identifier: string, password: string) => {
    const trimmed = identifier.trim();

    let emailToUse = trimmed;
    const looksLikeEmail = trimmed.includes("@");

    if (!looksLikeEmail) {
      const { data, error } = await supabase.rpc("get_email_by_username", {
        p_username: trimmed,
      });

      if (error) throw error;

      const resolvedEmail = typeof data === "string" ? data : null;
      if (!resolvedEmail) {
        throw new Error("Nom d'utilisateur inconnu");
      }

      emailToUse = resolvedEmail;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      const anyErr = error as unknown as { message?: string; status?: number; code?: string; name?: string };
      const message = anyErr?.message || "Erreur de connexion";
      const status = typeof anyErr?.status === "number" ? anyErr.status : undefined;
      const code = typeof anyErr?.code === "string" ? anyErr.code : undefined;
      throw new Error([message, status ? `status=${status}` : null, code ? `code=${code}` : null].filter(Boolean).join(" "));
    }

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
