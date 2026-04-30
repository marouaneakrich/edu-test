import * as React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";
import logoIcon from "../assets/icon.png";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

/* ─── Nav items ─── */
const NAV = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    activeClass: "text-[#C2185B] bg-[#FFF0F5] border-[rgba(194,24,91,0.2)]",
    iconColor: "text-[#C2185B]",
    dotColor: "bg-[#C2185B]",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/>
        <rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Commandes",
    activeClass: "text-[#7B1FA2] bg-[#F8F0FF] border-[rgba(123,31,162,0.2)]",
    iconColor: "text-[#7B1FA2]",
    dotColor: "bg-[#7B1FA2]",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    href: "/admin/submissions",
    label: "Rendez-vous",
    activeClass: "text-[#00897B] bg-[#E8F8F5] border-[rgba(0,137,123,0.2)]",
    iconColor: "text-[#00897B]",
    dotColor: "bg-[#00897B]",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

function AdminLayout() {
  const { isAuthenticated, loading, logout, user } = useAdminAuth();
  const { isAdmin } = useUserRole();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  // const [time, setTime] = React.useState(() => new Date());
  const [currentPath, setCurrentPath] = React.useState(
    () => typeof window !== "undefined" ? window.location.pathname : ""
  );
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // React.useEffect(() => {
  //   const t = setInterval(() => setTime(new Date()), 1000);
  //   return () => clearInterval(t);
  // }, []);

  React.useEffect(() => {
    const handler = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (!loading && !isAuthenticated) window.location.href = "/login";
  }, [isAuthenticated, loading]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const o = supabase.channel("orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ez_orders" }, (p) => {
        const n = p.new as { customer_name: string; total_amount: number };
        toast.success("Nouvelle commande !", {
          description: `${n.customer_name} — ${n.total_amount} MAD`,
          action: { label: "Voir", onClick: () => { window.location.href = "/admin/orders"; } },
        });
      }).subscribe();
    const s = supabase.channel("submissions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ez_submissions" }, (p) => {
        const n = p.new as { first_name: string; last_name: string };
        toast.success("Nouveau message !", {
          description: `${n.first_name} ${n.last_name}`,
          action: { label: "Voir", onClick: () => { window.location.href = "/admin/submissions"; } },
        });
      }).subscribe();
    return () => { o.unsubscribe(); s.unsubscribe(); };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    window.location.href = "/login";
  };

  // const hh = String(time.getHours()).padStart(2, "0");
  // const mm = String(time.getMinutes()).padStart(2, "0");
  const activeNav = NAV.find(n => currentPath === n.href || currentPath.startsWith(n.href + "/"));
  const userInitial = user?.email?.[0]?.toUpperCase() ?? "A";
  const userEmailShort = user?.email?.split("@")[0] ?? "Admin";

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 bg-[#F7F6FC]">
        <motion.span
          className="block w-5 h-5 rounded-full border-[2.5px] border-[rgba(194,24,91,0.2)] border-t-[#C2185B]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
        />
        <span className="font-display font-extrabold text-base text-[#C2185B]">Chargement…</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="min-h-screen flex flex-col bg-[#F7F6FC] font-body text-foreground">

        {/* ══ TOP NAVBAR ══ */}
        <nav className="sticky top-0 z-30 h-[60px] flex items-center justify-between gap-3 px-4 sm:px-5
                        bg-white/85 backdrop-blur-md border-b border-black/[0.07] shadow-sm">

          {/* Logo */}
          <button
            onClick={() => { window.location.href = "/admin-choice"; }}
            className="flex items-center gap-2.5 flex-shrink-0 bg-transparent border-0 cursor-pointer p-0"
          >
            <motion.div
              className="w-[34px] h-[34px] rounded-[10px] bg-white border border-[rgba(194,24,91,0.15)]
                         flex items-center justify-center shadow-[0_2px_8px_rgba(194,24,91,0.12)] flex-shrink-0"
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 250, damping: 16 }}
            >
              <img src={logoIcon} className="w-[22px] h-[22px] object-contain" alt="EK" />
            </motion.div>
            <div className="hidden sm:block text-left">
              <div className="font-display font-black text-[15px] tracking-[-0.4px] leading-none text-foreground">
                <span className="bg-gradient-to-br from-[#C2185B] to-[#7B1FA2] bg-clip-text text-transparent">Educazen</span>Kids
              </div>
              <div className="font-body text-[10px] text-muted-foreground font-semibold mt-0.5">Administration</div>
            </div>
          </button>

          {/* Pill nav tabs — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 bg-[#F7F6FC] p-1 rounded-[14px] border border-black/[0.07]">
            {NAV.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setCurrentPath(item.href)}
                  className={[
                    "relative flex items-center gap-1.5 px-3.5 py-[7px] rounded-[10px]",
                    "font-display font-bold text-[13px] no-underline whitespace-nowrap",
                    "border transition-all duration-200",
                    isActive
                      ? item.activeClass + " shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                      : "text-muted-foreground border-transparent hover:bg-white hover:text-foreground hover:border-black/[0.07]",
                  ].join(" ")}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pill-bg"
                      className="absolute inset-0 rounded-[10px] -z-10"
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    />
                  )}
                  <span className={isActive ? item.iconColor : "text-muted-foreground/60"}>
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Live pulse — hidden on small */}
            {/* <div className="hidden sm:flex items-center gap-1.5 bg-[rgba(0,137,123,0.08)] border border-[rgba(0,137,123,0.18)] rounded-full px-2.5 py-[5px]">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#00897B] block"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="font-display font-bold text-[11px] text-[#00897B]">En ligne</span>
            </div> */}

            {/* Clock */}
            {/* <div className="bg-foreground text-white font-display font-extrabold text-[12px] tracking-[1px] px-3 py-[5px] rounded-full">
              {hh}:{mm}
            </div> */}

            {/* User dropdown button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-[5px] rounded-full bg-white
                           border border-black/[0.08] cursor-pointer font-display font-bold text-[12px]
                           text-muted-foreground transition-all duration-200
                           hover:border-[rgba(194,24,91,0.3)] hover:shadow-[0_2px_12px_rgba(194,24,91,0.08)]"
              >
                <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#C2185B] to-[#7B1FA2]
                                flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                  {userInitial}
                </div>
                <span className="hidden sm:block">{userEmailShort}</span>
                <motion.svg
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </motion.svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] z-50
                               bg-white border border-black/[0.08] rounded-2xl
                               shadow-[0_12px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]
                               overflow-hidden"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-black/[0.07]">
                      <div className="text-[12px] text-muted-foreground font-semibold truncate">
                        {user?.email}
                      </div>
                      <div className="font-display text-[11px] font-bold text-[#C2185B] tracking-[0.5px] mt-0.5">
                        Administrateur
                      </div>
                    </div>

                    {/* Switch space */}
                    <button
                      onClick={() => { setDropdownOpen(false); window.location.href = "/admin-choice"; }}
                      className="w-full flex items-center gap-2.5 px-4 py-[11px] text-left font-body
                                 text-[13px] font-bold text-muted-foreground bg-transparent border-0
                                 cursor-pointer transition-colors duration-150
                                 hover:bg-[rgba(194,24,91,0.05)] hover:text-[#C2185B]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/>
                        <rect x="2" y="15" width="6" height="6" rx="1"/><rect x="16" y="15" width="6" height="6" rx="1"/>
                      </svg>
                      Changer d'espace
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-[11px] text-left font-body
                                 text-[13px] font-bold text-red-500 bg-transparent border-0
                                 cursor-pointer transition-colors duration-150
                                 hover:bg-red-50 hover:text-red-600"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* ── Breadcrumb strip ── */}
        {/* <div className="flex items-center gap-2 px-5 py-2 bg-white border-b border-black/[0.07]">
          <button
            onClick={() => { window.location.href = "/admin-choice"; }}
            className="font-body text-[11px] font-bold text-muted-foreground bg-transparent
                       border-0 cursor-pointer p-0 transition-colors hover:text-[#C2185B]"
          >
            Accueil
          </button>
          <span className="text-muted-foreground/40 text-sm">›</span>
          <span className={`font-display text-[11px] font-extrabold ${activeNav?.iconColor ?? "text-foreground"}`}>
            {activeNav?.label ?? "Dashboard"}
          </span>
        </div> */}

        {/* ── Page content ── */}
        <main className="flex-1 px-4 sm:px-6 pt-6 pb-24 md:pb-10 max-w-[1100px] w-full mx-auto">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* ══ MOBILE BOTTOM NAV ══ */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch gap-1 px-2 pt-2 pb-3
                        bg-white/92 backdrop-blur-md border-t border-black/[0.07]">
          {NAV.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setCurrentPath(item.href)}
                className={[
                  "relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl",
                  "font-display text-[10px] font-bold no-underline transition-all duration-200",
                  "border",
                  isActive
                    ? item.activeClass
                    : "text-muted-foreground/60 border-transparent",
                ].join(" ")}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-indicator"
                    className={`absolute top-1 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full ${item.dotColor}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={isActive ? item.iconColor : "text-muted-foreground/50"}>
                  {item.icon}
                </span>
                {item.label}
              </a>
            );
          })}

          {/* Logout tab */}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl
                       font-display text-[10px] font-bold text-muted-foreground/60 border border-transparent
                       bg-transparent cursor-pointer transition-colors hover:text-red-400"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Quitter
          </button>
        </nav>
      </div>
    </>
  );
}