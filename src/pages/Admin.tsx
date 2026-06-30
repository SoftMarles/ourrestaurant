import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth, useRoles } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tab = "reservations" | "orders" | "dishes";

export default function Admin() {
  const { user, loading } = useAuth();
  const { isStaff, isAdmin, loading: rolesLoading } = useRoles(user?.id);
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("reservations");
  const demo = new URLSearchParams(location.search).get("demo") === "true";

  useEffect(() => {
    if (loading || rolesLoading) return;
    if (demo) return;
    if (!user) nav("/auth");
    else if (!isStaff) nav("/account");
  }, [user, isStaff, loading, rolesLoading, demo, nav]);

  if (!demo && (loading || rolesLoading || !user || !isStaff)) {
    return <div className="min-h-screen grid place-items-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container py-12">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow">Staff</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">{demo ? "Demo mode" : user?.email} · {isAdmin ? "Admin" : "Staff"}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-2 border-b border-border">
          {(["reservations", "orders", "dishes"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "reservations" && <ReservationsTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "dishes" && <DishesTab canEdit={isAdmin || demo} />}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function ReservationsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => supabase.from("reservations").select("*").order("reserved_for", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };
  const statuses = ["pending", "confirmed", "seated", "completed", "cancelled"];
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-muted-foreground">No reservations.</p>}
      {rows.map((r) => (
        <div key={r.id} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] grid md:grid-cols-[1fr_auto] gap-3 items-center">
          <div>
            <div className="font-display font-bold">{r.guest_name} · party of {r.party_size}</div>
            <div className="text-sm text-muted-foreground">{new Date(r.reserved_for).toLocaleString()} · {r.guest_email}{r.guest_phone ? ` · ${r.guest_phone}` : ""}</div>
            {r.notes && <div className="text-sm mt-1">{r.notes}</div>}
            <div className="text-xs mt-1 text-primary font-mono">{r.tracking_code}</div>
          </div>
          <select value={r.status} onChange={(e) => update(r.id, e.target.value)} className="input w-44">
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function OrdersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [items, setItems] = useState<Record<string, any[]>>({});
  const load = () => supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  const toggleItems = async (orderId: string) => {
    if (items[orderId]) { setItems({ ...items, [orderId]: undefined as any }); return; }
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    setItems({ ...items, [orderId]: data ?? [] });
  };
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };
  const statuses = ["received", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-muted-foreground">No orders.</p>}
      {rows.map((o) => (
        <div key={o.id} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
            <div>
              <div className="font-display font-bold">{o.guest_name} · ${(o.total_cents / 100).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground capitalize">{o.fulfillment.replace("_", " ")} · {o.guest_email}{o.guest_phone ? ` · ${o.guest_phone}` : ""}</div>
              {o.address && <div className="text-sm">{o.address}</div>}
              <div className="text-xs mt-1 text-primary font-mono">{o.tracking_code} · {new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleItems(o.id)} className="btn-ghost text-sm py-2">Items</button>
              <select value={o.status} onChange={(e) => update(o.id, e.target.value)} className="input w-44">
                {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
          {items[o.id] && (
            <ul className="mt-4 border-t border-border pt-3 space-y-1 text-sm">
              {items[o.id].map((i: any) => (
                <li key={i.id} className="flex justify-between"><span>{i.quantity}× {i.dish_name}</span><span>${(i.line_total_cents / 100).toFixed(2)}</span></li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function DishesTab({ canEdit }: { canEdit: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: "", category: "Burgers", price_cents: 1000, description: "", image_url: "", is_vegetarian: false, prep_minutes: 15, calories: 500, is_active: true });
  const load = () => supabase.from("dishes").select("*").order("sort_order").then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("dishes").insert(form);
    if (error) toast.error(error.message); else { toast.success("Added"); load(); setForm({ ...form, name: "" }); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("dishes").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };
  const toggleActive = async (d: any) => {
    const { error } = await supabase.from("dishes").update({ is_active: !d.is_active }).eq("id", d.id);
    if (error) toast.error(error.message); else load();
  };
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-3">
        {rows.map((d) => (
          <div key={d.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] flex items-center gap-4">
            {d.image_url && <img src={d.image_url} alt={d.name} className="h-16 w-16 rounded-xl object-cover" />}
            <div className="flex-1">
              <div className="font-display font-bold">{d.name} <span className="text-xs text-muted-foreground">· {d.category}</span></div>
              <div className="text-sm text-muted-foreground">${(d.price_cents / 100).toFixed(2)} · {d.is_active ? "Active" : "Hidden"}</div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button onClick={() => toggleActive(d)} className="btn-ghost text-xs py-1.5 px-3">{d.is_active ? "Hide" : "Show"}</button>
                <button onClick={() => remove(d.id)} className="text-xs font-semibold text-destructive">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {canEdit && (
        <form onSubmit={create} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] space-y-3 h-fit sticky top-24">
          <h3 className="font-display font-bold">Add dish</h3>
          <input required className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="input" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <textarea className="input min-h-16" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" className="input" placeholder="¢" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: +e.target.value })} />
            <input type="number" className="input" placeholder="kcal" value={form.calories} onChange={(e) => setForm({ ...form, calories: +e.target.value })} />
            <input type="number" className="input" placeholder="min" value={form.prep_minutes} onChange={(e) => setForm({ ...form, prep_minutes: +e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_vegetarian} onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })} /> Vegetarian</label>
          <button className="btn-primary w-full">Add dish</button>
          <p className="text-xs text-muted-foreground">Prices in cents (1299 = $12.99)</p>
        </form>
      )}
    </div>
  );
}
