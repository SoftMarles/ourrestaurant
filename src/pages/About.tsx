import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="container py-20 max-w-4xl">
        <p className="eyebrow">About Us</p>
        <h1 className="mt-2 font-display text-5xl md:text-6xl font-bold">Food made with love, served with pride.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          OURS Restaurant started as a tiny corner kitchen with one rule: cook every plate the way you'd cook it for your own family.
          Today, we serve thousands of meals every week — and that rule has not changed.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { t: "Fresh ingredients", d: "Sourced daily from local farms and producers." },
            { t: "Made to order", d: "Nothing sits under a heat lamp. Cooked when you order it." },
            { t: "Real-time tracking", d: "See your order status from kitchen to door." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-display text-xl font-bold">{c.t}</h3>
              <p className="mt-2 text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-secondary text-secondary-foreground p-10">
          <h2 className="font-display text-3xl font-bold">Get in touch</h2>
          <p className="mt-3 text-secondary-foreground/80">123 Saffron Lane, Downtown · Open daily 11am — 11pm</p>
          <p className="mt-1 text-secondary-foreground/80">hello@ours.restaurant</p>
          <Link to="/reserve" className="mt-8 inline-block btn-primary">Reserve a Table</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
