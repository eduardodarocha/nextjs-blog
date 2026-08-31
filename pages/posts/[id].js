import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteUrl } from '../../components/layout';
import DateToken from '../../components/date';
import styles from '../../styles/post.module.css';
import { getAllPostIds, getPostData, getSortedPostsData } from '../../lib/posts';

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  const allPostsData = getSortedPostsData().map(
    ({ content, contentHtml, ...rest }) => rest
  );
  return {
    props: {
      postData,
      allPostsData,
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

export default function Post({ postData, allPostsData }) {
  const canonical = `${siteUrl}/posts/${postData.id}`;
  const description = postData.description || postData.excerpt;
  const ogImage = postData.coverImage || `${siteUrl}/og-default.png`;

  // Related posts: same category, newest first, max 3
  const relatedPosts = allPostsData
    .filter((p) => p.id !== postData.id && p.category === postData.category)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postData.title,
    description: description,
    image: ogImage,
    datePublished: postData.date,
    dateModified: postData.date,
    author: {
      '@type': 'Person',
      name: 'Eduardo Rocha',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Eduardo Rocha',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/profile.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    keywords: postData.tags ? postData.tags.join(', ') : postData.category,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: postData.title,
        item: canonical,
      },
    ],
  };

  return (
    <Layout
      title={postData.title}
      description={description}
      canonical={canonical}
      ogImage={ogImage}
      ogType="article"
    >
      <Head>
        <meta property="article:published_time" content={postData.date} />
        {postData.tags && <meta name="keywords" content={postData.tags.join(', ')} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>

      <article className={styles.articleContainer}>
        {/* Precision System Metadata Header Card */}
        <header className={styles.headerCard}>
          <div className={styles.metaTop}>
            <span>// LOG_ID: #{postData.id}</span>
            <span className={styles.metaCategory}>
              [ {postData.category || 'ai_engineering'} ]
            </span>
          </div>

          <h1 className={styles.title}>{postData.title}</h1>

          <div className={styles.metaBottom}>
            <span>{postData.readingTime || 'EST_TIME: 05_MIN'}</span>
            <DateToken dateString={postData.date} />
          </div>
        </header>

        {/* Rendered Article Body */}
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{postData.title}</span>
        </nav>

        {/* Related posts - internal linking */}
        {relatedPosts.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>// RELATED_LOGS</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className={styles.relatedCard}
                >
                  <span className={styles.relatedCategory}>
                    [ {post.category} ]
                  </span>
                  <span className={styles.relatedPostTitle}>{post.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
}