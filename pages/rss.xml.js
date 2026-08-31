import { getSortedPostsData } from "../lib/posts";
import { siteUrl, siteTitle, siteDescription } from "../components/layout";

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRss(posts) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const now = new Date().toUTCString();
  const items = posts
    .map((post) => {
      const url = `${baseUrl}/posts/${post.id}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : now;
      const description = escapeXml(post.description || post.excerpt || "");
      const title = escapeXml(post.title || post.id);
      const category = escapeXml(post.category || "ai_engineering");
      const coverImage = post.coverImage ? `${baseUrl}${post.coverImage}` : `${baseUrl}/og-default.png`;
      return `  <item>
    <title>${title}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${post.description || post.excerpt || ""}]]></description>
    <category>${category}</category>
    <enclosure url="${coverImage}" type="image/png" />
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(siteTitle)}</title>
  <description>${escapeXml(siteDescription)}</description>
  <link>${baseUrl}/</link>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
  <language>pt-BR</language>
  <lastBuildDate>${now}</lastBuildDate>
  <generator>Next.js - Eduardo Rocha Blog</generator>
${items}
</channel>
</rss>`;
}

export async function getServerSideProps({ res }) {
  const posts = getSortedPostsData();

  const rss = generateRss(posts);

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");
  res.write(rss);
  res.end();

  return { props: {} };
}

export default function Rss() {
  return null;
}
