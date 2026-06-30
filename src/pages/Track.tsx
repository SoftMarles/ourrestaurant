import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, Truck, Utensils, XCircle } from "lucide-react";

type LookupResult = any;

const orderSteps = ["received", "preparing", "ready", "out_for_delivery", "completed"];
const resSteps = ["pending", "confirmed", "seated", "completed"];

export default function Track() {
  const { code: paramCode } = useParams();
  const nav = useNavigate();
  const [code, setCode] = useState(paramCode ?? "");
  const [data, setData] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (c: string) => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.rpc("lookup_tracking", { _code: c.trim().toUpperCase() });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (!data) { setError("No order or reservation found with that code."); return; }
    setData(data);
  };

  useEffect(() => { if (paramCode) lookup(paramCode); }, [paramCode]);

  const steps = data?.kind === "order" ? (data.status === "cancelled" ? [] : orderSteps) : resSteps;
  const currentIdx = data ? steps.indexOf(data.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container py-16 max-w-3xl">
        <p className="eyebrow">Order Tracking</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">Where's my order?</h1>
        <p className="mt-3 text-muted-foreground">Enter the tracking code from your confirmation.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); nav(`/track/${code.trim().toUpperCase()}`); lookup(code); }}
          className="mt-8 flex gap-2"
        >
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OUR-XXXXXX" className="input flex-1 uppercase" />
          <button className="btn-primary">Track</button>
        </form>

        {loading && <p className="mt-8 text-muted-foreground">Looking up…</p>}
        {error && <p className="mt-8 text-destructive">{error}</p>}

        {data && (
          <div className="mt-10 rounded-2xl bg-card p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="chip">{data.kind === "order" ? "Order" : "Reservation"}</span>
                <h2 className="mt-3 font-display text-2xl font-bold">{data.guest_name}</h2>
                <p className="text-sm text-muted-foreground">Code: {data.tracking_code}</p>
              </div>
              {data.status === "cancelled" ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive"><XCircle className="h-4 w-4" /> Cancelled</span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary capitalize">{data.status.replace("_", " ")}</span>
              )}
            </div>

            {steps.length > 0 && (
              <ol className="relative border-l-2 border-muted ml-3 space-y-6">
                {steps.map((s, i) => {
                  const done = i <= currentIdx;
                  return (
                    <li key={s} className="ml-6">
                      <span className={`absolute -left-3 grid h-6 w-6 place-items-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3 w-3" />}
                      </span>
                      <p className={`font-semibold capitalize ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.replace("_", " ")}</p>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
              {data.kind === "order" ? (
                <>
                  <Info icon={<Truck className="h-4 w-4" />} label="Fulfillment" value={String(data.fulfillment).replace("_", " ")} />
                  <Info icon={<Utensils className="h-4 w-4" />} label="Total" value={`$${(data.total_cents / 100).toFixed(2)}`} />
                </>
              ) : (
                <>
                  <Info icon={<Utensils className="h-4 w-4" />} label="Party size" value={String(data.party_size)} />
                  <Info icon={<Clock className="h-4 w-4" />} label="Reserved for" value={new Date(data.reserved_for).toLocaleString()} />
                </>
              )}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wide">{icon} {label}</div>
      <div className="mt-1 font-semibold capitalize">{value}</div>
    </div>
  );
}
