# Zippy — Build Plan

Zippy is too big to build in one go, so I'll build it in phases, starting with a solid first slice you can click through. A few things to know first:

- **Platform:** Zippy will be a mobile-first web app (it works on phones and can be installed to the home screen) plus a web admin dashboard, all in one project. React Native/Expo and Next.js aren't supported here, so the native mobile parts of the brief become web screens with the same look and flows.
- **Backend:** Lovable Cloud handles logins, the database, file uploads and live updates.
- **Reference screenshots:** none were attached. If you upload them, I'll use them for layouts.

## Phase 1 — Foundation + clickable core (this build)
1. **Design system:** your color palette as light/dark themes, Plus Jakarta Sans + Nunito Sans fonts, pill buttons that press down when tapped, big rounded cards, status chips, step progress bars, bottom sheets, loading placeholders, toasts, confetti, and a reduced-motion setting.
2. **Original illustrations:** a delivery box character, the bicycle, motorbike, car and cargo van, a pin and route, and a success scene.
3. **Splash, 4 swipeable onboarding screens, sign up / login with email and Google, forgot password, and a "How will you use Zippy?" choice** (send, deliver, or both).
4. **Roles:** customer, driver and admin are stored securely on the server. After login, each person lands in their own app.
5. **Customer app:** a home dashboard (hero card, quick actions, ride picker, active and recent deliveries, rewards banner, bottom nav) and the 6-step booking flow (pickup, drop-off, package, vehicle with an automatic recommendation and reasons why a vehicle can't be used, timing, review with full price breakdown).
6. **Driver app (darker look):** registration with document uploads and a "Pending Verification" state, a home screen with an online/offline toggle and earnings card, and a list of incoming requests to accept or decline.
7. **Matching:** a real order lifecycle. Only approved, online drivers with a suitable vehicle see a request. Two drivers can't accept the same order.
8. **Admin (basic):** approve or reject drivers, and edit vehicle weight/distance limits and pricing rules.

## Phase 2 — Live delivery
Finding-driver and driver-assigned screens, live tracking map (Google Maps), driver's step-by-step active delivery, pickup checks (photos, item count, OTP), proof of delivery (OTP, signature, photo), failed-delivery and return flows, the delivered celebration, and ratings.

## Phase 3 — Messaging and notifications
Customer–driver chat with quick replies, in-app notifications with preferences, support tickets and reporting a problem.

## Phase 4 — Money and business
Wallet, transactions and receipts, a payment provider (to be decided together, with mobile money if possible), driver earnings charts and payout requests, business profiles with staff, multiple pickup locations, bulk booking and invoices.

## Phase 5 — Admin and polish
Full admin dashboard (overview stats, live operations map, customers, finance, analytics charts, disputes, audit log), Zippy Points and achievements, order history filters, and accessibility and speed improvements.

## Technical details
- TanStack Start routes: `/` splash + onboarding, `/auth`, `/_authenticated/{app,driver,admin}/*`, with a gate on each role-specific area that checks a `user_roles` table and a `has_role()` function.
- Phase 1 tables: profiles, user_roles, vehicle_types (configurable limits), drivers, driver_documents, vehicles, driver_availability, addresses, delivery_orders, delivery_stops (ready for multiple stops), packages, delivery_quotes (price saved at booking time), pricing_rules, delivery_status_events, delivery_assignments, admin_audit_logs. Money is stored in minor units with a currency code. RLS on every table. Later phases add the remaining tables from your list.
- The order lifecycle is enforced by a database function that checks allowed status changes. Acceptance is an atomic `accept_order()` RPC that uses row locking.
- Quotes and vehicle recommendations are calculated in a server function using admin-configurable rules. In Phase 1, distance comes from a straight-line estimate; Phase 2 switches to real Google route distance.
- Forms use React Hook Form + Zod, data loads through TanStack Query, and there are tests for pricing, vehicle eligibility and status-transition rules.
