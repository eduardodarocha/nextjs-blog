# Dark AI-Themed Redesign — Design Spec

Date: 2026-08-08

## Goal

Redesign the site's visual style to be modern and attractive to developers and AI enthusiasts, while adding a hero section and a tech-stack section. Keep the existing Next.js Pages Router + CSS Modules architecture — no new frameworks, libraries, or router migration.

## Current State

- Next.js Pages Router site (`pages/index.js`, `pages/posts/[id].js`), shared `Layout` component (`components/layout.js`).
- Styling via CSS Modules (`styles/Home.module.css`, `styles/utils.module.css`, `components/layout.module.css`) plus `styles/global.css` for resets/base styles.
- Content: a personal blog for Eduardo Rocha. Homepage shows a centered profile photo, name, a short bio paragraph with a LinkedIn link, leftover Next.js-tutorial boilerplate text, and a plain `<ul>` list of blog posts (title + date). Post pages render markdown content in a simple centered column.
- `styles/global copy.css` is an unused duplicate file.
- Header is a centered profile-photo-and-name block, repeated (smaller) on post pages with a "← Back to home" link below the content.

## Visual Direction

Dark, AI/neural-inspired theme:

- **Background**: near-black (`#0a0a0f`) base, with a subtle radial gradient glow (blue/purple) behind the hero area only.
- **Accent gradient**: blue → purple → teal (`#3b82f6` → `#8b5cf6` → `#22d3ee`), applied to headings, link hovers, buttons, and card borders/glows.
- **Text**: off-white primary (`#f5f5f7`), muted gray secondary (`#a1a1aa`).
- **Typography**: keep existing system sans-serif stack for body text; add a monospace stack (`ui-monospace, "SF Mono", Menlo, monospace`) for code-flavored accents — site name/logo, tech-stack chips, date/meta labels.
- **Cards**: glassmorphism-lite — translucent dark background, 1px gradient-tinted border, soft glow on hover, subtle rounded corners.
- All colors/fonts/spacing exposed as CSS custom properties in `global.css` (`:root`) so the palette lives in one place.

## Components & Pages

### `styles/global.css`
- Define CSS variables (colors, fonts, radii) on `:root`.
- Dark body background with the radial gradient.
- Base link/heading styles updated to use the new palette.
- Delete `styles/global copy.css` (unused duplicate).

### `components/layout.js` + `layout.module.css`
- Replace the current centered profile-photo header with a slim sticky top nav: site name/logo on the left (monospace, gradient text), nav links on the right (Home, Blog anchor, LinkedIn) — no mobile hamburger menu needed at this scale.
- Footer: small muted text line, dark-theme styled, no structural redesign.
- Post pages: "← Back to home" rendered as a small pill/button instead of a plain link.
- The profile photo moves out of the header and into the homepage hero (see below); `home` prop behavior in `Layout` adjusts accordingly — non-home pages just get the slim nav, no large photo.

### `pages/index.js` + `styles/Home.module.css`
- **Hero section**: profile photo (with a subtle gradient glow ring), headline "AI-Focused Software Developer" using the gradient-text treatment, a short bio paragraph, and the LinkedIn link restyled as a pill/button. Remove the leftover Next.js-tutorial boilerplate comment block at the bottom of the file (dead code).
- **Tech stack section**: heading ("Tech Stack" or similar) followed by a responsive row/grid of chip cards (monospace label, subtle border, hover glow). Default chips: JavaScript, React, Next.js, Node.js, CSS, Python, LLM APIs, Prompt Engineering. Data lives as a simple array in `index.js` so it's easy to edit later.
- **Blog section**: heading "Writing", posts rendered as cards (title, date, hover glow/border) instead of a plain `<ul>`, in a responsive grid/stack via `utils.module.css`/`Home.module.css` classes.

### `pages/posts/[id].js` + associated styles
- Inherits dark theme automatically via global styles + `Layout`.
- Article body: constrained reading width (~680px), heading/link colors from the accent palette, code blocks (if markdown contains any) styled as monospace dark cards with a visible border.

### `styles/utils.module.css`
- Update shared heading/list/text utility classes to match new typography and color tokens; add any new shared classes needed for chips/cards if not page-specific.

## Data Flow

No changes to data flow — `getStaticProps` in `pages/index.js` continues to read posts via `lib/posts.js`; `pages/posts/[id].js` continues to read individual post markdown the same way. This is a styling/structural-JSX change only, not a data change.

## Testing / Verification

No automated tests exist in this repo. Verification is manual:
- Run `npm run dev` and visually check the homepage (hero, tech stack, blog list) and at least one post page.
- Check responsive behavior at mobile width (stacked layout, chips wrap, nav doesn't overflow).
- Confirm no console errors and that `next/image` still renders the profile photo correctly in its new hero placement.

## Out of Scope

- No new pages, routes, or dependencies.
- No migration to App Router.
- No CMS/content changes beyond removing dead boilerplate comments.
- No real analytics/skills data sourcing — tech-stack chips are a static, user-editable list.
