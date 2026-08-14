# Configuração do Gerador Autônomo de Blog de IA no Vercel

Este projeto está equipado com duas rotas de API de Cron do Vercel, cada uma acionando um agente diferente:

- **`/api/cron/generate-trend-post`** (Segunda e Quarta) — Agente de Tendências: busca no Google as notícias mais recentes do ecossistema de IA e escreve um artigo sobre elas.
- **`/api/cron/generate-post`** (Sexta) — Agente Gerador: escreve um artigo aprofundado e didático sobre um tema atemporal do ecossistema de IA.

Ambas as rotas seguem o mesmo fluxo:
1. Geram um novo artigo em **Português do Brasil** sobre **Inteligência Artificial (IA)** usando o Google Gemini API.
2. Evitam tópicos duplicados lendo os artigos já existentes na pasta `posts/`.
3. Passam o rascunho pelo **Agente Editor**, que revisa e corrige gramática, estrutura e consistência factual.
4. Criam um novo branch e abrem automaticamente um **Pull Request no GitHub**.
5. Quando você aprova/funde o Pull Request, o Vercel faz o deploy automático do artigo publicado!

---

## 🔑 Variáveis de Ambiente Necessárias no Vercel

Acesse o painel do seu projeto no **Vercel** (`Settings > Environment Variables`) e adicione as seguintes variáveis:

| Nome da Variável | Descrição | Exemplo / Onde Obter |
| :--- | :--- | :--- |
| **`GEMINI_API_KEY`** | Chave gratuita de API do Google Gemini | Obtenha em [Google AI Studio](https://aistudio.google.com/) |
| **`GITHUB_TOKEN`** | Token de acesso pessoal do GitHub | Crie em [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens) com permissão `repo` (leitura/escrita de conteúdo e Pull Requests) |
| **`CRON_SECRET`** | Token aleatório de segurança para proteger a rota de Cron | Uma string aleatória (ex: `meusegredocron123`) |
| **`GITHUB_OWNER`** *(Opcional)* | Usuário/Organização do GitHub | Padrão: `eduardodarocha` |
| **`GITHUB_REPO`** *(Opcional)* | Nome do Repositório | Padrão: `nextjs-blog` |

---

## ⏰ Horário de Execução do Vercel Cron

O agendamento configurado no [`vercel.json`](../vercel.json) é:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-trend-post",
      "schedule": "0 11 * * 1,3"
    },
    {
      "path": "/api/cron/generate-post",
      "schedule": "0 11 * * 5"
    }
  ]
}
```
Isso aciona o Agente de Tendências toda **Segunda e Quarta**, e o Agente Gerador toda **Sexta-feira**, sempre às **11:00 UTC (08:00 da manhã no horário de Brasília - BRT)**. São dois Cron Jobs no total — o máximo permitido no plano **Hobby**.

---

## 🧪 Como Testar Localmente

1. Crie o arquivo `.env.local` na raiz do projeto preenchendo as variáveis:
   ```env
   GEMINI_API_KEY=sua_chave_gemini
   GITHUB_TOKEN=seu_github_token
   CRON_SECRET=seu_segredo
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Em outro terminal, execute o teste local do agente desejado:
   ```bash
   npm run test:cron        # Agente Gerador
   npm run test:trend-cron  # Agente de Tendências
   ```
4. Verifique a notificação de Pull Request criado no seu GitHub!
