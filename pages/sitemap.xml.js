import { getSortedPostsData } from "../lib/posts";
import { siteUrl } from "../components/layout";

// Coerce a frontmatter date (`2026-08-14` or a full ISO string) into an ISO
// timestamp. Returns null for missing/invalid values so we omit <lastmod>
// rather than emit a bogus "now" — Google starts ignoring lastmod site-wide
// once it catches the value drifting on every fetch.
function toIso(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// A post's real last-modified is its `updated` frontmatter field when the
// editor has revised it, otherwise its publish `date`.
function postLastmod(post) {
  return toIso(post.updated) || toIso(post.date);
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSiteMap(posts) {
  const baseUrl = siteUrl.replace(/\/$/, "");

  // The homepage lists every post, so it genuinely changes whenever the most
  // recent post is published or updated — use that timestamp, not request time.
  const stamps = posts.map(postLastmod).filter(Boolean);
  const homeLastmod = stamps.length ? stamps.slice().sort().pop() : null;

  const entries = [
    urlEntry(baseUrl, homeLastmod, "weekly", "1.0"),
    ...posts.map((post) =>
      urlEntry(`${baseUrl}/posts/${post.id}`, postLastmod(post), "monthly", "0.8")
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const posts = getSortedPostsData();

  const sitemap = generateSiteMap(posts);

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function SiteMap() {
  // getServerSideProps will do the heavy lifting
  return null;
}
