import { getSortedPostsData } from "../lib/posts";
import { siteUrl } from "../components/layout";

function generateSiteMap(posts) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${posts
  .map(({ id, date }) => {
    const lastmod = date ? new Date(date).toISOString() : new Date().toISOString();
    return `  <url>
    <loc>${baseUrl}/posts/${id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
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
