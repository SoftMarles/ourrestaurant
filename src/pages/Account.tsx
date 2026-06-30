import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth, useRoles } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Account() {
  const { user, loading } = useAuth();
  const { isAdmin, isStaff } = useRoles(user?.id);
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav("/auth"); return; }
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setOrders(data ?? []));
    supabase.from("reservations").select("*").eq("user_id", user.id).order("reserved_for", { ascending: false }).then(({ data }) => setReservations(data ?? []));
  }, [user, loading, nav]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ user_id: user.id, ...profile });
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container py-16">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow">My Account</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {isStaff && <Link to="/admin" className="btn-secondary">Admin Dashboard</Link>}
            <button
              onClick={async () => { await supabase.auth.signOut(); nav("/"); }}
              className="btn-ghost"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <form onSubmit={saveProfile} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] space-y-3">
            <h2 className="font-display text-xl font-bold mb-2">Profile</h2>
            <input className="input" placeholder="Full name" value={profile?.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            <input className="input" placeholder="Phone" value={profile?.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <textarea className="input min-h-20" placeholder="Dietary notes / allergies" value={profile?.dietary_notes ?? ""} onChange={(e) => setProfile({ ...profile, dietary_notes: e.target.value })} />
            <button className="btn-primary w-full">Save</button>
            {isAdmin && <p className="text-xs text-primary font-semibold">You have admin access.</p>}
          </form>

          <div className="lg:col-span-2 space-y-8">
            <Block title="My Orders" empty="No orders yet.">
              {orders.map((o) => (
                <Link key={o.id} to={`/track/${o.tracking_code}`} className="flex items-center justify-between rounded-xl bg-muted p-4 hover:bg-muted/70 transition">
                  <div>
                    <div className="font-semibold">{o.tracking_code} · {new Date(o.created_at).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground capitalize">{o.fulfillment.replace("_", " ")} · ${(o.total_cents / 100).toFixed(2)}</div>
                  </div>
                  <span className="chip capitalize">{o.status.replace("_", " ")}</span>
                </Link>
              ))}
            </Block>
            <Block title="My Reservations" empty="No reservations yet.">
              {reservations.map((r) => (
                <Link key={r.id} to={`/track/${r.tracking_code}`} className="flex items-center justify-between rounded-xl bg-muted p-4 hover:bg-muted/70 transition">
                  <div>
                    <div className="font-semibold">{r.tracking_code} · {new Date(r.reserved_for).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Party of {r.party_size}</div>
                  </div>
                  <span className="chip capitalize">{r.status}</span>
                </Link>
              ))}
            </Block>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Block({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  const isEmpty = arr.length === 0 || (arr.length === 1 && !arr[0]);
  return (
    <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-xl font-bold mb-4">{title}</h2>
      {isEmpty ? <p className="text-muted-foreground">{empty}</p> : <div className="space-y-2">{children}</div>}
    </div>
  );
}
