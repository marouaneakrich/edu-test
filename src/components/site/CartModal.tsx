import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, MapPin, User, Phone, Mail } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { OrderItem } from "@/lib/supabase";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart, getCartCount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"cart" | "checkout">("cart");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Agadir",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis";
    if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
    if (!formData.city.trim()) newErrors.city = "La ville est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (getCartCount() === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    if (!validateForm()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order items
      const orderItems: OrderItem[] = items.map((item) => ({
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const total = getCartTotal();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("ez_orders")
        .insert({
          org_id: "educazen",
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address: formData.address,
          customer_city: formData.city,
          items: orderItems,
          total_amount: total,
          payment_method: "cod",
          payment_status: "pending",
          order_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItemsInsert = orderItems.map((item) => ({
        order_id: order.id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase.from("ez_order_items").insert(orderItemsInsert);

      if (itemsError) throw itemsError;

      // Trigger email notification via Supabase Edge Function
      try {
        console.log("Sending order email via Supabase...", { order, items: orderItems });
        const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ...order,
            items: orderItems,
          }),
        });
        const emailResult = await emailResponse.json();
        console.log("Email response:", emailResult);
        if (!emailResponse.ok) {
          console.error("Email sending failed:", emailResult);
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the order if email fails
      }

      toast.success("Commande passée avec succès ! Un email de confirmation vous a été envoyé.");
      clearCart();
      setStep("cart");
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "Agadir",
      });
      onClose();
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-20 md:right-4 md:left-auto md:w-[600px] md:max-h-[85vh] bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-magenta-bg rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-magenta" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">
                    {step === "cart" ? "Votre panier" : "Finaliser la commande"}
                  </h2>
                  <p className="text-sm text-ink-light">{getCartCount()} article(s)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === "cart" ? (
                <>
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-ink-light text-lg">Votre panier est vide</p>
                      <p className="text-sm text-ink-light mt-2">Ajoutez des produits pour commencer</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-4 p-4 bg-canvas rounded-2xl"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                          <div className="flex-1">
                            <h3 className="font-display font-bold text-sm">{item.name}</h3>
                            <p className="text-magenta font-bold">{item.price} MAD</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-ink-light hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="bg-canvas p-4 rounded-2xl">
                    <h3 className="font-display font-bold mb-3">Récapitulatif</h3>
                    <div className="space-y-2 text-sm">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-bold">{item.price * item.quantity} MAD</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-magenta">{getCartTotal()} MAD</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-teal-bg rounded-xl">
                      <p className="text-sm text-teal font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Paiement à la livraison
                      </p>
                    </div>
                  </div>

                  {/* Customer Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <User className="w-4 h-4" />
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${errors.name ? "border-red-400" : "border-gray-200"} focus:border-magenta outline-none`}
                        placeholder="Votre nom"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Mail className="w-4 h-4" />
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border-2 ${errors.email ? "border-red-400" : "border-gray-200"} focus:border-magenta outline-none`}
                          placeholder="votre@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Phone className="w-4 h-4" />
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border-2 ${errors.phone ? "border-red-400" : "border-gray-200"} focus:border-magenta outline-none`}
                          placeholder="06 XX XX XX XX"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <MapPin className="w-4 h-4" />
                        Adresse de livraison *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${errors.address ? "border-red-400" : "border-gray-200"} focus:border-magenta outline-none resize-none`}
                        rows={2}
                        placeholder="Numéro, rue, quartier..."
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Ville *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${errors.city ? "border-red-400" : "border-gray-200"} focus:border-magenta outline-none`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-white">
              {step === "cart" ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-magenta">{getCartTotal()} MAD</span>
                  </div>
                  <button
                    onClick={() => items.length > 0 && setStep("checkout")}
                    disabled={items.length === 0}
                    className="w-full py-4 rounded-full bg-gradient-hero text-white font-display font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Passer la commande
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("cart")}
                    className="px-6 py-4 rounded-full border-2 border-gray-200 font-display font-bold hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-full bg-gradient-hero text-white font-display font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {isSubmitting ? "Traitement..." : "Confirmer la commande"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
