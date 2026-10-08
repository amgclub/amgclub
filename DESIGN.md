---
version: alpha
name: Mercedes-AMG Dark Motion
description: A high-contrast, automotive-first dark system with bold editorial headlines and sharp red accents.
colors:
  primary: "#B21E23"
  secondary: "#FFFFFF"
  tertiary: "#374151"
  neutral: "#000000"
  surface: "#000000"
  on-surface: "#FFFFFF"
  error: "#B21E23"
  primary-60: "#C74A4E"
  primary-70: "#D66B6E"
  surface-weak: "#111111"
  surface-strong: "#000000"
typography:
  headline-display:
    fontFamily: "Satoshi"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: "36px"
    letterSpacing: "0.15008px"
  headline-lg:
    fontFamily: "Satoshi"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "36px"
    letterSpacing: "0.15008px"
  headline-md:
    fontFamily: "Satoshi"
    fontSize: "23px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0.15008px"
  headline-sm:
    fontFamily: "Satoshi"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: "23px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Satoshi"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0.15008px"
  body-md:
    fontFamily: "Satoshi"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0.15008px"
  body-sm:
    fontFamily: "Satoshi"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0.15008px"
  label-lg:
    fontFamily: "Satoshi"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "Satoshi"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Satoshi"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0px"
  caption:
    fontFamily: "Satoshi"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 56px
  gutter: 24px
  section: 56px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.none}"
    padding: "16px"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.none}"
    padding: "16px"
    height: "48px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface-weak}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.surface-weak}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px"
  navbar:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    height: "88px"
---

## Overview

Mercedes-AMG’s visual language is aggressive, premium, and cinematic, with a near-black stage that lets photography and a single red accent do most of the work. The tone is high-performance and aspirational rather than playful, aimed at enthusiasts and shoppers who expect precision, speed, and brand authority. The layout feels spacious in the hero, but the dense top navigation and cookie consent area keep the interface grounded in utility.

## Colors

- **Primary (#B21E23):** A saturated motorsport red used for key calls to action, active emphasis, and small brand details. It should feel urgent and premium, never decorative.
- **Secondary (#FFFFFF):** Crisp white used for text, icons, and button outlines against the dark field. It carries most of the legibility burden in the system.
- **Tertiary (#374151):** A muted graphite border tone for cards and subtle structural separation. It is intentionally quiet and should not compete with content.
- **Neutral (#000000):** The dominant black base that creates the brand’s cinematic darkness and maximizes contrast with content overlays.
- **Surface (#000000):** Primary surface color for panels, nav, and cards. In practice, the system leans heavily on black-on-black layering with only minimal separation.
- **On-surface (#FFFFFF):** The default foreground color on dark surfaces, used for headings, body copy, and controls.
- **Error (#B21E23):** Error and danger messaging should reuse the same red family so destructive states remain on-brand.
- **Primary-60 (#C74A4E) and Primary-70 (#D66B6E):** Lighter red steps for hover, pressed, or softened emphasis states when the red needs to breathe without losing its identity.
- **Surface-weak (#111111):** A slightly lifted dark tone for nested panels, input fields, or low-contrast containers.
- **Surface-strong (#000000):** The deepest black reserved for the most immersive areas, especially full-bleed hero backgrounds.
- **Stripe-mark colours (#FFFFFF, #E92626, #0A733B):** The five-bar stripe artwork drawn in `apps/web/src/components/logo-stripes.tsx` uses the mark's own sampled colours, exempted per line with `// design-allow: logo stripe colour` so the design lint skips them. They live only inside that SVG as `<fill>` values and never become UI tokens, `className` colours, or text.

## Typography

The typographic system is a single family, **Satoshi**, resolved in every role. The role names the design file originally carried (`titleExtraBold`, `titleBold`, `textRegular`, `MBCorpoSText_Regular_Web`) now map onto Satoshi at different weights and sizes: `font-extrabold` (800) for display and large headlines, `font-bold` (700) for mid-level editorial emphasis, `font-normal` (400) for body copy, and `font-medium` (500) for labels and buttons. No second family ships, and display type is never condensed with a `scaleX` transform or a text stroke: size and weight carry the emphasis.

Headlines are strong through weight and tight line heights rather than through a bespoke face. The largest headings, like `headline-display` and `headline-lg`, should feel short, punchy, and all-caps friendly when used in marketing blocks.

Body text is compact and highly readable at 16px with a 24px line height, suited for cookie notices, product descriptions, and support copy. Labels are slightly denser and semibold in function, giving buttons and nav items a clear, engineered feel without adding visual weight.

Letter spacing is subtle and consistent, with a slight positive tracking on display and body styles. Keep uppercase or near-uppercase treatment for navigation and promotional headlines where the screenshot suggests a bold, branded voice.

**Exception — transactional email bodies.** Outbound HTML email (e.g. the contact-form notification built in `packages/api/src/routers/contact.ts`) uses a web-safe font stack (`Helvetica, Arial, sans-serif`), off-ramp font sizes, and raw hex colors: email clients cannot load Satoshi or read CSS custom properties, so inline styles are the only reliable mechanism. These lines carry `// design-allow: email` opt-outs and are exempt from the type ramp and token rules; nothing in the site UI inherits this exception.

## Layout & Spacing

The layout is built around full-bleed imagery with overlay panels rather than a strict boxed grid. Content is left-aligned and anchored with generous negative space, while the top navigation and cookie banner create strong horizontal bands.

Spacing is modular and restrained: 6px for micro gaps, 16px for common in-panel padding, 24px for standard separations, and 32px to 56px for larger vertical breathing room. Use 24px as the default rhythm for grouped content, and reserve 56px for section-level spacing or hero-to-content transitions.

Cards and overlays should remain compact, typically with 16px internal padding and clear separation from the background through contrast rather than shadow. Buttons use fixed height conventions and generous horizontal padding to maintain a stable, premium control size.

The annual's spread grid is one column model shared by the home and events pages: a marginalia rail at 5.1448cqw carrying section numbers and kickers, the body inset at 20.7317cqw, a 3.6242cqw right margin, and full-width 1.5px hairlines dividing every spread. Spreads breathe at 5.6cqw vertical padding on desktop (stepping down at the `max-xl` band). The events first viewport is composed to a fold target at 1440×900: the REGISTER action's bottom edge lands at 857px, the first ruled fixture row's top edge at 893px — so the fold always shows the season continuing below the feature — and the deck-to-rule gap under the page headline sits at 17px.

## Elevation & Depth

The system is intentionally flat. Shadows are effectively absent, so hierarchy comes from tonal contrast, translucent/dark overlays, and the strength of photography. When depth is needed, use borders, darker surfaces, and opacity rather than blur or elevation effects.

Panels can sit above imagery with black or near-black fills to preserve readability. Thin graphite borders help define cards without making the interface feel busy.

## Shapes

The shape language is mostly rectilinear and automotive, with very little curvature. Interactive elements such as buttons and containers should stay at `rounded.none` to preserve the engineered, performance-oriented feel.

When a softer container is needed, use only a modest 8px radius on cards. Avoid pill shapes except for small informational chips, where `rounded.full` can be used sparingly.

## Components

Buttons are the clearest expression of the system. `button-primary` uses solid `primary` red with white text, a 48px height, and square corners; it should feel decisive and action-oriented. `button-secondary` is transparent with a white outline and white text, used for lower-priority actions. `button-link` is text-only, underlined, and should be used for lightweight navigational actions or legal links.

Button states should remain simple and high-contrast. Hover states may lift the red toward `primary-60` or `primary-70`, but avoid gradients, glows, or shadows. Keep padding generous and consistent, with a strong minimum touch target. On large solid actions grouped inside a single link — the events spread's REGISTER — hover is expressed as a fade instead: the block holds `button-primary` geometry (48px minimum height, 16px horizontal padding) and the whole group eases to 85% opacity on hover, so the red never changes hue, only weight.

Cards should be dark, bordered, and restrained, following `card` with `surface` background, `tertiary` border, and `rounded.md` only when a softer read is useful. Most card content should remain text-forward and image-led, with the card acting as a readable frame rather than a decorative object.

Inputs should feel utilitarian and understated. Use dark fills, white text, and square corners so forms match the rest of the brand’s technical tone. Focus states should be expressed with border or contrast changes, not shadow.

Chips and small tags may use `rounded.full` for compact categorization, but keep their color treatment subdued. Navigation items and utility links should use label typography, clear spacing, and minimal ornament. In dense areas like the cookie banner, prioritize hierarchy through typography weight and button emphasis rather than additional visual effects.

### Navigation

The shared site header is one identical band on every route, including the home page. The wordmark links home at left at natural aspect (`md:h-9`, never stretched); the "Season 2026 · Issue 001" running line is centred at `xl` and above (in flow below); uppercase tracked navigation (`label-md`, `primary-60` on hover) runs through the middle; and the right cluster is the JOIN NOW action — label plus the red mark block flush to the hairline, as one tappable target — with the cart and its count badge. There is no theme toggle and no account menu. A 1.5px hairline closes the band across the full width (53.5px tall on desktop, a three-row wrap on mobile). The Dashboard link is deliberately absent from public navigation — account and dashboard surfaces stay off the public site. The header's entrance (hairline draw, issue/navigation/CTA fade) is part of each page's opening timeline in `page-motion.tsx`.

### Signature components

- **Ruled fixture row.** The house pattern for repeated dated entries, shared by the home page's format list and the events page's calendars. A three-column baseline grid — marginalia index in tracked `primary-60` (`01`, `02`…), uppercase extra-bold name, right-aligned tracked detail meta (`date · location · price`) — sitting on a 1.5px bottom hairline with no card, no fill, no radius. Upcoming-event rows are links: the name eases to `primary-60` on hover. Past-drive rows render as plain text with no link, because the detail route only resolves upcoming events. Loading states are hairline-height bars at the same geometry, never rounded blocks.
- **Statement divider.** One oversized display line divides major movements of a spread (on events: upcoming from the archive). Set in the display voice — extra-bold, uppercase, fluid `clamp(44px, 8.6cqw, 150px)`, leading 0.86, tracking −0.03em — starting at the marginalia rail so it reads full-bleed, with the second line in `primary` (the shipped line is "The season / never idles"). It participates in the spread's scroll reveal alongside rows and rules, gated behind `prefers-reduced-motion: no-preference`.
- **Logo stripes.** The club mark's five slanted bars (one white, two red, two green) as a small inline SVG, used as a quiet end-mark beneath a calendar. Decorative only — `aria-hidden`, never load-bearing. Its fills are sampled from `logo.webp` and are exempted per line in `logo-stripes.tsx` (see Colors); they never leak into UI tokens or text colour.

## Do's and Don'ts

- Do use black surfaces and white text as the default contrast pairing.
- Do reserve the red accent for primary actions, active states, and important brand emphasis.
- Do keep buttons square and materially simple, with no shadows or gradients.
- Do let photography dominate the hero while overlays protect readability.
- Do use 16px body copy with comfortable 24px line height for long-form content.
- Do set repeated dated entries as ruled fixture rows — marginalia index, uppercase name, right-aligned meta on a 1.5px rule — not as a grid of cards.
- Do give a spread exactly one red action and let hairlines and typography carry everything else.
- Don't introduce soft pastel colors, glossy effects, or playful shapes.
- Don't rely on heavy elevation, floating cards, or multi-layer shadow stacks.
- Don't over-round interactive controls; the system should feel engineered and precise.
- Don't link archive entries whose detail route can't resolve them; leave them as ledger text.
