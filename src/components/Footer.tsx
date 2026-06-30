import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground font-display font-bold text-lg">O</span>
            <span className="font-display text-xl font-bold">Ours<span className="text-primary">Restaurant</span></span>
          </div>
          <p className="text-secondary-foreground/70 max-w-md">
            Exceptional food, delivered to you. Reserve a table, order in, or track your meal in real time — no online payment required.
          </p>
          <div className="mt-6 flex gap-3">
            <a className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-primary transition" href="#"><Instagram className="h-4 w-4" /></a>
            <a className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-primary transition" href="#"><Facebook className="h-4 w-4" /></a>
            <a className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-primary transition" href="#"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-secondary-foreground/70">
            <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link to="/reserve" className="hover:text-primary">Reserve a table</Link></li>
            <li><Link to="/track" className="hover:text-primary">Track order</Link></li>
            <li><Link to="/about" className="hover:text-primary">About & Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Visit</h4>
          <ul className="space-y-2 text-secondary-foreground/70">
            <li>123 Saffron Lane</li>
            <li>Downtown · Open daily</li>
            <li>11am — 11pm</li>
            <li>hello@ours.restaurant</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-6 text-sm text-secondary-foreground/60 flex flex-col md:flex-row gap-2 justify-between">
          <span>© 2026 OURS Restaurant. All rights reserved.</span>
          <span>Crafted with care.</span>
        </div>
      </div>
    </footer>
  );
}
