# Agent Instructions

## CORE BEHAVIOR - STRICTLY FOLLOW THESE

- Keep responses concise and to the point - unless the user asks otherwise.
- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently.
- When using sub-agents to implement features, act as a coordinator only.
- Do not commit or deploy anything.

## Design System Enforcement (Mercedes-AMG Dark Motion)

Source of truth: `DESIGN.md`. The palette is motorsport red on true black — **not** Petronas teal.

### Forbidden Tailwind utilities

These classes violate the shape language (`rounded.none` is 0; the only exception is `rounded-full` on chip-sized elements like `MessageAvatar`):

- `rounded-lg`, `rounded-md`, `rounded-sm`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- `rounded-\[2px\]` — also forbidden; use `rounded-none` (the spec is `rounded.none`, not 2px)
- `rounded-full` — forbidden **except** in `packages/ui/src/components/message.tsx` for `MessageAvatar`

These classes violate the high-contrast palette (no soft blues, no generic grays as foreground, no off-brand reds):

- `bg-blue-*`, `text-blue-*`, `border-blue-*`, `ring-blue-*`
- `bg-slate-*`, `bg-gray-*`, `bg-zinc-*`, `bg-neutral-*` (use `bg-background` / `bg-surface-weak` / `bg-muted` instead)
- `text-slate-*`, `text-gray-*`, `text-zinc-*`, `text-neutral-*` (use `text-foreground` / `text-muted-foreground`)
- `bg-green-*`, `text-green-*` (success states use the AMG red ramp, not traffic-light greens)
- `bg-red-*`, `text-red-*` with values other than the `--primary` token (e.g. `bg-red-500`)
- Raw hex colors in className (`#fff`, `#000`, etc.) — go through tokens
- `oklch(...)` literals in className outside `globals.css` — tokenize instead

### Enforcement

Biome does not have a native "disallow specific Tailwind classes" rule. The check is implemented as a Node script at `scripts/lint-design.mjs` (run via `pnpm lint:design`):

```bash
pnpm lint:design                 # scan packages/*/src and apps/*/src
pnpm --filter @amgclub/ui lint:design   # scan a single package
node scripts/lint-design.mjs <path> [<path> ...]   # scan explicit paths/files
```

The script scans every `.ts`/`.tsx` file under `packages/<name>/src` and `apps/<name>/src` and fails on:

- `\brounded-(lg|md|sm|xl|2xl|3xl)\b`
- `\brounded-\[2px\]`
- `\b(?:bg|text|border|ring)-(blue|slate|gray|zinc|green|red|amber|orange|yellow|pink|purple|indigo|cyan|teal|sky|emerald|lime|rose|fuchsia|violet)-(50|100|200|300|400|500|600|700|800|900|950)\b`
- Raw hex colors in className strings (`#fff`, `#000`, etc.) — the script excludes any file named `color.mjs`

The `MessageAvatar` `rounded-full` exception at `packages/ui/src/components/message.tsx:37` is whitelisted with an inline `// design-allow: chip` comment so the linter skips it. Any line containing the regex `/\bdesign-allow:\s*\S/` is treated as a per-line opt-out.

If a new component genuinely needs one of the forbidden utilities (e.g. a brand logo that must be teal), add a `// design-allow: <reason>` comment on that line and document the exception in `DESIGN.md`.

### Pre-commit hook

`.husky/pre-commit` invokes `lint-staged`, which is configured in the root `package.json`:

- `biome check --write --no-errors-on-unmatched` runs on staged JS/TS/JSON files.
- `node scripts/lint-design.mjs` runs on staged `.ts`/`.tsx` files inside `packages/ui/src/**` and `apps/**/src/**`.

After a fresh clone, run `pnpm install` to wire the husky hook (the `prepare` script does this). Until then, design violations can still land via direct `git commit --no-verify` or pushes that bypass local hooks — CI should re-run `pnpm lint:design` as a final guard.

### Adding a new component

1. Inherit radius from tokens — do not pass a `rounded-*` class unless the element is a chip.
2. Use semantic tokens (`bg-primary`, `text-foreground`, `bg-surface-weak`, `border-tertiary`) — never raw colors.
3. If you need a new color, add a token in `globals.css` and a `color-*` mapping in `@theme inline`, then reference it via the utility class.

### Typography

All type roles resolve to **Satoshi** (Fontshare), loaded via `next/font/local` (self-hosted variable woff2) in `apps/web/src/app/layout.tsx` and bound to the `--font-sans` variable. The four DESIGN.md family names (`titleExtraBold`, `titleBold`, `textRegular`, `MBCorpoSText_Regular_Web`) are collapsed onto Satoshi; only the numeric weight and size differ per role.

**Use the role-named utility for the size bundle, then compose the weight separately.** Each role in `globals.css` is declared as its own Tailwind variable per slot (`--text-<role>`, `--text-<role>--line-height`, `--text-<role>--letter-spacing`) inside the `@theme` block, so a single `text-<role>` class applies the whole bundle:

```tsx
// Display headline (DESIGN.md: 34px @ md / 28px mobile, leading 1.06, weight 800)
<h1 className="text-headline-display font-extrabold font-sans">…</h1>

// Body copy (DESIGN.md: 16px, leading 1.5, weight 400)
<p className="text-body-md font-sans">…</p>

// Label / button (DESIGN.md: 16px, leading 1.5, weight 500)
<button className="text-label-lg font-medium font-sans">…</button>
```

**Available roles and their documented weights:**

| Role | Use | Weight | Mobile / md size |
| --- | --- | --- | --- |
| `text-headline-display` | Marketing hero | `font-extrabold` (800) | 28 / 34 |
| `text-headline-lg` | Section hero | `font-extrabold` (800) | 23 / 28 |
| `text-headline-md` | Subsection | `font-bold` (700) | 19 / 23 |
| `text-headline-sm` | Card header | `font-normal` (400) | 17 / 19 |
| `text-body-lg` | Long-form reading | `font-normal` (400) | 16 |
| `text-body-md` | Default body | `font-normal` (400) | 14 / 16 |
| `text-body-sm` | Compact body | `font-normal` (400) | 14 |
| `text-caption` | Tiny meta | `font-normal` (400) | 12 |
| `text-label-lg` | Button text, nav | `font-medium` (500) | 14 / 16 |
| `text-label-md` | Form labels | `font-medium` (500) | 14 |
| `text-label-sm` | Chips, tags | `font-medium` (500) | 12 |

**Responsive step:** every role has a mobile default in `:root` and a larger value at the `md` (768px) breakpoint, declared via `@media (min-width: 768px) { :root { --text-<role>: … } }`. The roles live in a plain `@theme` block, so the utility references the variable at runtime and Tailwind v4 reads the in-cascade value, which auto-scales the single class with no `md:text-[34px]` workaround.

**Add a new role:** add `--text-<name>: <size>`, `--text-<name>--line-height: <value>` and `--text-<name>--letter-spacing: <value>` inside the `@theme` block in `packages/ui/src/styles/globals.css` (mobile default) and redeclare the same three variables in the `@media (min-width: 768px) { :root { … } }` block if the spec calls for a desktop step. The `text-<name>` utility becomes available immediately.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
- Copy & text: `antislop-copywriting`
- People: `antislop-human`
- Mobile / responsive: `antislop-layoutmobile`
- Code comments: `antislop-code`
- UI / visual: `antislop-ui`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
