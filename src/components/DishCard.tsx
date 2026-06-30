import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/cart";
import { Plus, Flame, Clock } from "lucide-react";

export type Dish = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_cents: number;
  calories: number | null;
  prep_minutes: number | null;
  image_url: string | null;
  is_vegetarian: boolean;
};

export default function DishCard({ dish }: { dish: Dish }) {
  const add = useCart((s) => s.add);
  return (
    <article className="card-dish">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {dish.image_url && (
          <img
            src={dish.image_url}
            alt={dish.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="chip">{dish.category}</span>
          {dish.is_vegetarian && <span className="chip-veg">Vegetarian</span>}
        </div>
        {dish.prep_minutes && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-secondary/90 px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Clock className="h-3 w-3" /> {dish.prep_minutes}m
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold leading-tight">{dish.name}</h3>
        {dish.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{dish.description}</p>
        )}
        {dish.calories && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Flame className="h-3 w-3" /> {dish.calories} cal
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">{formatPrice(dish.price_cents)}</span>
          <button
            onClick={() =>
              add({ id: dish.id, name: dish.name, price_cents: dish.price_cents, image_url: dish.image_url })
            }
            className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-[var(--shadow-cta)] hover:brightness-110"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
