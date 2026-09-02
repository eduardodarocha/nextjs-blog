// Site-wide metadata and the <title> builder. Kept free of React / CSS imports
// so it can be unit-tested and reused from API routes (sitemap, rss, robots).
// components/layout.js re-exports these for existing import sites.

export const name = "Eduardo Rocha";
export const siteTitle = "Eduardo Rocha — AI-Focused Software Developer";
export const siteDescription =
  "Eduardo Rocha — AI-focused software developer. Writing about web development, AI, LLMs, and software engineering.";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://eduardo-rocha-blog.vercel.app"
).replace(/\/$/, "");
export const defaultOgImage = `${siteUrl}/og-default.png`;

const BRAND_SUFFIX = ` | ${name}`;
// Longest base title that still leaves room for the brand suffix without
// pushing the <title> past ~60 rendered characters.
const SUFFIX_HEADROOM = 45;

// The <title> tag. Home uses the site title verbatim (appending the suffix
// there produced "… Software Developer | Eduardo Rocha"). Article pages prefer
// `seoTitle` (a <=60-char frontmatter field) over the on-page H1, and only get
// the brand suffix when the base is short enough to keep the whole thing tight.
export function buildPageTitle({ home, seoTitle, title } = {}) {
  if (home) return siteTitle;
  const base = seoTitle || title;
  if (!base) return siteTitle;
  return base.length <= SUFFIX_HEADROOM ? `${base}${BRAND_SUFFIX}` : base;
}
