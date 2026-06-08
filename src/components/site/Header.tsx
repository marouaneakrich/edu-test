import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform} from "framer-motion";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Doodle } from "./motion/Doodle";
import { useCart } from "@/hooks/useCart";
import { CartModal } from "./CartModal";
import logoIcon from "../../assets/icon.png";
import { NAV, isNavItemVisible, type NavVisibility } from "@/lib/navConfig";
import { supabase } from "@/lib/supabase";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [navVisibility, setNavVisibility] = useState<NavVisibility | null>(null);

  useEffect(() => {
    supabase
      .from("ez_settings")
      .select("value")
      .eq("key", "nav_visibility")
      .single()
      .then(({ data, error }) => {
        if (!error && data?.value) {
          try {
            setNavVisibility(JSON.parse(data.value));
          } catch {}
        }
      });
  }, []);

  const visibleNav = NAV.filter((item) => isNavItemVisible(item.to, navVisibility));
  const boutiqueVisible = isNavItemVisible("/boutique", navVisibility);
  const { scrollY } = useScroll();
  const sparkRotate = useTransform(scrollY, [0, 1500], [0, 360]);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
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
  <span className="logo-style text-2xl flex items-center justify-end">
    <img
      src={logoIcon}
      className="object-contain mr-2"
      alt="Educazen Kids"
      style={{ width: "40px" }}
    />

    <span className="text-magenta">Educa</span>
    <span className="text-purple">zen</span>
    <span className="text-teal">kids</span>
  </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {visibleNav.map((item) => (
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
                        preserveAspectRatio="none"
                        className="absolute left-2 right-2 -bottom-1 w-[calc(100%-1rem)] h-2 text-magenta"
                      >
                        <path d="M2 5 Q 20 -1 40 4 T 78 5" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" />
                      </motion.svg>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>

           <div className="flex items-center gap-3">
            {boutiqueVisible && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative inline-flex items-center gap-2 rounded-full bg-gradient-hero px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-105"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Panier</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden rounded-full bg-magenta-bg p-2.5 text-magenta hover:scale-110 transition-transform"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

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
              {visibleNav.map((item, i) => (
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
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
