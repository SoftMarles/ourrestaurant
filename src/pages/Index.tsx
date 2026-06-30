import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DishCard, { type Dish } from "@/components/DishCard";
import { supabase } from "@/integrations/supabase/client";
import heroFood from "@/assets/hero-food.jpg";
import reserveBg from "@/assets/reserve-bg.jpg";

const reviews = [
  { name: "Sarah Mitchell", date: "June 12, 2026", dish: "Classic Smash Burger", text: "Absolutely incredible food. The smash burger is the best I've ever had. Fast delivery and everything arrived piping hot." },
  { name: "James Okoye", date: "June 8, 2026", dish: "Tagliatelle Carbonara", text: "The carbonara is authentic and creamy — you can tell they use quality ingredients. Will definitely be ordering again." },
  { name: "Priya Sharma", date: "May 30, 2026", dish: "Margherita Pizza", text: "Love that I can track my order in real time. The Margherita pizza was fresh, thin-crust perfection. OURS is my go-to now." },
];

export default function Index() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  useEffect(() => {
    supabase
      .from("dishes")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .limit(8)
      .then(({ data }) => setDishes((data ?? []) as Dish[]));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroFood} alt="Signature burger and craft beer" width={1920} height={1280} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/85 via-secondary/55 to-secondary/20" />
        </div>
        <div className="relative container py-32 md:py-44 max-w-3xl text-secondary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-cta)]">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Now Taking Orders
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-extrabold leading-[1.05]">
            Exceptional Food, <br />
            <span className="text-primary">Delivered to You</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-secondary-foreground/85">
            Restaurant-quality meals from our passionate chefs. Browse the menu, place your order, and track it in real time — no online payment required.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="btn-primary">Order Now <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/reserve" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur px-6 py-3 font-semibold text-white border border-white/20 hover:bg-white/20 transition">
              Reserve a Table
            </Link>
          </div>
          <div className="mt-12 flex gap-10">
            <div><div className="font-display text-3xl font-bold text-primary">4.9<span className="text-accent">★</span></div><div className="text-xs uppercase tracking-wider text-secondary-foreground/70 mt-1">Average Rating</div></div>
            <div><div className="font-display text-3xl font-bold">15k+</div><div className="text-xs uppercase tracking-wider text-secondary-foreground/70 mt-1">Happy Customers</div></div>
            <div><div className="font-display text-3xl font-bold">25m</div><div className="text-xs uppercase tracking-wider text-secondary-foreground/70 mt-1">Avg. Prep Time</div></div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow">Fan Favorites</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Featured Meals</h2>
          </div>
          <Link to="/menu" className="hidden md:inline-flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dishes.map((d) => <DishCard key={d.id} dish={d} />)}
        </div>
      </section>

      {/* RESERVE BAND */}
      <section className="relative overflow-hidden">
        <img src={reserveBg} alt="Restaurant dining room" width={1600} height={1000} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-secondary/85" />
        <div className="relative container py-24 grid md:grid-cols-2 gap-10 items-center text-secondary-foreground">
          <div>
            <p className="eyebrow text-primary">Dine With Us</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Reserve a table tonight</h2>
            <p className="mt-4 text-secondary-foreground/80 max-w-md">
              Whether it's an anniversary, a casual dinner, or a celebration — we'll have your table ready. Free reservation, instant confirmation.
            </p>
            <Link to="/reserve" className="mt-8 btn-primary">Reserve Now <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { k: "Open Daily", v: "11am — 11pm" },
                { k: "Reservations", v: "Up to 12 guests" },
                { k: "Dress Code", v: "Smart casual" },
                { k: "Parking", v: "Valet available" },
              ].map((i) => (
                <div key={i.k} className="rounded-xl bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-wider text-secondary-foreground/60">{i.k}</div>
                  <div className="mt-1 font-display font-bold">{i.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container py-24">
        <div className="text-center mb-12">
          <p className="eyebrow">What Customers Say</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Real Reviews</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" />)}
              </div>
              <p className="text-foreground/80">"{r.text}"</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold">{r.name[0]}</div>
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.date} · {r.dish}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-20 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Ready to Order?</h2>
          <p className="mt-3 max-w-xl mx-auto text-primary-foreground/90">
            Browse our full menu and have your favorite dishes prepared fresh, just for you.
          </p>
          <Link to="/menu" className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 font-bold text-secondary-foreground hover:bg-secondary/90 transition">
            View the Full Menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
