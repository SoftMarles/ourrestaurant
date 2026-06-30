
# OURS RESTAURANT — booking & ordering platform

Pivot the current glamping site into a restaurant platform called **OURS RESTAURANT** with customer accounts, an admin back office, table-reservation tracking, and food-order tracking. The look adopts the reference video's identity: vivid orange primary, deep navy surfaces, big bold sans-serif headlines, rounded white cards with category chips and prominent CTAs.

## Visual direction (replaces current Aimé Leon Dore aesthetic)

- **Palette**: orange `#F26B1F` primary, deep navy `#1A2238` surface, off-white `#FAF7F2` background, charcoal `#1B1B1F` text. Star/rating yellow `#F5B301`.
- **Type**: Poppins (display, 700/800) + Inter (body, 400/500). Replaces DM Sans.
- **Components**: rounded-2xl white cards with shadow, orange pill CTAs, category chips (orange / green vegetarian), large hero image with dark overlay and overlaid headline + dual CTA, sticky white navbar with circular orange logo mark, navy footer.
- Memory entries for the old AlD aesthetic will be replaced.

## Information architecture

Public site
- **Home**: hero (Exceptional Food, Delivered to You-style headline), stats strip, "Featured Dishes" card grid, "Reserve a Table" band, reviews, big orange "Ready to Order?" CTA, navy footer.
- **Menu**: full dish catalog, filter by category, add to cart.
- **Reserve**: table booking form (date, time, party size, occasion, contact, special requests).
- **Track Order / Track Reservation**: lookup by code or from account.
- **About & Contact**.

Authenticated
- **Sign in / Sign up** (email+password and Google).
- **My Account**: profile (name, phone, dietary prefs, avatar), my reservations, my orders, both with live status.

Admin
- **/admin** protected by role (`admin` in `user_roles`). Keeps existing `?demo=true` bypass behavior.
- Tabs: Reservations, Orders, Menu (CRUD dishes), Customers.
- Status update controls move records through the tracking pipeline (received → preparing → ready → completed / cancelled for orders; pending → confirmed → seated → completed / cancelled for reservations).

## Backend (Lovable Cloud)

New tables, all RLS-enabled, with grants:

- `profiles` (user_id PK→auth.users, full_name, phone, avatar_url, dietary_notes). Auto-created via trigger on signup.
- `user_roles` (user_id, role enum: `admin` | `staff` | `customer`) + `has_role()` security-definer function.
- `dishes` (name, description, category, price_cents, calories, prep_minutes, image_url, is_vegetarian, is_active, sort_order).
- `reservations` (user_id nullable for guests, guest_name, guest_email, guest_phone, party_size, reserved_for timestamptz, occasion, notes, status, tracking_code).
- `orders` (user_id nullable for guests, guest_name, guest_email, guest_phone, fulfillment enum: `delivery` | `pickup` | `dine_in`, address, status, total_cents, tracking_code).
- `order_items` (order_id, dish_id, quantity, unit_price_cents, line_total_cents).

RLS summary (plain English):
- Anyone can read active dishes.
- Customers can read/create their own reservations and orders; admins/staff can read and update all.
- Guests (no account) can create reservations/orders and look them up by `tracking_code` via a public RPC.
- Only admins can write to dishes; only admins/staff can update reservation/order status.

## Auth

- Email/password + Google sign-in via Lovable Cloud (`lovable.auth.signInWithOAuth`).
- Password reset page at `/reset-password`.
- Role check is server-side via `has_role()`; admin route guards check it, never localStorage.

## Tracking system

- Every reservation and order generates a short `tracking_code` (e.g. `OUR-7F3K`).
- `/track` page accepts a code and returns current status + timeline.
- Signed-in users also see all their bookings/orders on `/account`.
- Status changes by admins write `updated_at`; the customer view polls (or uses realtime) to reflect changes.

## Migration of existing project

- Remove glamping content: Wild Haven branding, locations catalog, glamping booking flow, experience cards.
- Replace with restaurant equivalents above. Keep routing shell, navbar/footer scaffolding, and admin route (rewired for new tables).
- Update memory: replace Aimé Leon Dore design rules with the new OURS RESTAURANT design system; replace location/booking memories with dish/reservation/order memories.

## Out of scope for this first pass

- Real payments (Stripe/Paddle) — orders are "no online payment required", matching the reference. Can be added later.
- Delivery driver app, kitchen display, SMS notifications.
- Loyalty/coupons.

## Technical notes

- Stack stays React 18 + Vite + Tailwind + shadcn + Supabase (Lovable Cloud).
- New tokens in `index.css` (HSL): `--primary` orange, `--secondary` navy, `--accent` yellow, `--radius: 1rem`. Tailwind config extends with `poppins` + `inter` font families via `@fontsource`.
- Cart state in a Zustand store, persisted to localStorage; on checkout, posted to `orders` + `order_items` in one RPC.
- Profile + role auto-provisioned via `handle_new_user()` trigger on `auth.users` insert (default role `customer`).
- Admin first user: bootstrap script / one-time SQL to grant `admin` to the project owner's email.

## Build order

1. Design tokens, fonts, navbar/footer reskin, home hero + featured dishes (static).
2. DB migrations: profiles, user_roles, dishes, reservations, orders, order_items + RLS + grants + trigger.
3. Auth pages (sign in / sign up / reset) with email+password and Google.
4. Menu page + cart + checkout → orders.
5. Reservation form → reservations.
6. /track page + /account page (my reservations + my orders).
7. Admin dashboard rewired: reservations, orders, menu CRUD.
8. Seed dishes, polish, replace memory entries.
