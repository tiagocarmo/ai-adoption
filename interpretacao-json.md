# Interpretação do JSON Exportado

## Objetivo

O arquivo exportado consolida o estado completo do AI Adoption Wizard em um único JSON para auditoria,
continuidade de trabalho, análises em BI e automações internas.

## Estrutura geral

```text
root
├── meta
├── wizardState
├── phases[]
└── sourceConfigs
```

## Blocos principais

### `meta`

- `schemaVersion` (`string`): versão do formato de exportação.
- `exportedAt` (`string` ISO-8601): timestamp da geração.
- `storageKey` (`string`): chave de sessão usada no navegador.
- `source` (`string`): identificador da origem do arquivo.

### `wizardState`

Snapshot cru do estado do wizard no momento da exportação.

- `currentStep` (`number`): índice da etapa atual.
- `completedSteps` (`number[]`): etapas concluídas.
- `phaseAnswers` (`object`): respostas por fase.
- `phaseSelections` (`object`): seleções e campos auxiliares por fase.
- `phaseResults` (`object`): resultados calculados por fase.
- `phaseReports` (`object`): artefatos gerados por fase.
- `phaseAcknowledged` (`object`): confirmações de entendimento por fase.

### `phases[]`

Lista organizada por fase (`fase-1` a `fase-7`) para leitura humana e programática.

Cada item contém:

- `id` (`string`): identificador da fase.
- `order` (`number`): ordem no framework.
- `title` (`string`): título da fase.
- `inputs` (`object`):
  - `answers` (`object`): respostas diretas da fase.
  - `selections` (`object`): campos e seleções adicionais.
  - `questionAnswerMap` (`array`): mapeamento normalizado de pergunta/resposta.
- `computed` (`object`): scores, bandas, validações e cálculos da fase.
- `report` (`object|null`): resumo/plano gerado para decisão.
- `status` (`object`):
  - `isCurrent` (`boolean`)
  - `isCompleted` (`boolean`)
  - `acknowledged` (`boolean`)
  - `pending.missingAnswers` (`number`)

### `sourceConfigs`

Configurações-base em JSON carregadas pelo app para cada fase.

- Chaves: `fase-1`, `fase-2`, ..., `fase-7`.
- Conteúdo: configuração estrutural usada para perguntas, regras e geração de artefatos.

## Como ler rapidamente

1. Veja `meta` para validar versão e data da exportação.
2. Consulte `phases[]` para análise fase a fase.
3. Em cada fase, comece por `status` para identificar pendências.
4. Use `inputs.questionAnswerMap` para leitura estruturada de pergunta/resposta.
5. Use `computed` e `report` para entender diagnóstico e plano recomendado.

## Exemplo de interpretação da Fase 7

- `phases[i].id = "fase-7"`
- `inputs.answers`: respostas do questionário de escala.
- `computed`: score, banda e flags de completude.
- `report`: plano de escala com ondas, métricas, cerimônias, riscos e critérios finais.

## Campos adicionais relevantes por fase

- `fase-4` (`report.prioritizedItems[]`): cada item inclui `source` com origem do gargalo (`phase-1`, `phase-3`, `default` ou `manual`).
- `fase-5` (`report.stages[]`): além de índices (`selectedCriteria` e `selectedAntiPatterns`), o export inclui
  `selectedCriteriaLabels` e `selectedAntiPatternLabels` para leitura direta.
- `fase-6` (`report`): o pacote inclui estruturas adicionais de governança e segurança:
  `reviewProcess`, `aiSecurityPosture`, `owaspLlmTop10`, `mcpSecurity`, `gatewayGuidance` e `skillsMarketplace`.

## Compatibilidade e versionamento

- Sempre valide `meta.schemaVersion` antes de processar o arquivo.
- Mudanças compatíveis devem evoluir versão de forma incremental.
- Quebras de contrato devem atualizar `schemaVersion` para uma nova major.

## Uso em BI e automação

- Recomendado normalizar `phases[]` em tabela por fase.
- Para perguntas/respostas, use `questionAnswerMap` como fonte principal.
- Para métricas de progresso, use `status` + `wizardState.completedSteps`.
