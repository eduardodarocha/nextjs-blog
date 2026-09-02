import { Octokit } from '@octokit/rest';
import { GoogleGenAI } from '@google/genai';
import matter from 'gray-matter';
import { authenticateCron } from '../../../lib/cronAuth';
import { slugify, listExistingPostFiles, publishPostAsPR } from '../../../lib/githubPublisher';
import { editPost } from '../../../lib/editorAgent';

export const config = {
  // A full article, an editor pass, plus 4 GitHub round-trips takes ~41s+,
  // so this must be set explicitly — the platform default is far lower and
  // silently 504s the job. 300 requires Fluid Compute, which is enabled on
  // this project; without it the Hobby ceiling is 60 and anything above that
  // fails the deploy with `invalid_max_duration`.
  maxDuration: 300,
};

// Friday's generator: an evergreen, didactic deep-dive on an AI ecosystem
// topic, written from the model's general knowledge (no search grounding).
export default async function handler(req, res) {
  if (!authenticateCron(req, res)) return;

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
    // 1. Fetch existing posts from GitHub repository to avoid duplicate topics
    const existingFiles = await listExistingPostFiles({ octokit, owner, repo, ref: defaultBranch });
    const existingTitles = existingFiles.map((f) => f.replace(/\.md$/, ''));

    // 2. Build prompt for Gemini API (YAML Frontmatter + Markdown Output)
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

    // The filename/branch slug is derived from the pre-edit title, so the
    // editor pass below can polish wording without ever moving the file path.
    const cleanSlug = slugify(slug);
    const draftBody = parsedData.content.trim();

    // 3. Editor agent reviews and corrects the draft before it's committed.
    const edited = await editPost({ ai, title, content: draftBody, existingTitles });

    // 4. Create Git branch, commit the post, and open the PR for human review.
    const { pr, fileName, branch } = await publishPostAsPR({
      octokit,
      owner,
      repo,
      defaultBranch,
      title: edited.title,
      seoTitle: edited.seoTitle,
      description: edited.description,
      cleanSlug,
      existingFiles,
      bodyContent: edited.content,
      branchPrefix: 'draft/ia-post',
      commitMessage: `feat(blog): adicionei novo post em português sobre IA - "${edited.title}"`,
      prTitle: `🤖 Novo Post sobre IA: ${edited.title}`,
      prBodyExtra: `### 🤖 Artigo Gerado Automaticamente por IA

**Título:** ${edited.title}
${edited.edited ? '\n✏️ Revisado automaticamente pelo Agente Editor antes deste PR.' : ''}`,
    });

    console.log('[cron] pull request created', pr.html_url);

    return res.status(200).json({
      success: true,
      message: 'Post em Português sobre IA gerado com sucesso e Pull Request criado!',
      title: edited.title,
      slug: fileName.replace(/\.md$/, ''),
      branch,
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
