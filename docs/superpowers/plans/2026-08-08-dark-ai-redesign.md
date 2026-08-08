# Dark AI-Themed Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing Next.js personal blog with a dark, AI/neural-inspired theme, and add a hero section and a tech-stack section to the homepage.

**Architecture:** Pure CSS + JSX changes within the existing Next.js Pages Router + CSS Modules architecture. No new pages, routes, or dependencies. Design tokens (colors, fonts, spacing) are centralized as CSS custom properties in `styles/global.css` and consumed by every CSS Module.

**Tech Stack:** Next.js (Pages Router), React, CSS Modules, `next/image`, `next/link`. No new libraries.

## Global Constraints

- No new npm dependencies, no App Router migration.
- Keep existing data flow: `getStaticProps` in `pages/index.js` via `lib/posts.js`, `getStaticProps`/`getStaticPaths` in `pages/posts/[id].js` via `lib/posts.js` — unchanged.
- Dark theme tokens (from spec): background `#0a0a0f`, primary text `#f5f5f7`, muted text `#a1a1aa`, accent gradient `#3b82f6 → #8b5cf6 → #22d3ee`, monospace stack `ui-monospace, "SF Mono", Menlo, monospace` for code-flavored accents.
- No automated test suite exists in this repo. Every task's verification step is manual: run `npm run dev` and check `http://localhost:3000` in a browser.
- Delete `styles/global copy.css` (unused duplicate) as part of the global-styles task.

---

### Task 1: Design tokens & global base styles

**Files:**
- Modify: `styles/global.css`
- Delete: `styles/global copy.css`

**Interfaces:**
- Produces: CSS custom properties on `:root` — `--color-bg`, `--color-bg-elevated`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-border-hover`, `--gradient-accent`, `--font-sans`, `--font-mono`, `--radius`, `--radius-sm`, `--container-width`, `--shadow-glow`. Every later task's CSS Module reads these tokens by name — do not rename them.

- [ ] **Step 1: Replace the contents of `styles/global.css`**

```css
:root {
  --color-bg: #0a0a0f;
  --color-bg-elevated: rgba(255, 255, 255, 0.03);
  --color-text: #f5f5f7;
  --color-text-muted: #a1a1aa;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(139, 92, 246, 0.5);
  --gradient-accent: linear-gradient(90deg, #3b82f6, #8b5cf6, #22d3ee);
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --radius: 12px;
  --radius-sm: 8px;
  --container-width: 720px;
  --shadow-glow: 0 0 40px rgba(139, 92, 246, 0.15);
}

html,
body {
  padding: 0;
  margin: 0;
  font-family: var(--font-sans);
  line-height: 1.6;
  font-size: 18px;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.25), transparent),
    var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

a {
  color: #8b5cf6;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  display: block;
}
```

- [ ] **Step 2: Delete the unused duplicate file**

```bash
rm "styles/global copy.css"
```

- [ ] **Step 3: Manual verification**

Run `npm run dev` (if not already running) and open `http://localhost:3000`. Expected: the page background is near-black with a faint purple glow near the top; body text is off-white. Existing (unstyled) content is still visible — layout will look broken until later tasks, that's expected at this stage.

- [ ] **Step 4: Commit**

```bash
git add styles/global.css
git rm "styles/global copy.css"
git commit -m "Add dark theme design tokens and base styles"
```

---

### Task 2: Header / sticky nav redesign

**Files:**
- Modify: `components/layout.js`
- Modify: `components/layout.module.css`

**Interfaces:**
- Consumes: CSS tokens from Task 1 (`--color-border`, `--font-mono`, `--gradient-accent`, `--color-text-muted`, `--color-text`, `--container-width`).
- Produces: `Layout` component keeps its existing signature `Layout({ children, home })` and named export `siteTitle` — Task 3 (`pages/index.js`) and Task 6 (`pages/posts/[id].js`) both import these unchanged. The profile photo is removed from `Layout` — Task 3 renders it directly in the homepage hero instead.

- [ ] **Step 1: Replace `components/layout.js`**

```jsx
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
          )}.png?theme=dark&md=1&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            {name}
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
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/layout.module.css`**

```css
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
  background: rgba(10, 10, 15, 0.72);
  border-bottom: 1px solid var(--color-border);
}

.navInner {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
}

.navLinks {
  display: flex;
  gap: 1.5rem;
}

.navLink {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.15s ease;
}

.navLink:hover {
  color: var(--color-text);
  text-decoration: none;
}

.main {
  flex: 1;
  width: 100%;
}

.backToHome {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

.pillLink {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.pillLink:hover {
  border-color: var(--color-border-hover);
  text-decoration: none;
}
```

- [ ] **Step 3: Manual verification**

Refresh `http://localhost:3000`. Expected: a sticky top bar with the gradient-text name on the left and "Blog"/"LinkedIn" links on the right; the bar blurs content that scrolls under it. Visit a post page (e.g. `http://localhost:3000/posts/pre-rendering`) and confirm the same nav appears plus a "← Back to home" pill button below the article.

- [ ] **Step 4: Commit**

```bash
git add components/layout.js components/layout.module.css
git commit -m "Redesign header as a sticky nav bar"
```

---

### Task 3: Homepage hero section

**Files:**
- Modify: `pages/index.js`
- Modify: `styles/Home.module.css`

**Interfaces:**
- Consumes: `Layout`/`siteTitle` from Task 2 (`components/layout.js`); CSS tokens from Task 1.
- Produces: `styles.hero`, `styles.avatar`, `styles.avatarInner`, `styles.heroTitle`, `styles.heroBio`, `styles.heroButton`, `styles.section`, `styles.sectionTitle` class names in `Home.module.css` — Task 4 and Task 5 (both also editing `pages/index.js`) reuse `styles.section`/`styles.sectionTitle` for their own sections.

- [ ] **Step 1: Replace `styles/Home.module.css`**

```css
.hero {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 4rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar {
  border-radius: 9999px;
  padding: 4px;
  background: var(--gradient-accent);
  margin-bottom: 1.5rem;
}

.avatarInner {
  border-radius: 9999px;
  display: block;
}

.heroTitle {
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02rem;
  margin: 0 0 1rem;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.heroBio {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  max-width: 34rem;
  margin: 0 0 1.5rem;
}

.heroButton {
  display: inline-block;
  padding: 0.65rem 1.4rem;
  border-radius: 999px;
  background: var(--gradient-accent);
  color: #0a0a0f;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
}

.heroButton:hover {
  text-decoration: none;
  opacity: 0.9;
}

.section {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.sectionTitle {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
  color: var(--color-text-muted);
  margin: 0 0 1.25rem;
}
```

- [ ] **Step 2: Replace `pages/index.js`**

```jsx
import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import Layout, { siteTitle } from "../components/layout";
import styles from "../styles/Home.module.css";
import { getSortedPostsData } from '../lib/posts';

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-PH31J3DLE1"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-PH31J3DLE1');
        `}
      </Script>

      <Layout home>
        <Head>
          <title>{siteTitle}</title>
        </Head>

        <section className={styles.hero}>
          <div className={styles.avatar}>
            <Image
              priority
              src="/images/profile.png"
              className={styles.avatarInner}
              height={140}
              width={140}
              alt="Eduardo Rocha"
            />
          </div>
          <h1 className={styles.heroTitle}>AI-Focused Software Developer</h1>
          <p className={styles.heroBio}>
            Hi, I&apos;m Eduardo — I build web applications and explore how
            AI and large language models can make software more useful.
          </p>
          <a
            href="https://www.linkedin.com/in/eduardo-rocha-dev/"
            className={styles.heroButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            Connect on LinkedIn
          </a>
        </section>
      </Layout>
    </>
  );
}
```

Note: this step temporarily drops the tech-stack and blog sections from the page — Tasks 4 and 5 add them back into this same file. This is intentional so the hero can be verified in isolation.

- [ ] **Step 3: Manual verification**

Refresh `http://localhost:3000`. Expected: centered hero with a circular profile photo wrapped in a gradient ring, a large gradient-colored headline "AI-Focused Software Developer", a muted bio line, and a solid-gradient "Connect on LinkedIn" pill button that opens LinkedIn in a new tab.

- [ ] **Step 4: Commit**

```bash
git add pages/index.js styles/Home.module.css
git commit -m "Add hero section to homepage"
```

---

### Task 4: Tech-stack section

**Files:**
- Modify: `pages/index.js`
- Modify: `styles/Home.module.css`

**Interfaces:**
- Consumes: `styles.section`/`styles.sectionTitle` from Task 3.
- Produces: `styles.chipGrid`, `styles.chip` class names — not consumed elsewhere, but keep the naming since Task 7's QA pass checks these specific class names render.

- [ ] **Step 1: Append to `styles/Home.module.css`**

```css
.chipGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.chip {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.chip:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-glow);
}
```

- [ ] **Step 2: Add a `techStack` array and the tech-stack section to `pages/index.js`**

Add this array above `export async function getStaticProps` (after the imports):

```jsx
const techStack = [
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "CSS",
  "Python",
  "LLM APIs",
  "Prompt Engineering",
];
```

Then add a new section immediately after the closing `</section>` of the hero (still inside `<Layout home>`, before `</Layout>`):

```jsx
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tech Stack</h2>
          <div className={styles.chipGrid}>
            {techStack.map((tech) => (
              <span className={styles.chip} key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </section>
```

- [ ] **Step 3: Manual verification**

Refresh `http://localhost:3000`. Expected: below the hero, a small uppercase "Tech Stack" label followed by a wrapping row of monospace pill/chip tags (JavaScript, React, Next.js, Node.js, CSS, Python, LLM APIs, Prompt Engineering), each with a subtle border that glows on hover.

- [ ] **Step 4: Commit**

```bash
git add pages/index.js styles/Home.module.css
git commit -m "Add tech-stack section to homepage"
```

---

### Task 5: Blog list as cards

**Files:**
- Modify: `pages/index.js`
- Modify: `styles/Home.module.css`
- Modify: `styles/utils.module.css`

**Interfaces:**
- Consumes: `styles.section`/`styles.sectionTitle` from Task 3; `allPostsData` prop (array of `{ id, date, title }`) already produced by `getStaticProps` in this file, unchanged.
- Produces: `styles.postGrid`, `styles.postCard`, `styles.postTitle`, `styles.postDate` in `Home.module.css`. Updates `utils.module.css`'s `.lightText` color/font — Task 6 (`pages/posts/[id].js`) also uses `.lightText` for the post date, so it inherits this styling automatically.

- [ ] **Step 1: Append to `styles/Home.module.css`**

```css
.postGrid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.postCard {
  display: block;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg-elevated);
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.postCard:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
  text-decoration: none;
}

.postTitle {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
}

.postDate {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Update `styles/utils.module.css`**

Replace its contents with:

```css
.heading2Xl {
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.05rem;
  margin: 1rem 0;
  color: var(--color-text);
}

.headingXl {
  font-size: 2rem;
  line-height: 1.3;
  font-weight: 800;
  letter-spacing: -0.05rem;
  margin: 1rem 0;
  color: var(--color-text);
}

.headingLg {
  font-size: 1.5rem;
  line-height: 1.4;
  color: var(--color-text);
  margin: 1rem 0;
}

.headingMd {
  font-size: 1.2rem;
  line-height: 1.5;
  color: var(--color-text);
}

.borderCircle {
  border-radius: 9999px;
}

.colorInherit {
  color: inherit;
}

.padding1px {
  padding-top: 1px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.listItem {
  margin: 0 0 1.25rem;
}

.lightText {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
```

- [ ] **Step 3: Add imports and the blog section to `pages/index.js`**

Add these two imports alongside the existing ones at the top of the file:

```jsx
import Link from "next/link";
import Date from '../components/date';
```

Then add a new section immediately after the tech-stack section's closing `</section>` (still inside `<Layout home>`, before `</Layout>`):

```jsx
        <section className={styles.section} id="writing">
          <h2 className={styles.sectionTitle}>Writing</h2>
          <div className={styles.postGrid}>
            {allPostsData.map(({ id, date, title }) => (
              <Link href={`/posts/${id}`} className={styles.postCard} key={id}>
                <p className={styles.postTitle}>{title}</p>
                <p className={styles.postDate}>
                  <Date dateString={date} />
                </p>
              </Link>
            ))}
          </div>
        </section>
```

- [ ] **Step 4: Manual verification**

Refresh `http://localhost:3000`. Expected: below "Tech Stack", a "Writing" heading followed by a vertical stack of post cards (title + monospace date), each with a subtle border that glows and lifts slightly on hover. Click one and confirm it navigates to the post page. Confirm the nav's "Blog" link jumps to this section via `#writing`.

- [ ] **Step 5: Commit**

```bash
git add pages/index.js styles/Home.module.css styles/utils.module.css
git commit -m "Render blog posts as cards on homepage"
```

---

### Task 6: Post page restyle

**Files:**
- Create: `styles/post.module.css`
- Modify: `pages/posts/[id].js`

**Interfaces:**
- Consumes: `Layout` from Task 2; `utilStyles.headingXl`/`utilStyles.lightText` from Task 5's updated `utils.module.css`; `getAllPostIds`/`getPostData` from `lib/posts.js` (unchanged).
- Produces: nothing consumed by other tasks — this is the last content task.

- [ ] **Step 1: Create `styles/post.module.css`**

```css
.article {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

.article :global(p) {
  color: var(--color-text);
  line-height: 1.7;
}

.article :global(a) {
  color: #8b5cf6;
}

.article :global(h2),
.article :global(h3) {
  color: var(--color-text);
  margin-top: 2rem;
}

.article :global(code) {
  font-family: var(--font-mono);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  font-size: 0.9em;
}

.article :global(pre) {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1rem;
  overflow-x: auto;
}

.article :global(pre code) {
  border: none;
  background: none;
  padding: 0;
}

.meta {
  margin-bottom: 2rem;
}
```

- [ ] **Step 2: Replace `pages/posts/[id].js`**

```jsx
import utilStyles from '../../styles/utils.module.css';
import postStyles from '../../styles/post.module.css';
import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../lib/posts';
import Head from 'next/head';
import Date from '../../components/date';

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article className={postStyles.article}>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={`${utilStyles.lightText} ${postStyles.meta}`}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}
```

- [ ] **Step 3: Manual verification**

Open `http://localhost:3000/posts/pre-rendering` (and the other two posts). Expected: dark themed article in a comfortable reading column, off-white heading, monospace muted date, purple links, and (if the markdown contains any) code spans/blocks rendered as dark bordered monospace boxes.

- [ ] **Step 4: Commit**

```bash
git add styles/post.module.css pages/posts/[id].js
git commit -m "Restyle post pages with dark theme"
```

---

### Task 7: Cross-page and responsive QA pass

**Files:** none (verification only, no code changes expected unless a defect is found)

- [ ] **Step 1: Full-site manual walkthrough**

With `npm run dev` running, check in a browser:
1. `http://localhost:3000` — hero, tech-stack chips, and post cards all render with the dark theme; nav is sticky and blurs on scroll.
2. Each post URL under `/posts/` — dark themed article, working "← Back to home" pill.
3. Browser window resized to ~375px width (mobile) — nav doesn't overflow, chips wrap, hero text stays centered and readable, post cards remain full-width and readable.
4. Browser devtools console — no errors on any of the three pages.
5. `next/image` profile photo renders correctly inside its gradient ring in the hero (no broken image, no layout shift).

- [ ] **Step 2: Fix any defects found**

If Step 1 surfaces a visual bug, fix it directly in the relevant file from Tasks 1–6 and re-verify. No separate task needed for small fixes.

- [ ] **Step 3: Final commit (only if Step 2 made changes)**

```bash
git add -A
git commit -m "Fix QA issues from redesign walkthrough"
```

---

## Self-Review Notes

- **Spec coverage:** design tokens (Task 1), header/nav (Task 2), hero (Task 3), tech-stack (Task 4), blog cards (Task 5), post page (Task 6), responsive/manual QA (Task 7), `global copy.css` deletion (Task 1), dead boilerplate comment removal (Task 3 rewrites `pages/index.js` from scratch, dropping it) — all spec sections are covered.
- **Placeholder scan:** no TBD/TODO markers; every step has literal code.
- **Type/name consistency:** `styles.section`/`styles.sectionTitle` introduced in Task 3 and reused verbatim in Tasks 4 and 5; `utilStyles.lightText`/`utilStyles.headingXl` introduced in Task 5/kept from original and reused verbatim in Task 6; `Layout`/`siteTitle` export names unchanged across Tasks 2, 3, 6.
