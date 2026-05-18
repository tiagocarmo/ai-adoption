# AI Adoption Wizard

Aplicação frontend em HTML, CSS e JavaScript puro para navegação guiada das 7 fases do framework AI Adoption.

## Operação

- URL oficial de deploy: `https://tiagocarmo.github.io/ai-adoption/`
- Tempo médio de build: aproximadamente `1 minuto`

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
│   ├── 03-definicao-do-time-piloto.md
│   ├── 04-remocao-de-gargalos-organizacionais-e-tecnicos.md
│   ├── 05-adocao-progressiva-de-ia-no-fluxo-de-desenvolvimento.md
│   ├── 06-governanca-e-padronizacao.md
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

- Wizard SPA com 7 etapas na ordem oficial.
- Fase 1 com diagnóstico interativo (9 perguntas, score em tempo real e gargalo principal).
- Sidebar/timeline com seleção direta, etapa atual e etapas concluídas.
- Navegação por botões `Voltar` e `Próximo`.
- Marcação manual de conclusão por etapa.
- Barra e anel de progresso.
- Persistência no `sessionStorage` com chave `ai-adoption-data-wizard-state`.
- Restauração automática do estado ao recarregar.
- Carregamento dinâmico de conteúdo Markdown em `/content`.
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
- Limites de navegação (`Voltar/Próximo`).
- Marcação de etapa concluída.

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
- A aplicação não altera o conteúdo estratégico, apenas organiza sua leitura em experiência guiada.
