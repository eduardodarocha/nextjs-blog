import { Octokit } from '@octokit/rest';
import { GoogleGenAI } from '@google/genai';
import matter from 'gray-matter';

export default async function handler(req, res) {
  // 1. Verify Vercel Cron authorization secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized cron request.' });
    }
  } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
      return res.status(500).json({
        error: 'Failed to extract article title from AI output.',
        rawText,
      });
    }

    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const todayDate = new Date().toISOString().split('T')[0];
    const filePath = `posts/${cleanSlug}.md`;
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

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `feat(blog): adicionei novo post em português sobre IA - "${title}"`,
      content: Buffer.from(fullMarkdownContent, 'utf-8').toString('base64'),
      branch: newBranchName,
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

    return res.status(200).json({
      success: true,
      message: 'Post em Português sobre IA gerado com sucesso e Pull Request criado!',
      title,
      slug: cleanSlug,
      branch: newBranchName,
      prUrl: pr.html_url,
    });
  } catch (error) {
    console.error('Error generating daily post:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao gerar post via Vercel Cron.',
    });
  }
}
