# AI Adoption Wizard

Aplicação frontend em HTML, CSS e JavaScript puro para navegação guiada das 7 fases do framework AI Adoption.

## Estrutura do projeto

```text
/
├── index.html
├── style.css
├── script.js
├── /content
│   ├── 01-diagnostico-organizacional-e-de-engenharia.md
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

### Publicação manual

Publicar no branch `gh-pages`:

```bash
npm run deploy
```

### Publicação automática

O workflow em `.github/workflows/deploy.yml` executa a cada push na branch `main`:

1. `npm ci`
2. `npm run build`
3. `npm run deploy`

Esse fluxo publica apenas `public/` no GitHub Pages.

## Funcionalidades implementadas

- Wizard SPA com 7 etapas na ordem oficial.
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
  - negrito (`**texto**`)
  - blocos de citação (`>`)
  - separadores (`---`)
- Sanitização de HTML antes da renderização para reduzir risco de injeção.

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
- Limites de navegação (`Voltar/Próximo`).
- Marcação de etapa concluída.

## Como adicionar novas etapas

1. Adicione novo arquivo `.md` em `/content`.
2. Inclua entrada correspondente em `WIZARD_STEPS` com `order` sequencial.
3. Ajuste o título da etapa conforme o framework.

A interface, navegação e progresso serão atualizados automaticamente com base na configuração.

## Fidelidade ao framework original

- As 7 etapas foram mantidas na mesma ordem lógica do guia oficial.
- Os arquivos em `/content` são a fonte oficial do conteúdo do framework neste projeto.
- A aplicação não altera o conteúdo estratégico, apenas organiza sua leitura em experiência guiada.
