import { Type } from '@google/genai';
import { validatePostStructure } from './validatePostStructure';

const editedPostSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    // seoTitle: <= 60 chars, used only for the <title> tag; the on-page H1
    // stays `title`. When `title` is already short, seoTitle can just repeat it.
    seoTitle: { type: Type.STRING },
    // description: 150-160 char meta description, no trailing ellipsis.
    description: { type: Type.STRING },
    content: { type: Type.STRING },
  },
  required: ['title', 'seoTitle', 'description', 'content'],
};

// Second, distinct Gemini call with an editor persona — runs after every
// draft, before it's ever committed to GitHub. Structured JSON output is
// used instead of another frontmatter block so the result doesn't need a
// second markdown re-parse (and can't get corrupted by stray ``` fences
// the way the generator's raw output occasionally does).
export async function editPost({ ai, title, content, existingTitles = [] }) {
  const prompt = `Você é o Editor-Chefe de um blog de tecnologia em Português do Brasil, especializado em Inteligência Artificial. Sua função é revisar e corrigir o rascunho abaixo antes da publicação.

REGRAS:
1. Corrija erros gramaticais, ortográficos e de fluidez, mantendo o Português do Brasil.
2. Sinalize e corrija afirmações factualmente inconsistentes, vagas ou exageradas — deixe-as precisas e verificáveis.
3. Melhore a estrutura e a clareza sem mudar o tema central do artigo.
4. Não introduza um tema que coincida com estes títulos já existentes no blog: ${existingTitles.join(', ') || 'nenhum'}.
5. Preserve quaisquer seções de fontes/citações presentes no rascunho.
6. Mantenha o título atraente; só o altere se necessário para maior clareza ou precisão.
7. O campo "content" DEVE ser Markdown com quebras de linha reais: uma linha em branco entre cada parágrafo, título (##, ###), lista e bloco de código. Nunca retorne o corpo do artigo em uma única linha.
8. Gere "seoTitle": uma versão do título com no máximo 60 caracteres, em Português do Brasil, otimizada para busca (sem o nome do site). Se o título já tiver 60 caracteres ou menos, repita-o.
9. Gere "description": uma meta descrição em Português do Brasil, entre 150 e 160 caracteres, atraente, com a palavra-chave principal, sem reticências no final.

RASCUNHO ORIGINAL:

TÍTULO: ${title}

CONTEÚDO:
${content}

Retorne o título, o seoTitle, a description e o conteúdo já revisados e prontos para publicação.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: editedPostSchema,
    },
  });

  const rawText = (response.text || '').trim();
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    console.error('[editor] failed to parse structured output, publishing original draft:', e.message);
    return { title, content, edited: false };
  }

  if (!parsed.title || !parsed.content) {
    console.warn('[editor] structured output missing fields, publishing original draft');
    return { title, content, edited: false };
  }

  // If the editor collapsed the Markdown structure onto one line, its output
  // is unusable — fall back to the pre-edit draft, which came straight from a
  // frontmatter parse and is structurally intact.
  const structure = validatePostStructure(parsed.content);
  if (!structure.ok) {
    console.warn(`[editor] edited body failed structure check (${structure.reason}), publishing original draft`);
    return { title, content, edited: false };
  }

  return {
    title: parsed.title,
    seoTitle: parsed.seoTitle || parsed.title,
    description: parsed.description || '',
    content: parsed.content,
    edited: true,
  };
}
