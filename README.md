# AI Adoption Wizard

Aplicação frontend em HTML, CSS e JavaScript puro para navegação guiada das 7 fases do framework AI Adoption.

## Operação

- URL oficial de deploy: `https://tiagocarmo.github.io/ai-adoption/`
- Tempo médio de build: aproximadamente `1 minuto`

## Workflow de entrega

- Toda tarefa exige validação aplicável ao tipo de mudança antes da conclusão.
- Para mudanças de código, usar o fluxo mínimo: `node tests/run-tests.js` + `npm run build` + cenário crítico E2E via Playwright MCP/CLI.
- Em qualquer tarefa com modificação de arquivos do repositório, após validação aprovada (sem erro crítico), é obrigatório
  seguir com `git add`, `git commit` e `git push` na branch atual.
- A tarefa só é considerada concluída após o push com sucesso.
- Quando aplicável, usar `gh` para autenticação e fluxo de GitHub (como PR), mantendo o commit local no Git.
- Mensagens de commit seguem o padrão Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/
- Referência normativa de governança e validação: [AGENTS.md](AGENTS.md).

## Estrutura do projeto

```text
/
├── index.html
├── style.css
├── script.js
├── /content
│   ├── 01-diagnostico-organizacional-e-de-engenharia.md
│   ├── 01-diagnostico-organizacional-e-de-engenharia.json
│   ├── 02-time-ai-enablers.md
│   ├── 02-time-ai-enablers.json
│   ├── 03-definicao-do-time-piloto.md
│   ├── 03-definicao-do-time-piloto.json
│   ├── 04-remocao-de-gargalos-organizacionais-e-tecnicos.md
│   ├── 04-remocao-de-gargalos-organizacionais-e-tecnicos.json
│   ├── 05-adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento.md
│   ├── 05-adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento.json
│   ├── 06-governanca-e-padronizacao.md
│   ├── 06-governanca-e-padronizacao.json
│   ├── 07-escala-organizacional.json
│   └── 07-escala-organizacional.md
└── /tests
    └── run-tests.js
```

## Como executar

1. Inicie um servidor estático local na raiz do projeto.
2. Abra `http://localhost:<porta>/index.html`.

Exemplo com Node.js:

```bash
npx serve .
```

## Deploy no GitHub Pages

### Build local dos artefatos

Gerar pasta `public/` com os arquivos publicados:

```bash
npm run build
```

Executar localmente o conteúdo publicado:

```bash
npx serve public
```

### Publicação automática

O workflow em `.github/workflows/deploy.yml` executa a cada push na branch `main`:

1. `npm ci`
2. `npm run build`
3. `actions/upload-pages-artifact`
4. `actions/deploy-pages`

Esse fluxo publica apenas `public/` no GitHub Pages via mecanismo oficial de artifact/deploy.

## Funcionalidades implementadas

- Tela de boas-vindas obrigatória antes da Fase 1, com contexto do projeto e link oficial de inspiração:
  `https://ai-adoption.techleads.club/framework/guia`.
- Entrada com 2 ações:
  - `Iniciar do zero` (limpa dados do projeto no `sessionStorage` com prefixo `ai-adoption-data-` e inicia na Fase 1).
  - `Carregar JSON da Fase 7` (restaura e sobrescreve o estado completo das fases 1 a 7).
- Wizard SPA com 7 etapas na ordem oficial.
- Fase 1 com diagnóstico interativo (9 perguntas, score em tempo real e gargalo principal).
- Fase 2 com experiência interativa completa de Time AI Enablers:
  - seleção de arquétipo (`Lean`, `Dedicado`, `Distribuído`);
  - diagnóstico de familiaridade em 4 competências críticas;
  - seleção de nível de proficiência do time (`L0` a `L3`);
  - score combinado de prontidão, risco e direcionamento para a Fase 3;
  - relatório pós-preenchimento com lacunas e recomendações práticas.
- Fase 3 com experiência interativa completa de Time Piloto:
  - seleção do modo de avaliação (`squad`, `indivíduos`, `gestão`);
  - formulário dinâmico por modo com campos de contexto e racional;
  - diagnóstico de prontidão com 5 dimensões e scoring ponderado (`2x/2x/2x/1x/1x`);
  - relatório final com resumo executivo, checklist, ferramentas sugeridas e critérios de expansão.
- Fase 4 com experiência interativa completa de Remoção de Gargalos:
  - backlog editável por trilha (`Técnica`, `Organizacional`, `Cultura`);
  - priorização automática por score (`impacto`, `esforço`, `risco`);
  - classificação dos itens em `Crítico` e `Médio`;
  - geração automática de plano 30/90/180 por trilha com critério de conclusão.
- Fase 5 com experiência interativa completa de Adoção Progressiva:
  - baseline de maturidade para sinais críticos (`currentAiUsage`, `overallLevel`, `dxCode`, `seniority`, `quality`, `continuousDelivery`);
  - seleção automática/manual de template (`conservador`, `balanceado`, `agressivo`);
  - matriz dos 6 estágios do SDLC com nível, responsabilidade, anti-padrões e critérios de avanço;
  - calibrações automáticas por risco operacional (ex.: limite em `deploy` quando `continuousDelivery` está baixo);
  - artefato final serializado em `phaseReports[\"fase-5\"]`.
- Fase 6 com experiência interativa completa de Governança e Padronização:
  - diagnóstico contextual com 6 perguntas (porte, risco, uso agentic, ferramental e MCP);
  - recomendação de modelo de condução do Time AI Enablers por cenário;
  - pacote com owners/cadência das 9 políticas, 7 padrões técnicos e guardrails por criticidade;
  - plano de implantação 30/60/90 e controles mandatórios imediatos.
- Fase 7 com experiência interativa completa de Escala Organizacional:
  - questionário de contexto para escala;
  - plano gerado com ondas, catálogo de 11 métricas, 8 riscos, cerimônias e critérios de conclusão;
  - exportação de JSON consolidado com todos os dados preenchidos e artefatos gerados.
- Sidebar/timeline com seleção direta, etapa atual e etapas concluídas.
- Navegação por botões `Voltar` e `Próximo`.
- Navegação entre fases com scroll automático para o topo da página.
- Marcação manual de conclusão por etapa.
- Barra e anel de progresso.
- Persistência no `sessionStorage` com chave `ai-adoption-data-wizard-state`.
- Limpeza segura por prefixo `ai-adoption-data-` na ação de reinício (`Iniciar do zero`).
- Persistência estendida para respostas, seleções e resultados da Fase 2 no mesmo estado serializado.
- Persistência estendida para `phaseAnswers`, `phaseSelections`, `phaseResults` e `phaseReports` das fases interativas.
- Restauração automática do estado ao recarregar.
- Carregamento dinâmico de conteúdo Markdown em `/content`.
- Carregamento dinâmico de configuração JSON da Fase 2 em `/content/02-time-ai-enablers.json`.
- Carregamento dinâmico de configuração JSON da Fase 3 em `/content/03-definicao-do-time-piloto.json`.
- Carregamento dinâmico de configuração JSON da Fase 4 em `/content/04-remocao-de-gargalos-organizacionais-e-tecnicos.json`.
- Carregamento dinâmico de configuração JSON da Fase 5 em `/content/05-adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento.json`.
- Carregamento dinâmico de configuração JSON da Fase 6 em `/content/06-governanca-e-padronizacao.json`.
- Carregamento dinâmico de configuração JSON da Fase 7 em `/content/07-escala-organizacional.json`.
- Renderização contextual de seções textuais: ocultação de blocos não aplicáveis nas Fases 2, 3 e 4.
- Parser Markdown leve (sem bibliotecas externas) com suporte a:
  - headings (`#`, `##`, `###`)
  - listas (`-` e `*`)
  - parágrafos
  - tabelas Markdown (`| ... |`)
  - negrito (`**texto**`)
  - blocos de citação (`>`)
  - separadores (`---`)
- Sanitização de HTML antes da renderização para reduzir risco de injeção.
- Footer global com assinatura do projeto, agradecimento e crédito de inspiração ao guia oficial da Tech Leads Club.

## Arquitetura

### Configuração central

`WIZARD_STEPS` em `script.js` centraliza `id`, `order`, `slug`, `title` e arquivo Markdown de cada fase.

### Serviços

- `storageService`
  - `loadState()`
  - `saveState(state)`
  - `clearState()`
- `markdownService`
  - `loadStepMarkdown(step)`
  - `parseMarkdown(mdText)`
  - `extractStepSections(mdText)`
- `wizardController`
  - `goToStep(index)`
  - `goNext()`
  - `goBack()`
  - `markCurrentStepCompleted()`
  - `render()`
- `phaseTwoService`
  - `loadConfig()`
  - `calculateResult(config, answers, selections)`
  - `buildRecommendations(config, result)`
- `phaseThreeService`
  - `loadConfig()`
  - `calculateResult(config, answers)`
  - `validateSelection(config, selection)`
  - `buildRecommendations(config, result)`
  - `buildExecutiveReport(config, selection, result, recommendations)`
- `phaseFourService`
  - `loadConfig()`
  - `buildInitialBacklog(config, upstreamData)`
  - `sanitizeBacklog(items)`
  - `calculatePrioritization(config, items)`
  - `buildRoadmap(config, prioritizedItems)`
- `phaseFiveService`
  - `loadConfig()`
  - `buildInitialPlan(config, upstreamData)`
  - `resolveTemplate(config, signals, manualOverrides)`
  - `applyCalibrations(config, plan, upstreamSignals)`
  - `validatePlan(config, plan)`
  - `buildPhaseFiveReport(config, plan)`
- `phaseSixService`
  - `loadConfig()`
  - `calculateProfile(config, answers)`
  - `buildGovernancePack(config, answers, profile)`
- `phaseSevenService`
  - `loadConfig()`
  - `calculateResult(config, answers)`
  - `buildScalePlan(config, answers, result)`
- `exportService`
  - `buildPayload(state)`
  - `download(payload)`

### Estratégia de extração semântica

O conteúdo de cada Markdown é dividido por blocos `##`. O sistema tenta mapear seções para:

- Descrição resumida
- Objetivos
- Perguntas e reflexões
- Critérios de conclusão

Quando uma seção explícita não existe, aplica fallback para blocos próximos, sem inventar conteúdo.

## Testes

Executar:

```bash
node tests/run-tests.js
```

Cobertura atual:

- Parser Markdown: headings, listas, parágrafos, negrito, blockquote e separador.
- Sanitização de HTML.
- Extração de seções com fallback.
- Cálculo de score e gargalo da Fase 1.
- Cálculo de score combinado e gate da Fase 2.
- Cálculo de score ponderado, relatório e gate da Fase 3.
- Sanitização de backlog, score, roadmap e gate da Fase 4.
- Seleção de template, calibrações, validação e gate da Fase 5.
- Perfil, pacote e gate da Fase 6.
- Plano de escala, gate e exportação consolidada da Fase 7.
- Limites de navegação (`Voltar/Próximo`).
- Marcação de etapa concluída.

## Exportação do diagnóstico

- O botão `Exportar JSON consolidado` fica no bloco final da **Fase 7**.
- O JSON exportado pode ser carregado pela tela inicial via botão `Carregar JSON da Fase 7`.
- Em importação inválida ou incompleta, o sistema bloqueia a carga, exibe erro e não altera o storage.
- O arquivo gerado segue o padrão `ai-adoption-export-YYYY-MM-DDTHH-mm-ss.json`.
- O conteúdo inclui:
  - `meta` da exportação;
  - `wizardState` completo;
  - `phases[]` com perguntas, respostas, preenchimentos, resultados e relatórios;
  - `sourceConfigs` com os JSONs-base carregados por fase.
- A documentação de leitura está em [`interpretacao-json.md`](interpretacao-json.md).

Validação E2E com Playwright CLI (cenário da Fase 1):

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
npx serve public -l 4173
"$PWCLI" open http://localhost:4173
```

Aprendizados de validação desta iteração:

- Validar em produção quando o objetivo for checar comportamento já publicado.
- Validar em servidor local (`public/`) quando a mudança ainda não estiver em deploy.
- Não tratar `404` de `favicon.ico` como falha de cenário funcional.
- Critério de aceite técnico usado: testes unitários passantes + build passante + E2E do cenário crítico passante.

## Como adicionar novas etapas

1. Adicione novo arquivo `.md` em `/content`.
2. Inclua entrada correspondente em `WIZARD_STEPS` com `order` sequencial.
3. Ajuste o título da etapa conforme o framework.

A interface, navegação e progresso serão atualizados automaticamente com base na configuração.

## Fidelidade ao framework original

- As 7 etapas foram mantidas na mesma ordem lógica do guia oficial.
- Os arquivos em `/content` são a fonte oficial do conteúdo do framework neste projeto.
- Na Fase 1, os níveis `Baixo (1,0)`, `Médio (2,0)` e `Alto (3,0)` de cada questão foram organizados em tabela Markdown de 3 colunas.
- A aplicação não altera o conteúdo estratégico, apenas organiza sua leitura em experiência guiada.
