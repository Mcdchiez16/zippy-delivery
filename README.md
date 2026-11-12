# Zippy Delivery

MASTER PROMPT: BUILD ZIPPY — A PREMIUM, PLAYFUL MULTI-VEHICLE DELIVERY PLATFORM

PROJECT OVERVIEW

Build a beautiful, modern, production-oriented, mobile-first delivery platform called Zippy.

Zippy is an on-demand delivery and logistics application connecting individuals, businesses, shops, and merchants with verified delivery drivers and couriers.

Users should be able to request delivery of almost anything legally transportable, including documents, groceries, clothes, electronics, food, parcels, business supplies, furniture, and larger cargo.

The platform must support four main vehicle categories:

Bicycle — affordable, environmentally friendly deliveries over short distances, suitable for documents, food, and small parcels.

Motorbike — fast deliveries for small and medium packages, especially in traffic-heavy urban areas.

Car — deliveries for larger parcels, multiple items, groceries, and fragile packages.

Cargo vehicle / Van / Truck — larger deliveries such as furniture, appliances, bulk goods, and business stock.

The platform must intelligently recommend suitable vehicle types based on distance, weight, dimensions, package category, availability, and pricing.

Zippy must have THREE separate experiences sharing one backend:

Customer App — for individuals, shops, and businesses requesting deliveries.

Driver App — for couriers and drivers accepting and completing deliveries.

Admin Dashboard — for managing the entire delivery platform.

The customer and driver applications should have completely different interfaces, navigation structures, permissions, and workflows.

The application must feel extremely polished, fast, friendly, intuitive, trustworthy, and enjoyable.

1. DESIGN DIRECTION

Main Inspiration

Combine:

Duolingo's delightful user experience, approachable personality, satisfying interactions, colorful visuals, and gamification.

Uber's simple booking experience and clean navigation.

Modern logistics apps' professional shipment dashboards, live maps, and delivery tracking.

The supplied reference screenshots' card layouts, package details, progress indicators, delivery history, bottom navigation, and route screens.

Do not directly copy any existing product's proprietary artwork, branding, mascot, or screen designs.

Create an original visual identity that feels like a premium logistics startup.

Brand Personality

Zippy should feel:

Fast

Energetic

Friendly

Modern

Reliable

Secure

Helpful

Rewarding

Professional

The user should feel excited to open the app while still trusting it with valuable deliveries.

Color System

Primary Green: #58CC02
Deep Green: #2E8B20
Dark Charcoal: #17251D
Bright Yellow: #FFC83D
Sky Blue: #35B7FF
Soft Background: #F7FAF5
White: #FFFFFF
Light Border: #E5EBE3
Muted Text: #7A867D
Success: #27AE60
Error: #F05A5A
Warning: #FFB020

Use the bright green for primary buttons, active states, delivery progress, and important branded elements.

Use dark charcoal for premium typography, navigation, and contrast.

Use yellow for promotions, rewards, highlighted illustrations, and selected actions.

Use sky blue for tracking, navigation, and informational elements.

Avoid overwhelming users with too many bright colors on one screen.

Typography

Use a modern, rounded, highly readable font such as Nunito Sans, Plus Jakarta Sans, or a similarly friendly geometric typeface.

Use:

Bold, expressive headings.

Clear medium-weight body text.

Rounded numerical labels.

Excellent text contrast.

Strong visual hierarchy.

Components

Create a consistent design system featuring:

Large rounded cards.

Soft shadows.

Pill-shaped buttons.

Tactile buttons with subtle pressed depth.

Rounded text fields.

Friendly illustrated empty states.

Colorful status chips.

Step-by-step progress indicators.

Floating navigation elements.

Interactive map cards.

Bottom sheets.

Large vehicle selection cards.

Skeleton loading states.

Toast notifications.

Confetti for meaningful achievements.

Smooth animated transitions.

Use consistent 8-point spacing and generous padding.

The app should have both light mode and dark mode.

Light mode should be the default.

Illustrations

Create an original illustration system featuring:

Happy delivery boxes.

Cute but professional bicycle couriers.

Friendly motorbike illustrations.

Compact delivery cars.

Cargo vans and trucks.

Location pins.

Route lines.

Package characters.

Delivery success illustrations.

Illustrations should be polished 3D-inspired or soft vector illustrations with rounded shapes, expressive personalities, and bright brand colors.

They should be playful but not childish.

Animation and Interaction

Make the experience feel alive.

Examples:

Buttons slightly compress when tapped.

Vehicle cards bounce subtly when selected.

Progress bars animate smoothly.

A package illustration celebrates when delivery is completed.

A moving courier icon appears on the tracking map.

Delivery status updates transition smoothly.

Reward points animate when earned.

Successful delivery produces a subtle confetti animation.

Loading states show a small animated courier or package.

Animations must be smooth, accessible, and fast.

Support reduced-motion accessibility settings.

2. APP ARCHITECTURE

Build a single platform with role-based access.

Roles:

CUSTOMER
DRIVER
ADMIN

Customers may have individual or business accounts.

Drivers can register with a specific vehicle type and may add additional approved vehicles.

Admins manage operations through a separate web dashboard.

After login, redirect users to the appropriate interface according to their account role.

Use secure role-based permissions. Never rely on frontend-only authorization.

3. CUSTOMER APPLICATION

Screen 1 — Splash Screen

Create a memorable splash screen.

Background: bright Zippy green.

Center: original animated package or delivery vehicle illustration.

Brand name: Zippy.

Tagline: "Anything delivered. Anywhere we go."

Add a smooth transition into onboarding.

Screen 2 — Onboarding

Create three or four swipeable onboarding screens.

Screen A:
"Send anything, effortlessly."
Illustration of a package traveling between two locations.

Screen B:
"The perfect ride for every delivery."
Show bicycle, motorbike, car, and cargo vehicle illustrations.

Screen C:
"Know exactly where it is."
Show a live map with a moving courier.

Screen D:
"Fast delivery. Happy moments."
Show a successful delivery celebration.

Each screen should have:

Large friendly illustrations.

Short compelling headings.

Clear supporting text.

Animated progress dots.

Skip option.

Continue button.

Final screen should display:

"Get Started"

Screen 3 — Authentication

Provide:

Sign up with email.

Sign up with phone number.

Google login where supported.

Apple login where supported.

Login.

Forgot password.

OTP verification.

Terms and privacy consent.

After registration, ask:

"How will you use Zippy?"

Options:

Send packages.

Deliver packages and earn.

Both.

Users who choose both must be able to switch between customer and driver modes after completing driver verification.

Screen 4 — Customer Home Dashboard

This is one of the most important screens.

Create a beautiful, modern dashboard.

Top section:

Friendly greeting:
"Hey Alex! 👋"

Supporting text:
"Where are we delivering today?"

Show the user's current city or selected service area.

Top-right:
Notification bell with unread badge.

Main hero card:

"Let's get it moving!"

Supporting text:
"Your next delivery is just a few taps away."

Include a friendly illustrated courier or package.

Primary CTA:
"Send a Package"

Below the hero, show:

Quick Actions

Four interactive cards:

Send Package

Track Delivery

My Orders

Delivery Prices

Choose Your Ride

Horizontal scrollable illustrated cards:

Bicycle

Motorbike

Car

Cargo

Each card should show an illustration, short description, and estimated suitability.

Active Deliveries

Show ongoing deliveries in polished cards.

Each card includes:

Package icon.

Tracking number.

Pickup and destination.

Delivery status.

Estimated arrival.

Mini progress indicator.

Track button.

Recent Deliveries

Display recent completed orders with quick rebook actions.

Rewards Banner

"Every delivery gets you closer to a reward!"

Display reward points and a progress bar.

Bottom Navigation

Home | Activity | Track | Wallet | Profile

Use a floating or softly elevated bottom navigation bar with rounded icons and a clear active state.

Screen 5 — Create Delivery

Build a smooth multi-step booking experience.

Show a progress indicator at the top.

Step 1: Pickup Location

Inputs:

Pickup address.

Map location selection.

Current location option.

Saved addresses.

Pickup contact name.

Pickup phone number.

Additional instructions.

Step 2: Drop-off Location

Inputs:

Destination address.

Map location selection.

Recipient name.

Recipient phone number.

Delivery instructions.

Support multiple stops in a future-ready architecture.

Step 3: Package Information

Fields:

Package category.

Description.

Weight.

Dimensions.

Quantity.

Fragile toggle.

Package photo upload.

Estimated declared value.

Special handling instructions.

Categories:

Documents, Food, Groceries, Clothing, Electronics, Gifts, Furniture, Business Goods, Other.

Step 4: Select Vehicle

Display four beautiful vehicle cards.

Bicycle:
"Small packages. Small price."

Motorbike:
"Quick trips. Big convenience."

Car:
"More room for more things."

Cargo:
"Big deliveries made easy."

Each card displays:

Illustrated vehicle.

Suitable package size.

Maximum supported weight.

Estimated arrival time.

Estimated delivery duration.

Estimated cost.

Availability.

Recommended badge where appropriate.

The system should automatically recommend the best vehicle.

Disable unsuitable vehicle options and explain why they are unavailable.

Step 5: Delivery Timing

Options:

Deliver Now.

Schedule for Later.

Allow selection of date and time for scheduled deliveries.

Step 6: Order Review

Show:

Pickup.

Destination.

Route map.

Package information.

Vehicle selection.

Estimated distance.

Estimated duration.

Delivery fee.

Additional charges.

Discounts.

Total amount.

Primary CTA:
"Confirm Delivery"

Screen 6 — Finding a Driver

Create a visually delightful matching screen.

Display:

Animated map.

Pulsating location marker.

Friendly vehicle animation.

"Finding your delivery hero..."

A short reassuring message.

Show the selected vehicle type.

Allow cancellation according to the cancellation policy.

Matching must use actual eligible online drivers, not fake simulated assignments.

When a driver accepts, transition to the assigned-driver screen.

Screen 7 — Driver Assigned

Show:

Driver profile photo.

Driver name.

Verified badge.

Driver rating.

Vehicle type.

Vehicle registration information where appropriate.

ETA to pickup.

Call button.

Chat button.

Live tracking map.

Status:

"Your driver is on the way!"

Screen 8 — Live Delivery Tracking

Design a premium full-screen map interface.

Show:

Driver's live location.

Pickup marker.

Destination marker.

Route polyline.

Estimated arrival.

Updated delivery status.

Vehicle icon moving along the route.

Bottom floating delivery card:

Driver photo and name.

Tracking ID.

Package details.

Delivery address.

Estimated arrival.

Buttons:

Contact Driver.

Share Tracking.

Get Help.

Delivery timeline:

Order Confirmed.

Driver Assigned.

Driver Arriving.

Package Picked Up.

In Transit.

Near Destination.

Delivered.

Use animated progress indicators and clear status descriptions.

Screen 9 — Delivery Completion

When a delivery is confirmed, show a friendly celebration.

Illustration:
A happy package reaching its destination.

Heading:
"Delivered! 🎉"

Supporting text:
"Your package made it safely."

Show:

Delivery receipt.

Delivery time.

Proof of delivery.

Final amount.

Driver details.

Allow:

Rate driver.

Leave feedback.

Add tip where supported.

Download receipt.

Book another delivery.

Screen 10 — Order History

Tabs:

Active.

Scheduled.

Completed.

Cancelled.

Provide:

Search.

Date filters.

Status filters.

Detailed order cards.

Rebook action.

Receipt download.

Support access.

Screen 11 — Wallet and Payments

Show:

Available wallet balance.

Transaction history.

Payment methods.

Refund history.

Promotional credits.

Reward points.

Support configurable payment integrations including:

Mobile money.

Debit and credit cards.

Wallet balance.

Cash, where enabled.

Design payments with regional flexibility.

Never store raw card details in the application database.

Screen 12 — Profile and Settings

Include:

Profile photo.

Personal details.

Saved addresses.

Payment methods.

Notifications.

Security settings.

Delivery preferences.

Rewards.

Help center.

Privacy policy.

Logout.

Account deletion.

4. DRIVER APPLICATION

The driver experience must be designed specifically for couriers, not reused from the customer interface.

Drivers need fast information, large action buttons, minimal distractions, and excellent usability while stationary.

Use a slightly darker, more operational interface with bright green highlights.

Screen 1 — Driver Registration

Collect:

Full name.

Phone number.

Email.

Profile picture.

Identity verification documents.

Driver's license when required.

Vehicle type.

Vehicle registration where applicable.

Vehicle photos.

Insurance details where required.

Bank or mobile-money payout details.

Emergency contact.

Verification requirements must depend on vehicle type and jurisdiction.

Account states:

Pending Verification.
Approved.
Rejected.
Suspended.

Drivers cannot accept orders until approved.

Screen 2 — Driver Home Dashboard

Top greeting:

"Ready to roll, Alex? 🚀"

Show:

Online / Offline toggle.

Today's earnings.

Completed deliveries.

Acceptance rate.

Driver rating.

Active delivery.

Weekly earnings progress.

Create a large, visually appealing earnings card.

Example:

"Today's Earnings"
"K 450.00"

Use configurable currency and illustrative placeholder data.

Show a motivational progress card:

"2 more deliveries to reach today's goal!"

Do not make performance rewards dependent on unsafe driving or speeding.

Primary CTA:

"Go Online"

When online, display:

"You're online. Let's find your next delivery!"

Bottom navigation:

Home | Requests | Earnings | Activity | Profile

Screen 3 — Incoming Delivery Requests

Display incoming jobs as prominent cards.

Each request includes:

Pickup area.

Destination area.

Pickup distance.

Estimated trip distance.

Estimated duration.

Package category.

Package size.

Offered driver earnings.

Vehicle requirements.

Special handling instructions.

Actions:

Accept.
Decline.

Show a countdown only when a real request-expiry deadline exists.

Never penalize drivers for declining unsafe or unsuitable jobs.

Screen 4 — Active Delivery

Create a professional delivery operations screen.

Show:

Interactive map.

Pickup location.

Destination.

Navigation button.

Recipient details.

Package information.

Delivery instructions.

Support button.

Status actions:

"Navigate to Pickup"
"Arrived at Pickup"
"Confirm Pickup"
"Start Delivery"
"Arrived at Destination"
"Complete Delivery"

Require valid state transitions.

Screen 5 — Pickup Confirmation

Before pickup, allow the driver to:

Review package information.

Confirm item count.

Capture package photos.

Report damage.

Verify pickup OTP or QR code.

Confirm collection.

Screen 6 — Delivery Confirmation

At destination, allow:

Recipient OTP.

Recipient signature.

Delivery photo.

Completion notes.

Use configurable proof-of-delivery requirements.

Only mark a delivery complete after the required verification succeeds.

Handle unsuccessful delivery attempts, unreachable recipients, and return-to-sender flows.

Screen 7 — Driver Earnings

Show:

Today.

This Week.

This Month.

Lifetime earnings.

Pending payouts.

Completed payouts.

Bonuses.

Platform fees.

Earnings breakdown.

Use attractive, readable charts.

Provide payout requests where supported.

Screen 8 — Driver Activity

Show:

Completed deliveries.

Cancelled deliveries.

Delivery dates.

Pickup and destination.

Trip earnings.

Distance.

Delivery receipts.

Performance insights.

Screen 9 — Driver Profile

Show:

Profile picture.

Verified status.

Rating.

Total completed deliveries.

Vehicle details.

Documents.

Availability settings.

Payout methods.

Notifications.

Safety center.

Support.

Logout.

5. BUSINESS AND SHOP FEATURES

Customers must be able to switch between Personal and Business profiles.

Business accounts should support:

Business name.

Business logo.

Shop address.

Multiple authorized staff members.

Multiple pickup locations.

Frequent customers.

Bulk delivery creation.

Scheduled pickups.

Batch order imports.

Delivery analytics.

Monthly spending.

Downloadable invoices.

Customer tracking links.

Order status notifications.

Create a dedicated business dashboard with:

Today's Deliveries.

Pending Pickups.

Active Shipments.

Completed Orders.

Monthly Delivery Spend.

Quick Bulk Booking.

The interface should remain friendly and visually consistent with the customer app.

6. ADMIN DASHBOARD

Build a separate responsive web-based administration dashboard.

Use a premium SaaS-style interface.

Include:

Overview

Total orders.

Active deliveries.

Completed deliveries.

Cancelled orders.

Revenue.

Platform commissions.

Active drivers.

Registered customers.

Average delivery time.

Live Operations

Real-time driver map.

Active delivery routes.

Unassigned orders.

Delayed deliveries.

Delivery exceptions.

Manual reassignment tools.

Driver Management

Review verification documents.

Approve drivers.

Suspend drivers.

Manage vehicle eligibility.

Review ratings.

View driver earnings.

Customer Management

Customer accounts.

Business accounts.

Order histories.

Support issues.

Refund requests.

Pricing Management

Configure pricing by:

Vehicle type.

Base fare.

Distance.

Estimated time.

Package size.

Weight.

Service zone.

Additional stops.

Special handling.

Demand conditions.

Show a complete price breakdown before customers confirm an order.

Financial Management

Payment records.

Driver payouts.

Platform commissions.

Refunds.

Promotions.

Reconciliation reports.

Analytics

Use charts and visual dashboards to show:

Daily delivery volume.

Revenue trends.

Popular vehicle types.

Driver utilization.

Peak booking hours.

Delivery success rate.

Average fulfillment time.

Support and Disputes

Allow administrators to investigate:

Missing packages.

Damaged packages.

Payment issues.

Driver complaints.

Customer complaints.

Failed deliveries.

Maintain an auditable record of operational changes.

7. SMART VEHICLE MATCHING

Implement a delivery recommendation and driver matching system.

Consider:

Pickup location.

Drop-off location.

Distance.

Vehicle availability.

Package weight.

Package dimensions.

Package category.

Vehicle capacity.

Driver eligibility.

Service zones.

Estimated pickup time.

Estimated delivery cost.

Example rules:

Bicycle:
Short-distance lightweight deliveries.

Motorbike:
Small to medium deliveries with fast urban pickup.

Car:
Medium or larger deliveries requiring more space.

Cargo:
Heavy, oversized, or bulk deliveries.

All capacity and distance thresholds must be configurable by administrators.

The system must not assign a package to a vehicle that cannot safely or legally carry it.

Match eligible online drivers using real availability and location information.

Prevent duplicate assignments through transactional order acceptance.

8. MAPS AND LOCATION

Integrate a mapping and routing provider such as Google Maps or Mapbox.

Support:

Address autocomplete.

GPS location.

Map pin selection.

Geocoding.

Route calculation.

Distance estimation.

ETA estimation.

Driver location updates.

Real-time route display.

Geofenced service areas.

Location sharing must be permission-based.

Use efficient location updates to protect battery life.

Only track driver location when operationally necessary and authorized.

Provide a clear fallback when location permission is unavailable.

9. NOTIFICATIONS

Support push notifications and in-app notifications.

Examples:

"Your driver has been assigned! 🚴"

"Your package has been picked up!"

"Good news! Your delivery is almost there."

"Delivered successfully! 🎉"

"You've earned 20 Zippy Points!"

"New delivery request nearby."

"Your payout has been processed."

Notification preferences should be configurable.

10. GAMIFICATION AND REWARDS

Use Duolingo-inspired motivation without copying Duolingo's branding.

Customer Rewards

Create a Zippy Points system.

Customers can earn points for eligible completed deliveries and approved referrals.

Show:

Points balance.

Reward progress.

Achievement badges.

Available discounts.

Reward history.

Example achievements:

First Delivery.
Delivery Explorer.
Frequent Sender.
Business Champion.

Driver Recognition

Create positive driver achievements:

First 10 Deliveries.
Excellent Service.
Customer Favorite.
Reliable Courier.

Reward safety, service quality, and successful deliveries.

Avoid encouraging speeding, overworking, or unsafe behavior.

Celebrations

Use:

Subtle confetti.

Animated progress bars.

Friendly success illustrations.

Encouraging messages.

Achievement popups.

Gamification must never interfere with essential delivery information.

11. CHAT AND SUPPORT

Implement in-app customer-driver messaging.

Features:

Real-time text messages.

Delivery-related quick replies.

Masked calling where supported.

Customer support chat.

Report an issue.

Emergency assistance.

Protect personal contact information wherever possible.

Chat access should be restricted to authorized delivery participants.

12. TECHNICAL ARCHITECTURE

Build this as a functional, scalable application rather than a collection of static mockups.

Preferred stack, where supported:

Mobile:
React Native with Expo and TypeScript.

Admin Web:
Next.js with TypeScript.

Styling:
NativeWind or an equivalent component styling system.

Backend:
Supabase with PostgreSQL, authentication, storage, and realtime capabilities, or an equivalent production-ready backend.

Maps:
Google Maps or Mapbox.

Payments:
A provider supporting the intended launch market, with mobile-money support where available.

Push Notifications:
Expo Notifications or Firebase Cloud Messaging.

State Management:
TanStack Query and Zustand, or equivalent.

Forms:
React Hook Form with Zod validation.

Implement:

Secure authentication.

Role-based access control.

Database row-level security where supported.

Real-time delivery updates.

Secure file uploads.

Server-side payment verification.

Webhook signature verification.

Audit logging.

Input validation.

Error handling.

Retry-safe operations.

Idempotent payment and booking endpoints.

Environment-based configuration.

Accessible components.

Responsive layouts.

Never expose secret API keys in the client application.

Do not use fabricated live tracking or fake successful payments in production flows.

13. DATABASE DESIGN

Design normalized database tables for:

users
profiles
businesses
business_members
drivers
driver_documents
vehicles
vehicle_types
vehicle_capabilities
driver_availability
driver_locations
addresses
delivery_orders
delivery_stops
packages
delivery_assignments
delivery_status_events
delivery_quotes
pricing_rules
payments
wallets
wallet_transactions
driver_earnings
payouts
delivery_proofs
ratings
reviews
notifications
chat_conversations
chat_messages
support_tickets
rewards
reward_transactions
promotions
admin_audit_logs

Use appropriate foreign keys, indexes, timestamps, status constraints, and access policies.

Use an explicit delivery lifecycle with valid state transitions.

Store monetary amounts in integer minor units with currency codes.

Preserve historical quotes and payment records even when pricing rules change.

14. CRITICAL USER FLOWS

Implement these end-to-end flows:

FLOW A: Customer Books a Delivery

Customer logs in → chooses Send Package → selects pickup → selects destination → enters package information → chooses vehicle → reviews price → confirms booking → receives driver assignment → tracks delivery → receives completion confirmation → rates driver.

FLOW B: Driver Completes a Delivery

Driver logs in → goes online → receives eligible request → accepts → navigates to pickup → verifies package → confirms pickup → navigates to destination → verifies recipient → submits proof of delivery → receives earnings update.

FLOW C: Business Sends Multiple Orders

Business logs in → opens business dashboard → creates multiple deliveries → reviews individual quotes → confirms bookings → monitors all deliveries → downloads receipts.

FLOW D: Admin Manages Operations

Admin logs in → reviews live deliveries → checks pending drivers → approves verification → monitors assignments → investigates exceptions → reviews payments and payouts.

15. IMPORTANT EDGE CASES

Handle:

No available drivers.

Driver cancellation.

Customer cancellation.

Payment failure.

Duplicate booking attempts.

GPS unavailable.

Poor internet connection.

Driver going offline during a delivery.

Package too large for selected vehicle.

Recipient unreachable.

Incorrect address.

Delivery rescheduling.

Failed pickup.

Damaged package.

Delivery dispute.

Refund request.

Scheduled order with no available driver.

Unauthorized access attempts.

Provide clear, friendly messages and actionable recovery options.

16. DESIGN QUALITY REQUIREMENTS

The app should look like a professionally designed startup product, not a generic template.

Use:

Consistent component spacing.

Premium typography.

Beautiful icons.

Original illustrated vehicles.

Polished dashboard cards.

Modern navigation.

Clear information hierarchy.

Thoughtful empty states.

Strong accessibility.

Smooth loading experiences.

High-quality maps.

Elegant bottom sheets.

Delightful but restrained motion.

Design for mobile screens first.

Ensure buttons and touch targets are comfortable.

Use realistic sample content in development previews.

The design should be visually distinctive and memorable.

17. IMPLEMENTATION ORDER

Build in phases.

PHASE 1 — FOUNDATION

Create:

Design system.

Reusable components.

Authentication.

Role-based navigation.

Database schema.

Customer and driver profile management.

PHASE 2 — CORE DELIVERY EXPERIENCE

Create:

Customer home.

Delivery booking flow.

Vehicle selection.

Price estimation.

Driver dashboard.

Driver availability.

Driver matching.

Delivery status workflow.

PHASE 3 — REAL-TIME OPERATIONS

Create:

Maps.

Driver tracking.

Push notifications.

In-app messaging.

Pickup verification.

Proof of delivery.

PHASE 4 — PAYMENTS AND BUSINESS

Create:

Payment integrations.

Driver earnings.

Payouts.

Business profiles.

Business delivery management.

Receipts.

PHASE 5 — ADMIN AND POLISH

Create:

Admin dashboard.

Operations management.

Analytics.

Support.

Rewards.

Animations.

Accessibility improvements.

Performance optimization.

For each phase, implement working navigation, validation, database integration, loading states, error states, and realistic tests.

Do not mark a feature as complete if it is only a visual placeholder.

18. EXPECTED OUTPUT

First, create a coherent design system and screen architecture.

Then generate high-fidelity screens for:

Splash Screen.

Onboarding.

Role Selection.

Customer Home.

Create Delivery.

Package Details.

Vehicle Selection.

Order Review.

Finding Driver.

Driver Assigned.

Live Tracking.

Delivery Completed.

Customer Order History.

Customer Wallet.

Customer Profile.

Driver Registration.

Driver Home.

Incoming Delivery Request.

Driver Navigation.

Pickup Verification.

Delivery Confirmation.

Driver Earnings.

Driver Activity.

Driver Profile.

Business Dashboard.

Admin Dashboard.

Make every screen visually consistent.

Use the supplied screenshots as visual references for logistics-related layouts, map tracking, package cards, and delivery dashboards.

Add Duolingo-inspired visual delight through original artwork, bold friendly colors, animations, progress feedback, and encouraging microcopy.

The final result must be an original, premium, scalable, user-friendly delivery platform that people enjoy using and businesses can confidently depend on.

Most important: make Zippy feel as enjoyable as Duolingo, as intuitive as Uber, and as trustworthy as a professional logistics platform.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/44308b6d-1e80-4ab6-802b-35d5e859997b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
