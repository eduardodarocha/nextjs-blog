# 🛡️ Relatório de Revisão de Segurança (Security Review)

Este documento apresenta uma análise detalhada de segurança sobre a arquitetura do **Publicador Autônomo de Blog por IA** (`/api/cron/generate-post`), cobrindo autenticação, gestão de segredos, permissões do GitHub, higienização de dados e mitigação de riscos de IA.

---

## 📊 Matriz de Risco e Segurança

| Domínio de Segurança | Nível de Risco | Status | Ação / Mitigação Implementada |
| :--- | :--- | :--- | :--- |
| **Autenticação da Rota Cron** | High | 🟢 Protegido | Requer cabeçalho `Authorization: Bearer <CRON_SECRET>` rigoroso em ambiente de produção |
| **Gestão de API Keys & Tokens** | High | 🟢 Protegido | Segredos lidos estritamente via `process.env`. `.env.local` ignorado no `.gitignore` |
| **Acesso ao Repositório GitHub** | Medium | 🟢 Recomendação | Utilizar Fine-Grained Personal Access Token (PAT) com escopo restrito |
| **Sanitização de Entradas/Slugs** | Medium | 🟢 Protegido | Regex estrita `[^a-z0-9-]` impede ataques de Path Traversal |
| **Injeção de Prompt / Alucinação de IA** | Medium | 🟢 Protegido | **Fluxo por Pull Request**: Exige aprovação humana antes de ir ao ar no Vercel |
| **Exaustão de Cota / Negação de Serviço** | Low | 🟢 Protegido | Rota bloqueada contra chamadas anônimas e públicas |

---

## 🔍 Detalhamento Técnico das Proteções

### 1. Autenticação e Proteção do Endpoint (`/api/cron/generate-post`)
- **Risco**: Se a rota fosse pública, qualquer atacante poderia dispará-la repetidamente, gastando a cota da sua API do Google Gemini e poluindo seu GitHub com centenas de Pull Requests.
- **Mitigação**:
  - A rota valida obrigatoriamente a presença da variável `CRON_SECRET`.
  - O Vercel Cron injeta automaticamente o cabeçalho `Authorization: Bearer <CRON_SECRET>` quando executa o agendamento.
  - Tentativas sem token ou com token inválido retornam `401 Unauthorized`.

---

### 2. Gestão de Segredos e Chaves de API
- **Risco**: Vazamento acidental de chaves de API (`GEMINI_API_KEY`, `GITHUB_TOKEN`) em repositórios públicos.
- **Mitigação**:
  - Nenhuma chave de API ou token foi hardcoded no código fonte.
  - O arquivo `.env.local` está incluído no `.gitignore`.
  - No Vercel, as variáveis são armazenadas de forma criptografada no painel **Environment Variables**.

---

### 3. Princípio do Menor Privilégio no GitHub Token (`GITHUB_TOKEN`)
- **Recomendação**: Para máxima segurança, **NÃO utilize** um Classic Token com permissão global `repo` se puder evitar.
- **Prática Recomendada**:
  1. Vá em **GitHub > Settings > Developer Settings > Fine-grained tokens**.
  2. Selecione **apenas o repositório específico**: `eduardodarocha/nextjs-blog`.
  3. Conceda **apenas** as seguintes permissões de repositório:
     - **Contents**: `Read and write` (para criar o arquivo Markdown).
     - **Pull requests**: `Read and write` (para abrir o PR).

---

### 4. Sanitização de Arquivos e Prevenção de Path Traversal
- **Risco**: Uma IA gerando um slug malicioso como `../../public/evil.js` poderia tentar sobrescrever arquivos do sistema.
- **Mitigação**:
  - O slug passa por higienização estrita com expressão regular:
    ```javascript
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    ```
  - Isso garante que o caminho do arquivo gerado seja obrigatoriamente restrito à pasta `posts/<cleanSlug>.md`.
  - Caracteres especiais em títulos de frontmatter são devidamente escapados.

---

### 5. Barreira Humana contra Alucinações de IA (Human-in-the-Loop)
- **Risco**: IA gerando informações incorretas, código com bugs ou conteúdo indesejado publicado diretamente no ar.
- **Mitigação**:
  - O sistema **NÃO publica diretamente na branch `main`**.
  - O sistema cria um **Pull Request de rascunho**.
  - O proprietário do blog recebe uma notificação, revisa o texto e decide se aprova o merge. Isso garante **100% de controle editorial e segurança de conteúdo**.

---

## 🎯 Lista de Verificação (Checklist) para Deploy Seguro

- [x] Rota `/api/cron/generate-post` configurada para exigir `CRON_SECRET`
- [x] Sanitização de slug e escape de frontmatter implementados
- [x] Gitignore verificado para não comitar `.env.local`
- [ ] Configurar `GEMINI_API_KEY` nas variáveis do Vercel
- [ ] Criar Fine-Grained `GITHUB_TOKEN` com escopo limitado
- [ ] Definir um `CRON_SECRET` forte no painel do Vercel
