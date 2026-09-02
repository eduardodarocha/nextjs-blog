import { Octokit } from '@octokit/rest';
import { GoogleGenAI } from '@google/genai';
import matter from 'gray-matter';
import { authenticateCron } from '../../../lib/cronAuth';
import { slugify, listExistingPostFiles, publishPostAsPR } from '../../../lib/githubPublisher';
import { editPost } from '../../../lib/editorAgent';

export const config = {
  // Search grounding adds latency on top of the ~41s the sibling generator
  // already takes, so this needs the same explicit ceiling as
  // generate-post.js — see that file for why 300 requires Fluid Compute.
  maxDuration: 300,
};

// Trend agent: Mon/Wed. Same PT-BR, didactic voice as the Friday generator,
// but grounded in live Google Search results instead of the model's general
// knowledge, so the topic is whatever is actually trending in the AI
// industry/ecosystem right now.
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
    const existingFiles = await listExistingPostFiles({ octokit, owner, repo, ref: defaultBranch });
    const existingTitles = existingFiles.map((f) => f.replace(/\.md$/, ''));

    const prompt = `Você é um jornalista especializado em Inteligência Artificial, cobrindo o ecossistema de IA (novos modelos, lançamentos, financiamentos, ferramentas e pesquisas) para um blog técnico em Português do Brasil.

Use a busca do Google para descobrir o que está acontecendo de mais relevante e recente no ecossistema de IA agora, e escreva um artigo envolvente sobre isso.

REGRAS:
1. O artigo DEVE ser em Português do Brasil.
2. O tema deve ser uma tendência ou notícia REAL e ATUAL do ecossistema de IA (lançamentos de modelos, movimentos de mercado, novas ferramentas, pesquisas relevantes) — não um tópico genérico atemporal.
3. Não repita estes tópicos existentes no blog: ${existingFiles.join(', ')}.
4. O conteúdo deve ser rico em detalhes, com títulos (##, ###), exemplos práticos, blocos de código se aplicável, e uma conclusão instigante — mesmo estilo didático e aprofundado do restante do blog.
5. Baseie as afirmações nos resultados de busca; não invente números, datas ou citações.

FORMATO DE SAÍDA:
Gere o artigo exatamente com o Frontmatter YAML no topo e o conteúdo Markdown logo abaixo:

---
title: "Título atraente do artigo em Português"
slug: "slug-do-artigo-em-kebab-case"
---

# Título do Artigo

Conteúdo completo em Markdown...`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
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
      console.error('[cron:trend] no title in AI output. Raw response:', rawText);
      return res.status(500).json({
        error: 'Failed to extract article title from AI output.',
      });
    }

    if (!slug) {
      slug = title;
    }

    const cleanSlug = slugify(slug);
    let draftBody = parsedData.content.trim();

    // Grounding reports back the sources it actually used — attaching them
    // lends the piece credibility and gives the editor pass something
    // concrete to check the article's claims against.
    const groundingChunks = aiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk) => chunk.web)
      .filter((web) => web?.uri)
      .slice(0, 5);

    if (sources.length > 0) {
      const sourceLines = sources.map((web) => `- [${web.title || web.uri}](${web.uri})`).join('\n');
      draftBody = `${draftBody}\n\n## Fontes\n\n${sourceLines}`;
    }

    // Editor agent reviews and corrects the draft before it's committed.
    const edited = await editPost({ ai, title, content: draftBody, existingTitles });

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
      branchPrefix: 'draft/trend-post',
      commitMessage: `feat(blog): adicionei novo post de tendências sobre IA - "${edited.title}"`,
      prTitle: `🔥 Novo Post de Tendências IA: ${edited.title}`,
      prBodyExtra: `### 🔥 Artigo de Tendências Gerado Automaticamente por IA (com busca no Google)

**Título:** ${edited.title}
${edited.edited ? '\n✏️ Revisado automaticamente pelo Agente Editor antes deste PR.' : ''}`,
    });

    console.log('[cron:trend] pull request created', pr.html_url);

    return res.status(200).json({
      success: true,
      message: 'Post de tendências sobre IA gerado com sucesso e Pull Request criado!',
      title: edited.title,
      slug: fileName.replace(/\.md$/, ''),
      branch,
      prUrl: pr.html_url,
    });
  } catch (error) {
    console.error('[cron:trend] failed:', error.status || '', error.message, error);
    return res.status(500).json({
      error: error.message || 'Erro ao gerar post de tendências via Vercel Cron.',
      upstreamStatus: error.status,
    });
  }
}
