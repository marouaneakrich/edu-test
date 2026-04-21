import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Doodle } from "./motion/Doodle";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/activites", label: "Activités" },
  { to: "/blog", label: "Blog" },
  { to: "/boutique", label: "Boutique" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const sparkRotate = useTransform(scrollY, [0, 1500], [0, 360]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-border shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-2 group relative">
          <motion.div style={{ rotate: sparkRotate }} className="absolute -top-2 -left-3 h-4 w-4 text-magenta">
            <Doodle kind="spark" color="currentColor" className="w-full h-full" />
          </motion.div>
          <span className="logo-style text-2xl">
            <span className="text-magenta">educa</span><span className="text-purple">zen</span><span className="text-teal">kids</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="relative px-4 py-2 text-sm font-bold text-ink transition-colors hover:text-magenta data-[status=active]:text-magenta"
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <motion.svg
                      layoutId="nav-underline"
                      viewBox="0 0 80 8"
                      className="absolute left-2 right-2 -bottom-1 w-[calc(100%-1rem)]"
                    >
                      <path d="M2 5 Q 20 -1 40 4 T 78 5" stroke="oklch(0.52 0.21 357)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </motion.svg>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/boutique"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-hero px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-105 hover:-rotate-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Boutique
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden rounded-full bg-magenta-bg p-2.5 text-magenta hover:scale-110 transition-transform"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 top-[72px] z-[9999] bg-gradient-to-br from-magenta-bg via-lavender to-teal-bg overflow-hidden"
          >
            <Doodle kind="star" color="oklch(0.52 0.21 357)" className="absolute top-10 right-8 w-12 h-12 opacity-40" />
            <Doodle kind="heart" color="oklch(0.45 0.21 312)" className="absolute bottom-20 left-8 w-10 h-10 opacity-40" />
            <Doodle kind="squiggle" color="oklch(0.58 0.10 187)" className="absolute top-1/2 left-1/2 -translate-x-1/2 w-32 h-6 opacity-30" />
            <div className="flex flex-col px-8 py-8 gap-1">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-3xl font-display font-bold text-ink hover:text-magenta transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
