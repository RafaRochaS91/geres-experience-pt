# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Tourism website for Aldeia Turística de Louredo (geresexperience.pt). Currently a single monolithic `index.html` (51MB, 87 base64-encoded images). Target state: Astro static site with content collections, i18n (PT/EN), and extracted/optimised assets.

## Toolchain

**Always use Bun** — never npm or yarn. This applies to installing packages, running scripts, and executing one-off Node scripts.

```bash
bun install            # Install dependencies
bun run dev            # Dev server → localhost:4321
bun run build          # Production build → dist/
bun run preview        # Preview dist/ locally
bun run astro          # Astro CLI
bunx astro add ...     # Add Astro integrations
```

## Target Stack

- **Astro** — static site generation (`output: 'static'`)
- **Tailwind CSS** — configured via CSS variables; use semantic tokens, not loose utility classes
- **Netlify** — deployment target (static)
- **No UI framework** — vanilla JS for gallery/lightbox islands

## Architecture (target)

### i18n
- Two locales: `pt` (default, `/`) and `en` (`/en/`)
- Use Astro's built-in i18n routing
- UI strings in `src/i18n/pt.ts` and `src/i18n/en.ts` as typed key→value maps
- Long-form content via locale-specific Markdown variants per collection entry

### Content Collections (`src/content/`)

| Collection | Key fields | Notes |
|---|---|---|
| `houses` | `name`, `type`, `slug`, `features[]`, `images[]` | 6 units (T2/T3) |
| `activities` | `name`, `description`, `image` | 8 activity cards |
| `heritage` | `name`, `description`, `image` | 7 cultural/historical sites |
| `testimonials` | `author`, `rating`, `text`, `date` | Guest reviews |

Each entry has `pt.md` and `en.md` under `src/content/<collection>/<slug>/`.
Schemas defined with Zod in `src/content/config.ts`.

### Asset Pipeline
- Source images in `src/assets/` (extracted from base64 at migration time via `scripts/extract-images.js`)
- Astro's `<Image />` component handles AVIF/WebP conversion and lazy loading
- Google Fonts replaced with local font files in `public/fonts/` (Playfair Display + Lato)

### Theming

Styling is driven by **semantic CSS tokens** defined in `src/styles/tokens.css`. Tailwind is configured to consume these tokens — do not use raw Tailwind colour/spacing utilities (e.g. `bg-green-700`); always reference a semantic token instead.

**Token layers:**

1. **Primitive tokens** — raw values, not used directly in components:
```css
--color-green-900: #1a3810;
--color-green-700: #2d5a1b;
/* … */
```

2. **Semantic tokens** — intent-named, mapped to primitives, defined on `:root`:
```css
:root {
  --color-brand:        var(--color-green-700);
  --color-brand-dark:   var(--color-green-900);
  --color-brand-light:  var(--color-green-500);
  --color-accent:       var(--color-terra);
  --color-surface:      var(--color-sand);
  --color-surface-alt:  var(--color-white-warm);
  --color-text:         var(--color-ink);
  --color-text-muted:   var(--color-ink-soft);
  --color-cta:          var(--color-red-dark);
  --color-highlight:    var(--color-gold);
}
```

3. **Tailwind mapping** in `tailwind.config.ts` — semantic tokens wired as Tailwind theme values:
```ts
colors: {
  brand:       'var(--color-brand)',
  'brand-dark':'var(--color-brand-dark)',
  accent:      'var(--color-accent)',
  surface:     'var(--color-surface)',
  cta:         'var(--color-cta)',
  // …
}
```

Swapping themes means overriding semantic tokens only — primitives and components stay untouched.

### Naming Conventions

All code identifiers must be in English: CSS classes, HTML IDs, component names, file names, variables, and function names. Portuguese is only used in content (Markdown files, translation strings).

Examples: `#accommodation` not `#alojamento`, `.house-card` not `.casa-card`, `Hero.astro` not `Heroi.astro`.

### Component Structure
- `src/layouts/Base.astro` — HTML shell, nav, footer, font loading
- `src/pages/index.astro` and `src/pages/en/index.astro` — home pages (same components, different locale prop)
- `src/components/` — one file per page section: `Hero`, `Sobre`, `Casas`, `Actividades`, `Localizacao`, `Retiros`, `Patrimonio`, `Testemunhos`, `Reservas`
- `src/i18n/utils.ts` — `useTranslations(locale)` helper

### Email Protection
Use `data-email` attribute + inline decode script instead of the Cloudflare CDN email-protection script (currently loaded 5× redundantly in `index.html`).
