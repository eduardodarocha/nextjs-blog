import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import DateToken from "../components/date";
import Layout, { siteTitle, siteDescription, siteUrl } from "../components/layout";
import styles from "../styles/Home.module.css";
import { getSortedPostsData } from "../lib/posts";

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

const POSTS_PER_PAGE = 10;

export async function getStaticProps() {
  const allPostsData = getSortedPostsData().map(
    ({ content, contentHtml, ...rest }) => rest
  );
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { id: "ALL", label: "[ TODOS ]" },
    { id: "autonomous_agents", label: "[ AGENTS ]" },
    { id: "llm_ops", label: "[ LLM_OPS ]" },
    { id: "ai_engineering", label: "[ AI_ENG ]" },
    { id: "web_architecture", label: "[ WEB ]" },
  ];

  // Filter posts by search query and selected category tab
  const filteredPosts = allPostsData.filter((post) => {
    const matchesCategory =
      selectedCategory === "ALL" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  const goToPage = (n) => {
    setCurrentPage(n);
    document.getElementById("writing")?.scrollIntoView({ behavior: "smooth" });
  };

  const canonical = siteUrl;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteTitle,
    description: siteDescription,
    url: siteUrl,
    author: {
      "@type": "Person",
      name: "Eduardo Rocha",
      url: siteUrl,
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: allPostsData.slice(0, 10).map((post, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${siteUrl}/posts/${post.id}`,
      name: post.title,
    })),
  };

  return (
    <Layout
      home
      title={siteTitle}
      description={siteDescription}
      canonical={canonical}
      ogType="website"
    >
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      </Head>
      {/* Original Personal Bio & Hero Section */}
      <section className={styles.hero}>
        <div className={styles.avatarWrapper}>
          <Image
            priority
            src="/images/profile.png"
            className={styles.avatarInner}
            height={130}
            width={130}
            alt="Eduardo Rocha"
          />
          <span className={styles.statusIndicator} title="System Online" />
        </div>

        <h1 className={styles.heroTitle}>Desenvolvedor de Software Focado em IA</h1>

        <p className={styles.heroBio}>
          Olá, sou o Eduardo — construo aplicações web e exploro como a IA e
          os grandes modelos de linguagem podem tornar o software mais útil.
        </p>

        <a
          href="https://www.linkedin.com/in/eduardo-rocha-dev/"
          className={styles.heroButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Conectar no LinkedIn</span>
          <span style={{ fontSize: "0.75rem" }}>↗</span>
        </a>
      </section>

      {/* Original Tech Stack Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>// TECH_STACK</h2>
        <div className={styles.chipGrid}>
          {techStack.map((tech) => (
            <span className={styles.chip} key={tech}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Writing Section with Interactive Search & Category Filter */}
      <section className={styles.section} id="writing">
        <h2 className={styles.sectionTitle}>// ARTIGOS</h2>

        {/* Search Bar & Category Filter Controls */}
        <div className={styles.controlsContainer}>
          {/* Search Input Box */}
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>&gt;</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Filter Tabs */}
          <div className={styles.filterTabs}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterTab} ${
                  selectedCategory === cat.id ? styles.filterTabActive : ""
                }`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid (Strict System Design Specification 5.2) */}
        {filteredPosts.length === 0 ? (
          <div className={styles.emptyState}>
            // NENHUM_ARTIGO_CORRESPONDE_AO_FILTRO
          </div>
        ) : (
          <div className={styles.postGrid}>
            {paginatedPosts.map((post) => (
              <Link
                href={`/posts/${post.id}`}
                className={styles.postCard}
                key={post.id}
              >
                <div>
                  {/* Micro-Data Layer Header */}
                  <div className={styles.cardHeader}>
                    <span>{post.indexLabel}</span>
                    <span className={styles.cardCategory}>
                      [ {post.category || "ai_engineering"} ]
                    </span>
                  </div>

                  {/* Post Title */}
                  <h3 className={styles.cardTitle}>{post.title}</h3>

                  {/* Post Excerpt */}
                  {post.excerpt && (
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  )}
                </div>

                {/* Micro-Data Layer Footer */}
                <div className={styles.cardFooter}>
                  <span>{post.readingTime || "EST_TIME: 04_MIN"}</span>
                  <DateToken dateString={post.date} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Paginação de artigos">
            <button
              className={styles.pageButton}
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              &lt; ANTERIOR
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`${styles.pageButton} ${
                  n === page ? styles.pageButtonActive : ""
                }`}
                onClick={() => goToPage(n)}
                aria-current={n === page ? "page" : undefined}
              >
                {String(n).padStart(2, "0")}
              </button>
            ))}
            <button
              className={styles.pageButton}
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              PRÓXIMO &gt;
            </button>
          </nav>
        )}
      </section>
    </Layout>
  );
}
