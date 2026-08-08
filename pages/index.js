import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import Layout, { siteTitle } from "../components/layout";
import styles from "../styles/Home.module.css";
import { getSortedPostsData } from '../lib/posts';

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
      </Layout>
    </>
  );
}
