# RFC: Plano Operacional de Cobertura do Guia Oficial no AI Adoption Wizard

## Contexto e objetivo da auditoria

- Data-base: 18 de maio de 2026.
- Fonte oficial auditada: `https://ai-adoption.techleads.club/framework/guia`.
- Aplicação auditada (local): `http://localhost:4173`.
- Objetivo: transformar a auditoria em plano de execução técnica, com lacunas priorizadas por impacto x esforço,
  critérios de aceite verificáveis e evidências rastreáveis.

## Estado atual consolidado

### Cobertura já consolidada

- Jornada das 7 fases implementada com navegação, progresso e gates por etapa (`script.js`, `WIZARD_STEPS`).
- Conteúdo base por fase carregado via Markdown e JSON de `content/`.
- Diagnósticos e cálculos interativos implementados nas fases 1 a 7.
- Exportação consolidada de diagnóstico implementada na fase 7 (`exportService`).
- Persistência de estado no `sessionStorage` com prefixo `ai-adoption-data-`.

### Situação geral

- Status de cobertura: `Parcialmente atendido`.
- Principal concentração de lacunas: profundidade estruturada de dados nas fases 7 e 6.

### Evidências de referência

- Estrutura e comportamento: `script.js`, `README.md`, `interpretacao-json.md`.
- Conteúdo por fase: `content/*.md` e `content/*.json`.
- Fluxo funcional previamente validado em navegador local com conclusão das 7 fases e exportação JSON.

## Backlog priorizado (Impacto x Esforço)

| ID | Problema | Impacto | Esforço | Ação técnica | Arquivos-alvo | Critério de aceite | Evidência esperada |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AUD-001 | Fase 7 com métricas estruturadas incompletas no JSON interativo em relação ao conteúdo-base | Alto | Médio | Completar catálogo de métricas da fase 7 no JSON e ajustar consumo no plano gerado | `content/07-escala-organizacional.json`, `script.js`, `tests/run-tests.js` | `prioritizedMetrics` reflete o conjunto completo definido para escala e aparece no export da fase 7 | Teste automatizado cobrindo contagem e presença dos códigos no payload exportado |
| AUD-002 | Fase 7 com riscos estruturados incompletos no JSON interativo | Alto | Baixo | Completar lista de riscos da fase 7 e garantir priorização consistente no plano | `content/07-escala-organizacional.json`, `script.js`, `tests/run-tests.js` | Export da fase 7 contém todos os riscos aplicáveis definidos no catálogo | Teste automatizado validando presença dos riscos esperados no plano/export |
| AUD-003 | Divergência de contagem de métricas na fase 7 entre texto e estrutura | Alto | Baixo | Unificar nomenclatura e contagem oficial em Markdown, JSON e documentação | `content/07-escala-organizacional.md`, `content/07-escala-organizacional.json`, `README.md` | Mesma contagem e terminologia em MD, JSON e README | Revisão textual + teste de consistência de metadados da fase 7 |
| AUD-004 | Fase 6 sem estruturação integral de AI Security Posture / OWASP LLM Top 10 / MCP Security / Gateway / Marketplace no pacote gerado | Alto | Médio | Modelar seções avançadas no JSON da fase 6 e incluir no `buildGovernancePack` e export | `content/06-governanca-e-padronizacao.json`, `script.js`, `tests/run-tests.js` | `phaseReports["fase-6"]` exporta seções avançadas com objetos/arrays legíveis | Teste automatizado validando campos estruturados obrigatórios da fase 6 |
| AUD-005 | Fase 5 exporta critérios e anti-padrões selecionados por índice, com baixa legibilidade fora do app | Médio | Baixo | Exportar também labels/textos resolvidos dos critérios e anti-padrões selecionados | `script.js`, `tests/run-tests.js`, `interpretacao-json.md` | Fase 5 no export contém índices e textos (`selectedCriteriaLabels`/equivalente) | Teste validando coexistência de índice e texto no payload |
| AUD-006 | Fase 3 com catálogo interativo de ferramentas menor que conteúdo textual | Médio | Médio | Ampliar catálogo estruturado da fase 3 ou registrar explicitamente subset priorizado | `content/03-definicao-do-time-piloto.json`, `content/03-definicao-do-time-piloto.md`, `script.js` | Catálogo estruturado alinhado ao conteúdo ou documento explicita recorte oficial | Teste garantindo coerência mínima entre catálogo e recomendações |
| AUD-007 | Fase 4 sem metadado de origem dos gargalos no backlog/export | Médio | Baixo | Incluir `source` por item (`phase-1`, `phase-3`, `default`, `manual`) no fluxo da fase 4 | `script.js`, `tests/run-tests.js`, `interpretacao-json.md` | Itens da fase 4 no export incluem origem de rastreabilidade | Teste validando serialização de origem em itens priorizados |
| AUD-008 | Ausência de verificação automatizada de cobertura estrutural crítica por fase | Médio | Médio | Criar teste de consistência para contagens/chaves críticas por fase | `tests/run-tests.js`, `content/*.json` | Falhas estruturais críticas quebram teste automaticamente | Execução local de testes com cenário de mismatch detectado |

## Plano de execução

### Lote 1 (P0)

- AUD-001, AUD-002, AUD-003.
- Objetivo: eliminar lacunas críticas da fase 7 e estabilizar a consistência de métricas/riscos.
- Resultado esperado: cobertura estrutural mínima para declarar equivalência funcional de escala.

### Lote 2 (P1)

- AUD-004, AUD-005, AUD-006.
- Objetivo: elevar rastreabilidade e legibilidade dos artefatos exportados nas fases 6, 5 e 3.
- Resultado esperado: relatório/export mais auditável para uso fora da interface.

### Lote 3 (P2)

- AUD-007, AUD-008.
- Objetivo: fortalecer rastreabilidade operacional e proteção contra regressões.
- Resultado esperado: backlog com origem explícita e monitoramento automatizado de cobertura estrutural.

## Governança de execução

### Dependências

- AUD-001 e AUD-002 devem preceder AUD-003 para evitar consolidar contagem inconsistente.
- AUD-004 e AUD-005 são independentes da fase 7 e podem rodar em paralelo.
- AUD-008 deve ser finalizado após AUD-001 a AUD-007 para refletir o contrato estrutural definitivo.

### Definição de pronto por item (DoD)

Cada item só pode ser concluído com:

1. `node tests/run-tests.js` sem falhas.
2. `npm run build` sem falhas.
3. Validação do cenário crítico via Playwright MCP/CLI na URL correta:
- Produção: `https://tiagocarmo.github.io/ai-adoption/` para comportamento publicado.
- Local: `http://localhost:4173` (servido de `public/`) para mudanças ainda não publicadas.
4. Registro de evidência objetiva no documento/tarefa sem transcrição extensa de logs.

### Convenção de versionamento sugerida

- Tratar este pacote como evolução funcional compatível do produto (`MINOR` em SemVer).
- Usar `PATCH` para ajustes pontuais de consistência documental/estrutural sem expansão de capacidade.

## Critérios de aceite e validação do documento

### Qualidade do conteúdo

- Todo item do backlog contém: problema, ação, aceite e evidência esperada.
- Não há duplicação entre resumo executivo e backlog operacional.

### Aderência ao processo do projeto

- O fluxo mínimo de validação está explícito e alinhado a `AGENTS.md` e `README.md`.
- Ambiente de validação (produção vs local) está definido por tipo de mudança.

### Rastreabilidade

- Toda lacuna P0/P1 aponta arquivos-alvo e artefato esperado no export.
- Critérios de aceite são mensuráveis (contagem, presença de campos e consistência de payload).

## Riscos residuais e decisões pendentes

- Risco residual: sem AUD-008, regressões estruturais podem retornar em mudanças futuras de conteúdo.
- Decisão pendente: confirmar, contra a fonte oficial, a contagem normativa final de métricas da fase 7 para
  evitar divergência recorrente entre título e catálogo.
- Decisão pendente: definir se o catálogo da fase 3 deve ser exaustivo ou oficialmente priorizado por recorte.
