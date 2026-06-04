export type NavItem = {
  to: string;
  label: string;
};

export const NAV: readonly NavItem[] = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/activites", label: "Activités" },
  { to: "/camp-ete", label: "Summer Camp" },
  { to: "/camps-vacances", label: "Camps de vacances" },
  { to: "/blog", label: "Blog" },
  { to: "/boutique", label: "Boutique" },
  { to: "/contact", label: "Contact" },
] as const;

export type NavVisibilityConfig = {
  visible: boolean;
  schedule: { start: string; end: string } | null;
};

export type NavVisibility = Record<string, NavVisibilityConfig>;

export function isInSchedule(schedule: { start: string; end: string }): boolean {
  const today = new Date();
  const now = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const { start, end } = schedule;

  if (start <= end) {
    return now >= start && now <= end;
  }
  return now >= start || now <= end;
}

export function isNavItemVisible(
  path: string,
  visibility: NavVisibility | null,
): boolean {
  const config = visibility?.[path];
  if (!config) return true;

  if (config.schedule) {
    return isInSchedule(config.schedule);
  }

  return config.visible;
}
