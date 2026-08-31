import Head from "next/head";
import Link from "next/link";
import Layout from "../components/layout";
import styles from "../styles/post.module.css";

export default function Custom404() {
  return (
    <Layout
      title="404 — LOG_NOT_FOUND"
      description="Page not found — Eduardo Rocha AI Blog"
      noIndex
    >
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <article className={styles.articleContainer}>
        <div className={styles.headerCard} style={{ textAlign: "center", padding: "3rem 1.75rem" }}>
          <div className={styles.metaTop} style={{ justifyContent: "center", gap: "12px" }}>
            <span style={{ color: "#38BDF8" }}>[ 404 ]</span>
            <span>ERR_CODE: LOG_NOT_FOUND</span>
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              margin: "1.25rem 0 1rem",
            }}
          >
            404
          </div>

          <h1 className={styles.title} style={{ fontSize: "1.65rem", marginBottom: "0.75rem" }}>
            This log does not exist.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "2rem",
            }}
          >
            // The requested URL was not found on this server.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className={styles.pillLink} style={{ background: "var(--bg-muted)", borderColor: "#38BDF8", color: "#38BDF8" }}>
              ← Back to home
            </Link>
            <Link href="/#writing" className={styles.pillLink}>
              Browse logs →
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            lineHeight: 1.7,
          }}
        >
          <div style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>$ cat /logs/index</div>
          <div>
            Hint: Use search on the homepage or check{" "}
            <Link href="/sitemap.xml" style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>
              /sitemap.xml
            </Link>{" "}
            for all available logs.
          </div>
        </div>
      </article>
    </Layout>
  );
}
