import * as React from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "sales" | "finance" | null;

export interface UserPermissions {
  view_submissions: boolean;
  edit_submissions: boolean;
  view_customers: boolean;
  edit_customers: boolean;
  view_payments: boolean;
  edit_payments: boolean;
}

export function useUserRole() {
  const [role, setRole] = React.useState<UserRole>(null);
  const [username, setUsername] = React.useState<string>("");
  const [displayName, setDisplayName] = React.useState<string>("");
  const [permissions, setPermissions] = React.useState<UserPermissions | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch user role from ez_user_roles
        const { data: roleData, error: roleError } = await supabase
          .from("ez_user_roles")
          .select("role, username, display_name")
          .eq("user_id", user.id)
          .single();

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          setLoading(false);
          return;
        }

        if (roleData) {
          setRole(roleData.role as UserRole);
          setUsername(roleData.username || "");
          setDisplayName(roleData.display_name || "");

          // Fetch role permissions from ez_settings
          const { data: settingsData, error: settingsError } = await supabase
            .from("ez_settings")
            .select("value")
            .eq("key", "role_permissions")
            .single();

          if (!settingsError && settingsData) {
            const allPermissions = JSON.parse(settingsData.value);
            setPermissions(allPermissions[roleData.role] || null);
          }
        }
      } catch (error) {
        console.error("Error in useUserRole:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (role === "admin") return true;
    if (!permissions) return false;
    return permissions[permission] || false;
  };

  return {
    role,
    username,
    displayName,
    permissions,
    loading,
    hasPermission,
    isAdmin: role === "admin",
    isSales: role === "sales",
    isFinance: role === "finance",
  };
}
