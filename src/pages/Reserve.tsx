import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import reserveBg from "@/assets/reserve-bg.jpg";

const schema = z.object({
  guest_name: z.string().trim().min(2).max(100),
  guest_email: z.string().trim().email().max(255),
  guest_phone: z.string().trim().max(40).optional(),
  party_size: z.number().int().min(1).max(20),
  reserved_for: z.string().min(10),
  occasion: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
});

export default function Reserve() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    guest_email: user?.email ?? "",
    guest_phone: "",
    party_size: 2,
    reserved_for: "",
    occasion: "",
    notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, guest_email: form.guest_email || user?.email });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .insert({ ...parsed.data, user_id: user?.id ?? null } as any)
      .select("tracking_code")
      .single();
    setLoading(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not save reservation");
      return;
    }
    toast.success(`Reservation confirmed! Tracking code: ${data.tracking_code}`);
    nav(`/track/${data.tracking_code}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="relative">
        <img src={reserveBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="relative container py-16 max-w-3xl">
          <p className="eyebrow">Book a Table</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Reserve your evening</h1>
          <p className="mt-3 text-muted-foreground">Tell us a little about your visit. We'll confirm by email and give you a tracking code.</p>

          <form onSubmit={submit} className="mt-10 grid gap-5 rounded-2xl bg-card p-8 shadow-[var(--shadow-card)]">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Full name *">
                <input required value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} className="input" />
              </Field>
              <Field label="Email *">
                <input required type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} className="input" />
              </Field>
              <Field label="Phone">
                <input value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} className="input" />
              </Field>
              <Field label="Party size *">
                <input required type="number" min={1} max={20} value={form.party_size} onChange={(e) => setForm({ ...form, party_size: parseInt(e.target.value) || 1 })} className="input" />
              </Field>
              <Field label="Date & time *">
                <input required type="datetime-local" value={form.reserved_for} onChange={(e) => setForm({ ...form, reserved_for: e.target.value })} className="input" />
              </Field>
              <Field label="Occasion (optional)">
                <input value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} className="input" placeholder="Birthday, anniversary…" />
              </Field>
            </div>
            <Field label="Special requests">
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-24" placeholder="Allergies, accessibility, seating preferences…" />
            </Field>
            <button disabled={loading} className="btn-primary justify-self-start disabled:opacity-60">
              {loading ? "Reserving…" : "Confirm Reservation"}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

// add input class
declare global {}
