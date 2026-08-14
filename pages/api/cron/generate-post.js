import { Octokit } from '@octokit/rest';
import { GoogleGenAI } from '@google/genai';
import matter from 'gray-matter';

export const config = {
  // A full article plus 4 GitHub round-trips takes ~41s, so this must be set
  // explicitly — the platform default is far lower and silently 504s the job.
  // 300 requires Fluid Compute, which is enabled on this project; without it
  // the Hobby ceiling is 60 and anything above that fails the deploy with
  // `invalid_max_duration`.
  maxDuration: 300,
};

// Accents must be folded before stripping non-ASCII, otherwise Portuguese
// titles turn into slugs like "intelig-ncia-artificial".
function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function handler(req, res) {
  // 1. Verify Vercel Cron authorization secret
  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET;

  console.log('[cron] invoked', {
    ua: req.headers['user-agent'],                   // 'vercel-cron/1.0' when Vercel calls
    schedule: req.headers['x-vercel-cron-schedule'], // '0 11 * * 1,3,5'
    hasSecret: Boolean(cronSecret),
    hasAuthHeader: Boolean(authHeader),
  });

  // A missing secret and a wrong secret are different problems, so they get
  // different status codes — otherwise the logs cannot tell them apart.
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      console.error('[cron] CRON_SECRET is not set in this environment');
      return res.status(500).json({ error: 'CRON_SECRET not configured.' });
    }
    if (authHeader.trim() !== `Bearer ${cronSecret.trim()}`) {
      console.error('[cron] auth mismatch');
      return res.status(401).json({ error: 'Unauthorized cron request.' });
    }
  } else if (cronSecret && authHeader.trim() !== `Bearer ${cronSecret.trim()}`) {
    return res.status(401).json({ error: 'Unauthorized cron request.' });
  }

  // Check required environment variables
  const githubToken = process.env.GITHUB_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!githubToken) {
    return res.status(500).json({ error: 'Missing GITHUB_TOKEN environment variable.' });
  }

  if (!geminiApiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable.' });
  }

  const rawOwner = process.env.GITHUB_OWNER;
  const rawRepo = process.env.GITHUB_REPO;
  const owner = (!rawOwner || rawOwner === 'your_github_username') ? 'eduardodarocha' : rawOwner;
  const repo = (!rawRepo || rawRepo === 'your_repository_name') ? 'nextjs-blog' : rawRepo;
  const defaultBranch = process.env.GITHUB_BRANCH || 'main';

  const octokit = new Octokit({ auth: githubToken });
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  try {
    // 2. Fetch existing posts from GitHub repository to avoid duplicate topics
    let existingFiles = [];
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'posts',
        ref: defaultBranch,
      });
      if (Array.isArray(data)) {
        existingFiles = data.map((file) => file.name);
      }
    } catch (e) {
      console.warn('Could not fetch existing posts list:', e.message);
    }

    // 3. Build prompt for Gemini API (YAML Frontmatter + Markdown Output)
    const prompt = `Você é um especialista em Inteligência Artificial, Engenharia de Software e Tecnologias Emergentes.
Sua tarefa é escrever um artigo completo, didático e altamente relevante em PORTUGUÊS DO BRASIL sobre o ecossistema de Inteligência Artificial.

REGRAS:
1. O artigo DEVE ser em Português do Brasil.
2. O tema deve ser estritamente focado no ecossistema de IA (por exemplo: Agentes Autônomos de IA, Modelos de Linguagem (LLMs), RAG (Retrieval-Augmented Generation), Visão Computacional, Engenharia de Prompt, Modelos Open-Source, IA na programação, IA no cotidiano ou Ética em IA).
3. Não repita estes tópicos existentes no blog: ${existingFiles.join(', ')}.
4. O conteúdo deve ser rico em detalhes, com títulos (##, ###), exemplos práticos, blocos de código se aplicável, e uma conclusão instigante.

FORMATO DE SAÍDA:
Gere o artigo exatamente com o Frontmatter YAML no topo e o conteúdo Markdown logo abaixo:

---
title: "Título atraente do artigo em Português"
slug: "slug-do-artigo-em-kebab-case"
---

# Título do Artigo

Conteúdo completo em Markdown...`;

    // Call Gemini API
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let rawText = (aiResponse.text || '').trim();
    if (rawText.startsWith('```markdown')) {
      rawText = rawText.replace(/^```markdown\s*/i, '').replace(/```\s*$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    const parsedData = matter(rawText);
    const title = parsedData.data.title;
    let slug = parsedData.data.slug;

    if (!title) {
      console.error('[cron] no title in AI output. Raw response:', rawText);
      return res.status(500).json({
        error: 'Failed to extract article title from AI output.',
      });
    }

    if (!slug) {
      slug = title;
    }

    const cleanSlug = slugify(slug);
    const todayDate = new Date().toISOString().split('T')[0];
    // Reusing a slug would make createOrUpdateFileContents fail with a 422
    // ("sha wasn't supplied"), so a repeated topic becomes a dated variant.
    const fileName = existingFiles.includes(`${cleanSlug}.md`)
      ? `${cleanSlug}-${todayDate}.md`
      : `${cleanSlug}.md`;
    const filePath = `posts/${fileName}`;
    const bodyContent = parsedData.content.trim();

    const fullMarkdownContent = `---
title: '${title.replace(/'/g, "''")}'
date: '${todayDate}'
---

${bodyContent}
`;

    // 4. Create Git Branch and Commit on GitHub
    const { data: mainRef } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const mainSha = mainRef.object.sha;

    const newBranchName = `draft/ia-post-${cleanSlug}-${Date.now()}`;
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranchName}`,
      sha: mainSha,
    });

    // Safety net for when the existing-posts listing above failed: GitHub
    // rejects a write to an existing path unless the current blob sha is sent.
    let existingSha;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: newBranchName,
      });
      if (!Array.isArray(existingFile)) {
        existingSha = existingFile.sha;
      }
    } catch (e) {
      // 404 means the path is free, which is the expected case
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `feat(blog): adicionei novo post em português sobre IA - "${title}"`,
      content: Buffer.from(fullMarkdownContent, 'utf-8').toString('base64'),
      branch: newBranchName,
      ...(existingSha ? { sha: existingSha } : {}),
    });

    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: `🤖 Novo Post sobre IA: ${title}`,
      head: newBranchName,
      base: defaultBranch,
      body: `### 🤖 Artigo Gerado Automaticamente por IA

**Título:** ${title}  
**Data:** ${todayDate}  
**Arquivo:** \`${filePath}\`  

---

#### Resumo / Prévia:
${bodyContent.substring(0, 300)}...

---
*Revise o conteúdo e clique em **Merge pull request** para publicar no Vercel.*`,
    });

    console.log('[cron] pull request created', pr.html_url);

    return res.status(200).json({
      success: true,
      message: 'Post em Português sobre IA gerado com sucesso e Pull Request criado!',
      title,
      slug: fileName.replace(/\.md$/, ''),
      branch: newBranchName,
      prUrl: pr.html_url,
    });
  } catch (error) {
    // error.status is set by Octokit — a 401 here means the GitHub PAT expired.
    console.error('[cron] failed:', error.status || '', error.message, error);
    return res.status(500).json({
      error: error.message || 'Erro ao gerar post via Vercel Cron.',
      upstreamStatus: error.status,
    });
  }
}
