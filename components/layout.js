import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './layout.module.css';
import CommandPalette from './CommandPalette';

export const siteTitle = 'EDUARDO ROCHA // AI & SYSTEMS ARCHITECTURE';

export default function Layout({ children, home, posts = [] }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.wrapper}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Eduardo Rocha — High-Precision Tech & AI Engineering Blog. Deep dives into LLMs, Autonomous Agents, and Systems Architecture."
        />
        <meta property="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <title>{siteTitle}</title>
      </Head>

      {/* 5.1. Global Navigation Bar */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Brand Logo & Pulse Indicator */}
          <Link href="/" className={styles.brand}>
            <span className="pulse-indicator" title="System Status: Operational" />
            <span className={styles.brandTitle}>EDUARDO ROCHA</span>
            <span className={styles.brandTag}>// ARCHITECTURE_LOGS</span>
          </Link>

          {/* Center Navigation Links */}
          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              [ 01 // INDEX ]
            </Link>
            <Link href="/#writing" className={styles.navLink}>
              [ 02 // LOGS ]
            </Link>
            <a
              href="https://github.com/eduardodarocha"
              className={styles.navLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              [ 03 // GITHUB ]
            </a>
          </nav>

          {/* Search Trigger Button */}
          <button
            className={styles.commandTrigger}
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Open Command Palette"
          >
            <span>SEARCH_SYS</span>
            <kbd className={styles.commandKbd}>⌘ K</kbd>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.main}>{children}</main>

      {/* Article Back Navigation */}
      {!home && (
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 1.5rem' }}>
          <Link href="/" className={styles.backToTop}>
            ← [ RETURN_TO_SYSTEM_INDEX ]
          </Link>
        </div>
      )}

      {/* Global Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerMeta}>
            <span>[ SYS_VER: 2026.4.0 ]</span>
            <span>•</span>
            <span>[ STACK: NEXT.JS_14_SSG ]</span>
          </div>
          <div>
            <span>© 2026 EDUARDO ROCHA // ALL_RIGHTS_RESERVED</span>
          </div>
        </div>
      </footer>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        posts={posts}
      />
    </div>
  );
}
