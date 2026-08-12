import { useState } from 'react';
import Link from 'next/link';
import DateToken from '../components/date';
import Layout, { siteTitle } from '../components/layout';
import styles from '../styles/Home.module.css';
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
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: '[ ALL_LOGS ]' },
    { id: 'autonomous_agents', label: '[ AGENTS ]' },
    { id: 'llm_ops', label: '[ LLM_OPS ]' },
    { id: 'ai_engineering', label: '[ AI_ENGINEERING ]' },
    { id: 'web_architecture', label: '[ WEB_ARCH ]' },
  ];

  const filteredPosts = selectedCategory === 'ALL'
    ? allPostsData
    : allPostsData.filter((post) => post.category === selectedCategory);

  return (
    <Layout home posts={allPostsData}>
      {/* 3.1 & 3.2. Precision System Dashboard Hero */}
      <section className={styles.hero}>
        <div className={styles.heroMetaTop}>
          <span>// 00_SYSTEM_STATUS</span>
          <span className={styles.heroStatusTag}>
            <span className="pulse-indicator" />
            [ SYS_STATUS: ONLINE ]
          </span>
        </div>

        <h1 className={styles.heroTitle}>AI & SYSTEMS ARCHITECTURE LOGS</h1>

        <p className={styles.heroBio}>
          High-precision engineering logs on Large Language Models, Autonomous Agents,
          Deterministic Pipelines, and Distributed Web Topologies.
        </p>

        {/* Tactical Micro-data Stats Grid */}
        <div className={styles.heroStatsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>POSTS_INDEXED</div>
            <div className={styles.statValue}>
              {String(allPostsData.length).padStart(2, '0')} ARTICLES
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>PRIMARY_FOCUS</div>
            <div className={styles.statValue}>AI_ECOSYSTEM</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>ENGINE_STACK</div>
            <div className={styles.statValue}>NEXT.JS_14_SSG</div>
          </div>
        </div>
      </section>

      {/* Category Filter Tabs Bar */}
      <section className={styles.filterBar} id="writing">
        <div className={styles.filterTitle}>
          // INDEX_FILTER
        </div>
        <div className={styles.filterTabs}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterTab} ${
                selectedCategory === cat.id ? styles.filterTabActive : ''
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 5.2. Bento Grid Post Layout */}
      <section>
        {filteredPosts.length === 0 ? (
          <div className={styles.emptyState}>
            // NO_LOGS_FOUND_FOR_CATEGORY: [{selectedCategory}]
          </div>
        ) : (
          <div className={styles.bentoGrid}>
            {filteredPosts.map((post, idx) => {
              const isFeatured = idx === 0 && selectedCategory === 'ALL';
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className={`${styles.bentoCard} ${
                    isFeatured ? styles.bentoCardFeatured : ''
                  }`}
                >
                  <div>
                    {/* Micro-Data Layer Header */}
                    <div className={styles.cardHeader}>
                      <span>{post.indexLabel || `// index_${String(idx + 1).padStart(2, '0')}`}</span>
                      <span className={styles.cardCategory}>
                        [ {post.category || 'ai_engineering'} ]
                      </span>
                    </div>

                    {/* Article Title */}
                    <h2
                      className={`${styles.cardTitle} ${
                        isFeatured ? styles.cardTitleFeatured : ''
                      }`}
                    >
                      {post.title}
                    </h2>

                    {/* Article Excerpt Summary */}
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  </div>

                  {/* Micro-Data Layer Footer */}
                  <div className={styles.cardFooter}>
                    <span>{post.readingTime || 'EST_TIME: 04_MIN'}</span>
                    <DateToken dateString={post.date} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}
