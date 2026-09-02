import Head from "next/head";
import Link from "next/link";
import styles from "./layout.module.css";
import {
  name,
  siteTitle,
  siteDescription,
  siteUrl,
  defaultOgImage,
  buildPageTitle,
} from "../lib/siteMeta";

export { siteTitle, siteDescription, siteUrl, defaultOgImage, buildPageTitle };

export default function Layout({
  children,
  home,
  title,
  seoTitle,
  description,
  canonical,
  ogImage,
  ogType = "website",
  noIndex = false,
}) {
  const pageTitle = buildPageTitle({ home, seoTitle, title });
  const pageDescription = description || siteDescription;
  const pageOgImage = ogImage || defaultOgImage;

  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#09090B" />
        <link rel="alternate" type="application/rss+xml" title={siteTitle} href={`${siteUrl}/rss.xml`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content={name} />
        <meta name="description" content={pageDescription} />
        {canonical && <link rel="canonical" href={canonical} />}
        {noIndex && <meta name="robots" content="noindex, nofollow" />}

        {/* Open Graph */}
        <meta property="og:title" content={title || siteTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content={ogType} />
        {canonical && <meta property="og:url" content={canonical} />}
        <meta property="og:image" content={pageOgImage} />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:locale" content="pt_BR" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title || siteTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageOgImage} />
        <meta name="twitter:creator" content="@eduardorocha" />

        <title>{pageTitle}</title>
      </Head>

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.statusDot} title="System Active" />
            <span>{name}</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/#writing" className={styles.navLink}>
              Blog
            </Link>
            <a
              href="https://www.linkedin.com/in/eduardo-rocha-dev/"
              className={styles.navLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </nav>

      <main className={styles.main}>{children}</main>

      {!home && (
        <div className={styles.backToHome}>
          <Link href="/" className={styles.pillLink}>
            ← Back to home
          </Link>
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} {name}</span>
          <span>Next.js & AI Blog</span>
        </div>
      </footer>
    </div>
  );
}
