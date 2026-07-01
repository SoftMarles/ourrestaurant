import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart, formatPrice } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  guest_name: z.string().trim().min(2).max(100),
  guest_email: z.string().trim().email().max(255),
  guest_phone: z.string().trim().max(40).optional(),
  fulfillment: z.enum(["delivery", "pickup", "dine_in"]),
  address: z.string().max(300).optional(),
  notes: z.string().max(500).optional(),
});

export default function Cart() {
  const { items, setQty, remove, clear, totalCents } = useCart();
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    guest_email: user?.email ?? "",
    guest_phone: "",
    fulfillment: "delivery" as "delivery" | "pickup" | "dine_in",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, guest_email: f.guest_email || user.email || "" }));
    supabase.from("profiles").select("full_name, phone").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm((f) => ({
        ...f,
        guest_name: f.guest_name || data.full_name || "",
        guest_phone: f.guest_phone || data.phone || "",
      }));
    });
  }, [user]);

  const total = totalCents();

  const checkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!user) {
      nav("/auth?next=/cart");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ ...parsed.data, user_id: user.id, total_cents: total } as any)
      .select("id, tracking_code")
      .single();
    if (error || !order) {
      setLoading(false);
      toast.error(error?.message ?? "Could not place order");
      return;
    }
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        dish_id: i.id,
        dish_name: i.name,
        quantity: i.quantity,
        unit_price_cents: i.price_cents,
        line_total_cents: i.price_cents * i.quantity,
      }))
    );
    setLoading(false);
    if (itemsErr) {
      toast.error(itemsErr.message);
      return;
    }
    clear();
    toast.success(`Order placed! Tracking code: ${order.tracking_code}`);
    nav(`/track/${order.tracking_code}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container py-16">
        <p className="eyebrow">Your Cart</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Review & Order</h1>

        {items.length === 0 ? (
          <div className="mt-16 rounded-2xl bg-card p-16 text-center shadow-[var(--shadow-card)]">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
            <Link to="/menu" className="mt-6 inline-block btn-primary">Browse the Menu</Link>
          </div>
        ) : (
          <div className="mt-10 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
                  {i.image_url && <img src={i.image_url} alt={i.name} className="h-20 w-20 rounded-xl object-cover" />}
                  <div className="flex-1">
                    <div className="font-display font-bold">{i.name}</div>
                    <div className="text-sm text-muted-foreground">{formatPrice(i.price_cents)} each</div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                    <button onClick={() => setQty(i.id, i.quantity - 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-background"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                    <button onClick={() => setQty(i.id, i.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-background"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="w-20 text-right font-display font-bold">{formatPrice(i.price_cents * i.quantity)}</div>
                  <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            <form onSubmit={checkout} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] space-y-4 h-fit sticky top-24">
              <h2 className="font-display text-xl font-bold">Checkout</h2>
              <div className="text-sm text-muted-foreground">No online payment — pay on delivery or pickup.</div>

              <div className="grid grid-cols-3 gap-2">
                {(["delivery", "pickup", "dine_in"] as const).map((f) => (
                  <button type="button" key={f} onClick={() => setForm({ ...form, fulfillment: f })}
                    className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${form.fulfillment === f ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}>
                    {f.replace("_", " ")}
                  </button>
                ))}
              </div>

              <input required placeholder="Full name *" value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} className="input" />
              <input required type="email" placeholder="Email *" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} className="input" />
              <input placeholder="Phone" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} className="input" />
              {form.fulfillment === "delivery" && (
                <textarea required={form.fulfillment === "delivery"} placeholder="Delivery address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input min-h-20" />
              )}
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-16" />

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? "Placing order…" : "Place Order"}
              </button>
            </form>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
