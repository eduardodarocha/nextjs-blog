import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

// Helper to calculate reading time
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  const formattedMinutes = String(minutes).padStart(2, '0');
  return `EST_TIME: ${formattedMinutes}_MIN`;
}

// Category mapping helper
function deriveCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  if (text.includes('agent') || text.includes('autônomo') || text.includes('autonomous')) {
    return 'autonomous_agents';
  }
  if (text.includes('llm') || text.includes('prompt') || text.includes('rag') || text.includes('model')) {
    return 'llm_ops';
  }
  if (text.includes('ssr') || text.includes('static') || text.includes('next') || text.includes('render')) {
    return 'web_architecture';
  }
  return 'ai_engineering';
}

export function getSortedPostsData() {
  // Get .md file names under /posts
  const fileNames = fs.readdirSync(postsDirectory).filter((fileName) => fileName.endsWith('.md'));
  
  const allPostsData = fileNames.map((fileName, index) => {
    // Remove ".md" from file name to get id/slug
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse post metadata
    const matterResult = matter(fileContents);
    const content = matterResult.content || '';

    // Calculate reading time and category
    const readingTime = calculateReadingTime(content);
    const category = matterResult.data.category || deriveCategory(matterResult.data.title || id, content);
    const excerpt = matterResult.data.excerpt || content.replace(/^#+.*$/gm, '').trim().substring(0, 140) + '...';

    return {
      id,
      readingTime,
      category,
      excerpt,
      content,
      ...matterResult.data,
    };
  });

  // Sort posts by date descending
  const sorted = allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });

  // Add index identifiers (// index_01, // index_02, etc.)
  return sorted.map((post, idx) => ({
    ...post,
    indexLabel: `// index_${String(idx + 1).padStart(2, '0')}`,
  }));
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory).filter((fileName) => fileName.endsWith('.md'));

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);
  const content = matterResult.content || '';

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(content);
  const contentHtml = processedContent.toString();

  const readingTime = calculateReadingTime(content);
  const category = matterResult.data.category || deriveCategory(matterResult.data.title || id, content);

  return {
    id,
    contentHtml,
    readingTime,
    category,
    content,
    ...matterResult.data,
  };
}