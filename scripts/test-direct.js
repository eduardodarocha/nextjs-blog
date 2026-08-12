require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { Octokit } = require('@octokit/rest');
const { GoogleGenAI } = require('@google/genai');

async function testDirectGeneration() {
  console.log('🧪 Iniciando teste de geração direta de post por IA em Português...\n');

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    console.error('❌ ERRO: GEMINI_API_KEY não foi configurada em .env.local!');
    console.log('👉 Obtenha uma chave gratuita em: https://aistudio.google.com/');
    process.exit(1);
  }

  if (!githubToken || githubToken === 'your_github_token_here') {
    console.error('❌ ERRO: GITHUB_TOKEN não foi configurada em .env.local!');
    console.log('👉 Crie um token em: https://github.com/settings/tokens');
    process.exit(1);
  }

  const owner = process.env.GITHUB_OWNER || 'eduardodarocha';
  const repo = process.env.GITHUB_REPO || 'nextjs-blog';
  const defaultBranch = process.env.GITHUB_BRANCH || 'main';

  const octokit = new Octokit({ auth: githubToken });
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  try {
    // 1. Fetch existing posts
    console.log(`1. Consultando posts existentes em https://github.com/${owner}/${repo}...`);
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
      console.log(`   └ Encontrados ${existingFiles.length} posts existentes.`);
    } catch (e) {
      console.warn('   ⚠️ Não foi possível listar posts existentes:', e.message);
    }

    // 2. Call Gemini API
    console.log('\n2. Chamando a API do Google Gemini (gemini-2.5-flash) para escrever o artigo sobre IA em Português...');
    const prompt = `Você é um especialista em Inteligência Artificial, Engenharia de Software e Tecnologias Emergentes.
Sua tarefa é escrever um artigo completo, didático e altamente relevante em PORTUGUÊS DO BRASIL sobre o ecossistema de Inteligência Artificial.

REGRAS:
1. O artigo DEVE ser em Português do Brasil.
2. O tema deve ser estritamente focado no ecossistema de IA (por exemplo: Agentes Autônomos de IA, Modelos de Linguagem (LLMs), RAG (Retrieval-Augmented Generation), Visão Computacional, Engenharia de Prompt, Modelos Open-Source, IA na programação, IA no cotidiano ou Ética em IA).
3. Não repita estes tópicos existentes no blog: ${existingFiles.join(', ')}.
4. O conteúdo deve ser rico em detalhes, com títulos (##, ###), exemplos práticos, blocos de código se aplicável, e uma conclusão instigante.

FORMATO DE RESPOSTA (Retorne EXATAMENTE um JSON válido sem marcações markdown extra em volta):
{
  "title": "Título atraente do artigo em Português",
  "slug": "slug-do-artigo-em-kebab-case",
  "content": "Conteúdo completo em Markdown..."
}`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawText = aiResponse.text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const articleData = JSON.parse(rawText);
    const { title, slug, content } = articleData;

    console.log(`   ✅ Artigo gerado pela IA com sucesso!`);
    console.log(`   📌 Título: "${title}"`);
    console.log(`   🔗 Slug: "${slug}"`);

    const todayDate = new Date().toISOString().split('T')[0];
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const filePath = `posts/${cleanSlug}.md`;

    const fullMarkdownContent = `---
title: '${title.replace(/'/g, "''")}'
date: '${todayDate}'
---

${content}
`;

    // 3. Create Git Branch and Commit on GitHub
    console.log(`\n3. Obtendo hash da branch principal (${defaultBranch})...`);
    const { data: mainRef } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const mainSha = mainRef.object.sha;

    const newBranchName = `draft/ia-post-${cleanSlug}-${Date.now()}`;
    console.log(`   └ Criando branch remota "${newBranchName}"...`);
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranchName}`,
      sha: mainSha,
    });

    console.log(`   └ Commitando novo arquivo "${filePath}" no GitHub...`);
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `feat(blog): adicionei novo post em português sobre IA - "${title}"`,
      content: Buffer.from(fullMarkdownContent, 'utf-8').toString('base64'),
      branch: newBranchName,
    });

    // 4. Open Pull Request on GitHub
    console.log(`\n4. Abrindo Pull Request no repositório GitHub...`);
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: `🤖 Novo Post sobre IA: ${title}`,
      head: newBranchName,
      base: defaultBranch,
      body: `### 🤖 Artigo Gerado em Teste por IA

**Título:** ${title}  
**Data:** ${todayDate}  
**Arquivo:** \`${filePath}\`  

---

#### Resumo / Prévia:
${content.substring(0, 300)}...

---
*Revise o conteúdo e clique em **Merge pull request** para publicar no Vercel.*`,
    });

    console.log(`\n🎉 SUCESSO COMPLETO!`);
    console.log(`🔗 Pull Request criado: ${pr.html_url}`);
    console.log(`👉 Acesse o link acima no seu navegador para ver e aprovar o novo post!`);
  } catch (err) {
    console.error('\n❌ Erro durante o teste:', err.message || err);
  }
}

testDirectGeneration();
