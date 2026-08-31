---
title: 'Governança e Regulação de IA: O AI Act Europeu, o PL 2338 e o que Muda para Quem Constrói Software'
date: '2026-08-10'
---

# Governança e Regulação de IA: O AI Act Europeu, o PL 2338 e o que Muda para Quem Constrói Software

Durante a maior parte da última década, construir com Inteligência Artificial foi uma atividade praticamente sem regras específicas. Isso acabou. A União Europeia colocou em vigor o primeiro regime abrangente do mundo, o Brasil avança com seu próprio marco legal, e dezenas de países publicaram estruturas de governança. Para quem desenvolve, regulação de IA deixou de ser assunto de departamento jurídico e passou a ser requisito de arquitetura.

## Por que Regular

O argumento regulatório parte de uma constatação simples: sistemas de IA tomam ou influenciam decisões que afetam direitos das pessoas — quem recebe crédito, quem é chamado para uma entrevista, quem é sinalizado por um sistema de vigilância, qual tratamento é sugerido. Quando essas decisões são opacas, difíceis de contestar e potencialmente enviesadas, o dano é real e difuso.

A resposta regulatória convergiu, em quase todos os lugares, para uma mesma ideia central: **quanto maior o risco da aplicação, maiores as obrigações**. Um filtro de spam e um sistema de triagem de currículos não deveriam carregar o mesmo peso de conformidade.

## O AI Act Europeu: Regulação por Camadas de Risco

O Regulamento de IA da União Europeia, em vigor desde 2024 com aplicação escalonada até 2027, organiza os sistemas em quatro faixas:

### Risco Inaceitável — Proibido

Práticas vedadas incluem pontuação social por autoridades públicas, manipulação subliminar que cause dano, e certos usos de identificação biométrica remota em tempo real em espaços públicos.

### Alto Risco — Fortemente Regulado

Sistemas usados em infraestrutura crítica, educação, emprego, acesso a serviços essenciais, aplicação da lei e administração da justiça. As obrigações são substanciais:

- Sistema de gestão de risco documentado e mantido ao longo do ciclo de vida.
- Governança de dados: conjuntos de treino, validação e teste relevantes, representativos e, na medida do possível, livres de erros.
- Documentação técnica e registro automático de eventos (logs).
- Transparência e instruções de uso para o operador.
- Supervisão humana efetiva.
- Robustez, acurácia e cibersegurança adequadas.

### Risco Limitado — Obrigações de Transparência

Chatbots devem se identificar como máquinas; conteúdo sintético (imagem, áudio, vídeo, texto) deve ser rotulado como gerado por IA.

### Risco Mínimo — Sem Obrigações Específicas

A maioria das aplicações. Códigos de conduta voluntários são incentivados.

Há ainda um capítulo dedicado a modelos de propósito geral (os grandes modelos de fundação), com deveres de documentação, resumo dos dados de treino e, para modelos com risco sistêmico, avaliação de modelo e mitigação de riscos.

## O Brasil: O PL 2338/2023

O Projeto de Lei 2338 de 2023, aprovado pelo Senado Federal e em tramitação na Câmara dos Deputados, segue uma lógica semelhante à europeia, combinando uma abordagem baseada em risco com um capítulo robusto de direitos das pessoas afetadas.

Pontos centrais do texto:

- **Classificação por risco**, com categorias de risco excessivo (vedado) e alto risco (sujeito a obrigações reforçadas), e avaliação de impacto algorítmico obrigatória para sistemas de alto risco.
- **Direitos do titular**: informação prévia sobre a interação com IA, explicação sobre decisões automatizadas, contestação e revisão humana, e não discriminação.
- **Governança e responsabilização** dos agentes que desenvolvem e operam os sistemas, com deveres de documentação e gestão de risco.
- **Autoridade competente** para supervisão e aplicação, com articulação com órgãos setoriais.

O texto dialoga diretamente com a LGPD: boa parte da infraestrutura de conformidade — mapeamento de tratamento de dados, avaliações de impacto, canais de atendimento ao titular — pode ser reaproveitada.

## O que Isso Significa na Prática de Engenharia

Regulação de IA se traduz em requisitos concretos que precisam entrar no backlog, não em uma apresentação de slides.

### Inventário e Classificação

Você não pode cumprir obrigações sobre sistemas que não sabe que existem. O primeiro passo é um inventário de onde há IA no produto — inclusive dependências de terceiros e APIs de modelos — com a classificação de risco de cada uso.

### Documentação como Artefato Versionado

```text
model_card.md            # propósito, dados de treino, limitações, métricas por subgrupo
data_sheet.md            # origem dos dados, consentimento, licenças, vieses conhecidos
risk_assessment.md       # ameaças, probabilidade, impacto, mitigações, riscos residuais
evaluation_report.md     # acurácia, falso positivo/negativo, desempenho estratificado
human_oversight.md       # onde há revisão humana, como intervir, como reverter
incident_log/            # eventos, análise de causa, correções
```

Esses documentos vivem no repositório, evoluem com o código e são revisados em pull request como qualquer outro artefato.

### Registro de Eventos e Rastreabilidade

Sistemas de alto risco precisam registrar automaticamente eventos suficientes para reconstruir uma decisão: entrada, versão do modelo, saída, se houve intervenção humana. Isso é requisito de log estruturado desde o projeto.

### Avaliação Estratificada e Contínua

Reportar acurácia média não basta. É preciso medir desempenho por subgrupo relevante e monitorar deriva em produção, com um processo definido de revalidação.

### Transparência ao Usuário

Rotular conteúdo gerado por IA, identificar agentes conversacionais como máquinas e oferecer um caminho real de contestação e revisão humana para decisões automatizadas.

## Conclusão

A regulação de IA não é um obstáculo à inovação — é a formalização de práticas que times maduros já adotavam: saber quais dados alimentam o modelo, medir seu desempenho de forma honesta, manter um humano responsável pelas decisões que importam e dar às pessoas afetadas um meio de questionar o resultado. O AI Act e o PL 2338 diferem em detalhes de escopo, prazos e sanções, mas apontam na mesma direção. Para quem constrói software, a estratégia sensata é tratar governança como parte do ciclo de desenvolvimento desde o primeiro commit, e não como uma corrida de adequação às vésperas do prazo de vigência.

## Fontes

- [Regulamento (UE) 2024/1689 — Artificial Intelligence Act (texto oficial)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [Comissão Europeia — AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- [Senado Federal — Projeto de Lei nº 2338, de 2023](https://www25.senado.leg.br/web/atividade/materias/-/materia/157233)
- [OECD AI Principles](https://oecd.ai/en/ai-principles)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
