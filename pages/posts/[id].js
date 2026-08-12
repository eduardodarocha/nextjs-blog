import Head from 'next/head';
import Layout from '../../components/layout';
import DateToken from '../../components/date';
import styles from '../../styles/post.module.css';
import { getAllPostIds, getPostData, getSortedPostsData } from '../../lib/posts';

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  const allPostsData = getSortedPostsData();
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
  return (
    <Layout posts={allPostsData}>
      <Head>
        <title>{postData.title} // EDUARDO ROCHA</title>
        <meta name="description" content={postData.title} />
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
      </article>
    </Layout>
  );
}