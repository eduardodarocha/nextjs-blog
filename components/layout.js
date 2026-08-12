import Head from "next/head";
import Link from "next/link";
import styles from "./layout.module.css";

const name = "Eduardo Rocha";
export const siteTitle = "Eduardo Rocha — AI-Focused Software Developer";

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Eduardo Rocha — AI-focused software developer. Writing about web development, AI, and software engineering."
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=dark&md=1&fontSize=75px`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <title>{siteTitle}</title>
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
