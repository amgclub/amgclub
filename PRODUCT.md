# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: UAE Mercedes-AMG owners and enthusiasts — people browsing upcoming club events (meetups, drives, track days), registering (free or paid via Ziina), shopping club merch in AED, and applying to join the club. English-speaking, UAE-based (Dubai, Jebel Jais, Ras Al Khaimah references throughout).

Secondary: club admins/staff running the back office — membership review, events and attendees, shop products/orders/customers, settings and team management.

## Product Purpose

AMG Club UAE is a club community platform: it makes membership, events, and merchandise possible for a UAE-based Mercedes-AMG community, and gives admins the tools to run the club. Success means members can discover events, register and pay, shop merch, and apply to join; and admins can review applications, manage events and orders, and see club performance at a glance.

## Positioning

A single platform purpose-built for a UAE AMG owners' club — local payments (Ziina, AED), local events, membership operations, and merch in one place. Neighboring products (generic event tools, generic shops) do not combine club membership ops, event registration with UAE payments, and merch under one club identity.

## Operating Context

- Public member-facing site (`apps/web`, port 3001) and separate admin console (`apps/admin`, port 3002, noindex, admin-role gated).
- Payments via Ziina (UAE PSP): paid event registration and shop orders; AED throughout; test/live mode toggled in admin settings.
- Workflows: browse events → register (optionally pay) → browse shop → cart → checkout → Ziina redirect → confirmation. Admin: review membership applications, manage events/attendees, manage products/orders/customers, settings and team.
- Deployed on Cloudflare Workers (OpenNext) with Supabase Postgres + Storage, Hyperdrive, Upstash Redis (rate limiting + shop cache).
- Order numbers `AMG-YYYY-NNNN`; free shipping currently hardcoded (policy undecided).

## Capabilities and Constraints

- **Built:** events list/detail with registration (free + Ziina-paid), shop (products, cart in localStorage, checkout, Ziina payment, confirmation), email+password auth (Better-Auth), session-gated member dashboard (currently a stub), full admin console (memberships CRUD with status transitions, events CRUD + attendees, shop products/orders/customers, general + team settings), role model `admin | user`.
- **Planned (open decision, not yet built):** public membership application form on `apps/web` — admin already has a "Membership Requests" review page and a `source: "website" | "manual"` field, but no public apply route exists yet; API currently always writes `source: "manual"`.
- **Undecided / open:**
  - Membership billing is not self-serve (prices admin-configured, defaults 0 AED; no member-facing subscribe/pay flow — Ziina only wired for events and shop).
  - Ziina payment mode defaults to `test`; live readiness undecided.
  - Shipping policy (free shipping hardcoded).
  - Contact channel (cancel copy says "contact us" but no contact exists).
  - No ToS/Privacy/Legal pages despite checkout collecting personal data.
  - Home page `/` is still a scaffold placeholder; web metadata placeholder (`amgclub`).
  - No tests of any kind; no localization beyond `en`.
- Currency/locale fixed: AED, `en-AE` formatting, `en-GB` dates.

## Brand Commitments

- Name: **AMG Club UAE** (repo `amgclub`, domain hint `amgclub.ae`).
- Logo assets exist only in admin: `apps/admin/public/logo.webp`, `apps/admin/public/login-cover.webp`; both favicons; no logo in `apps/web` yet.
- Voice observed in product copy: direct, sentence-case, functional, emoji-free. No formal brand-voice document exists.
- Visual identity lives in `DESIGN.md` (Mercedes-AMG Dark Motion) — record of the visual world, not product truth; not expanded here.

## Evidence on Hand

- Real assets: `apps/admin/public/logo.webp`, `apps/admin/public/login-cover.webp`, favicons in both apps.
- Real domain copy in code: events ("Join us at our next AMG Club gathering"), shop ("AMG Club merchandise and accessories"), admin ("Club performance at a glance"), example event "Morning drive to Jebel Jais".
- **Absent — future work must not fabricate:** no testimonials, reviews, case studies, press, customer logos, benchmarks, statistics, CMS/content, docs, or seed content (only a singleton settings row). No legal pages. README is unmodified scaffold text.

## Product Principles

1. Member-first: the public site exists for UAE AMG enthusiasts to discover, join, and buy; admin serves the club, not the reverse.
2. Local by default: AED, Ziina, UAE geography and events are first-class, not add-ons.
3. One club identity across membership, events, and merch — a single platform, not stitched tools.
4. Record reality: undecided facts (application form, billing, shipping, legal) stay marked open until confirmed — never invented.
5. Admin clarity over admin power: the console's job is fast, scannable review of real club operations.
