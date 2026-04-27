import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ShoppingBag, Search, Heart, Plus } from "lucide-react";
import { MagneticButton } from "@/components/site/motion/MagneticButton";
import { Doodle } from "@/components/site/motion/Doodle";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import blocks from "@/assets/product-blocks.jpg";
import books from "@/assets/product-books.jpg";
import artSet from "@/assets/product-art.jpg";
import alphabet from "@/assets/product-alphabet.jpg";
import sensory from "@/assets/product-sensory.jpg";
import puzzle from "@/assets/product-puzzle.jpg";
import school from "@/assets/product-school.jpg";

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique  EducazenKids | Matériel pédagogique" },
      { name: "description", content: "Découvrez notre sélection de jeux éducatifs, livres, matériel Montessori et fournitures scolaires pour enfants." },
      { property: "og:title", content: "Boutique EducazenKids" },
      { property: "og:description", content: "Matériel pédagogique soigneusement sélectionné par notre équipe." },
    ],
  }),
  component: ShopPage,
});

const CATEGORIES = ["Tous", "Montessori", "Livres", "Art & Créativité", "Sensoriel", "Fournitures"] as const;

const PRODUCTS = [
  { img: blocks, name: "Blocs de construction en bois", price: "180 MAD", cat: "Montessori", color: "magenta" },
  { img: alphabet, name: "Lettres & chiffres en bois", price: "220 MAD", cat: "Montessori", color: "teal" },
  { img: puzzle, name: "Puzzle carte du monde", price: "320 MAD", cat: "Montessori", color: "purple" },
  { img: books, name: "Collection de livres jeunesse", price: "150 MAD", cat: "Livres", color: "magenta" },
  { img: artSet, name: "Set crayons & aquarelle", price: "95 MAD", cat: "Art & Créativité", color: "purple" },
  { img: sensory, name: "Balles sensorielles texturées", price: "75 MAD", cat: "Sensoriel", color: "gold" },
  { img: school, name: "Pack rentrée scolaire", price: "350 MAD", cat: "Fournitures", color: "teal" },
  { img: blocks, name: "Cubes de tri couleurs", price: "140 MAD", cat: "Montessori", color: "purple" },
  { img: books, name: "Livre sensoriel  éveil", price: "85 MAD", cat: "Livres", color: "teal" },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function ShopPage() {
  const [active, setActive] = useState<string>("Tous");
  const [query, setQuery] = useState("");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const { addItem } = useCart();

  const handleAddToCart = (product: (typeof PRODUCTS)[number]) => {
    const priceNum = parseInt(product.price.replace(/\D/g, ""), 10);
    addItem({
      id: product.name,
      name: product.name,
      price: priceNum,
      image: product.img,
      category: product.cat,
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  const toggleFav = (name: string) => {
    setFavs((f) => {
      const next = new Set(f);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const filtered = PRODUCTS.filter((p) =>
    (active === "Tous" || p.cat === active) &&
    (query === "" || p.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <PageShell>
      <PageHero
        eyebrow="La boutique"
        title={<>Matériel <span className="font-handwritten text-gold">pédagogique</span></>}
        subtitle="Une sélection soigneuse de jeux, livres et fournitures, choisis et testés par notre équipe."
        accent="gold"
      />

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <motion.button
                key={c}
                onClick={() => setActive(c)}
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-display font-bold transition-all ${
                  active === c
                    ? "bg-gradient-hero text-white shadow-soft"
                    : "bg-canvas text-ink hover:bg-magenta-bg hover:text-magenta"
                }`}
              >
                {c}
              </motion.button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-light" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-full rounded-full bg-canvas pl-11 pr-4 py-2.5 text-sm border-2 border-transparent focus:border-magenta outline-none font-body"
            />
          </div>
        </div>
      </section>

      {/* Grid  Instagram shop style */}
      <section className="relative py-20 bg-canvas overflow-hidden paper-grain">
        <Doodle kind="star" color="oklch(0.79 0.16 78 / 0.4)" className="absolute top-10 right-10 w-12 h-12" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {filtered.length === 0 ? (
            <p className="text-center font-handwritten text-2xl text-ink-light py-20">Aucun produit ne correspond ✦</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((p, i) => {
                const fav = favs.has(p.name);
                const tilt = (i % 4) - 1.5;
                return (
                  <motion.article
                    key={p.name + i}
                    initial={{ opacity: 0, y: 30, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: tilt }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: (i % 8) * 0.05, type: "spring", stiffness: 80 }}
                    whileHover={{ rotate: 0, y: -6, scale: 1.03 }}
                    className="group relative cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sticker"
                  >
                    <div className="relative aspect-square overflow-hidden bg-canvas">
                      <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width={896} height={896} />
                      {/* Price sticker */}
                      <div className={`absolute top-3 right-3 bg-${p.color} text-white px-3 py-1.5 rounded-full font-display font-bold text-sm shadow-sticker rotate-6 group-hover:rotate-12 transition-transform`}>
                        {p.price}
                      </div>
                      {/* Favorite */}
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); toggleFav(p.name); }}
                        whileTap={{ scale: 0.7 }}
                        animate={fav ? { scale: [1, 1.4, 1] } : {}}
                        className="absolute top-3 left-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-soft"
                        aria-label="Ajouter aux favoris"
                      >
                        <Heart className={`h-4 w-4 transition-colors ${fav ? "fill-magenta text-magenta" : "text-ink-light"}`} />
                      </motion.button>
                    </div>
                    <div className="p-5">
                      <span className={`inline-block font-label text-[10px] px-2.5 py-1 rounded-full bg-${p.color}-bg text-${p.color} mb-3`}>{p.cat}</span>
                      <h3 className="font-display font-bold leading-snug group-hover:text-magenta transition-colors">{p.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        className="mt-4 w-full rounded-full bg-ink text-white py-2.5 font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-magenta transition-colors group/btn"
                      >
                        <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90" />
                        Ajouter
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-gradient-soft overflow-hidden">
        <Doodle kind="heart" color="oklch(0.52 0.21 357 / 0.4)" className="absolute top-20 left-1/5 w-12 h-12 animate-float-soft" />
        <Doodle kind="spark" color="oklch(0.79 0.16 78 / 0.5)" className="absolute bottom-20 right-1/5 w-12 h-12" spin />
        <motion.div {...fadeUp} className="mx-auto max-w-3xl px-6 text-center">
          <p className="section-num mx-auto justify-center mb-4">Sur commande</p>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-6">
            Vous cherchez un produit <span className="font-handwritten text-magenta">spécifique</span> ?
          </h2>
          <p className="font-handwritten text-2xl text-ink-light mb-10">
            Contactez-nous, nous pouvons commander pour vous des matériels pédagogiques sur mesure.
          </p>
          <MagneticButton as="a" href="/contact" className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-8 py-4 font-display font-bold text-white shadow-glow hover:scale-105 transition-transform">
            Nous contacter
          </MagneticButton>
        </motion.div>
      </section>
    </PageShell>
  );
}
