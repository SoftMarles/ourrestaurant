import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DishCard, { type Dish } from "@/components/DishCard";
import { supabase } from "@/integrations/supabase/client";

export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    supabase.from("dishes").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
      setDishes((data ?? []) as Dish[]);
    });
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(dishes.map((d) => d.category)))], [dishes]);
  const filtered = filter === "All" ? dishes : dishes.filter((d) => d.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container pt-16 pb-10">
        <p className="eyebrow">Our Menu</p>
        <h1 className="mt-2 font-display text-5xl md:text-6xl font-bold">Crafted Fresh, Daily</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">From hand-smashed burgers to wood-fired pizza, every dish is made by our team from scratch.</p>
      </section>
      <section className="container">
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === c ? "bg-primary text-primary-foreground shadow-[var(--shadow-cta)]" : "bg-muted text-foreground/70 hover:bg-muted/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 py-10">
          {filtered.map((d) => <DishCard key={d.id} dish={d} />)}
        </div>
      </section>
      <Footer />
    </div>
  );
}
