import { siteUrl } from "../components/layout";

export async function getServerSideProps({ res }) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const content = `User-agent: *
Allow: /

# Block API cron endpoints
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
  res.write(content);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}
