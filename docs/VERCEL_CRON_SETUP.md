# Configuração do Gerador Autônomo de Blog de IA no Vercel

Este projeto agora está equipado com uma rota de API de Cron do Vercel (`/api/cron/generate-post`) que diariamente:
1. Gera um novo artigo em **Português do Brasil** sobre **Inteligência Artificial (IA)** usando o Google Gemini API.
2. Evita tópicos duplicados lendo os artigos já existentes na pasta `posts/`.
3. Cria um novo branch e abre automaticamente um **Pull Request no GitHub**.
4. Quando você aprova/funde o Pull Request, o Vercel faz o deploy automático do artigo publicado!

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
      "path": "/api/cron/generate-post",
      "schedule": "0 11 * * 1,3,5"
    }
  ]
}
```
Isso aciona a geração toda **Segunda, Quarta e Sexta-feira às 11:00 UTC (08:00 da manhã no horário de Brasília - BRT)**.

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
3. Em outro terminal, execute o teste local:
   ```bash
   npm run test:cron
   ```
4. Verifique a notificação de Pull Request criado no seu GitHub!
